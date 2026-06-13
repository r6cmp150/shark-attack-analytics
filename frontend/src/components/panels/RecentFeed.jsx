const OUTCOME_DOT = {
  fatal:    'bg-red-500',
  injured:  'bg-orange-500',
  unharmed: 'bg-green-500',
  unknown:  'bg-gray-500',
}

function fmt(dateStr) {
  if (!dateStr) return null
  const d = new Date(dateStr + 'T12:00:00Z')
  return d.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })
}

function IncidentCard({ incident: i }) {
  return (
    <div className="flex gap-3 p-2.5 rounded-lg hover:bg-gray-800/50 transition-colors group cursor-default">
      <div className="flex flex-col items-center pt-1">
        <span className={`w-2 h-2 rounded-full shrink-0 ${OUTCOME_DOT[i.outcome] || OUTCOME_DOT.unknown}`} />
        <span className="w-px flex-1 bg-gray-800 mt-1" />
      </div>
      <div className="min-w-0 flex-1 pb-2">
        <div className="flex items-start justify-between gap-1">
          <div className="font-medium text-xs text-gray-200 leading-tight truncate">
            {i.shark_species || 'Unknown Species'}
          </div>
          <span className="text-[10px] text-gray-600 shrink-0">{fmt(i.date_of_attack)}</span>
        </div>
        <div className="text-[11px] text-gray-500 mt-0.5 truncate">
          {[i.location_name, i.country].filter(Boolean).join(', ') || 'Location unknown'}
        </div>
        {i.victim_activity && (
          <div className="text-[11px] text-gray-600 capitalize mt-0.5">{i.victim_activity}</div>
        )}
        {i.source_url && (
          <a
            href={i.source_url}
            target="_blank"
            rel="noopener noreferrer"
            className="text-[10px] text-blue-500 hover:text-blue-400 mt-1 block truncate"
            onClick={e => e.stopPropagation()}
          >
            {i.source_publication || new URL(i.source_url).hostname}
          </a>
        )}
      </div>
    </div>
  )
}

export default function RecentFeed({ incidents, isOpen }) {
  const recent = [...incidents]
    .sort((a, b) => {
      if (!a.date_of_attack) return 1
      if (!b.date_of_attack) return -1
      return b.date_of_attack.localeCompare(a.date_of_attack)
    })
    .slice(0, 30)

  return (
    <aside
      className={`
        fixed right-0 top-14 z-[1001]
        h-[calc(100vh-3.5rem)] w-72
        bg-gray-900/95 backdrop-blur-md
        border-l border-gray-800/60
        overflow-y-auto
        transition-transform duration-300 ease-in-out
        ${isOpen ? 'translate-x-0' : 'translate-x-full'}
      `}
    >
      <div className="p-3">
        <div className="flex items-center justify-between mb-3 sticky top-0 bg-gray-900/95 py-1 -mx-3 px-3">
          <h2 className="text-sm font-semibold text-white">Recent Incidents</h2>
          <span className="text-xs text-gray-600">{recent.length} shown</span>
        </div>

        {recent.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-16 text-center">
            <div className="text-4xl mb-3">🦈</div>
            <div className="text-sm font-medium text-gray-400">No incidents yet</div>
            <div className="text-xs text-gray-600 mt-1.5 max-w-[180px]">
              Run the ingestion pipeline to start collecting data
            </div>
          </div>
        ) : (
          <div>
            {recent.map(i => <IncidentCard key={i.id} incident={i} />)}
          </div>
        )}
      </div>
    </aside>
  )
}
