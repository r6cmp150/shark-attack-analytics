const express = require('express');
const router = express.Router();
const supabase = require('../db/supabase');

// GET /api/risk-estimates
router.get('/', async (req, res, next) => {
  try {
    const { region_id, risk_tier } = req.query;

    let query = supabase
      .from('risk_estimates')
      .select('*, regions(name, country)')
      .order('relative_risk_score', { ascending: false });

    if (region_id) query = query.eq('region_id', region_id);
    if (risk_tier) query = query.eq('risk_tier', risk_tier);

    const { data, error } = await query;
    if (error) throw error;

    res.json({ data });
  } catch (err) {
    next(err);
  }
});

// GET /api/risk-estimates/:id
router.get('/:id', async (req, res, next) => {
  try {
    const { data, error } = await supabase
      .from('risk_estimates')
      .select('*, regions(name, country)')
      .eq('id', req.params.id)
      .single();

    if (error) {
      if (error.code === 'PGRST116') return res.status(404).json({ error: 'Risk estimate not found' });
      throw error;
    }

    res.json(data);
  } catch (err) {
    next(err);
  }
});

// POST /api/risk-estimates
router.post('/', async (req, res, next) => {
  try {
    const { data, error } = await supabase
      .from('risk_estimates')
      .insert(req.body)
      .select()
      .single();

    if (error) throw error;
    res.status(201).json(data);
  } catch (err) {
    next(err);
  }
});

// PUT /api/risk-estimates/:id
router.put('/:id', async (req, res, next) => {
  try {
    const { data, error } = await supabase
      .from('risk_estimates')
      .update(req.body)
      .eq('id', req.params.id)
      .select()
      .single();

    if (error) {
      if (error.code === 'PGRST116') return res.status(404).json({ error: 'Risk estimate not found' });
      throw error;
    }

    res.json(data);
  } catch (err) {
    next(err);
  }
});

// DELETE /api/risk-estimates/:id
router.delete('/:id', async (req, res, next) => {
  try {
    const { error } = await supabase.from('risk_estimates').delete().eq('id', req.params.id);
    if (error) throw error;
    res.status(204).send();
  } catch (err) {
    next(err);
  }
});

module.exports = router;
