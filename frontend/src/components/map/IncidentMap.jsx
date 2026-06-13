import { useMemo } from 'react'
import { MapContainer, TileLayer, CircleMarker, Popup, ZoomControl } from 'react-leaflet'
import IncidentPopup from '../ui/IncidentPopup'
import NamedZoneLayer from './NamedZoneLayer'
import HeatmapLayer from './HeatmapLayer'

const OUTCOME_COLORS = {
  fatal:    '#ef4444',
  injured:  '#f97316',
  unharmed: '#22c55e',
  unknown:  '#94a3b8',
}

const HEAT_WEIGHT = { fatal: 1.0, injured: 0.6, unharmed: 0.3, unknown: 0.4 }

const TILES = {
  dark: {
    url: 'https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png',
    attribution: '© <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> © <a href="https://carto.com/attributions">CARTO</a>',
  },
  light: {
    url: 'https://{s}.basemaps.cartocdn.com/light_all/{z}/{x}/{y}{r}.png',
    attribution: '© <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> © <a href="https://carto.com/attributions">CARTO</a>',
  },
}

function MapLegend({ showHeatmap }) {
  return (
    <div className="absolute bottom-8 left-4 z-[1000] pointer-events-none">
      <div className="bg-gray-900/90 backdrop-blur border border-gray-700/50 rounded-xl px-3 py-2.5 shadow-xl">
        <div className="text-[10px] font-semibold text-gray-500 uppercase tracking-widest mb-2">
          Outcome
        </div>
        <div className="space-y-1.5">
          {[
            { color: OUTCOME_COLORS.fatal,    label: 'Fatal' },
            { color: OUTCOME_COLORS.injured,  label: 'Injured' },
            { color: OUTCOME_COLORS.unharmed, label: 'Unharmed' },
            { color: OUTCOME_COLORS.unknown,  label: 'Unknown' },
          ].map(({ color, label }) => (
            <div key={label} className="flex items-center gap-2">
              <span className="w-2.5 h-2.5 rounded-full shrink-0" style={{ backgroundColor: color }} />
              <span className="text-[11px] text-gray-300">{label}</span>
            </div>
          ))}
          <div className="flex items-center gap-2 mt-2 pt-2 border-t border-gray-700">
            <span className="w-2.5 h-2.5 rounded-full shrink-0 border-2 border-dashed border-blue-400" />
            <span className="text-[11px] text-gray-300">Named Zone</span>
          </div>
          {showHeatmap && (
            <div className="mt-2 pt-2 border-t border-gray-700">
              <div className="text-[10px] text-gray-500 mb-1.5 uppercase tracking-wide">Heatmap</div>
              <div className="flex items-center gap-0">
                {['#1e3a8a', '#0369a1', '#d97706', '#b91c1c'].map((c, i) => (
                  <span key={i} className="h-2 w-5 first:rounded-l last:rounded-r"
                    style={{ backgroundColor: c }} />
                ))}
              </div>
              <div className="flex justify-between text-[10px] text-gray-600 mt-0.5">
                <span>Low</span><span>High</span>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}

export default function IncidentMap({ incidents, namedZones, darkMode, showHeatmap }) {
  const tile = darkMode ? TILES.dark : TILES.light

  const valid = incidents.filter(i => i.latitude != null && i.longitude != null)

  const heatPoints = useMemo(() =>
    valid.map(i => [
      parseFloat(i.latitude),
      parseFloat(i.longitude),
      HEAT_WEIGHT[i.outcome] ?? 0.4,
    ]),
    [valid]
  )

  return (
    <div className="relative h-full w-full">
      <MapContainer
        center={[20, 10]}
        zoom={2}
        minZoom={2}
        style={{ height: '100%', width: '100%' }}
        zoomControl={false}
        worldCopyJump
      >
        <ZoomControl position="bottomright" />

        <TileLayer
          key={darkMode ? 'dark' : 'light'}
          url={tile.url}
          attribution={tile.attribution}
          maxZoom={19}
        />

        <HeatmapLayer points={heatPoints} visible={showHeatmap} />

        <NamedZoneLayer zones={namedZones} />

        {valid.map(incident => (
          <CircleMarker
            key={incident.id}
            center={[incident.latitude, incident.longitude]}
            radius={7}
            pathOptions={{
              fillColor: OUTCOME_COLORS[incident.outcome] || OUTCOME_COLORS.unknown,
              fillOpacity: showHeatmap ? 0.55 : 0.88,
              color: 'rgba(255,255,255,0.25)',
              weight: 1.5,
            }}
          >
            <Popup maxWidth={310} minWidth={260} className="incident-popup">
              <IncidentPopup incident={incident} />
            </Popup>
          </CircleMarker>
        ))}
      </MapContainer>

      <MapLegend showHeatmap={showHeatmap} />
    </div>
  )
}
