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

// GET /api/risk-estimates/compute?country=X
router.get('/compute', async (req, res, next) => {
  try {
    const { country } = req.query
    if (!country) return res.status(400).json({ error: 'country parameter required' })

    const COVERAGE = {
      'United States': 'high', 'Australia': 'high', 'South Africa': 'high',
      'New Zealand': 'high', 'France': 'high', 'Italy': 'high', 'Spain': 'high',
      'Japan': 'high', 'United Kingdom': 'high', 'Portugal': 'high', 'Germany': 'high',
      'Brazil': 'medium', 'Mexico': 'medium', 'Philippines': 'medium',
      'Indonesia': 'medium', 'Egypt': 'medium', 'Thailand': 'medium',
      'Cuba': 'medium', 'India': 'medium', 'Malaysia': 'medium', 'Bahamas': 'medium',
    }

    const MULTIPLIERS = {
      high:   { low: 1.3, median: 2.0, high: 3.5 },
      medium: { low: 2.5, median: 4.0, high: 6.0 },
      low:    { low: 4.0, median: 6.0, high: 10.0 },
    }

    const REGIONAL_GROUPS = {
      'United States': ['United States', 'Mexico', 'Bahamas', 'Cuba', 'Canada', 'Panama'],
      'Australia':     ['Australia', 'New Zealand', 'Papua New Guinea', 'Solomon Islands'],
      'South Africa':  ['South Africa', 'Mozambique', 'Madagascar', 'Reunion', 'Comoros'],
      'Brazil':        ['Brazil', 'Argentina', 'Uruguay', 'Venezuela', 'Colombia'],
      'Indonesia':     ['Indonesia', 'Malaysia', 'Philippines', 'Thailand', 'Vietnam'],
      'France':        ['France', 'Spain', 'Italy', 'Portugal', 'Greece', 'Croatia'],
      'Japan':         ['Japan', 'South Korea', 'China', 'Taiwan', 'Vietnam'],
      'India':         ['India', 'Sri Lanka', 'Maldives', 'Bangladesh', 'Pakistan'],
      'Egypt':         ['Egypt', 'Israel', 'Jordan', 'Saudi Arabia', 'Yemen'],
      'Mexico':        ['Mexico', 'United States', 'Cuba', 'Belize', 'Guatemala'],
      'Philippines':   ['Philippines', 'Indonesia', 'Malaysia', 'Thailand', 'Vietnam'],
      'New Zealand':   ['New Zealand', 'Australia', 'Papua New Guinea', 'Solomon Islands'],
      'Bahamas':       ['Bahamas', 'Cuba', 'United States', 'Mexico', 'Jamaica'],
      'Reunion':       ['Reunion', 'South Africa', 'Mozambique', 'Madagascar'],
      'Cuba':          ['Cuba', 'Bahamas', 'United States', 'Mexico', 'Jamaica'],
      'Spain':         ['Spain', 'France', 'Portugal', 'Italy', 'Morocco'],
      'Italy':         ['Italy', 'France', 'Spain', 'Greece', 'Croatia'],
    }

    const COASTAL_POP_M = {
      'United States': 40, 'Australia': 14, 'South Africa': 8, 'Brazil': 20,
      'Indonesia': 60, 'Philippines': 40, 'Japan': 30, 'New Zealand': 2.5,
      'France': 6, 'Spain': 7, 'Italy': 8, 'Mexico': 15, 'India': 80,
      'China': 50, 'Bahamas': 0.4, 'Reunion': 0.9, 'South Korea': 5,
      'Egypt': 4, 'Malaysia': 8, 'Thailand': 12, 'Vietnam': 20,
      'Colombia': 5, 'Venezuela': 4, 'Argentina': 3, 'Portugal': 2,
      'Greece': 2.5, 'Croatia': 0.8, 'Cuba': 3, 'Canada': 4,
      'Mozambique': 6, 'Madagascar': 5, 'Papua New Guinea': 2,
    }

    const neighbors = REGIONAL_GROUPS[country] || [country]

    const { data: incidents, error } = await supabase
      .from('incidents')
      .select('country, outcome, date_of_attack')
      .in('country', neighbors)

    if (error) throw error

    const byCountry = {}
    for (const inc of incidents) {
      const key = inc.country
      if (!byCountry[key]) byCountry[key] = { country: key, total: 0, fatal: 0 }
      byCountry[key].total++
      if (inc.outcome === 'fatal') byCountry[key].fatal++
    }

    const focus = byCountry[country] || { country, total: 0, fatal: 0 }
    const coverage = COVERAGE[country] || 'low'
    const mult = MULTIPLIERS[coverage]
    const coastalPop = COASTAL_POP_M[country] || null

    res.json({
      country,
      total: focus.total,
      fatal: focus.fatal,
      fatal_rate: focus.total > 0 ? Math.round((focus.fatal / focus.total) * 100) : 0,
      estimate: {
        reported: focus.total,
        estimated_low: Math.round(focus.total * mult.low),
        estimated_median: Math.round(focus.total * mult.median),
        estimated_high: Math.round(focus.total * mult.high),
        coverage_quality: coverage,
        confidence_note: `Based on ${coverage}-coverage reporting model (Neff et al.). Actual incidents may vary significantly.`,
      },
      coastal_pop_millions: coastalPop,
      attacks_per_million_coastal_pop: (coastalPop && focus.total > 0)
        ? parseFloat((focus.total / coastalPop).toFixed(2))
        : null,
      regional_comparison: neighbors
        .filter(n => byCountry[n])
        .map(n => ({ country: n, total: byCountry[n].total, fatal: byCountry[n].fatal, is_focus: n === country }))
        .sort((a, b) => b.total - a.total)
        .slice(0, 6),
      is_estimated: true,
    })
  } catch (err) {
    next(err)
  }
})

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
