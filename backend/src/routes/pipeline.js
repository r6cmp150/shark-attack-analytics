const express = require('express');
const router = express.Router();
const { runPipeline, getPipelineStatus } = require('../pipeline/runner');

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

module.exports = router;
