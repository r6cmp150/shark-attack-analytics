import { useEffect, useState } from 'react'
import { useParams, Link } from 'react-router-dom'
import { api } from '../api/client'
import RiskPanel from '../components/panels/RiskPanel'

const OUTCOME_BADGE = {
  fatal:    'bg-red-900/50 text-red-300 border border-red-800',
  injured:  'bg-orange-900/50 text-orange-300 border border-orange-800',
  unharmed: 'bg-green-900/50 text-green-300 border border-green-800',
  unknown:  'bg-gray-800 text-gray-400 border border-gray-700',
}

function fmt(dateStr) {
  if (!dateStr) return '—'
  const d = new Date(dateStr + 'T12:00:00Z')
  return d.toLocaleDateString('en-US', { year: 'numeric', month: 'short', day: 'numeric' })
}

export default function ZonePage() {
  const { id } = useParams()
  const [zone, setZone] = useState(null)
  const [incidents, setIncidents] = useState([])
  const [showRisk, setShowRisk] = useState(false)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)

  useEffect(() => {
    setLoading(true)
    api.getNamedZone(id)
      .then(z => {
        setZone(z)
        return api.getIncidents({ country: z.country, limit: 200 })
      })
      .then(setIncidents)
      .catch(e => setError(e.message))
      .finally(() => setLoading(false))
  }, [id])

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-950 flex items-center justify-center">
        <div className="flex items-center gap-2 text-gray-500 text-sm">
          <span className="w-2 h-2 rounded-full bg-blue-500 animate-pulse" />
          Loading…
        </div>
      </div>
    )
  }

  if (error || !zone) {
    return (
      <div className="min-h-screen bg-gray-950 flex flex-col items-center justify-center gap-4">
        <div className="text-red-400 text-sm">{error || 'Zone not found'}</div>
        <Link to="/" className="text-blue-400 hover:text-blue-300 text-sm">← Back to Map</Link>
      </div>
    )
  }

  const sorted = [...incidents].sort((a, b) =>
    !a.date_of_attack ? 1 : !b.date_of_attack ? -1 : b.date_of_attack.localeCompare(a.date_of_attack)
  )

  return (
    <div className="min-h-screen bg-gray-950 text-gray-100">
      {/* Header */}
      <header className="sticky top-0 z-50 bg-gray-950/95 backdrop-blur border-b border-gray-800">
        <div className="max-w-5xl mx-auto px-4 h-14 flex items-center gap-3">
          <Link
            to="/"
            className="flex items-center gap-1.5 text-gray-500 hover:text-white transition-colors text-sm shrink-0"
          >
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
              <path d="M19 12H5M12 5l-7 7 7 7" />
            </svg>
            <span className="hidden sm:inline">Map</span>
          </Link>
          <span className="text-gray-800">|</span>
          <span className="text-sm font-medium text-white truncate">{zone.name}</span>
          <div className="ml-auto flex items-center gap-2">
            <span className="text-xs text-gray-600 hidden sm:inline">🦈</span>
            <span className="font-bold text-white text-sm hidden sm:inline">Shark Attack Analytics</span>
            <button
              onClick={() => setShowRisk(v => !v)}
              className={`text-xs px-3 py-1.5 rounded-lg font-medium transition-colors ml-2 ${
                showRisk
                  ? 'bg-blue-600 text-white'
                  : 'bg-gray-800 text-gray-300 hover:bg-gray-700 hover:text-white'
              }`}
            >
              Risk Analysis
            </button>
          </div>
        </div>
      </header>

      <div className="max-w-5xl mx-auto px-4 py-8">

        {/* Floating risk panel */}
        {showRisk && (
          <div className="fixed right-4 top-20 z-40">
            <RiskPanel
              country={zone.country}
              isOpen={showRisk}
              onClose={() => setShowRisk(false)}
            />
          </div>
        )}

        {/* Zone hero */}
        <div className="mb-8">
          <div className="flex items-start gap-4 flex-wrap">
            <div className="flex-1 min-w-0">
              <h1 className="text-3xl font-bold text-white">{zone.name}</h1>
              <div className="text-gray-500 mt-1 text-sm">{zone.country}</div>
            </div>
            <div className="flex gap-3 shrink-0 flex-wrap">
              {zone.total_attacks > 0 && (
                <div className="bg-gray-800/60 border border-gray-700 rounded-2xl px-5 py-3 text-center">
                  <div className="text-2xl font-bold text-white tabular-nums">{zone.total_attacks}</div>
                  <div className="text-[11px] text-gray-500 mt-0.5">Documented attacks</div>
                </div>
              )}
              {zone.fatal_attacks > 0 && (
                <div className="bg-red-950/50 border border-red-900/40 rounded-2xl px-5 py-3 text-center">
                  <div className="text-2xl font-bold text-red-400 tabular-nums">{zone.fatal_attacks}</div>
                  <div className="text-[11px] text-gray-500 mt-0.5">Fatal</div>
                </div>
              )}
            </div>
          </div>

          {zone.description && (
            <p className="mt-5 text-gray-400 leading-relaxed max-w-2xl text-sm">{zone.description}</p>
          )}
        </div>

        {/* Detail cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 mb-8">
          {zone.peak_season_start && (
            <div className="bg-gray-900 border border-gray-800 rounded-xl p-4">
              <div className="text-[11px] text-gray-600 uppercase tracking-wider mb-1.5">Peak Season</div>
              <div className="text-white font-medium text-sm">
                {zone.peak_season_start} – {zone.peak_season_end}
              </div>
            </div>
          )}
          {zone.latitude && zone.longitude && (
            <div className="bg-gray-900 border border-gray-800 rounded-xl p-4">
              <div className="text-[11px] text-gray-600 uppercase tracking-wider mb-1.5">Coordinates</div>
              <div className="text-white font-medium font-mono text-xs">
                {parseFloat(zone.latitude).toFixed(4)}°, {parseFloat(zone.longitude).toFixed(4)}°
              </div>
            </div>
          )}
          {zone.known_species?.length > 0 && (
            <div className="bg-gray-900 border border-gray-800 rounded-xl p-4 sm:col-span-2 lg:col-span-1">
              <div className="text-[11px] text-gray-600 uppercase tracking-wider mb-2">Known Species</div>
              <div className="flex flex-wrap gap-1.5">
                {zone.known_species.map(s => (
                  <span
                    key={s}
                    className="text-xs bg-gray-800 border border-gray-700 text-gray-300 px-2 py-0.5 rounded-full"
                  >
                    {s.split('(')[0].trim()}
                  </span>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Incidents */}
        <div>
          <div className="flex items-baseline gap-2 mb-4">
            <h2 className="text-base font-semibold text-white">Incidents in {zone.country}</h2>
            <span className="text-sm text-gray-600">({incidents.length} recorded)</span>
          </div>

          {incidents.length === 0 ? (
            <div className="bg-gray-900 border border-gray-800 rounded-2xl p-16 text-center">
              <div className="text-5xl mb-4">🦈</div>
              <div className="text-gray-400 text-sm font-medium">No incidents in the database yet</div>
              <div className="text-gray-600 text-xs mt-2 max-w-xs mx-auto">
                The ingestion pipeline will populate this as it collects data
              </div>
            </div>
          ) : (
            <div className="overflow-x-auto rounded-2xl border border-gray-800">
              <table className="w-full text-sm">
                <thead>
                  <tr className="bg-gray-900 border-b border-gray-800">
                    {['Date', 'Location', 'Species', 'Activity', 'Outcome', 'Source'].map(h => (
                      <th
                        key={h}
                        className="px-4 py-3 text-left text-[11px] font-semibold text-gray-600
                          uppercase tracking-wider whitespace-nowrap"
                      >
                        {h}
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {sorted.map((inc, idx) => (
                    <tr
                      key={inc.id}
                      className={`border-b border-gray-800/40 hover:bg-gray-800/30 transition-colors ${
                        idx % 2 ? 'bg-gray-900/20' : ''
                      }`}
                    >
                      <td className="px-4 py-3 text-gray-300 whitespace-nowrap font-mono text-xs">
                        {fmt(inc.date_of_attack)}
                      </td>
                      <td className="px-4 py-3 text-gray-300 max-w-[140px] truncate">
                        {inc.location_name || inc.region || '—'}
                      </td>
                      <td className="px-4 py-3 text-gray-300 whitespace-nowrap">
                        {inc.shark_species?.split('(')[0].trim() || '—'}
                      </td>
                      <td className="px-4 py-3 text-gray-500 capitalize whitespace-nowrap">
                        {inc.victim_activity || '—'}
                      </td>
                      <td className="px-4 py-3 whitespace-nowrap">
                        <span className={`text-[11px] px-2 py-0.5 rounded-full font-medium capitalize
                          ${OUTCOME_BADGE[inc.outcome] || OUTCOME_BADGE.unknown}`}>
                          {inc.outcome || 'unknown'}
                        </span>
                      </td>
                      <td className="px-4 py-3 whitespace-nowrap">
                        {inc.source_url
                          ? <a href={inc.source_url} target="_blank" rel="noopener noreferrer"
                              className="text-blue-400 hover:text-blue-300 text-xs">View →</a>
                          : <span className="text-gray-700">—</span>
                        }
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
