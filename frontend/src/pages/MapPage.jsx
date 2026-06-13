import { useState, useEffect, useCallback, useRef } from 'react'
import Header from '../components/ui/Header'
import IncidentMap from '../components/map/IncidentMap'
import FiltersPanel from '../components/panels/FiltersPanel'
import LiveCounters from '../components/panels/LiveCounters'
import RecentFeed from '../components/panels/RecentFeed'
import IncidentList from '../components/panels/IncidentList'
import RiskPanel from '../components/panels/RiskPanel'
import AlertsPanel from '../components/panels/AlertsPanel'
import { api } from '../api/client'

const DEFAULT_FILTERS = {
  date_from: '',
  date_to: '',
  outcome: '',
  motivation: '',
  victim_activity: '',
  time_of_day: '',
  country: '',
  shark_species: '',
  is_confirmed: '',
}

export default function MapPage({ darkMode, setDarkMode }) {
  const [viewMode, setViewMode]       = useState('map')
  const [filtersOpen, setFiltersOpen] = useState(false)
  const [feedOpen, setFeedOpen]       = useState(false)
  const [showHeatmap, setShowHeatmap] = useState(false)
  const [showRisk, setShowRisk]       = useState(false)
  const [alertsOpen, setAlertsOpen]   = useState(false)
  const [alertData, setAlertData]     = useState(null)
  const [pipelineRunning, setPipelineRunning] = useState(false)
  const [filters, setFilters]         = useState(DEFAULT_FILTERS)
  const [incidents, setIncidents]     = useState([])
  const [stats, setStats]             = useState(null)
  const [namedZones, setNamedZones]   = useState([])
  const [loading, setLoading]         = useState(false)
  const [error, setError]             = useState(null)
  const debounceRef                   = useRef(null)

  const fetchIncidents = useCallback(async (currentFilters) => {
    setLoading(true)
    setError(null)
    try {
      const data = await api.getIncidents({ limit: 200, ...currentFilters })
      setIncidents(data)
    } catch (e) {
      setError(e.message)
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    clearTimeout(debounceRef.current)
    debounceRef.current = setTimeout(() => fetchIncidents(filters), 350)
    return () => clearTimeout(debounceRef.current)
  }, [filters, fetchIncidents])

  useEffect(() => {
    api.getStats().then(setStats).catch(() => {})
    api.getNamedZones().then(setNamedZones).catch(() => {})
    // Fetch alerts on mount and every 5 minutes
    const fetchAlerts = () => api.getAlerts(24).then(setAlertData).catch(() => {})
    fetchAlerts()
    const interval = setInterval(fetchAlerts, 5 * 60 * 1000)
    return () => clearInterval(interval)
  }, [])

  const hasCountryFilter = filters.country.trim().length > 0
  const alertCount = alertData?.count ?? 0

  const handleRunPipeline = async (hours) => {
    setPipelineRunning(true)
    await api.runPipeline(hours)
    // Re-fetch alerts after a short delay to show pipeline status
    setTimeout(() => {
      api.getAlerts(24).then(setAlertData).catch(() => {})
      setPipelineRunning(false)
    }, 2000)
  }

  // Close risk panel when country filter is cleared
  useEffect(() => {
    if (!hasCountryFilter) setShowRisk(false)
  }, [hasCountryFilter])

  return (
    <div className="flex flex-col h-screen bg-gray-950 text-gray-100 overflow-hidden">
      <Header
        darkMode={darkMode}
        setDarkMode={setDarkMode}
        viewMode={viewMode}
        setViewMode={setViewMode}
        filtersOpen={filtersOpen}
        setFiltersOpen={setFiltersOpen}
        feedOpen={feedOpen}
        setFeedOpen={setFeedOpen}
        loading={loading}
        incidentCount={incidents.length}
        showHeatmap={showHeatmap}
        onToggleHeatmap={() => setShowHeatmap(v => !v)}
        showRisk={showRisk}
        onToggleRisk={() => setShowRisk(v => !v)}
        hasCountryFilter={hasCountryFilter}
        alertCount={alertCount}
        alertsOpen={alertsOpen}
        onToggleAlerts={() => setAlertsOpen(v => !v)}
      />

      <AlertsPanel
        isOpen={alertsOpen}
        onClose={() => setAlertsOpen(false)}
        alertData={alertData}
        onRunPipeline={handleRunPipeline}
        running={pipelineRunning}
      />

      <div className="flex-1 relative overflow-hidden mt-14">

        <FiltersPanel
          filters={filters}
          onChange={setFilters}
          isOpen={filtersOpen}
          onClose={() => setFiltersOpen(false)}
          defaultFilters={DEFAULT_FILTERS}
        />

        {viewMode === 'map' ? (
          <>
            <IncidentMap
              incidents={incidents}
              namedZones={namedZones}
              darkMode={darkMode}
              showHeatmap={showHeatmap}
            />
            <LiveCounters stats={stats} />

            {showRisk && hasCountryFilter && (
              <div className="absolute bottom-24 right-4 z-[1000]">
                <RiskPanel
                  country={filters.country}
                  isOpen={showRisk}
                  onClose={() => setShowRisk(false)}
                />
              </div>
            )}
          </>
        ) : (
          <IncidentList incidents={incidents} />
        )}

        <RecentFeed incidents={incidents} isOpen={feedOpen} />

        {error && (
          <div className="absolute top-4 left-1/2 -translate-x-1/2 z-[1100]
            bg-red-900/90 border border-red-700 text-red-200 text-sm
            rounded-lg px-4 py-2 shadow-xl pointer-events-none">
            Failed to load incidents: {error}
          </div>
        )}
      </div>
    </div>
  )
}
