const express = require('express');
const router = express.Router();
const { runPipeline, getPipelineStatus } = require('../pipeline/runner');
const supabase = require('../db/supabase');

// GET /api/pipeline/status
router.get('/status', (req, res) => {
  res.json(getPipelineStatus());
});

// POST /api/pipeline/run
// Body: { lookback_hours: number } (optional, default 4)
router.post('/run', async (req, res, next) => {
  try {
    const status = getPipelineStatus();
    if (status.is_running) {
      return res.status(409).json({ error: 'Pipeline is already running' });
    }

    const lookbackHours = Math.min(Number(req.body?.lookback_hours) || 4, 72);

    // Fire and forget — client gets immediate response, pipeline runs in background
    runPipeline(lookbackHours).catch(err => {
      console.error('[Pipeline Route] Background run error:', err.message);
    });

    res.json({
      message: 'Pipeline started',
      lookback_hours: lookbackHours,
    });
  } catch (err) {
    next(err);
  }
});

// GET /api/pipeline/alerts?hours=24
router.get('/alerts', async (req, res, next) => {
  try {
    const hours = Math.min(Math.max(parseInt(req.query.hours) || 24, 1), 168)
    const since = new Date(Date.now() - hours * 60 * 60 * 1000).toISOString()

    const { data, error, count } = await supabase
      .from('incidents')
      .select(
        'id, date_of_attack, country, outcome, shark_species, victim_activity, source_url, source_publication, created_at',
        { count: 'exact' }
      )
      .gte('created_at', since)
      .order('created_at', { ascending: false })
      .limit(20)

    if (error) throw error

    res.json({
      count: count ?? 0,
      hours,
      since,
      incidents: data,
      pipeline_status: getPipelineStatus(),
    })
  } catch (err) {
    next(err)
  }
})

module.exports = router;
