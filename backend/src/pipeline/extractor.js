const cheerio = require('cheerio');

const FETCH_TIMEOUT_MS = 12000;
const MIN_CONTENT_LENGTH = 200;
const USER_AGENT = 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/124.0.0.0 Safari/537.36';

// Ordered list of CSS selectors most likely to contain article body text
const ARTICLE_SELECTORS = [
  'article',
  '[itemprop="articleBody"]',
  '[data-testid="article-body"]',
  '.article-body',
  '.article-content',
  '.article__body',
  '.story-body',
  '.story-content',
  '.entry-content',
  '.post-content',
  '.post-body',
  '.news-content',
  '.news-article',
  '.body-copy',
  '.content-body',
  'main',
];

async function fetchArticleText(url) {
  try {
    const res = await fetch(url, {
      headers: {
        'User-Agent': USER_AGENT,
        'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8',
        'Accept-Language': 'en-US,en;q=0.9',
        'Cache-Control': 'no-cache',
      },
      signal: AbortSignal.timeout(FETCH_TIMEOUT_MS),
      redirect: 'follow',
    });

    if (!res.ok) {
      console.log(`[Extractor] HTTP ${res.status} for ${url}`);
      return null;
    }

    const contentType = res.headers.get('content-type') || '';
    if (!contentType.includes('text/html')) return null;

    const html = await res.text();
    return extractText(html, url);
  } catch (err) {
    console.log(`[Extractor] Fetch failed ${url}: ${err.message}`);
    return null;
  }
}

function extractText(html, url) {
  const $ = cheerio.load(html);

  // Strip noise
  $('script, style, noscript, nav, header, footer, aside, form').remove();
  $('[class*="ad-"], [class*="advertisement"], [class*="social"], [class*="comment"], [id*="comment"]').remove();
  $('[class*="related"], [class*="sidebar"], [class*="newsletter"], [class*="subscribe"]').remove();

  // Try structured selectors first
  for (const sel of ARTICLE_SELECTORS) {
    const el = $(sel).first();
    if (!el.length) continue;

    const paragraphs = el.find('p')
      .map((_, p) => $(p).text().trim())
      .get()
      .filter(t => t.length > 30);

    const text = paragraphs.join('\n\n');
    if (text.length >= MIN_CONTENT_LENGTH) return text;
  }

  // Fallback: all <p> tags with meaningful length
  const allParas = $('p')
    .map((_, p) => $(p).text().trim())
    .get()
    .filter(t => t.length > 40);

  const fallback = allParas.join('\n\n');
  if (fallback.length >= MIN_CONTENT_LENGTH) return fallback;

  console.log(`[Extractor] Insufficient content extracted from ${url}`);
  return null;
}

module.exports = { fetchArticleText };
