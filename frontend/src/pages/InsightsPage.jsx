import { useState, useEffect, useMemo } from 'react'
import { Link } from 'react-router-dom'
import {
  BarChart, Bar, LineChart, Line, PieChart, Pie, Cell,
  XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer,
} from 'recharts'
import { api } from '../api/client'
import * as A from '../utils/analytics'

/* ─── Theme constants ────────────────────────────────────────── */
const GRID   = '#1f2937'
const AXIS   = '#4b5563'
const TICK   = '#6b7280'
const BLUE   = '#3b82f6'
const RED    = '#ef4444'
const ORANGE = '#f97316'
const GREEN  = '#22c55e'
const GRAY   = '#64748b'
const AMBER  = '#f59e0b'
const VIOLET = '#8b5cf6'
const PINK   = '#ec4899'

const MOTIVATION_COLORS = {
  Predatory:    RED,
  Investigatory: BLUE,
  Territorial:  AMBER,
  Warning:      VIOLET,
  Retaliatory:  PINK,
}

/* ─── Shared tooltip ─────────────────────────────────────────── */
function DarkTooltip({ active, payload, label }) {
  if (!active || !payload?.length) return null
  return (
    <div style={{
      background: '#111827', border: '1px solid #374151',
      borderRadius: 10, padding: '8px 14px', fontSize: 12,
    }}>
      {label != null && <p style={{ color: '#9ca3af', marginBottom: 6, fontWeight: 600 }}>{label}</p>}
      {payload.map((e, i) => (
        <p key={i} style={{ color: e.color || '#e5e7eb', margin: '2px 0' }}>
          <span style={{ opacity: 0.7 }}>{e.name}: </span>
          <span style={{ fontWeight: 600 }}>{e.value}</span>
        </p>
      ))}
    </div>
  )
}

/* ─── Reusable card ──────────────────────────────────────────── */
function Card({ title, subtitle, children, className = '' }) {
  return (
    <div className={`bg-gray-900 border border-gray-800 rounded-2xl p-5 flex flex-col gap-3 ${className}`}>
      <div>
        <h3 className="text-sm font-semibold text-white">{title}</h3>
        {subtitle && <p className="text-[11px] text-gray-600 mt-0.5">{subtitle}</p>}
      </div>
      {children}
    </div>
  )
}

function NoData({ msg = 'No data yet' }) {
  return (
    <div className="flex-1 flex items-center justify-center py-12">
      <p className="text-xs text-gray-700">{msg}</p>
    </div>
  )
}

function StatCard({ label, value, sub, color = 'text-white' }) {
  return (
    <div className="bg-gray-900 border border-gray-800 rounded-2xl px-5 py-4">
      <div className={`text-3xl font-bold tabular-nums ${color}`}>{value ?? 0}</div>
      <div className="text-sm font-medium text-gray-400 mt-1">{label}</div>
      {sub && <div className="text-[11px] text-gray-600 mt-0.5">{sub}</div>}
    </div>
  )
}

/* ─── Section wrapper ────────────────────────────────────────── */
function Section({ title, children }) {
  return (
    <section>
      <h2 className="text-xs font-semibold text-gray-600 uppercase tracking-widest mb-4 flex items-center gap-3">
        <span className="flex-1 h-px bg-gray-800" />
        {title}
        <span className="flex-1 h-px bg-gray-800" />
      </h2>
      {children}
    </section>
  )
}

/* ─── Horizontal bar for species / countries ────────────────── */
function HBar({ name, value, max, color = BLUE, badge }) {
  const pct = max > 0 ? Math.max(2, (value / max) * 100) : 2
  return (
    <div className="flex items-center gap-2">
      <div className="text-[11px] text-gray-400 w-28 shrink-0 truncate" title={name}>{name}</div>
      <div className="flex-1 h-4 bg-gray-800 rounded-full overflow-hidden">
        <div className="h-full rounded-full transition-all" style={{ width: `${pct}%`, backgroundColor: color }} />
      </div>
      <div className="text-[11px] text-gray-300 w-7 text-right tabular-nums shrink-0">{value}</div>
      {badge != null && (
        <div className="text-[10px] w-10 text-right tabular-nums shrink-0" style={{ color: RED }}>
          {badge}%
        </div>
      )}
    </div>
  )
}

