import { useEffect, useRef } from 'react'
import { useMap } from 'react-leaflet'
import L from 'leaflet'
import 'leaflet.heat'

export default function HeatmapLayer({ points, visible }) {
  const map = useMap()
  const heatRef = useRef(null)

  useEffect(() => {
    if (heatRef.current) {
      map.removeLayer(heatRef.current)
      heatRef.current = null
    }
    if (!visible || !points.length) return

    heatRef.current = L.heatLayer(points, {
      radius: 35,
      blur: 25,
      maxZoom: 8,
      max: 1.0,
      gradient: { 0.2: '#1e3a8a', 0.45: '#0369a1', 0.7: '#d97706', 1.0: '#b91c1c' },
    })
    heatRef.current.addTo(map)

    return () => {
      if (heatRef.current) {
        map.removeLayer(heatRef.current)
        heatRef.current = null
      }
    }
  }, [map, points, visible])

  return null
}
