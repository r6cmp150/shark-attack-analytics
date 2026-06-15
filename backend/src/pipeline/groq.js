const Groq = require('groq-sdk');

const MODEL = 'llama-3.1-8b-instant';
const DAILY_CAP = 500;          // Groq free tier: 14,400 RPD — conservative ceiling
const CALL_INTERVAL_MS = 2100;  // 30 RPM limit → 1 call per 2s + small buffer

let groqClient = null;

function getClient() {
  if (!groqClient) {
    groqClient = new Groq({ apiKey: process.env.GROQ_API_KEY });
  }
  return groqClient;
}

// Daily call counter — resets at midnight, persisted to Supabase across restarts
let dailyCount = 0;
let countDate = new Date().toDateString();
let dailyCountInitialized = false;

async function initDailyCount() {
  if (dailyCountInitialized) return;
  dailyCountInitialized = true;
  try {
    const supabase = require('../db/supabase');
    const { data } = await supabase
      .from('pipeline_state')
      .select('value')
      .eq('key', 'groq_daily')
      .single();
    if (data?.value?.date === new Date().toDateString()) {
      dailyCount = data.value.count || 0;
      countDate = data.value.date;
      console.log(`[Groq] Restored daily count: ${dailyCount}/${DAILY_CAP}`);
    }
  } catch (err) {
    console.warn('[Groq] Could not restore daily count:', err.message);
  }
}

function persistDailyCount() {
  try {
    const supabase = require('../db/supabase');
    supabase.from('pipeline_state').upsert({
      key: 'groq_daily',
      value: { count: dailyCount, date: countDate },
      updated_at: new Date().toISOString(),
    }).then(() => {}).catch(err => {
      console.warn('[Groq] Could not persist daily count:', err.message);
    });
  } catch {}
}

async function checkAndIncrementDailyCount() {
  await initDailyCount();
  const today = new Date().toDateString();
  if (today !== countDate) {
    dailyCount = 0;
    countDate = today;
  }
  if (dailyCount >= DAILY_CAP) {
    throw new Error(`Daily Groq cap reached (${DAILY_CAP} calls)`);
  }
  dailyCount++;
  persistDailyCount();
}

function sleep(ms) {
  return new Promise(r => setTimeout(r, ms));
}

function parseJsonResponse(text) {
  const cleaned = text
    .replace(/```json\s*/gi, '')
    .replace(/```\s*/g, '')
    .trim();
  return JSON.parse(cleaned);
}

async function callWithRetry(prompt, maxRetries = 3) {
  for (let attempt = 0; attempt < maxRetries; attempt++) {
    try {
      const response = await getClient().chat.completions.create({
        model: MODEL,
        messages: [{ role: 'user', content: prompt }],
        temperature: 0,
      });
      return response.choices[0]?.message?.content || '';
    } catch (err) {
      const is429 = err.status === 429 || err.message?.includes('429') || err.message?.includes('rate_limit');
      if (is429 && attempt < maxRetries - 1) {
        const waitMs = Math.pow(2, attempt + 1) * 8000;
        console.log(`[Groq] Rate limited — waiting ${(waitMs / 1000).toFixed(1)}s before retry ${attempt + 1}/${maxRetries - 1}`);
        await sleep(waitMs);
        continue;
      }
      throw err;
    }
  }
}

// Stage 2 — title-only classification (~50-100 tokens)
async function checkTitle(title, language = 'English') {
  await checkAndIncrementDailyCount();

  const prompt = `You are a shark attack news classifier.

Article title: "${title}"
Detected language: ${language}

Does this article report a real shark attack on a human? Qualifying events: bites, fatal encounters, injuries caused by a shark in the water.

Exclude: shark sightings with no contact, shark fishing, aquarium incidents, fictional/entertainment content, metaphorical use of "shark", conservation news without an attack.

Respond with valid JSON only — no other text:
{"is_shark_attack": true or false, "confidence": 0.0 to 1.0}`;

  try {
    const text = await callWithRetry(prompt);
    const parsed = parseJsonResponse(text);
    await sleep(CALL_INTERVAL_MS);
    return parsed;
  } catch (err) {
    console.error('[Groq Stage 2] Error:', err.message);
    await sleep(CALL_INTERVAL_MS);
    return { is_shark_attack: false, confidence: 0 };
  }
}

// Stage 3 — incident extraction from title + headline metadata
async function extractIncident(title, metadata, sourceUrl) {
  await checkAndIncrementDailyCount();

  const prompt = `You are a shark attack incident analyst extracting structured data from a news headline.

TITLE: ${title}
SOURCE: ${sourceUrl}
${metadata ? `\n${metadata}` : ''}

Extract all available information from the headline and metadata above. Many fields will be null — only populate what can be confidently inferred from the title. Return a single JSON object with these exact fields. Use null for anything not determinable:

{
  "date_of_attack": "YYYY-MM-DD or null",
  "time_of_attack": "HH:MM (24h) or null",
  "time_of_day": "dawn|morning|afternoon|dusk|night|unknown",
  "country": "country name or null",
  "region": "state/province/county or null",
  "location_name": "specific beach or location name or null",
  "latitude": decimal number or null,
  "longitude": decimal number or null,
  "shark_species": "common species name or null",
  "victim_activity": "surfing|swimming|diving|fishing|boating|snorkeling|wading|other or null",
  "outcome": "fatal|injured|unharmed|unknown",
  "injury_description": "brief description or null",
  "motivation": "predatory|investigatory|territorial|warning|retaliatory or null",
  "motivation_confidence": 0.0 to 1.0 or null,
  "water_temperature": celsius as number or null,
  "water_visibility": "clear|murky|unknown or null",
  "water_depth": metres as number or null,
  "tidal_state": "incoming|outgoing|high|low|unknown or null",
  "moon_phase": "text description or null",
  "weather_conditions": "text description or null",
  "proximity_to_fishing": true|false|null,
  "proximity_to_seal_colony": true|false|null,
  "bait_fish_present": true|false|null,
  "is_confirmed": true or false,
  "confidence_score": 0.0 to 1.0
}

MOTIVATION TAXONOMY — follow strictly:
- predatory: shark attacked with intent to consume the human
- investigatory: bite-and-release; shark was assessing — USE THIS instead of "mistaken identity"
- territorial: shark defending feeding area or space
- warning: deliberate threatening display or parade behavior toward observers
- retaliatory: direct response to human provocation or threat to the shark

NEVER use "mistaken identity". Reclassify all such cases as investigatory.
If motivation is ambiguous, use investigatory with confidence 0.3–0.5.

For latitude/longitude: if you know the named location, provide your best coordinate estimate. Otherwise null.

Return ONLY the JSON object. No markdown fences, no explanation text.`;

  try {
    const text = await callWithRetry(prompt);
    const parsed = parseJsonResponse(text);
    parsed.is_estimated = false;
    await sleep(CALL_INTERVAL_MS);
    return parsed;
  } catch (err) {
    console.error('[Groq Stage 3] Error:', err.message);
    await sleep(CALL_INTERVAL_MS);
    return null;
  }
}

function getDailyCallCount() {
  const today = new Date().toDateString();
  if (today !== countDate) return { count: 0, cap: DAILY_CAP, remaining: DAILY_CAP };
  return { count: dailyCount, cap: DAILY_CAP, remaining: DAILY_CAP - dailyCount };
}

module.exports = { checkTitle, extractIncident, getDailyCallCount };