/* ─── Main page ──────────────────────────────────────────────── */
export default function InsightsPage() {
  const [incidents, setIncidents] = useState([])
  const [stats, setStats]         = useState(null)
  const [loading, setLoading]     = useState(true)

  useEffect(() => {
    Promise.all([api.getIncidents({ limit: 200 }), api.getStats()])
      .then(([incs, s]) => { setIncidents(incs); setStats(s) })
      .catch(() => {})
      .finally(() => setLoading(false))
  }, [])

  const yearTrend   = useMemo(() => A.getYearTrend(incidents),        [incidents])
  const monthDist   = useMemo(() => A.getMonthDistribution(incidents), [incidents])
  const timeOfDay   = useMemo(() => A.getTimeOfDay(incidents),         [incidents])
  const topSpecies  = useMemo(() => A.getTopSpecies(incidents),        [incidents])
  const activities  = useMemo(() => A.getActivityBreakdown(incidents), [incidents])
  const motivations = useMemo(() => A.getMotivationBreakdown(incidents),[incidents])
  const countries   = useMemo(() => A.getTopCountries(incidents),      [incidents])
  const visibility  = useMemo(() => A.getVisibilityOutcomes(incidents), [incidents])
  const tidal       = useMemo(() => A.getTidalDistribution(incidents),  [incidents])
  const envFlags    = useMemo(() => A.getEnvironmentalFlags(incidents), [incidents])
  const insights    = useMemo(() => A.generateInsights(incidents, stats),[incidents, stats])

  return (
    <div className="min-h-screen bg-gray-950 text-gray-100">

      {/* Nav */}
      <header className="sticky top-0 z-50 bg-gray-950/95 backdrop-blur border-b border-gray-800">
        <div className="max-w-6xl mx-auto px-4 h-14 flex items-center gap-3">
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
            <span className="text-gray-600 text-sm font-normal ml-1">/ Insights</span>
          </div>
          <div className="ml-auto text-xs text-gray-600">
            {incidents.length} incidents analysed
          </div>
        </div>
      </header>

      <div className="max-w-6xl mx-auto px-4 py-8 space-y-10">

        {loading ? (
          <div className="flex items-center justify-center py-32">
            <div className="flex items-center gap-3 text-gray-500 text-sm">
              <span className="w-2 h-2 rounded-full bg-blue-500 animate-pulse" />
              Loading data…
            </div>
          </div>
        ) : (
          <>
            {/* ─── Summary stats ──────────────────────────────────── */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
              <StatCard label="Total Incidents" value={stats?.total?.toLocaleString()} />
              <StatCard label="Fatal Attacks" value={stats?.by_outcome?.fatal} color="text-red-400"
                sub={stats?.total ? `${Math.round((stats.by_outcome.fatal / stats.total) * 100)}% of total` : null} />
              <StatCard label="This Year" value={stats?.this_year} color="text-blue-400" />
              <StatCard label="Confirmed" value={stats?.confirmed} color="text-green-400"
                sub={stats?.total ? `${Math.round((stats.confirmed / stats.total) * 100)}% verified` : null} />
            </div>

            {/* ─── Key Insights ───────────────────────────────────── */}
            {insights.length > 0 && (
              <Section title="Key Patterns">
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
                  {insights.map((ins, i) => (
                    <div key={i} className="bg-gray-900 border border-gray-800 rounded-xl p-4 flex gap-3">
                      <span className="text-xl shrink-0">{ins.icon}</span>
                      <p className="text-xs text-gray-400 leading-relaxed">{ins.text}</p>
                    </div>
                  ))}
                </div>
              </Section>
            )}

            {/* ─── Temporal ───────────────────────────────────────── */}
            <Section title="Temporal Patterns">
              <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">

                <Card title="Year-over-Year Trend" subtitle="All recorded incidents by year"
                  className="lg:col-span-2">
                  {yearTrend.length > 1 ? (
                    <div className="h-56">
                      <ResponsiveContainer width="100%" height="100%">
                        <LineChart data={yearTrend} margin={{ top: 4, right: 8, left: -20, bottom: 0 }}>
                          <CartesianGrid stroke={GRID} strokeDasharray="3 3" />
                          <XAxis dataKey="year" stroke={AXIS} tick={{ fill: TICK, fontSize: 10 }} />
                          <YAxis stroke={AXIS} tick={{ fill: TICK, fontSize: 10 }} />
                          <Tooltip content={<DarkTooltip />} />
                          <Legend wrapperStyle={{ fontSize: 11, color: '#9ca3af' }} />
                          <Line dataKey="total" name="Total" stroke={BLUE} strokeWidth={2} dot={false} />
                          <Line dataKey="fatal" name="Fatal" stroke={RED} strokeWidth={1.5} dot={false} strokeDasharray="4 2" />
                        </LineChart>
                      </ResponsiveContainer>
                    </div>
                  ) : <NoData msg="Need ≥2 years of data for trend analysis" />}
                </Card>

                <Card title="Attacks by Month" subtitle="Seasonal distribution (all years combined)">
                  {monthDist.some(m => m.total > 0) ? (
                    <div className="h-56">
                      <ResponsiveContainer width="100%" height="100%">
                        <BarChart data={monthDist} margin={{ top: 4, right: 4, left: -24, bottom: 0 }}>
                          <CartesianGrid stroke={GRID} strokeDasharray="3 3" />
                          <XAxis dataKey="name" stroke={AXIS} tick={{ fill: TICK, fontSize: 9 }} />
                          <YAxis stroke={AXIS} tick={{ fill: TICK, fontSize: 10 }} />
                          <Tooltip content={<DarkTooltip />} />
                          <Bar dataKey="total" name="Total" fill={BLUE} radius={[3, 3, 0, 0]} />
                          <Bar dataKey="fatal" name="Fatal" fill={RED} radius={[3, 3, 0, 0]} />
                        </BarChart>
                      </ResponsiveContainer>
                    </div>
                  ) : <NoData />}
                </Card>
              </div>
            </Section>

            {/* ─── Activity analysis ──────────────────────────────── */}
            <Section title="Activity Analysis">
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">

                <Card title="Attacks by Victim Activity" subtitle="Stacked by outcome">
                  {activities.length > 0 ? (
                    <div className="h-64">
                      <ResponsiveContainer width="100%" height="100%">
                        <BarChart data={activities} layout="vertical"
                          margin={{ top: 0, right: 8, left: 4, bottom: 0 }}>
                          <CartesianGrid stroke={GRID} strokeDasharray="3 3" horizontal={false} />
                          <XAxis type="number" stroke={AXIS} tick={{ fill: TICK, fontSize: 10 }} />
                          <YAxis type="category" dataKey="name" width={76}
                            tick={{ fill: '#d1d5db', fontSize: 11 }} stroke={AXIS} />
                          <Tooltip content={<DarkTooltip />} />
                          <Legend wrapperStyle={{ fontSize: 11, color: '#9ca3af' }} />
                          <Bar dataKey="fatal"   name="Fatal"    stackId="a" fill={RED}    />
                          <Bar dataKey="injured" name="Injured"  stackId="a" fill={ORANGE} />
                          <Bar dataKey="unharmed" name="Unharmed" stackId="a" fill={GREEN} radius={[0,3,3,0]} />
                        </BarChart>
                      </ResponsiveContainer>
                    </div>
                  ) : <NoData />}
                </Card>

                <Card title="Fatality Rate by Activity"
                  subtitle="Activities with ≥ 2 incidents — higher % = deadlier">
                  {activities.filter(a => a.total >= 2).length > 0 ? (
                    <div className="space-y-2.5 py-1">
                      {activities.filter(a => a.total >= 2).map(a => (
                        <div key={a.name}>
                          <div className="flex justify-between text-xs mb-0.5">
                            <span className="text-gray-300">{a.name}</span>
                            <span style={{ color: a.fatalRate > 30 ? RED : a.fatalRate > 15 ? ORANGE : GREEN }}>
                              {a.fatalRate}% fatal
                            </span>
                          </div>
                          <div className="h-2 bg-gray-800 rounded-full overflow-hidden">
                            <div
                              className="h-full rounded-full"
                              style={{
                                width: `${a.fatalRate}%`,
                                backgroundColor: a.fatalRate > 30 ? RED : a.fatalRate > 15 ? ORANGE : GREEN,
                              }}
                            />
                          </div>
                        </div>
                      ))}
                    </div>
                  ) : <NoData msg="Need ≥ 2 incidents per activity" />}
                </Card>
              </div>
            </Section>

            {/* ─── Time & Environment ─────────────────────────────── */}
            <Section title="Time & Environment">
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">

                {/* Time of day */}
                <Card title="Time of Day" subtitle="Attack frequency by period" className="sm:col-span-2">
                  {timeOfDay.length > 0 ? (
                    <div className="space-y-3">
                      {timeOfDay.map(t => (
                        <div key={t.name}>
                          <div className="flex justify-between text-[11px] mb-1">
                            <span className="text-gray-300 font-medium">{t.name}</span>
                            <span className="text-gray-500">
                              {t.total} attacks · <span style={{ color: RED }}>{t.fatalRate}% fatal</span>
                            </span>
                          </div>
                          <div className="h-3 bg-gray-800 rounded-full overflow-hidden">
                            <div className="h-full rounded-full" style={{ width: `${t.pct}%`, backgroundColor: BLUE }} />
                          </div>
                        </div>
                      ))}
                    </div>
                  ) : <NoData msg="No time-of-day data extracted yet" />}
                </Card>

                {/* Tidal state */}
                <Card title="Tidal State" subtitle="Reported tidal conditions">
                  {tidal.length > 0 ? (
                    <div className="h-44">
                      <ResponsiveContainer width="100%" height="100%">
                        <PieChart>
                          <Pie data={tidal} dataKey="value" nameKey="name"
                            cx="50%" cy="50%" innerRadius={40} outerRadius={70}
                            paddingAngle={3}>
                            {tidal.map((_, i) => (
                              <Cell key={i} fill={[BLUE, '#0ea5e9', '#38bdf8', '#7dd3fc', '#bae6fd'][i % 5]} />
                            ))}
                          </Pie>
                          <Tooltip content={<DarkTooltip />} />
                          <Legend wrapperStyle={{ fontSize: 10, color: '#9ca3af' }} />
                        </PieChart>
                      </ResponsiveContainer>
                    </div>
                  ) : <NoData msg="No tidal data extracted yet" />}
                </Card>

                {/* Water visibility */}
                <Card title="Water Visibility" subtitle="Conditions at time of attack">
                  {visibility.length > 0 ? (
                    <div className="space-y-3 py-2">
                      {visibility.map(v => (
                        <div key={v.name}>
                          <div className="flex justify-between text-[11px] mb-1">
                            <span className="text-gray-300">{v.name}</span>
                            <span className="text-gray-500">{v.total}</span>
                          </div>
                          <div className="h-3 bg-gray-800 rounded-full overflow-hidden flex">
                            {v.fatal > 0 && (
                              <div className="h-full" style={{ width: `${(v.fatal / v.total) * 100}%`, backgroundColor: RED }} />
                            )}
                            {v.injured > 0 && (
                              <div className="h-full" style={{ width: `${(v.injured / v.total) * 100}%`, backgroundColor: ORANGE }} />
                            )}
                            {v.unharmed > 0 && (
                              <div className="h-full" style={{ width: `${((v.unharmed || 0) / v.total) * 100}%`, backgroundColor: GREEN }} />
                            )}
                          </div>
                        </div>
                      ))}
                      <div className="flex gap-3 text-[10px] text-gray-600 pt-1">
                        <span style={{ color: RED }}>■ Fatal</span>
                        <span style={{ color: ORANGE }}>■ Injured</span>
                        <span style={{ color: GREEN }}>■ Unharmed</span>
                      </div>
                    </div>
                  ) : <NoData msg="No visibility data yet" />}
                </Card>
              </div>

              {/* Environmental flags */}
              {envFlags?.length > 0 && (
                <div className="mt-4 bg-gray-900 border border-gray-800 rounded-2xl p-5">
                  <h3 className="text-sm font-semibold text-white mb-3">Environmental Co-factors</h3>
                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                    {envFlags.map(f => (
                      <div key={f.label} className="flex items-center gap-3">
                        <div className="text-right shrink-0">
                          <div className="text-2xl font-bold text-amber-400 tabular-nums">{f.pct}%</div>
                          <div className="text-[10px] text-gray-600">{f.positive}/{f.total}</div>
                        </div>
                        <div className="text-xs text-gray-400">{f.label} present at time of incident</div>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </Section>

            {/* ─── Species ─────────────────────────────────────────── */}
            <Section title="Species Analysis">
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">

                <Card title="Top Species by Incident Count" subtitle="Identified species only">
                  {topSpecies.length > 0 ? (
                    <div className="space-y-2">
                      {topSpecies.map((s, i) => (
                        <HBar
                          key={s.name}
                          name={s.name}
                          value={s.total}
                          max={topSpecies[0].total}
                          color={i === 0 ? RED : i <= 2 ? ORANGE : BLUE}
                          badge={s.fatalRate > 0 ? s.fatalRate : null}
                        />
                      ))}
                      <div className="text-[10px] text-gray-700 pt-1">
                        Red % = fatality rate
                      </div>
                    </div>
                  ) : <NoData msg="No species identification data yet" />}
                </Card>

                <Card title="Motivation Breakdown" subtitle="Why the shark approached — taxonomy: predatory, investigatory, territorial, warning, retaliatory">
                  {motivations.length > 0 ? (
                    <div className="h-52">
                      <ResponsiveContainer width="100%" height="100%">
                        <PieChart>
                          <Pie data={motivations} dataKey="value" nameKey="name"
                            cx="50%" cy="50%" innerRadius={50} outerRadius={80} paddingAngle={3}>
                            {motivations.map((m) => (
                              <Cell key={m.name} fill={MOTIVATION_COLORS[m.name] || GRAY} />
                            ))}
                          </Pie>
                          <Tooltip content={<DarkTooltip />} />
                          <Legend wrapperStyle={{ fontSize: 11, color: '#9ca3af' }} />
                        </PieChart>
                      </ResponsiveContainer>
                    </div>
                  ) : <NoData msg="No motivation data extracted yet" />}
                </Card>
              </div>
            </Section>

            {/* ─── Geographic distribution ─────────────────────────── */}
            <Section title="Geographic Distribution">
              <Card title="Top Countries by Attack Count" subtitle="Raw reported counts — do not compare rates across different regions">
                {countries.length > 0 ? (
                  <div className="h-80">
                    <ResponsiveContainer width="100%" height="100%">
                      <BarChart data={countries} layout="vertical"
                        margin={{ top: 0, right: 16, left: 8, bottom: 0 }}>
                        <CartesianGrid stroke={GRID} strokeDasharray="3 3" horizontal={false} />
                        <XAxis type="number" stroke={AXIS} tick={{ fill: TICK, fontSize: 10 }} />
                        <YAxis type="category" dataKey="name" width={88}
                          tick={{ fill: '#d1d5db', fontSize: 11 }} stroke={AXIS} />
                        <Tooltip content={<DarkTooltip />} />
                        <Legend wrapperStyle={{ fontSize: 11, color: '#9ca3af' }} />
                        <Bar dataKey="total" name="Total" fill={BLUE} radius={[0,4,4,0]} />
                        <Bar dataKey="fatal" name="Fatal" fill={RED} radius={[0,4,4,0]} />
                      </BarChart>
                    </ResponsiveContainer>
                  </div>
                ) : <NoData />}
                <p className="text-[11px] text-gray-700 mt-1">
                  ⚠️ Higher counts reflect better reporting coverage, not necessarily higher real-world risk. Use the Risk Analysis panel for local context.
                </p>
              </Card>
            </Section>

            {/* ─── Under-reporting note ─────────────────────────────── */}
            <div className="border border-dashed border-yellow-800/50 rounded-2xl p-5">
              <div className="flex items-start gap-3">
                <div className="text-yellow-500/80 text-lg shrink-0">⚠️</div>
                <div>
                  <h3 className="text-sm font-semibold text-yellow-400/80 mb-1">About this data</h3>
                  <p className="text-xs text-gray-500 leading-relaxed">
                    All statistics shown are derived from <strong className="text-gray-400">reported incidents</strong> collected
                    via AI-powered news ingestion. Academic literature (Neff et al.) estimates that globally, only 20–40%
                    of actual shark incidents are reported in accessible media. Countries with strong media infrastructure
                    (USA, Australia, South Africa) show higher counts largely due to better reporting, not higher actual risk.
                    Estimated actual data is shown with dashed styling throughout the platform.
                  </p>
                </div>
              </div>
            </div>

          </>
        )}
      </div>
    </div>
  )
}
