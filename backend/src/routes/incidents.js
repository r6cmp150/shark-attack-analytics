const express = require('express');
const router = express.Router();
const supabase = require('../db/supabase');

// GET /api/incidents
router.get('/', async (req, res, next) => {
  try {
    const {
      country, region, shark_species, victim_activity, outcome, motivation,
      time_of_day, date_from, date_to, is_confirmed, is_estimated,
      limit = '50', offset = '0',
    } = req.query;

    const limitNum = Math.min(parseInt(limit) || 50, 200);
    const offsetNum = parseInt(offset) || 0;

    let query = supabase
      .from('incidents')
      .select('*', { count: 'exact' })
      .order('date_of_attack', { ascending: false })
      .range(offsetNum, offsetNum + limitNum - 1);

    if (country) query = query.ilike('country', `%${country}%`);
    if (region) query = query.ilike('region', `%${region}%`);
    if (shark_species) query = query.ilike('shark_species', `%${shark_species}%`);
    if (victim_activity) query = query.eq('victim_activity', victim_activity);
    if (outcome) query = query.eq('outcome', outcome);
    if (motivation) query = query.eq('motivation', motivation);
    if (time_of_day) query = query.eq('time_of_day', time_of_day);
    if (date_from) query = query.gte('date_of_attack', date_from);
    if (date_to) query = query.lte('date_of_attack', date_to);
    if (is_confirmed !== undefined) query = query.eq('is_confirmed', is_confirmed === 'true');
    if (is_estimated !== undefined) query = query.eq('is_estimated', is_estimated === 'true');

    const { data, error, count } = await query;
    if (error) throw error;

    res.json({ data, total: count, limit: limitNum, offset: offsetNum });
  } catch (err) {
    next(err);
  }
});

// GET /api/incidents/stats
router.get('/stats', async (req, res, next) => {
  try {
    const now = new Date();
    const yearStart = `${now.getFullYear()}-01-01`;
    const monthStart = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}-01`;
    const today = now.toISOString().split('T')[0];

    const [total, thisYear, thisMonth, todayResult, fatal, injured, confirmed] = await Promise.all([
      supabase.from('incidents').select('*', { count: 'exact', head: true }),
      supabase.from('incidents').select('*', { count: 'exact', head: true }).gte('date_of_attack', yearStart),
      supabase.from('incidents').select('*', { count: 'exact', head: true }).gte('date_of_attack', monthStart),
      supabase.from('incidents').select('*', { count: 'exact', head: true }).eq('date_of_attack', today),
      supabase.from('incidents').select('*', { count: 'exact', head: true }).eq('outcome', 'fatal'),
      supabase.from('incidents').select('*', { count: 'exact', head: true }).eq('outcome', 'injured'),
      supabase.from('incidents').select('*', { count: 'exact', head: true }).eq('is_confirmed', true),
    ]);

    res.json({
      total: total.count ?? 0,
      this_year: thisYear.count ?? 0,
      this_month: thisMonth.count ?? 0,
      today: todayResult.count ?? 0,
      confirmed: confirmed.count ?? 0,
      by_outcome: {
        fatal: fatal.count ?? 0,
        injured: injured.count ?? 0,
      },
    });
  } catch (err) {
    next(err);
  }
});

// GET /api/incidents/:id
router.get('/:id', async (req, res, next) => {
  try {
    const { data, error } = await supabase
      .from('incidents')
      .select('*')
      .eq('id', req.params.id)
      .single();

    if (error) {
      if (error.code === 'PGRST116') return res.status(404).json({ error: 'Incident not found' });
      throw error;
    }

    res.json(data);
  } catch (err) {
    next(err);
  }
});

// POST /api/incidents
router.post('/', async (req, res, next) => {
  try {
    const { data, error } = await supabase
      .from('incidents')
      .insert(req.body)
      .select()
      .single();

    if (error) throw error;
    res.status(201).json(data);
  } catch (err) {
    next(err);
  }
});

// PUT /api/incidents/:id
router.put('/:id', async (req, res, next) => {
  try {
    const { data, error } = await supabase
      .from('incidents')
      .update(req.body)
      .eq('id', req.params.id)
      .select()
      .single();

    if (error) {
      if (error.code === 'PGRST116') return res.status(404).json({ error: 'Incident not found' });
      throw error;
    }

    res.json(data);
  } catch (err) {
    next(err);
  }
});

// DELETE /api/incidents/:id
router.delete('/:id', async (req, res, next) => {
  try {
    const { error } = await supabase
      .from('incidents')
      .delete()
      .eq('id', req.params.id);

    if (error) throw error;
    res.status(204).send();
  } catch (err) {
    next(err);
  }
});

module.exports = router;
