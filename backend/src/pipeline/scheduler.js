const cron = require('node-cron');
const { runPipeline } = require('./runner');

// Every 4 hours: midnight, 4am, 8am, noon, 4pm, 8pm
const SCHEDULE = '0 */4 * * *';

function startScheduler() {
  console.log(`[Scheduler] Pipeline cron: "${SCHEDULE}" (every 4 hours)`);

  cron.schedule(SCHEDULE, async () => {
    console.log(`[Scheduler] Triggering scheduled pipeline run — ${new Date().toISOString()}`);
    try {
      await runPipeline(4);
    } catch (err) {
      console.error('[Scheduler] Pipeline run failed:', err.message);
    }
  });
}

module.exports = { startScheduler };
