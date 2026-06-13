const { fetchArticles } = require('./gdelt');
const { applyStage1Filter } = require('./filter');
const { checkTitle, extractIncident, getDailyCallCount } = require('./gemini');
const { fetchArticleText } = require('./extractor');
const { isDuplicate } = require('./deduplication');
const supabase = require('../db/supabase');

let isRunning = false;
let lastRunStats = null;

async function runPipeline(lookbackHours = 4) {
  if (isRunning) {
    console.log('[Pipeline] Already running — skipping trigger');
    return { skipped: true };
  }

  isRunning = true;

  const stats = {
    started_at: new Date().toISOString(),
    lookback_hours: lookbackHours,
    gdelt_fetched: 0,
    stage1_passed: 0,
    stage2_passed: 0,
    stage3_extracted: 0,
    inserted: 0,
    duplicates: 0,
    fetch_failures: 0,
    errors: 0,
    completed_at: null,
  };

  try {
    // ── Stage 1: GDELT fetch + free filter ──────────────────────────────────
    const rawArticles = await fetchArticles(lookbackHours);
    stats.gdelt_fetched = rawArticles.length;

    const stage1Articles = applyStage1Filter(rawArticles);
    stats.stage1_passed = stage1Articles.length;

    if (stage1Articles.length === 0) {
      console.log('[Pipeline] No articles passed Stage 1 — done');
      return stats;
    }

    // Respect Gemini daily cap — only process as many as we have budget for
    const { remaining } = getDailyCallCount();
    // Stage 2 + Stage 3 together = up to 2 calls per article
    const maxArticles = Math.floor(remaining / 2);
    const articlesToProcess = stage1Articles.slice(0, maxArticles);

    if (articlesToProcess.length < stage1Articles.length) {
      console.log(`[Pipeline] Gemini budget: capping at ${articlesToProcess.length}/${stage1Articles.length} articles`);
    }

    // ── Stage 2: Gemini title check ─────────────────────────────────────────
    for (const article of articlesToProcess) {
      try {
        console.log(`\n[Stage 2] Checking: "${article.title?.slice(0, 80)}"`);

        const titleCheck = await checkTitle(article.title, article.language);

        if (!titleCheck.is_shark_attack || titleCheck.confidence < 0.6) {
          console.log(`[Stage 2] ✗ Rejected (confidence: ${titleCheck.confidence.toFixed(2)})`);
          continue;
        }

        console.log(`[Stage 2] ✓ Confirmed (confidence: ${titleCheck.confidence.toFixed(2)})`);
        stats.stage2_passed++;

        // Quick URL duplicate check before spending a Stage 3 call
        const urlCheck = await isDuplicate(article.url);
        if (urlCheck.duplicate) {
          console.log(`[Dedup] Skipping — ${urlCheck.reason} already stored`);
          stats.duplicates++;
          continue;
        }

        // ── Stage 3: Fetch article text + Gemini extraction ─────────────────
        console.log(`[Stage 3] Fetching: ${article.url}`);
        const articleText = await fetchArticleText(article.url);

        if (!articleText) {
          console.log('[Stage 3] ✗ Could not extract article text');
          stats.fetch_failures++;
          continue;
        }

        const incidentData = await extractIncident(article.title, articleText, article.url);

        if (!incidentData) {
          console.log('[Stage 3] ✗ Gemini extraction returned null');
          stats.errors++;
          continue;
        }

        stats.stage3_extracted++;
        console.log(`[Stage 3] ✓ Extracted: ${incidentData.location_name || incidentData.region || incidentData.country} | ${incidentData.date_of_attack} | ${incidentData.outcome}`);

        // Final incident-level duplicate check
        const incidentCheck = await isDuplicate(article.url, incidentData);
        if (incidentCheck.duplicate) {
          console.log(`[Dedup] Skipping — ${incidentCheck.reason} already stored`);
          stats.duplicates++;
          continue;
        }

        // ── Insert to Supabase ───────────────────────────────────────────────
        const record = {
          ...incidentData,
          source_url: article.url,
          source_language: article.language || null,
          source_publication: article.domain || null,
          raw_article_text: articleText.slice(0, 50000),
        };

        const { error } = await supabase.from('incidents').insert(record);

        if (error) {
          console.error('[Pipeline] Insert failed:', error.message);
          stats.errors++;
        } else {
          stats.inserted++;
          console.log('[Pipeline] ✓ Incident saved to database');
        }

      } catch (err) {
        console.error('[Pipeline] Article error:', err.message);
        stats.errors++;
      }
    }

  } catch (err) {
    console.error('[Pipeline] Fatal error:', err.message);
    stats.fatal_error = err.message;
  } finally {
    isRunning = false;
    stats.completed_at = new Date().toISOString();
    stats.gemini_usage = getDailyCallCount();

    const duration = ((new Date(stats.completed_at) - new Date(stats.started_at)) / 1000).toFixed(1);
    console.log(`\n[Pipeline] ── Run complete in ${duration}s ──`);
    console.log(`  GDELT fetched:   ${stats.gdelt_fetched}`);
    console.log(`  Stage 1 passed:  ${stats.stage1_passed}`);
    console.log(`  Stage 2 passed:  ${stats.stage2_passed}`);
    console.log(`  Stage 3 success: ${stats.stage3_extracted}`);
    console.log(`  Inserted:        ${stats.inserted}`);
    console.log(`  Duplicates:      ${stats.duplicates}`);
    console.log(`  Gemini used:     ${stats.gemini_usage.count}/${stats.gemini_usage.cap}`);

    lastRunStats = stats;
  }

  return stats;
}

function getPipelineStatus() {
  return {
    is_running: isRunning,
    last_run: lastRunStats,
    gemini_usage: getDailyCallCount(),
  };
}

module.exports = { runPipeline, getPipelineStatus };
