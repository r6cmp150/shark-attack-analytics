import { useState, useEffect, useMemo, useRef } from 'react'
import { Link } from 'react-router-dom'
import { api } from '../api/client'
import { computeRisk, FACTORS, MONTHS, TIER_META } from '../utils/riskModel'

/* ── Popular shark-attack countries for quick-pick ─────────── */
const QUICK_COUNTRIES = [
  'Australia', 'United States', 'South Africa', 'Brazil',
  'Reunion', 'Bahamas', 'Indonesia', 'New Zealand',
]

function currentTimeOfDay() {
  const h = new Date().getHours()
  if (h >= 5  && h < 8)  return 'dawn'
  if (h >= 8  && h < 12) return 'morning'
  if (h >= 12 && h < 17) return 'afternoon'
  if (h >= 17 && h < 20) return 'dusk'
  return 'night'
}

/* ── Form select ─────────────────────────────────────────────── */
function FSelect({ label, value, onChange, options, placeholder }) {
  return (
    <div>
      <label className="text-[11px] font-semibold text-gray-500 uppercase tracking-wider block mb-1.5">
        {label}
      </label>
      <select
        value={value}
        onChange={e => onChange(e.target.value)}
        className="w-full bg-gray-800 border border-gray-700 rounded-xl px-3 py-2.5 text-sm
          text-gray-200 focus:outline-none focus:border-blue-500 transition-colors cursor-pointer"
      >
        <option value="">{placeholder}</option>
        {options.map(o => (
          <option key={o} value={o} className="capitalize">
            {o.charAt(0).toUpperCase() + o.slice(1)}
          </option>
        ))}
      </select>
    </div>
  )
}

/* ── Risk score gauge ────────────────────────────────────────── */
function ScoreGauge({ score, ci, tier }) {
  const meta = TIER_META[tier] || TIER_META.low
  const ciWidth = Math.max(2, ci.high - ci.low)
  const ciLeft = ci.low

  return (
    <div>
      <div className="flex items-baseline gap-2 mb-3">
        <div className="text-5xl font-bold tabular-nums" style={{ color: meta.color }}>{score}</div>
        <div className="text-gray-600 text-sm">/100</div>
        <div className={`ml-auto text-sm font-bold px-3 py-1 rounded-full border ${meta.bg} ${meta.border} ${meta.text}`}>
          {meta.label}
        </div>
      </div>

      {/* Bar */}
      <div className="relative h-4 bg-gray-800 rounded-full overflow-hidden">
        {/* Green-yellow-orange-red gradient background */}
        <div className="absolute inset-0 opacity-20"
          style={{ background: 'linear-gradient(to right, #22c55e, #f59e0b, #f97316, #ef4444)' }} />
        {/* CI range */}
        <div
          className="absolute top-0 h-full border-x-2 border-dashed border-white/20"
          style={{ left: `${ciLeft}%`, width: `${ciWidth}%`, background: 'rgba(255,255,255,0.06)' }}
        />
        {/* Score needle */}
        <div
          className="absolute top-0.5 bottom-0.5 w-1 rounded-full bg-white/90 shadow"
          style={{ left: `calc(${score}% - 2px)` }}
        />
      </div>
      <div className="flex justify-between text-[10px] text-gray-700 mt-1">
        <span>Low</span><span>Moderate</span><span>High</span><span>Extreme</span>
      </div>
      <div className="text-[10px] text-gray-600 text-center mt-1.5 italic">
        Estimated range: {ci.low}–{ci.high} · Confidence: <span className="capitalize">{'{}'}</span>
      </div>
    </div>
  )
}

/* ── Factor row ─────────────────────────────────────────────── */
function FactorRow({ label, value, mult, effect, note, isDerived }) {
  const icon = effect === 'increase' ? '↑' : effect === 'decrease' ? '↓' : '→'
  const color = effect === 'increase' ? 'text-red-400' : effect === 'decrease' ? 'text-green-400' : 'text-gray-500'
  return (
    <div className="py-2.5 border-b border-gray-800/60 last:border-0">
      <div className="flex items-start gap-2">
        <div className={`font-bold text-sm w-5 shrink-0 ${color}`}>{icon}</div>
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 flex-wrap">
            <span className="text-xs text-gray-400">{label}:</span>
            <span className="text-xs font-semibold text-white capitalize">{value}</span>
            <span className={`text-[10px] font-mono ${color}`}>×{mult.toFixed(2)}</span>
            {isDerived && (
              <span className="text-[10px] border border-dashed border-yellow-700/50 text-yellow-600 px-1 rounded">
                data-derived
              </span>
            )}
          </div>
          {note && <div className="text-[11px] text-gray-600 mt-0.5 leading-relaxed">{note}</div>}
        </div>
      </div>
    </div>
  )
}

