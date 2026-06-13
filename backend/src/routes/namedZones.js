const express = require('express');
const router = express.Router();
const supabase = require('../db/supabase');

// GET /api/named-zones
router.get('/', async (req, res, next) => {
  try {
    const { country, species } = req.query;

    let query = supabase
      .from('named_zones')
      .select('*')
      .order('total_attacks', { ascending: false });

    if (country) query = query.ilike('country', `%${country}%`);
    if (species) query = query.contains('known_species', [species]);

    const { data, error } = await query;
    if (error) throw error;

    res.json({ data });
  } catch (err) {
    next(err);
  }
});

// GET /api/named-zones/:id
router.get('/:id', async (req, res, next) => {
  try {
    const { data, error } = await supabase
      .from('named_zones')
      .select('*')
      .eq('id', req.params.id)
      .single();

    if (error) {
      if (error.code === 'PGRST116') return res.status(404).json({ error: 'Zone not found' });
      throw error;
    }

    res.json(data);
  } catch (err) {
    next(err);
  }
});

// POST /api/named-zones
router.post('/', async (req, res, next) => {
  try {
    const { data, error } = await supabase
      .from('named_zones')
      .insert(req.body)
      .select()
      .single();

    if (error) throw error;
    res.status(201).json(data);
  } catch (err) {
    next(err);
  }
});

// PUT /api/named-zones/:id
router.put('/:id', async (req, res, next) => {
  try {
    const { data, error } = await supabase
      .from('named_zones')
      .update(req.body)
      .eq('id', req.params.id)
      .select()
      .single();

    if (error) {
      if (error.code === 'PGRST116') return res.status(404).json({ error: 'Zone not found' });
      throw error;
    }

    res.json(data);
  } catch (err) {
    next(err);
  }
});

// DELETE /api/named-zones/:id
router.delete('/:id', async (req, res, next) => {
  try {
    const { error } = await supabase.from('named_zones').delete().eq('id', req.params.id);
    if (error) throw error;
    res.status(204).send();
  } catch (err) {
    next(err);
  }
});

module.exports = router;
