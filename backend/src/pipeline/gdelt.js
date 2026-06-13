/**
 * Article fetcher — pulls from two sources and merges:
 *   1. Google News RSS (primary — free, reliable, multilingual)
 *   2. GDELT Doc API   (secondary — broader coverage when available)
 */

const cheerio = require('cheerio');

const GDELT_API = 'https://api.gdeltproject.org/api/v2/doc/doc';

const GNEWS_SEARCHES = [
  { q: 'shark attack',    hl: 'en', gl: 'US', ceid: 'US:en',  language: 'English'    },
  { q: 'shark bite',      hl: 'en', gl: 'AU', ceid: 'AU:en',  language: 'English'    },
  { q: 'attaque requin',  hl: 'fr', gl: 'FR', ceid: 'FR:fr',  language: 'French'     },
  { q: 'tiburon ataque',  hl: 'es', gl: 'ES', ceid: 'ES:es',  language: 'Spanish'    },
  { q: 'tubarao ataque',  hl: 'pt', gl: 'BR', ceid: 'BR:pt',  language: 'Portuguese' },
  { q: 'hai angriff',     hl: 'de', gl: 'DE', ceid: 'DE:de',  language: 'German'     },
];

// Single combined GDELT query to minimise rate-limit exposure
const GDELT_QUERY = '"shark attack" OR "shark bite" OR "shark attacked" OR "tiburon ataque" OR "requin attaque"';

function sleep(ms) {
  return new Promise(r => setTimeout(r, ms));
}

function toGdeltTimestamp(date) {
  return date.toISOString().replace(/[^0-9]/g, '').slice(0, 14);
}

// ─── Google News RSS ──────────────────────────────────────────────────────────

function parsePubDate(dateStr) {
  if (!dateStr) return null;
  try {
    return new Date(dateStr);
  } catch {
    return null;
  }
}

function parseDomain(sourceUrl) {
  try {
    return new URL(sourceUrl).hostname.replace(/^www\./, '');
  } catch {
    return sourceUrl || 'unknown';
  }
}

async function fetchFromGoogleNews(lookbackHours) {
  const cutoff = new Date(Date.now() - lookbackHours * 60 * 60 * 1000);
  const articles = [];

  for (const search of GNEWS_SEARCHES) {
    try {
      const url = `https://news.google.com/rss/search?q=${encodeURIComponent(search.q)}&hl=${search.hl}&gl=${search.gl}&ceid=${search.ceid}`;

      const res = await fetch(url, {
        headers: {
          'User-Agent': 'Mozilla/5.0 (compatible; SharkAttackAnalytics/1.0)',
          'Accept': 'application/rss+xml, text/xml, */*',
        },
        signal: AbortSignal.timeout(12000),
        redirect: 'follow',
      });

      if (!res.ok) {
        console.log(`[GNews] HTTP ${res.status} for "${search.q}"`);
        await sleep(1500);
        continue;
      }

      const xml = await res.text();
      const $ = cheerio.load(xml, { xmlMode: true });
      let count = 0;

      $('item').each((_, el) => {
        const title = $(el).find('title').text().trim();
        // In Google News RSS, the URL lives in <link> or <guid>
        const link  = $(el).find('guid').text().trim()
                   || $(el).find('link').text().trim();
        const pubDate = $(el).find('pubDate').text().trim();
        const sourceAttr = $(el).find('source').attr('url') || '';
        const domain = parseDomain(sourceAttr) || 'google-news';

        if (!title || !link) return;

        const articleDate = parsePubDate(pubDate);
        if (articleDate && articleDate < cutoff) return; // too old

        // Strip " - Source Name" suffix Google appends to titles
        const cleanTitle = title.replace(/\s{1,3}[-–]\s{1,3}[^-–]{2,60}$/, '').trim();

        articles.push({
          url: link,
          title: cleanTitle || title,
          seendate: articleDate ? articleDate.toISOString() : new Date().toISOString(),
          domain,
          language: search.language,
          sourcecountry: search.gl,
        });
        count++;
      });

      console.log(`[GNews] "${search.q}" → ${count} articles within lookback window`);
    } catch (err) {
      console.error(`[GNews] Failed "${search.q}":`, err.message);
    }

    await sleep(1200);
  }

  return articles;
}

// ─── GDELT Doc API ────────────────────────────────────────────────────────────

async function fetchFromGdelt(lookbackHours) {
  const endDate   = new Date();
  const startDate = new Date(endDate - lookbackHours * 60 * 60 * 1000);

  const params = new URLSearchParams({
    query:         GDELT_QUERY,
    mode:          'artlist',
    format:        'json',
    maxrecords:    '250',
    startdatetime: toGdeltTimestamp(startDate),
    enddatetime:   toGdeltTimestamp(endDate),
    sort:          'DateDesc',
  });

  let lastErr;
  for (let attempt = 0; attempt < 3; attempt++) {
    try {
      const res = await fetch(`${GDELT_API}?${params}`, {
        headers: { 'User-Agent': 'SharkAttackAnalytics/1.0 (research)' },
        signal: AbortSignal.timeout(15000),
      });

      if (res.status === 429) {
        const wait = Math.pow(2, attempt) * 6000; // 6s, 12s, 24s
        console.log(`[GDELT] Rate limited — waiting ${wait / 1000}s (attempt ${attempt + 1}/3)`);
        await sleep(wait);
        continue;
      }

      if (!res.ok) {
        throw new Error(`HTTP ${res.status}`);
      }

      const json = await res.json();
      const articles = (json.articles || []).map(a => ({
        url:          a.url,
        title:        a.title,
        seendate:     a.seendate,
        domain:       a.domain,
        language:     a.language || 'English',
        sourcecountry: a.sourcecountry || '',
      }));

      console.log(`[GDELT] Combined query → ${articles.length} articles`);
      return articles;

    } catch (err) {
      lastErr = err;
      console.error(`[GDELT] Attempt ${attempt + 1} failed:`, err.message);
      await sleep(4000);
    }
  }

  console.log('[GDELT] All attempts failed — continuing without GDELT results');
  return [];
}

// ─── Public API ───────────────────────────────────────────────────────────────

async function fetchArticles(lookbackHours = 4) {
  console.log(`[Fetcher] Querying all sources | lookback: ${lookbackHours}h`);

  const [gnewsResult, gdeltResult] = await Promise.allSettled([
    fetchFromGoogleNews(lookbackHours),
    fetchFromGdelt(lookbackHours),
  ]);

  const gnews = gnewsResult.status === 'fulfilled' ? gnewsResult.value : [];
  const gdelt = gdeltResult.status === 'fulfilled' ? gdeltResult.value : [];

  // Merge and deduplicate by URL
  const seen = new Set();
  const merged = [];

  for (const article of [...gnews, ...gdelt]) {
    if (article.url && !seen.has(article.url)) {
      seen.add(article.url);
      merged.push(article);
    }
  }

  console.log(`[Fetcher] Total unique articles: ${merged.length} (GNews: ${gnews.length}, GDELT: ${gdelt.length})`);
  return merged;
}

module.exports = { fetchArticles };