/* ── Main page ──────────────────────────────────────────────── */
export default function PredictorPage() {
  const [country, setCountry]     = useState('')
  const [activity, setActivity]   = useState('')
  const [month, setMonth]         = useState(new Date().getMonth())
  const [timeOfDay, setTimeOfDay] = useState(currentTimeOfDay())
  const [tidalState, setTidal]    = useState('')
  const [visibility, setVis]      = useState('')
  const [incidents, setIncidents] = useState([])
  const [loading, setLoading]     = useState(false)
  const debounce                  = useRef(null)

  // Fetch incidents for selected country (debounced)
  useEffect(() => {
    clearTimeout(debounce.current)
    if (!country.trim()) { setIncidents([]); return }
    debounce.current = setTimeout(() => {
      setLoading(true)
      api.getIncidents({ country, limit: 200 })
        .then(setIncidents)
        .catch(() => setIncidents([]))
        .finally(() => setLoading(false))
    }, 500)
    return () => clearTimeout(debounce.current)
  }, [country])

  const assessment = useMemo(
    () => computeRisk(incidents, { activity, timeOfDay, month, tidalState, visibility }),
    [incidents, activity, timeOfDay, month, tidalState, visibility]
  )

  const hasConditions = country.trim() !== ''
  const meta = TIER_META[assessment.tier] || TIER_META.low

  return (
    <div className="min-h-screen bg-gray-950 text-gray-100">

      {/* Nav */}
      <header className="sticky top-0 z-50 bg-gray-950/95 backdrop-blur border-b border-gray-800">
        <div className="max-w-5xl mx-auto px-4 h-14 flex items-center gap-3">
          <Link to="/" className="flex items-center gap-1.5 text-gray-500 hover:text-white transition-colors text-sm shrink-0">
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
              <path d="M19 12H5M12 5l-7 7 7 7" />
            </svg>
            <span className="hidden sm:inline">Map</span>
          </Link>
          <span className="text-gray-800">|</span>
          <div className="flex items-center gap-2">
            <span className="text-lg">🦈</span>
            <span className="font-bold text-white">Shark Attack Analytics</span>
            <span className="text-gray-600 text-sm font-normal ml-1">/ Risk Assessment</span>
          </div>
        </div>
      </header>

      <div className="max-w-5xl mx-auto px-4 py-8">

        {/* Hero */}
        <div className="mb-8">
          <h1 className="text-2xl font-bold text-white">Condition Risk Assessment</h1>
          <p className="text-gray-500 text-sm mt-2 max-w-xl">
            Enter your planned conditions to see a transparency-first risk analysis.
            Outputs are modeled estimates based on historical incident patterns and
            published marine biology research — not predictive probability.
          </p>
          <div className="inline-flex items-center gap-1.5 mt-3 border border-dashed border-yellow-700/50
            text-yellow-600/80 text-xs px-3 py-1.5 rounded-full">
            <span>⚠️</span>
            All outputs are estimates. Risk is always local — never compare across regions.
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">

          {/* ── Input form ─────────────────────────────────────── */}
          <div className="space-y-4">
            <div className="bg-gray-900 border border-gray-800 rounded-2xl p-5 space-y-4">
              <h2 className="text-sm font-semibold text-white">Your Conditions</h2>

              {/* Country */}
              <div>
                <label className="text-[11px] font-semibold text-gray-500 uppercase tracking-wider block mb-1.5">
                  Region / Country <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  value={country}
                  onChange={e => setCountry(e.target.value)}
                  placeholder="e.g. Australia"
                  className="w-full bg-gray-800 border border-gray-700 rounded-xl px-3 py-2.5 text-sm
                    text-gray-200 placeholder-gray-600 focus:outline-none focus:border-blue-500 transition-colors"
                />
                {/* Quick picks */}
                <div className="flex flex-wrap gap-1.5 mt-2">
                  {QUICK_COUNTRIES.map(c => (
                    <button
                      key={c}
                      onClick={() => setCountry(c)}
                      className={`text-[10px] px-2 py-0.5 rounded-full border transition-colors ${
                        country === c
                          ? 'border-blue-500 bg-blue-900/40 text-blue-300'
                          : 'border-gray-700 text-gray-500 hover:border-gray-600 hover:text-gray-400'
                      }`}
                    >
                      {c}
                    </button>
                  ))}
                </div>
              </div>

              <FSelect
                label="Activity"
                value={activity}
                onChange={setActivity}
                options={FACTORS.activity.options}
                placeholder="Select activity"
              />

              <FSelect
                label="Month"
                value={month}
                onChange={v => setMonth(parseInt(v))}
                options={Array.from({ length: 12 }, (_, i) => i)}
                placeholder="Select month"
              />

              <div className="grid grid-cols-2 gap-3">
                <FSelect
                  label="Time of day"
                  value={timeOfDay}
                  onChange={setTimeOfDay}
                  options={FACTORS.timeOfDay.options}
                  placeholder="Select time"
                />
                <FSelect
                  label="Tidal state"
                  value={tidalState}
                  onChange={setTidal}
                  options={FACTORS.tidalState.options}
                  placeholder="Unknown"
                />
              </div>

              <FSelect
                label="Water visibility"
                value={visibility}
                onChange={setVis}
                options={FACTORS.visibility.options}
                placeholder="Unknown"
              />
            </div>

            {/* Methodology note */}
            <div className="bg-gray-900/50 border border-gray-800 rounded-xl p-4">
              <div className="text-[11px] text-gray-600 font-semibold uppercase tracking-wider mb-2">
                How this works
              </div>
              <p className="text-xs text-gray-600 leading-relaxed">
                A base score of 40 is adjusted by literature-based multipliers for each condition
                (Neff &amp; Hueter 2013, Chapman &amp; McPhee 2016). Seasonal factors are
                data-derived from historical incidents in the selected region.
                The CI range reflects data density — fewer incidents = wider uncertainty.
              </p>
            </div>
          </div>

          {/* ── Results ──────────────────────────────────────────── */}
          <div className="space-y-4">

            {!hasConditions ? (
              <div className="bg-gray-900 border border-gray-800 rounded-2xl p-10 flex flex-col items-center text-center gap-3">
                <div className="text-4xl">🌊</div>
                <div className="text-sm font-medium text-gray-400">Select a region to begin</div>
                <div className="text-xs text-gray-600 max-w-xs">
                  Enter your planned location and activity to see a risk assessment
                </div>
              </div>
            ) : (
              <>
                {/* Risk level card */}
                <div className={`border rounded-2xl p-5 space-y-4 ${meta.bg} ${meta.border}`}>
                  <div className="flex items-center justify-between">
                    <div>
                      <div className="text-[11px] text-gray-500 uppercase tracking-wider font-semibold mb-0.5">
                        Condition Risk Assessment
                      </div>
                      <div className="text-xs text-gray-500">{country}</div>
                    </div>
                    {loading && (
                      <div className="w-2 h-2 rounded-full bg-blue-500 animate-pulse" />
                    )}
                  </div>

                  {/* Score gauge */}
                  <div>
                    <div className="flex items-baseline gap-2 mb-3">
                      <div className="text-5xl font-bold tabular-nums" style={{ color: meta.color }}>
                        {assessment.score}
                      </div>
                      <div className="text-gray-700 text-sm">/100</div>
                      <div className={`ml-auto text-sm font-bold px-3 py-1 rounded-full border bg-gray-900/60 ${meta.border} ${meta.text}`}>
                        {meta.label}
                      </div>
                    </div>

                    <div className="relative h-4 bg-gray-900/80 rounded-full overflow-hidden">
                      <div className="absolute inset-0 opacity-20 rounded-full"
                        style={{ background: 'linear-gradient(to right, #22c55e 0%, #f59e0b 40%, #f97316 70%, #ef4444 100%)' }} />
                      <div
                        className="absolute top-0 h-full border-x border-dashed border-white/20"
                        style={{ left: `${assessment.ci.low}%`, right: `${100 - assessment.ci.high}%`, background: 'rgba(255,255,255,0.05)' }}
                      />
                      <div
                        className="absolute top-1 bottom-1 w-1 rounded-full bg-white/80 shadow"
                        style={{ left: `calc(${assessment.score}% - 2px)` }}
                      />
                    </div>

                    <div className="flex justify-between text-[10px] text-gray-700 mt-1 px-0.5">
                      <span>Low</span><span>Moderate</span><span>High</span><span>Extreme</span>
                    </div>
                    <div className="text-[10px] text-gray-600 text-center mt-1.5 italic">
                      Estimated range {assessment.ci.low}–{assessment.ci.high} · Data confidence:{' '}
                      <span className="capitalize">{assessment.confidence}</span>
                      {assessment.confidence === 'poor' && ' (very limited data)'}
                    </div>
                  </div>
                </div>

                {/* Factor breakdown */}
                {assessment.factors.length > 0 && (
                  <div className="bg-gray-900 border border-gray-800 rounded-2xl p-5">
                    <h3 className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-1">
                      Factor Breakdown
                    </h3>
                    <p className="text-[10px] text-gray-700 mb-3">
                      How each condition adjusts the base score (×1.0 = no effect)
                    </p>
                    <div>
                      {assessment.factors.map((f, i) => (
                        <FactorRow key={i} {...f} />
                      ))}
                    </div>
                    {assessment.factors.length === 0 && (
                      <p className="text-xs text-gray-600">Select conditions to see factor breakdown</p>
                    )}
                  </div>
                )}

                {/* Historical context */}
                <div className="bg-gray-900 border border-gray-800 rounded-2xl p-5">
                  <h3 className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-3">
                    Historical Context
                  </h3>

                  {assessment.history.total === 0 ? (
                    <div className="text-center py-4">
                      <div className="text-gray-600 text-xs">
                        {loading ? 'Loading incidents…' : `No incidents found for "${country}" in the database yet`}
                      </div>
                      <div className="text-gray-700 text-[10px] mt-1">
                        Run the ingestion pipeline to populate data
                      </div>
                    </div>
                  ) : (
                    <div className="space-y-3">
                      <div className="grid grid-cols-3 gap-2">
                        <div className="bg-gray-800/60 rounded-xl p-2.5 text-center">
                          <div className="text-xl font-bold text-white tabular-nums">
                            {assessment.history.total}
                          </div>
                          <div className="text-[10px] text-gray-500 mt-0.5">Total in region</div>
                        </div>
                        <div className="bg-gray-800/60 rounded-xl p-2.5 text-center">
                          <div className="text-xl font-bold text-blue-400 tabular-nums">
                            {assessment.history.matching}
                          </div>
                          <div className="text-[10px] text-gray-500 mt-0.5">Condition match</div>
                        </div>
                        <div className="bg-gray-800/60 rounded-xl p-2.5 text-center">
                          <div className="text-xl font-bold text-red-400 tabular-nums">
                            {assessment.history.fatal}
                          </div>
                          <div className="text-[10px] text-gray-500 mt-0.5">Of those fatal</div>
                        </div>
                      </div>

                      {assessment.history.matching > 0 && (
                        <div>
                          <div className="text-[10px] text-gray-600 mb-1.5">Outcomes for matching incidents</div>
                          <div className="h-3 rounded-full overflow-hidden flex">
                            {[
                              { count: assessment.history.fatal,    color: '#ef4444' },
                              { count: assessment.history.injured,  color: '#f97316' },
                              { count: assessment.history.unharmed, color: '#22c55e' },
                            ].map(({ count, color }, i) => {
                              const pct = (count / assessment.history.matching) * 100
                              return pct > 0 ? (
                                <div key={i} className="h-full" style={{ width: `${pct}%`, backgroundColor: color }} />
                              ) : null
                            })}
                          </div>
                          <div className="flex gap-3 text-[10px] text-gray-600 mt-1">
                            <span style={{ color: '#ef4444' }}>■ Fatal ({assessment.history.fatal})</span>
                            <span style={{ color: '#f97316' }}>■ Injured ({assessment.history.injured})</span>
                            <span style={{ color: '#22c55e' }}>■ Unharmed ({assessment.history.unharmed})</span>
                          </div>
                        </div>
                      )}

                      <p className="text-[10px] text-gray-700 leading-relaxed border-t border-gray-800 pt-2.5 mt-2">
                        Matching incidents are those in {country} where we have data for the same activity
                        and/or time of day. More matches → more reliable context.
                        {assessment.history.total < 10 && ' This region has limited data — confidence ranges are wide.'}
                      </p>
                    </div>
                  )}
                </div>

                {/* Disclaimer */}
                <div className="border border-dashed border-yellow-800/40 rounded-xl p-4">
                  <p className="text-[11px] text-gray-600 leading-relaxed">
                    <strong className="text-yellow-600/80">This is a condition-awareness tool, not a predictor.</strong>{' '}
                    Shark attacks are rare events. This model cannot predict whether an attack will occur —
                    it contextualizes your conditions relative to historical incident patterns.
                    Always follow local beach authority guidance and posted warnings.
                  </p>
                </div>
              </>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}
