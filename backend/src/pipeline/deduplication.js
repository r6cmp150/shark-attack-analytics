const supabase = require('../db/supabase');

// Has this exact URL already been stored?
async function isUrlAlreadyStored(sourceUrl) {
  const { count, error } = await supabase
    .from('incidents')
    .select('id', { count: 'exact', head: true })
    .eq('source_url', sourceUrl);

  if (error) {
    console.error('[Dedup] URL check error:', error.message);
    return false;
  }
  return (count || 0) > 0;
}

// Does a similar incident already exist? (same date + country + victim_activity)
// Catches the same event reported by multiple outlets.
async function isSimilarIncidentStored(incidentData) {
  const { date_of_attack, country, victim_activity } = incidentData || {};
  if (!date_of_attack || !country) return false;

  let query = supabase
    .from('incidents')
    .select('id', { count: 'exact', head: true })
    .eq('date_of_attack', date_of_attack)
    .ilike('country', country);

  if (victim_activity) {
    query = query.eq('victim_activity', victim_activity);
  }

  const { count, error } = await query;
  if (error) {
    console.error('[Dedup] Incident check error:', error.message);
    return false;
  }
  return (count || 0) > 0;
}

async function isDuplicate(sourceUrl, incidentData = null) {
  if (await isUrlAlreadyStored(sourceUrl)) {
    return { duplicate: true, reason: 'url' };
  }

  if (incidentData && await isSimilarIncidentStored(incidentData)) {
    return { duplicate: true, reason: 'incident' };
  }

  return { duplicate: false };
}

module.exports = { isDuplicate };
