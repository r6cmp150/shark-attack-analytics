const MONTHS = ['Jan','Feb','Mar','Apr','May','Jun','Jul','Aug','Sep','Oct','Nov','Dec']
const TIME_ORDER = ['dawn', 'morning', 'afternoon', 'dusk', 'night']
const TIDAL_ORDER = ['high', 'incoming', 'slack', 'outgoing', 'low']

export function getYearTrend(incidents) {
  const map = {}
  for (const inc of incidents) {
    const year = inc.date_of_attack?.split('-')[0]
    if (!year || year < '1990' || year > '2030') continue
    if (!map[year]) map[year] = { year: parseInt(year), total: 0, fatal: 0, injured: 0 }
    map[year].total++
    if (inc.outcome === 'fatal') map[year].fatal++
    if (inc.outcome === 'injured') map[year].injured++
  }
  return Object.values(map).sort((a, b) => a.year - b.year)
}

export function getMonthDistribution(incidents) {
  const total = Array(12).fill(0)
  const fatal = Array(12).fill(0)
  for (const inc of incidents) {
    if (!inc.date_of_attack) continue
    const m = new Date(inc.date_of_attack + 'T12:00:00Z').getMonth()
    total[m]++
    if (inc.outcome === 'fatal') fatal[m]++
  }
  return MONTHS.map((name, i) => ({ name, total: total[i], fatal: fatal[i] }))
}

export function getTimeOfDay(incidents) {
  const counts = {}
  const fatal = {}
  for (const inc of incidents) {
    const t = inc.time_of_day
    if (!t || t === 'unknown') continue
    counts[t] = (counts[t] || 0) + 1
    if (inc.outcome === 'fatal') fatal[t] = (fatal[t] || 0) + 1
  }
  const maxCount = Math.max(...Object.values(counts), 1)
  return TIME_ORDER
    .filter(t => counts[t])
    .map(t => ({
      name: t.charAt(0).toUpperCase() + t.slice(1),
      total: counts[t],
      fatal: fatal[t] || 0,
      pct: Math.round((counts[t] / maxCount) * 100),
      fatalRate: Math.round(((fatal[t] || 0) / counts[t]) * 100),
    }))
}

export function getTopSpecies(incidents, limit = 10) {
  const counts = {}
  const fatal = {}
  const SKIP = ['unknown', 'unidentified', 'unspecified', 'species unknown']
  for (const inc of incidents) {
    let s = inc.shark_species?.split('(')[0].trim()
    if (!s || SKIP.some(skip => s.toLowerCase().includes(skip))) continue
    counts[s] = (counts[s] || 0) + 1
    if (inc.outcome === 'fatal') fatal[s] = (fatal[s] || 0) + 1
  }
  return Object.entries(counts)
    .map(([name, total]) => ({
      name,
      total,
      fatal: fatal[name] || 0,
      fatalRate: Math.round(((fatal[name] || 0) / total) * 100),
    }))
    .sort((a, b) => b.total - a.total)
    .slice(0, limit)
}

export function getActivityBreakdown(incidents) {
  const map = {}
  for (const inc of incidents) {
    const a = inc.victim_activity
    if (!a) continue
    if (!map[a]) map[a] = { name: a.charAt(0).toUpperCase() + a.slice(1), fatal: 0, injured: 0, unharmed: 0, unknown: 0, total: 0 }
    map[a].total++
    map[a][inc.outcome] = (map[a][inc.outcome] || 0) + 1
  }
  return Object.values(map)
    .sort((a, b) => b.total - a.total)
    .slice(0, 8)
    .map(a => ({ ...a, fatalRate: Math.round((a.fatal / a.total) * 100) }))
}

export function getMotivationBreakdown(incidents) {
  const ORDER = ['predatory', 'investigatory', 'territorial', 'warning', 'retaliatory']
  const counts = {}
  for (const inc of incidents) {
    const m = inc.motivation
    if (!m) continue
    counts[m] = (counts[m] || 0) + 1
  }
  return ORDER
    .filter(m => counts[m])
    .map(m => ({ name: m.charAt(0).toUpperCase() + m.slice(1), value: counts[m] }))
}

