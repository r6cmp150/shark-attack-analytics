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

export default function IncidentList({ incidents }) {
  if (incidents.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center h-full gap-3 text-center bg-gray-950">
        <div className="text-5xl">🦈</div>
        <div className="text-lg font-semibold text-gray-300">No incidents found</div>
        <div className="text-sm text-gray-500 max-w-xs">
          Adjust your filters, or trigger the pipeline from the API to start collecting data
        </div>
      </div>
    )
  }

  const sorted = [...incidents].sort((a, b) => {
    if (!a.date_of_attack) return 1
    if (!b.date_of_attack) return -1
    return b.date_of_attack.localeCompare(a.date_of_attack)
  })

  return (
    <div className="h-full overflow-auto bg-gray-950">
      <div className="max-w-7xl mx-auto px-4 py-6">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-lg font-semibold text-white">All Incidents</h2>
          <span className="text-sm text-gray-500">{incidents.length.toLocaleString()} results</span>
        </div>

        <div className="overflow-x-auto rounded-xl border border-gray-800">
          <table className="w-full text-sm">
            <thead>
              <tr className="bg-gray-900 border-b border-gray-800">
                {['Date', 'Location', 'Country', 'Species', 'Activity', 'Outcome', 'Motivation', 'Source'].map(h => (
                  <th key={h} className="px-4 py-3 text-left text-[11px] font-semibold text-gray-500 uppercase tracking-wider whitespace-nowrap">
                    {h}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {sorted.map((i, idx) => (
                <tr
                  key={i.id}
                  className={`border-b border-gray-800/50 hover:bg-gray-900/60 transition-colors ${
                    idx % 2 === 0 ? '' : 'bg-gray-900/20'
                  }`}
                >
                  <td className="px-4 py-3 text-gray-300 whitespace-nowrap font-mono text-xs">
                    {fmt(i.date_of_attack)}
                  </td>
                  <td className="px-4 py-3 text-gray-300 max-w-[160px] truncate">
                    {i.location_name || i.region || '—'}
                  </td>
                  <td className="px-4 py-3 text-gray-300 whitespace-nowrap">
                    {i.country || '—'}
                  </td>
                  <td className="px-4 py-3 text-gray-300 whitespace-nowrap">
                    {i.shark_species?.split('(')[0].trim() || '—'}
                  </td>
                  <td className="px-4 py-3 text-gray-400 capitalize whitespace-nowrap">
                    {i.victim_activity || '—'}
                  </td>
                  <td className="px-4 py-3 whitespace-nowrap">
                    <span className={`text-[11px] px-2 py-0.5 rounded-full font-medium capitalize
                      ${OUTCOME_BADGE[i.outcome] || OUTCOME_BADGE.unknown}`}>
                      {i.outcome || 'unknown'}
                    </span>
                  </td>
                  <td className="px-4 py-3 text-gray-400 capitalize whitespace-nowrap">
                    {i.motivation || '—'}
                  </td>
                  <td className="px-4 py-3 whitespace-nowrap">
                    {i.source_url ? (
                      <a
                        href={i.source_url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-blue-400 hover:text-blue-300 text-xs underline"
                      >
                        {i.source_publication || 'View →'}
                      </a>
                    ) : '—'}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  )
}
