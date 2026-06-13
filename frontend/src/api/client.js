const BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:3001'

async function get(path) {
  const res = await fetch(`${BASE_URL}${path}`)
  if (!res.ok) throw new Error(`API ${res.status}: ${path}`)
  return res.json()
}

function qs(params = {}) {
  const clean = Object.fromEntries(
    Object.entries(params).filter(([, v]) => v !== '' && v !== null && v !== undefined)
  )
  const str = new URLSearchParams(clean).toString()
  return str ? `?${str}` : ''
}

export const api = {
  getIncidents:       (params)  => get(`/api/incidents${qs(params)}`).then(r => r.data ?? []),
  getStats:           ()        => get('/api/incidents/stats'),
  getNamedZones:      ()        => get('/api/named-zones').then(r => r.data ?? []),
  getNamedZone:       (id)      => get(`/api/named-zones/${id}`),
  getIncident:        (id)      => get(`/api/incidents/${id}`),
  getCountryStats:    ()        => get('/api/incidents/country-stats').then(r => r.data ?? []),
  computeRisk:        (country) => get(`/api/risk-estimates/compute${qs({ country })}`),
  getSharkMigrations: (params)  => get(`/api/shark-migrations${qs(params)}`).then(r => r.data ?? []),
  getPipelineStatus:  ()        => get('/api/pipeline/status'),
  getAlerts:          (hours=24)=> get(`/api/pipeline/alerts${qs({ hours })}`),
  runPipeline:        (hours=4) =>
    fetch(`${BASE_URL}/api/pipeline/run`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ lookback_hours: hours }),
    }).then(r => r.json()),
}
