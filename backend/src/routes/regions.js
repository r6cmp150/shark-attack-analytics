const express = require('express');
const router = express.Router();
const supabase = require('../db/supabase');

// GET /api/regions
router.get('/', async (req, res, next) => {
  try {
    const { country, is_named_zone, reporting_quality, limit = '100', offset = '0' } = req.query;
    const limitNum = Math.min(parseInt(limit) || 100, 500);
    const offsetNum = parseInt(offset) || 0;

    let query = supabase
      .from('regions')
      .select('*', { count: 'exact' })
      .order('name')
      .range(offsetNum, offsetNum + limitNum - 1);

    if (country) query = query.ilike('country', `%${country}%`);
    if (is_named_zone !== undefined) query = query.eq('is_named_zone', is_named_zone === 'true');
    if (reporting_quality) query = query.eq('reporting_quality', reporting_quality);

    const { data, error, count } = await query;
    if (error) throw error;

    res.json({ data, total: count, limit: limitNum, offset: offsetNum });
  } catch (err) {
    next(err);
  }
});

// GET /api/regions/:id
router.get('/:id', async (req, res, next) => {
  try {
    const { data, error } = await supabase
      .from('regions')
      .select('*, risk_estimates(*)')
      .eq('id', req.params.id)
      .single();

    if (error) {
      if (error.code === 'PGRST116') return res.status(404).json({ error: 'Region not found' });
      throw error;
    }

    res.json(data);
  } catch (err) {
    next(err);
  }
});

// POST /api/regions
router.post('/', async (req, res, next) => {
  try {
    const { data, error } = await supabase
      .from('regions')
      .insert(req.body)
      .select()
      .single();

    if (error) throw error;
    res.status(201).json(data);
  } catch (err) {
    next(err);
  }
});

// PUT /api/regions/:id
router.put('/:id', async (req, res, next) => {
  try {
    const { data, error } = await supabase
      .from('regions')
      .update(req.body)
      .eq('id', req.params.id)
      .select()
      .single();

    if (error) {
      if (error.code === 'PGRST116') return res.status(404).json({ error: 'Region not found' });
      throw error;
    }

    res.json(data);
  } catch (err) {
    next(err);
  }
});

// DELETE /api/regions/:id
router.delete('/:id', async (req, res, next) => {
  try {
    const { error } = await supabase.from('regions').delete().eq('id', req.params.id);
    if (error) throw error;
    res.status(204).send();
  } catch (err) {
    next(err);
  }
});

module.exports = router;