export function getTopCountries(incidents, limit = 12) {
  const counts = {}
  const fatal = {}
  for (const inc of incidents) {
    const c = inc.country
    if (!c) continue
    counts[c] = (counts[c] || 0) + 1
    if (inc.outcome === 'fatal') fatal[c] = (fatal[c] || 0) + 1
  }
  return Object.entries(counts)
    .map(([name, total]) => ({
      name: name.length > 14 ? name.slice(0, 13) + '…' : name,
      fullName: name,
      total,
      fatal: fatal[name] || 0,
    }))
    .sort((a, b) => b.total - a.total)
    .slice(0, limit)
}

export function getVisibilityOutcomes(incidents) {
  const map = {}
  for (const inc of incidents) {
    const v = inc.water_visibility
    if (!v || v === 'unknown') continue
    if (!map[v]) map[v] = { name: v.charAt(0).toUpperCase() + v.slice(1), fatal: 0, injured: 0, unharmed: 0, total: 0 }
    map[v].total++
    map[v][inc.outcome] = (map[v][inc.outcome] || 0) + 1
  }
  return Object.values(map).sort((a, b) => b.total - a.total)
}

export function getTidalDistribution(incidents) {
  const counts = {}
  for (const inc of incidents) {
    const t = inc.tidal_state
    if (!t || t === 'unknown') continue
    counts[t] = (counts[t] || 0) + 1
  }
  return TIDAL_ORDER
    .filter(t => counts[t])
    .map(t => ({ name: t.charAt(0).toUpperCase() + t.slice(1), value: counts[t] }))
}

export function getEnvironmentalFlags(incidents) {
  const withData = incidents.filter(i =>
    i.bait_fish_present != null ||
    i.proximity_to_fishing != null ||
    i.proximity_to_seal_colony != null
  )
  if (!withData.length) return null

  const flags = [
    { label: 'Bait fish present', key: 'bait_fish_present' },
    { label: 'Near fishing activity', key: 'proximity_to_fishing' },
    { label: 'Near seal colony', key: 'proximity_to_seal_colony' },
  ]

  return flags.map(f => {
    const withFlag = withData.filter(i => i[f.key] != null)
    const trueCount = withFlag.filter(i => i[f.key] === true).length
    return {
      label: f.label,
      total: withFlag.length,
      positive: trueCount,
      pct: withFlag.length ? Math.round((trueCount / withFlag.length) * 100) : 0,
    }
  }).filter(f => f.total > 0)
}

export function generateInsights(incidents, stats) {
  if (!incidents.length) return []
  const out = []

  const species = getTopSpecies(incidents, 1)
  if (species[0]?.total > 1) {
    const pct = Math.round((species[0].total / incidents.length) * 100)
    out.push({ icon: '🦈', text: `${species[0].name} accounts for ${pct}% of all identified attacks in this dataset` })
  }

  const months = getMonthDistribution(incidents)
  const peak = months.reduce((a, b) => a.total > b.total ? a : b, months[0])
  if (peak?.total > 0) {
    out.push({ icon: '📅', text: `${peak.name} has the highest recorded attack frequency — likely peak summer in the hemisphere with most data` })
  }

  const acts = getActivityBreakdown(incidents).filter(a => a.total >= 3)
  if (acts.length) {
    const deadliest = acts.reduce((a, b) => b.fatalRate > a.fatalRate ? b : a)
    out.push({ icon: '⚠️', text: `${deadliest.name} carries the highest fatality rate (${deadliest.fatalRate}%) among activities with ≥3 incidents` })
  }

  const times = getTimeOfDay(incidents)
  if (times.length) {
    const peakTime = times.reduce((a, b) => b.total > a.total ? b : a)
    const pct = Math.round((peakTime.total / incidents.length) * 100)
    out.push({ icon: '🕐', text: `${pct}% of recorded attacks occur during ${peakTime.name.toLowerCase()} hours` })
  }

  if (stats?.total && stats.total > incidents.length) {
    out.push({ icon: '📊', text: `Showing ${incidents.length} of ${stats.total} total incidents — use date filters to explore specific periods` })
  }

  const lowEst = Math.round(incidents.length * 1.5)
  const highEst = Math.round(incidents.length * 5)
  out.push({ icon: '🔍', text: `Under-reporting models suggest this dataset may represent only 20–40% of actual incidents. Estimated actual: ${lowEst}–${highEst}` })

  return out
}
