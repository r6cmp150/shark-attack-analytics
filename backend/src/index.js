require('dotenv').config();

// Startup diagnostic — visible in Render/Railway logs before any module load
const REQUIRED_VARS = ['SUPABASE_URL', 'SUPABASE_SECRET_KEY', 'GEMINI_API_KEY'];
const missing = REQUIRED_VARS.filter(k => !process.env[k]);
if (missing.length) {
  console.error('[Startup] FATAL: Missing environment variables:', missing.join(', '));
  console.error('[Startup] Add them in your hosting dashboard → Environment tab, then redeploy.');
  process.exit(1);
}
console.log('[Startup] Env vars OK. Node', process.version, '— starting server…');

const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const morgan = require('morgan');
const rateLimit = require('express-rate-limit');

const incidentsRouter = require('./routes/incidents');
const regionsRouter = require('./routes/regions');
const namedZonesRouter = require('./routes/namedZones');
const riskEstimatesRouter = require('./routes/riskEstimates');
const sharkMigrationsRouter = require('./routes/sharkMigrations');
const pipelineRouter = require('./routes/pipeline');
const errorHandler = require('./middleware/errorHandler');
const { startScheduler } = require('./pipeline/scheduler');

const app = express();
const PORT = process.env.PORT || 3001;

app.use(helmet());
// Support comma-separated FRONTEND_URL list for multi-origin (e.g. Vercel + localhost)
const allowedOrigins = process.env.FRONTEND_URL
  ? process.env.FRONTEND_URL.split(',').map(u => u.trim()).filter(Boolean)
  : null;

app.use(cors({
  origin: allowedOrigins ?? true,   // true = reflect any origin (dev fallback)
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

app.listen(PORT, '0.0.0.0', () => {
  console.log(`Shark Attack Analytics API running on port ${PORT}`);
  startScheduler();
});
