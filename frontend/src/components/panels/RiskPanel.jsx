import { useState, useEffect } from 'react'
import { api } from '../../api/client'

const COVERAGE_LABEL = { high: 'Good', medium: 'Moderate', low: 'Limited' }
const COVERAGE_COLOR = { high: 'text-green-400', medium: 'text-yellow-400', low: 'text-red-400' }

function EstimateBar({ reported, low, median, high }) {
  const max = Math.max(high, 1)
  const pct = (v) => Math.min(98, Math.round((v / max) * 100))
  return (
    <div className="mt-2 space-y-1">
      <div className="flex justify-between text-[10px] text-gray-600 mb-1">
        <span className="text-blue-400">Reported</span>
        <span className="italic text-yellow-500/70">— Estimated range —</span>
      </div>
      <div className="relative h-5 bg-gray-800 rounded-full overflow-hidden">
        <div
          className="absolute left-0 top-0 h-full bg-blue-600 rounded-full transition-all"
          style={{ width: `${pct(reported)}%` }}
        />
        <div
          className="absolute top-0 bottom-0 border-y-2 border-dashed border-yellow-500/50"
          style={{ left: `${pct(low)}%`, right: `${100 - pct(high)}%` }}
        />
        {median > 0 && (
          <div
            className="absolute top-0 h-full w-0.5 bg-yellow-400/80"
            style={{ left: `${pct(median)}%` }}
          />
        )}
      </div>
      <div className="flex justify-between text-[10px]">
        <span className="text-blue-400 font-semibold">{reported} reported</span>
        <span className="text-yellow-400/70 italic">{low}–{high} est.</span>
      </div>
    </div>
  )
}

function RegionBar({ country, total, maxTotal, isFocus }) {
  const pct = maxTotal > 0 ? Math.max(4, Math.round((total / maxTotal) * 100)) : 4
  return (
    <div className="flex items-center gap-2">
      <div className={`text-[11px] w-[90px] shrink-0 truncate ${isFocus ? 'text-white font-semibold' : 'text-gray-500'}`}>
        {country}
      </div>
      <div className="flex-1 h-2.5 bg-gray-800 rounded-full overflow-hidden">
        <div
          className={`h-full rounded-full ${isFocus ? 'bg-blue-500' : 'bg-gray-600'}`}
          style={{ width: `${pct}%` }}
        />
      </div>
      <div className={`text-[11px] w-6 text-right shrink-0 tabular-nums ${isFocus ? 'text-white font-semibold' : 'text-gray-600'}`}>
        {total}
      </div>
    </div>
  )
}

export default function RiskPanel({ country, isOpen, onClose }) {
  const [data, setData] = useState(null)
  const [loading, setLoading] = useState(false)

  useEffect(() => {
    if (!isOpen || !country) { setData(null); return }
    setLoading(true)
    setData(null)
    api.computeRisk(country)
      .then(setData)
      .catch(() => setData(null))
      .finally(() => setLoading(false))
  }, [country, isOpen])

  if (!isOpen) return null

  return (
    <div className="w-72 pointer-events-auto">
      <div className="bg-gray-900/97 backdrop-blur border border-gray-700/60 rounded-2xl shadow-2xl overflow-hidden">

        <div className="flex items-center justify-between px-4 py-3 border-b border-gray-800">
          <div>
            <h3 className="text-sm font-bold text-white">Local Risk Analysis</h3>
            {country && <div className="text-[11px] text-gray-500 mt-0.5">{country}</div>}
          </div>
          <button
            onClick={onClose}
            className="w-6 h-6 flex items-center justify-center text-gray-600
              hover:text-gray-300 transition-colors rounded-lg hover:bg-gray-800 text-lg leading-none"
          >
            ×
          </button>
        </div>

        <div className="p-4 space-y-4 max-h-[70vh] overflow-y-auto">
          {!country ? (
            <p className="text-xs text-gray-500 text-center py-6">
              Filter by a country to see local risk analysis
            </p>
          ) : loading ? (
            <div className="flex items-center justify-center gap-2 py-6">
              <span className="w-2 h-2 rounded-full bg-blue-500 animate-pulse" />
              <span className="text-xs text-gray-500">Analyzing…</span>
            </div>
          ) : !data ? (
            <p className="text-xs text-gray-500 text-center py-6">No data available</p>
          ) : (
            <>
              {/* Quick stats */}
              <div className="grid grid-cols-3 gap-2">
                {[
                  { label: 'Attacks', value: data.total, color: 'text-white' },
                  { label: 'Fatal',   value: data.fatal, color: 'text-red-400' },
                  { label: 'Fatal %', value: `${data.fatal_rate}%`, color: 'text-orange-400' },
                ].map(({ label, value, color }) => (
                  <div key={label} className="bg-gray-800/60 rounded-xl p-2.5 text-center">
                    <div className={`text-xl font-bold ${color}`}>{value}</div>
                    <div className="text-[10px] text-gray-500 mt-0.5">{label}</div>
                  </div>
                ))}
              </div>

              {/* Per-capita rate */}
              {data.attacks_per_million_coastal_pop != null && (
                <div className="bg-blue-950/40 border border-blue-900/30 rounded-xl p-3">
                  <div className="text-[10px] text-blue-400/60 uppercase tracking-wider mb-0.5">
                    Per million coastal residents
                  </div>
                  <div className="text-2xl font-bold text-blue-300">
                    {data.attacks_per_million_coastal_pop}
                  </div>
                  <div className="text-[10px] text-blue-500/40 mt-1">
                    est. {data.coastal_pop_millions}M coastal pop.
                  </div>
                </div>
              )}

              {/* Under-reporting CI */}
              <div className="border border-dashed border-yellow-800/50 rounded-xl p-3">
                <div className="flex items-center gap-2 mb-1">
                  <span className="text-[11px] font-semibold text-gray-400 uppercase tracking-wider">
                    Under-reporting estimate
                  </span>
                  <span className="text-[10px] border border-dashed border-yellow-600/50
                    text-yellow-500/80 px-1.5 py-0 rounded font-medium">
                    est.
                  </span>
                </div>
                <EstimateBar
                  reported={data.estimate.reported}
                  low={data.estimate.estimated_low}
                  median={data.estimate.estimated_median}
                  high={data.estimate.estimated_high}
                />
                <div className="mt-2 flex items-center gap-1.5">
                  <span className="text-[10px] text-gray-600">Reporting coverage:</span>
                  <span className={`text-[10px] font-medium ${COVERAGE_COLOR[data.estimate.coverage_quality]}`}>
                    {COVERAGE_LABEL[data.estimate.coverage_quality]}
                  </span>
                </div>
                <p className="text-[10px] text-gray-600 mt-1.5 leading-relaxed">
                  {data.estimate.confidence_note}
                </p>
              </div>

              {/* Regional comparison */}
              {data.regional_comparison?.length > 1 && (
                <div>
                  <div className="text-[11px] font-semibold text-gray-500 uppercase tracking-wider mb-2.5">
                    Regional comparison
                  </div>
                  <div className="space-y-2">
                    {data.regional_comparison.map(r => (
                      <RegionBar
                        key={r.country}
                        country={r.country}
                        total={r.total}
                        maxTotal={data.regional_comparison[0].total || 1}
                        isFocus={r.is_focus}
                      />
                    ))}
                  </div>
                  <p className="text-[10px] text-gray-700 mt-2 leading-relaxed">
                    Raw reported counts only. Cross-region rate comparison requires local beach visitor data not available in this dataset.
                  </p>
                </div>
              )}
            </>
          )}
        </div>
      </div>
    </div>
  )
}
