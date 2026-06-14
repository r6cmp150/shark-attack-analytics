require('dotenv').config();

// Catch anything that escapes the main try/catch (e.g. errors in async callbacks)
process.on('uncaughtException', (err) => {
  console.error('[Fatal] Uncaught exception:');
  console.error(err.stack || err);
  process.exit(1);
});

process.on('unhandledRejection', (reason) => {
  console.error('[Fatal] Unhandled promise rejection:');
  console.error(reason instanceof Error ? reason.stack : reason);
  process.exit(1);
});

try {
  const REQUIRED_VARS = ['SUPABASE_URL', 'SUPABASE_SECRET_KEY', 'GEMINI_API_KEY'];
  const missing = REQUIRED_VARS.filter(k => !process.env[k]);
  const present = REQUIRED_VARS.filter(k => process.env[k]);
  if (present.length) console.log('[Startup] Env vars present:', present.join(', '));
  if (missing.length) console.warn('[Startup] WARNING: Env vars missing:', missing.join(', '), '— dependent features will fail at runtime');
  console.log('[Startup] Node', process.version, '— loading modules…');

  const express = require('express');
  console.log('[Startup] express loaded');
  const cors = require('cors');
  const helmet = require('helmet');
  const morgan = require('morgan');
  const rateLimit = require('express-rate-limit');
  console.log('[Startup] Core middleware loaded');

  const incidentsRouter = require('./routes/incidents');
  console.log('[Startup] routes/incidents loaded');
  const regionsRouter = require('./routes/regions');
  console.log('[Startup] routes/regions loaded');
  const namedZonesRouter = require('./routes/namedZones');
  console.log('[Startup] routes/namedZones loaded');
  const riskEstimatesRouter = require('./routes/riskEstimates');
  console.log('[Startup] routes/riskEstimates loaded');
  const sharkMigrationsRouter = require('./routes/sharkMigrations');
  console.log('[Startup] routes/sharkMigrations loaded');
  const pipelineRouter = require('./routes/pipeline');
  console.log('[Startup] routes/pipeline loaded');
  const errorHandler = require('./middleware/errorHandler');
  console.log('[Startup] middleware/errorHandler loaded');
  const { startScheduler } = require('./pipeline/scheduler');
  console.log('[Startup] pipeline/scheduler loaded');

  const app = express();
  const PORT = process.env.PORT || 3001;

  app.use(helmet());

  const allowedOrigins = process.env.FRONTEND_URL
    ? process.env.FRONTEND_URL.split(',').map(u => u.trim()).filter(Boolean)
    : null;

  app.use(cors({
    origin: allowedOrigins ?? true,
    methods: ['GET', 'POST', 'PUT', 'DELETE'],
  }));
  app.use(morgan('dev'));
  app.use(express.json({ limit: '10mb' }));

  app.use(rateLimit({
    windowMs: 15 * 60 * 1000,
    max: 500,
    standardHeaders: true,
    legacyHeaders: false,
    message: { error: 'Too many requests — please try again later' },
  }));

  app.get('/health', (req, res) => {
    res.json({ status: 'ok', timestamp: new Date().toISOString() });
  });

  app.use('/api/incidents', incidentsRouter);
  app.use('/api/regions', regionsRouter);
  app.use('/api/named-zones', namedZonesRouter);
  app.use('/api/risk-estimates', riskEstimatesRouter);
  app.use('/api/shark-migrations', sharkMigrationsRouter);
  app.use('/api/pipeline', pipelineRouter);

  app.use(errorHandler);

  console.log('[Startup] Express app configured — binding to port', PORT);

  const server = app.listen(PORT, '0.0.0.0', () => {
    console.log(`[Startup] Shark Attack Analytics API running on port ${PORT}`);
    startScheduler();
  });

  server.on('error', (err) => {
    console.error('[Startup] Server failed to bind:', err.stack || err);
    process.exit(1);
  });

} catch (err) {
  console.error('[Startup] FATAL error during startup:');
  console.error(err.stack || err);
  process.exit(1);
}
