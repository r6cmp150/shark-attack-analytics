const OUTCOME = {
  fatal:    { label: 'Fatal',    cls: 'bg-red-600 text-white' },
  injured:  { label: 'Injured',  cls: 'bg-orange-500 text-white' },
  unharmed: { label: 'Unharmed', cls: 'bg-green-600 text-white' },
  unknown:  { label: 'Unknown',  cls: 'bg-gray-600 text-white' },
}

const MOTIVATION = {
  predatory:     'Predatory',
  investigatory: 'Investigatory',
  territorial:   'Territorial',
  warning:       'Warning display',
  retaliatory:   'Retaliatory',
}

const ACTIVITY_ICONS = {
  surfing: '🏄', swimming: '🏊', diving: '🤿', fishing: '🎣',
  boating: '⛵', snorkeling: '🤿', wading: '🚶', other: '🌊',
}

function fmt(dateStr) {
  if (!dateStr) return null
  const d = new Date(dateStr + 'T12:00:00Z')
  return d.toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' })
}

function locationStr(i) {
  return [i.location_name, i.region, i.country].filter(Boolean).join(', ')
}

export default function IncidentPopup({ incident: i }) {
  const outcome = OUTCOME[i.outcome] || OUTCOME.unknown

  return (
    <div className="text-sm min-w-[260px] max-w-[300px]">
      {/* Title row */}
      <div className="flex items-start justify-between gap-2 mb-3">
        <div>
          <div className="font-bold text-[15px] leading-tight dark:text-white text-gray-900">
            {i.shark_species || 'Unknown Species'}
          </div>
          <div className="text-xs mt-0.5 dark:text-slate-400 text-gray-500">
            {fmt(i.date_of_attack) || 'Date unknown'}
            {i.time_of_day && ` · ${i.time_of_day}`}
          </div>
        </div>
        <span className={`shrink-0 text-[11px] px-2 py-0.5 rounded-full font-semibold ${outcome.cls}`}>
          {outcome.label}
        </span>
      </div>

      {/* Details */}
      <div className="space-y-1.5 dark:text-slate-300 text-gray-700">
        {locationStr(i) && (
          <Row icon="📍" text={locationStr(i)} />
        )}
        {i.victim_activity && (
          <Row icon={ACTIVITY_ICONS[i.victim_activity] || '🌊'} text={<span className="capitalize">{i.victim_activity}</span>} />
        )}
        {i.motivation && (
          <Row
            icon="🎯"
            text={
              <>
                {MOTIVATION[i.motivation] || i.motivation}
                {i.motivation_confidence != null && (
                  <span className="dark:text-slate-500 text-gray-400 ml-1">
                    ({Math.round(i.motivation_confidence * 100)}% conf.)
                  </span>
                )}
              </>
            }
          />
        )}
        {i.injury_description && (
          <Row icon="🩹" text={<span className="dark:text-slate-400 text-gray-500">{i.injury_description}</span>} />
        )}
        {i.water_visibility && i.water_visibility !== 'unknown' && (
          <Row icon="🌊" text={<span className="capitalize">Water: {i.water_visibility}</span>} />
        )}
        {i.tidal_state && i.tidal_state !== 'unknown' && (
          <Row icon="🌊" text={<span className="capitalize">Tide: {i.tidal_state}</span>} />
        )}
      </div>

      {/* Confidence + source */}
      <div className="mt-3 pt-2 border-t dark:border-slate-700 border-gray-200 flex items-center justify-between">
        {i.confidence_score != null && (
          <span className="text-[11px] dark:text-slate-500 text-gray-400">
            Confidence: {Math.round(i.confidence_score * 100)}%
          </span>
        )}
        {i.source_url && (
          <a
            href={i.source_url}
            target="_blank"
            rel="noopener noreferrer"
            className="text-[11px] text-blue-400 hover:text-blue-300 underline ml-auto"
          >
            {i.source_publication || 'Source →'}
          </a>
        )}
      </div>
    </div>
  )
}

function Row({ icon, text }) {
  return (
    <div className="flex gap-2 items-start">
      <span className="shrink-0 text-sm leading-5">{icon}</span>
      <span className="text-xs leading-5">{text}</span>
    </div>
  )
}
