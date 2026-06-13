function errorHandler(err, req, res, next) {
  console.error(`[${new Date().toISOString()}] ${req.method} ${req.path}`, err.message);

  // Invalid UUID
  if (err.code === '22P02') {
    return res.status(400).json({ error: 'Invalid UUID format' });
  }

  // Supabase not found (single() with no rows)
  if (err.code === 'PGRST116') {
    return res.status(404).json({ error: 'Record not found' });
  }

  // Constraint violations
  if (err.code === '23503') {
    return res.status(400).json({ error: 'Referenced record does not exist' });
  }
  if (err.code === '23505') {
    return res.status(409).json({ error: 'Duplicate record' });
  }

  const status = err.status || 500;
  res.status(status).json({ error: err.message || 'Internal server error' });
}

module.exports = errorHandler;
