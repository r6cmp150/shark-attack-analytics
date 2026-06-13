/*
 * Transparent, literature-based risk condition model.
 * Multipliers are grounded in published marine biology research
 * (Neff & Hueter 2013, Chapman & McPhee 2016, Shark Research Institute).
 *
 * This is NOT a predictive model — it is a condition-awareness tool that
 * combines empirical multipliers with local historical incident data.
 * All outputs must be clearly labeled as estimates.
 */

export const MONTHS = ['Jan','Feb','Mar','Apr','May','Jun','Jul','Aug','Sep','Oct','Nov','Dec']

export const FACTORS = {
  timeOfDay: {
    label: 'Time of day',
    options: ['dawn', 'morning', 'afternoon', 'dusk', 'night'],
    mults: { dawn: 1.5, morning: 1.0, afternoon: 0.85, dusk: 1.4, night: 1.9 },
    notes: {
      dawn:      'Low light, peak crepuscular feeding window',
      morning:   'Baseline activity period',
      afternoon: 'High bather density, reduced predatory activity',
      dusk:      'Reduced visibility, active feeding window',
      night:     'Minimal visibility, heightened predatory activity',
    },
  },
  activity: {
    label: 'Activity',
    options: ['surfing', 'swimming', 'diving', 'fishing', 'snorkeling', 'wading', 'boating', 'other'],
    mults: { surfing: 1.05, swimming: 0.9, diving: 0.65, fishing: 1.4, snorkeling: 0.75, wading: 0.55, boating: 0.25, other: 1.0 },
    notes: {
      surfing:    'Silhouette from below resembles prey; surface splashing',
      swimming:   'Moderate exposure in open water',
      diving:     'Divers often observe threats and can take evasive action',
      fishing:    'Blood, bait, and injured fish significantly attract sharks',
      snorkeling: 'Near-surface but quieter than swimming',
      wading:     'Shallow water, reduced total body exposure',
      boating:    'Out of water — negligible direct contact risk',
      other:      'Baseline multiplier applied',
    },
  },
  tidalState: {
    label: 'Tidal state',
    options: ['high', 'incoming', 'outgoing', 'low'],
    mults: { high: 0.9, incoming: 1.1, outgoing: 1.0, low: 1.3 },
    notes: {
      high:     'Prey dispersed into deeper water',
      incoming: 'Fish and prey species move inshore with rising tide',
      outgoing: 'Baseline tidal condition',
      low:      'Sharks concentrated in channels and gutters',
    },
  },
  visibility: {
    label: 'Water visibility',
    options: ['clear', 'murky'],
    mults: { clear: 0.85, murky: 1.45 },
    notes: {
      clear:  'Sharks can visually assess; investigatory approaches less likely to escalate',
      murky:  'Reduced sensory range increases likelihood of close contact',
    },
  },
}

const BASE_SCORE = 40 // baseline ocean activity — all multipliers relative to this

export function computeRisk(incidents, { activity, timeOfDay, month, tidalState, visibility }) {
  let score = BASE_SCORE
  const appliedFactors = []

  function applyFactor(key, value) {
    const def = FACTORS[key]
    const mult = value ? (def.mults[value] ?? 1.0) : 1.0
    if (!value || mult === 1.0) return
    score *= mult
    appliedFactors.push({
      label: def.label,
      value: value.charAt(0).toUpperCase() + value.slice(1),
      mult,
      effect: mult > 1.05 ? 'increase' : mult < 0.95 ? 'decrease' : 'neutral',
      note: def.notes[value] ?? '',
    })
  }

  applyFactor('timeOfDay', timeOfDay)
  applyFactor('activity', activity)
  applyFactor('tidalState', tidalState)
  applyFactor('visibility', visibility)

  // Data-derived month factor
  if (month != null && incidents.length >= 5) {
    const inMonth = incidents.filter(i => {
      if (!i.date_of_attack) return false
      return new Date(i.date_of_attack + 'T12:00:00Z').getMonth() === month
    }).length

    const expected = incidents.length / 12
    const monthMult = Math.min(2.5, Math.max(0.3, inMonth / Math.max(1, expected)))

    if (Math.abs(monthMult - 1.0) > 0.1) {
      score *= monthMult
      const dir = monthMult > 1 ? 'increase' : 'decrease'
      appliedFactors.push({
        label: 'Season (data-derived)',
        value: MONTHS[month],
        mult: monthMult,
        effect: dir,
        note: `${MONTHS[month]} has ${Math.abs(Math.round((monthMult - 1) * 100))}% ${monthMult > 1 ? 'more' : 'fewer'} recorded attacks than average in this region`,
        isDerived: true,
      })
    }
  }

  const finalScore = Math.min(100, Math.max(1, Math.round(score)))

  // Confidence based on data density for the country
  const confidence =
    incidents.length >= 50 ? 'good' :
    incidents.length >= 20 ? 'fair' :
    incidents.length >= 5  ? 'limited' : 'poor'

  const ciRange = { good: 8, fair: 18, limited: 28, poor: 38 }[confidence]

  // Tier
  const tier =
    finalScore >= 75 ? 'extreme' :
    finalScore >= 50 ? 'high' :
    finalScore >= 25 ? 'moderate' : 'low'

  // Find matching historical incidents
  const matching = incidents.filter(i => {
    if (activity && i.victim_activity && i.victim_activity !== activity) return false
    if (timeOfDay && i.time_of_day && i.time_of_day !== 'unknown' && i.time_of_day !== timeOfDay) return false
    if (month != null && i.date_of_attack) {
      if (new Date(i.date_of_attack + 'T12:00:00Z').getMonth() !== month) return false
    }
    return true
  })

  return {
    tier,
    score: finalScore,
    ci: {
      low:  Math.max(0,   finalScore - ciRange),
      high: Math.min(100, finalScore + ciRange),
    },
    confidence,
    factors: appliedFactors,
    history: {
      total:    incidents.length,
      matching: matching.length,
      fatal:    matching.filter(i => i.outcome === 'fatal').length,
      injured:  matching.filter(i => i.outcome === 'injured').length,
      unharmed: matching.filter(i => i.outcome === 'unharmed').length,
    },
  }
}

export const TIER_META = {
  low:     { label: 'Low',     color: '#22c55e', bg: 'bg-green-950/50',  border: 'border-green-800/50',  text: 'text-green-400'  },
  moderate:{ label: 'Moderate',color: '#f59e0b', bg: 'bg-amber-950/50',  border: 'border-amber-800/50',  text: 'text-amber-400'  },
  high:    { label: 'High',    color: '#f97316', bg: 'bg-orange-950/50', border: 'border-orange-800/50', text: 'text-orange-400' },
  extreme: { label: 'Extreme', color: '#ef4444', bg: 'bg-red-950/50',    border: 'border-red-800/50',    text: 'text-red-400'    },
}
