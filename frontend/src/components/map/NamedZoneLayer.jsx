import { CircleMarker, Popup, Tooltip } from 'react-leaflet'
import { Link } from 'react-router-dom'

export default function NamedZoneLayer({ zones }) {
  return zones
    .filter(z => z.latitude != null && z.longitude != null)
    .map(zone => (
      <CircleMarker
        key={zone.id}
        center={[zone.latitude, zone.longitude]}
        radius={18}
        pathOptions={{
          fillColor: '#3b82f6',
          fillOpacity: 0.12,
          color: '#3b82f6',
          weight: 2,
          dashArray: '5 5',
        }}
      >
        <Tooltip
          permanent
          direction="top"
          offset={[0, -16]}
          className="zone-label"
        >
          {zone.name}
        </Tooltip>
        <Popup maxWidth={300} minWidth={240}>
          <div className="text-sm dark:text-slate-200">
            <div className="font-bold text-[15px] dark:text-white text-gray-900 mb-0.5">
              {zone.name}
            </div>
            <div className="text-xs dark:text-slate-400 text-gray-500 mb-2">
              {zone.country}
            </div>
            {zone.description && (
              <p className="text-xs dark:text-slate-300 text-gray-600 mb-2 leading-relaxed">
                {zone.description.slice(0, 200)}{zone.description.length > 200 ? '…' : ''}
              </p>
            )}
            <div className="grid grid-cols-2 gap-x-4 gap-y-1 text-xs">
              {zone.total_attacks > 0 && (
                <Stat label="Total attacks" value={zone.total_attacks} />
              )}
              {zone.fatal_attacks > 0 && (
                <Stat label="Fatal attacks" value={zone.fatal_attacks} className="text-red-400" />
              )}
              {zone.peak_season_start && (
                <Stat label="Peak season" value={`${zone.peak_season_start} – ${zone.peak_season_end}`} />
              )}
            </div>
            {zone.known_species?.length > 0 && (
              <div className="mt-2 text-xs">
                <span className="dark:text-slate-400 text-gray-500">Species: </span>
                <span className="dark:text-slate-300 text-gray-700">
                  {zone.known_species.map(s => s.split('(')[0].trim()).join(', ')}
                </span>
              </div>
            )}
            <div className="mt-3 pt-2 border-t dark:border-slate-700 border-gray-200">
              <Link
                to={`/zones/${zone.id}`}
                className="text-xs text-blue-400 hover:text-blue-300 font-medium transition-colors"
              >
                View full details →
              </Link>
            </div>
          </div>
        </Popup>
      </CircleMarker>
    ))
}

function Stat({ label, value, className = 'dark:text-slate-200 text-gray-800' }) {
  return (
    <div>
      <div className="dark:text-slate-500 text-gray-400">{label}</div>
      <div className={`font-semibold ${className}`}>{value}</div>
    </div>
  )
}
