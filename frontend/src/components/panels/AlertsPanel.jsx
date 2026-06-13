import { useState } from 'react'
import { api } from '../../api/client'

const OUTCOME_DOT = {
  fatal:    'bg-red-500',
  injured:  'bg-orange-500',
  unharmed: 'bg-green-500',
  unknown:  'bg-gray-500',
}

function fmt(ts) {
  if (!ts) return ''
  const d = new Date(ts)
  const now = Date.now()
  const diffMs = now - d.getTime()
  const diffH = Math.floor(diffMs / 3600000)
  if (diffH < 1) return `${Math.max(1, Math.floor(diffMs / 60000))}m ago`
  if (diffH < 24) return `${diffH}h ago`
  return `${Math.floor(diffH / 24)}d ago`
}

function UsageBar({ used, cap }) {
  const pct = cap ? Math.min(100, Math.round((used / cap) * 100)) : 0
  const color = pct > 80 ? '#ef4444' : pct > 60 ? '#f97316' : '#22c55e'
  return (
    <div>
      <div className="flex justify-between text-[10px] mb-1">
        <span className="text-gray-600">Gemini API today</span>
        <span style={{ color }} className="font-medium tabular-nums">{used}/{cap}</span>
      </div>
      <div className="h-1.5 bg-gray-800 rounded-full overflow-hidden">
        <div className="h-full rounded-full transition-all" style={{ width: `${pct}%`, backgroundColor: color }} />
      </div>
    </div>
  )
}

export default function AlertsPanel({ isOpen, onClose, alertData, onRunPipeline, running }) {
  const [runStatus, setRunStatus] = useState(null)

  const handleRun = async (hours) => {
    setRunStatus('starting')
    try {
      await onRunPipeline(hours)
      setRunStatus('started')
      setTimeout(() => setRunStatus(null), 4000)
    } catch {
      setRunStatus('error')
      setTimeout(() => setRunStatus(null), 3000)
    }
  }

  if (!isOpen) return null

  const { incidents = [], count = 0, pipeline_status } = alertData || {}
  const gemini = pipeline_status?.gemini_usage
  const lastRun = pipeline_status?.last_run
  const isRunning = running || pipeline_status?.is_running

  return (
    <>
      {/* Backdrop */}
      <div className="fixed inset-0 z-[1050]" onClick={onClose} />

      {/* Panel */}
      <div className="fixed right-3 top-[58px] z-[1051] w-80
        bg-gray-900/98 backdrop-blur border border-gray-700/70 rounded-2xl shadow-2xl
        overflow-hidden">

        {/* Header */}
        <div className="flex items-center justify-between px-4 py-3 border-b border-gray-800">
          <div className="flex items-center gap-2">
            <h3 className="text-sm font-bold text-white">Pipeline & Alerts</h3>
            {count > 0 && (
              <span className="bg-red-600 text-white text-[10px] font-bold px-1.5 py-0.5 rounded-full">
                {count} new
              </span>
            )}
          </div>
          <button onClick={onClose} className="text-gray-600 hover:text-gray-300 text-lg leading-none transition-colors">×</button>
        </div>

        <div className="p-4 space-y-4 max-h-[70vh] overflow-y-auto">

          {/* Pipeline status */}
          <div className="bg-gray-800/40 rounded-xl p-3 space-y-2.5">
            <div className="flex items-center justify-between">
              <div className="text-[11px] font-semibold text-gray-500 uppercase tracking-wider">
                Ingestion Pipeline
              </div>
              <div className={`flex items-center gap-1.5 text-[11px] ${isRunning ? 'text-blue-400' : 'text-gray-600'}`}>
                <span className={`w-1.5 h-1.5 rounded-full ${isRunning ? 'bg-blue-400 animate-pulse' : 'bg-gray-700'}`} />
                {isRunning ? 'Running…' : 'Idle'}
              </div>
            </div>

            {lastRun && (
              <div className="text-[10px] text-gray-600 space-y-0.5">
                <div>Last run: <span className="text-gray-500">{fmt(lastRun.completed_at || lastRun.started_at)}</span></div>
                {lastRun.stats && (
                  <div className="flex gap-3">
                    <span>Articles: <span className="text-gray-400">{lastRun.stats.gdelt_fetched ?? 0}</span></span>
                    <span>Inserted: <span className="text-green-500">{lastRun.stats.inserted ?? 0}</span></span>
                    <span>Errors: <span className={lastRun.stats.errors > 0 ? 'text-red-400' : 'text-gray-500'}>{lastRun.stats.errors ?? 0}</span></span>
                  </div>
                )}
              </div>
            )}

            {gemini && <UsageBar used={gemini.calls_today} cap={gemini.daily_cap} />}
          </div>

          {/* Manual run buttons */}
          <div>
            <div className="text-[11px] text-gray-500 uppercase tracking-wider font-semibold mb-2">
              Manual Run
            </div>
            <div className="grid grid-cols-3 gap-2">
              {[
                { hours: 6,  label: '6h' },
                { hours: 24, label: '24h' },
                { hours: 48, label: '48h' },
              ].map(({ hours, label }) => (
                <button
                  key={hours}
                  onClick={() => handleRun(hours)}
                  disabled={isRunning || runStatus === 'starting'}
                  className={`text-xs px-2 py-2 rounded-lg font-medium transition-colors border ${
                    isRunning || runStatus === 'starting'
                      ? 'border-gray-800 text-gray-700 cursor-not-allowed bg-gray-900'
                      : 'border-gray-700 text-gray-300 hover:border-blue-600 hover:text-blue-300 hover:bg-blue-950/20'
                  }`}
                >
                  {label} lookback
                </button>
              ))}
            </div>
            {runStatus === 'started' && (
              <p className="text-[11px] text-blue-400 mt-2">Pipeline started — results will appear after the run completes.</p>
            )}
            {runStatus === 'error' && (
              <p className="text-[11px] text-red-400 mt-2">Failed to start pipeline. Check backend is running.</p>
            )}
          </div>

          {/* New incidents */}
          <div>
            <div className="text-[11px] text-gray-500 uppercase tracking-wider font-semibold mb-2">
              New Incidents (last 24h)
            </div>

            {incidents.length === 0 ? (
              <div className="text-center py-6 text-xs text-gray-700">
                No new incidents detected in the last 24 hours
              </div>
            ) : (
              <div className="space-y-0">
                {incidents.map(inc => (
                  <div key={inc.id} className="flex gap-2.5 py-2.5 border-b border-gray-800/50 last:border-0">
                    <span className={`w-2 h-2 rounded-full shrink-0 mt-1 ${OUTCOME_DOT[inc.outcome] || OUTCOME_DOT.unknown}`} />
                    <div className="min-w-0 flex-1">
                      <div className="flex items-start justify-between gap-1">
                        <span className="text-xs text-gray-200 font-medium truncate">
                          {inc.shark_species || 'Unknown species'}
                        </span>
                        <span className="text-[10px] text-gray-600 shrink-0">{fmt(inc.created_at)}</span>
                      </div>
                      <div className="text-[11px] text-gray-500 truncate mt-0.5">
                        {inc.country}{inc.date_of_attack ? ` · ${inc.date_of_attack}` : ''}
                      </div>
                      {inc.source_url && (
                        <a href={inc.source_url} target="_blank" rel="noopener noreferrer"
                          className="text-[10px] text-blue-500 hover:text-blue-400 truncate block mt-0.5">
                          {inc.source_publication || new URL(inc.source_url).hostname}
                        </a>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </>
  )
}
