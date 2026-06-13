const express = require('express');
const router = express.Router();
const supabase = require('../db/supabase');

// GET /api/shark-migrations
router.get('/', async (req, res, next) => {
  try {
    const { species, region, month, presence_likelihood } = req.query;

    let query = supabase
      .from('shark_migrations')
      .select('*')
      .order('species')
      .order('month');

    if (species) query = query.ilike('species', `%${species}%`);
    if (region) query = query.ilike('region', `%${region}%`);
    if (month) query = query.eq('month', parseInt(month));
    if (presence_likelihood) query = query.eq('presence_likelihood', presence_likelihood);

    const { data, error } = await query;
    if (error) throw error;

    res.json({ data });
  } catch (err) {
    next(err);
  }
});

// GET /api/shark-migrations/:id
router.get('/:id', async (req, res, next) => {
  try {
    const { data, error } = await supabase
      .from('shark_migrations')
      .select('*')
      .eq('id', req.params.id)
      .single();

    if (error) {
      if (error.code === 'PGRST116') return res.status(404).json({ error: 'Migration record not found' });
      throw error;
    }

    res.json(data);
  } catch (err) {
    next(err);
  }
});

// POST /api/shark-migrations
router.post('/', async (req, res, next) => {
  try {
    const { data, error } = await supabase
      .from('shark_migrations')
      .insert(req.body)
      .select()
      .single();

    if (error) throw error;
    res.status(201).json(data);
  } catch (err) {
    next(err);
  }
});

// PUT /api/shark-migrations/:id
router.put('/:id', async (req, res, next) => {
  try {
    const { data, error } = await supabase
      .from('shark_migrations')
      .update(req.body)
      .eq('id', req.params.id)
      .select()
      .single();

    if (error) {
      if (error.code === 'PGRST116') return res.status(404).json({ error: 'Migration record not found' });
      throw error;
    }

    res.json(data);
  } catch (err) {
    next(err);
  }
});

// DELETE /api/shark-migrations/:id
router.delete('/:id', async (req, res, next) => {
  try {
    const { error } = await supabase.from('shark_migrations').delete().eq('id', req.params.id);
    if (error) throw error;
    res.status(204).send();
  } catch (err) {
    next(err);
  }
});

module.exports = router;
