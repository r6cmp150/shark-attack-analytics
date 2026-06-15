/**
 * Debug script: runs Stage 1 → Stage 2 on 5 articles and prints the
 * RAW Groq response text for each one BEFORE any JSON parsing.
 *
 * Run from the backend folder:
 *   node debug-stage2.js
 */

require('dotenv').config();
const Groq           = require('groq-sdk');
const { fetchArticles }     = require('./src/pipeline/gdelt');
const { applyStage1Filter } = require('./src/pipeline/filter');

const MODEL        = 'llama-3.1-8b-instant';
const MAX_ARTICLES = 5;
const LOOKBACK_HOURS = 72;

const groq = new Groq({ apiKey: process.env.GROQ_API_KEY });

function sleep(ms) { return new Promise(r => setTimeout(r, ms)); }

function buildPrompt(title, language) {
  return `You are a shark attack news classifier.

Article title: "${title}"
Detected language: ${language}

Does this article report a real shark attack on a human? Qualifying events: bites, fatal encounters, injuries caused by a shark in the water.

Exclude: shark sightings with no contact, shark fishing, aquarium incidents, fictional/entertainment content, metaphorical use of "shark", conservation news without an attack.

Respond with valid JSON only — no other text:
{"is_shark_attack": true or false, "confidence": 0.0 to 1.0}`;
}

async function callGroqRaw(prompt) {
  const response = await groq.chat.completions.create({
    model: MODEL,
    messages: [{ role: 'user', content: prompt }],
    temperature: 0,
  });
  return response.choices[0]?.message?.content || '';
}

async function main() {
  if (!process.env.GROQ_API_KEY) {
    console.error('ERROR: GROQ_API_KEY not set in .env');
    process.exit(1);
  }

  console.log('='.repeat(70));
  console.log('SHARK ATTACK PIPELINE — STAGE 2 DEBUG');
  console.log('='.repeat(70));
  console.log(`Model:    ${MODEL}`);
  console.log(`Lookback: ${LOOKBACK_HOURS}h`);
  console.log(`Articles: first ${MAX_ARTICLES} that pass Stage 1`);
  console.log('='.repeat(70));

  // ── Fetch + Stage 1 ────────────────────────────────────────────────────────
  console.log('\n[1/3] Fetching articles...');
  const raw = await fetchArticles(LOOKBACK_HOURS);
  console.log(`      ${raw.length} raw articles fetched`);

  console.log('\n[2/3] Applying Stage 1 filter...');
  const stage1 = applyStage1Filter(raw);
  console.log(`      ${stage1.length} articles passed Stage 1`);

  if (stage1.length === 0) {
    console.log('\nNo articles passed Stage 1. Try increasing LOOKBACK_HOURS.');
    process.exit(0);
  }

  const toTest = stage1.slice(0, MAX_ARTICLES);
  console.log(`\n[3/3] Running Stage 2 Groq check on ${toTest.length} articles...\n`);

  // ── Stage 2 for each article ───────────────────────────────────────────────
  for (let i = 0; i < toTest.length; i++) {
    const article = toTest[i];
    console.log('─'.repeat(70));
    console.log(`ARTICLE ${i + 1} of ${toTest.length}`);
    console.log(`  Title:    ${article.title}`);
    console.log(`  Language: ${article.language}`);
    console.log(`  Domain:   ${article.domain}`);
    console.log(`  URL:      ${article.url}`);

    const prompt = buildPrompt(article.title, article.language);
    console.log('\n  PROMPT SENT TO GROQ:');
    console.log('  ' + prompt.split('\n').join('\n  '));

    console.log('\n  RAW GROQ RESPONSE:');
    try {
      const rawText = await callGroqRaw(prompt);
      console.log('  >>>');
      console.log('  ' + rawText.split('\n').join('\n  '));
      console.log('  <<<');

      let parsed;
      try {
        const cleaned = rawText
          .replace(/```json\s*/gi, '')
          .replace(/```\s*/g, '')
          .trim();
        parsed = JSON.parse(cleaned);
        console.log('\n  PARSED RESULT:');
        console.log(`    is_shark_attack: ${parsed.is_shark_attack}`);
        console.log(`    confidence:      ${parsed.confidence}`);
        const verdict = parsed.is_shark_attack && parsed.confidence >= 0.3 ? 'PASS' : 'REJECT';
        console.log(`    DECISION:        ${verdict}`);
      } catch (parseErr) {
        console.log(`\n  PARSE ERROR: ${parseErr.message}`);
        console.log('  Production code returns { is_shark_attack: false, confidence: 0 } on any parse error.');
      }

    } catch (apiErr) {
      console.log(`\n  GROQ API ERROR: ${apiErr.message}`);
      if (apiErr.status === 429 || apiErr.message?.includes('429')) {
        console.log('  Rate limited — waiting 30s before next article...');
        await sleep(30000);
      }
    }

    console.log('');
    // Respect rate limit between calls (30 RPM = 1 per 2s)
    if (i < toTest.length - 1) {
      console.log('  [waiting 2.1s before next call to respect rate limit]');
      await sleep(2100);
    }
  }

  console.log('='.repeat(70));
  console.log('DEBUG RUN COMPLETE');
  console.log('='.repeat(70));
}

main().catch(err => {
  console.error('Fatal error:', err);
  process.exit(1);
});
