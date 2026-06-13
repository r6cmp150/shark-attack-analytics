import { Link } from 'react-router-dom'

export default function Header({
  darkMode, setDarkMode,
  filtersOpen, setFiltersOpen,
  feedOpen, setFeedOpen,
  viewMode, setViewMode,
  loading, incidentCount,
  showHeatmap, onToggleHeatmap,
  showRisk, onToggleRisk, hasCountryFilter,
  alertCount, alertsOpen, onToggleAlerts,
}) {
  return (
    <header className="absolute top-0 left-0 right-0 z-[1001] h-14 flex items-center gap-3 px-4
      bg-gray-950/90 backdrop-blur-md border-b border-gray-800/60">

      {/* Logo */}
      <div className="flex items-center gap-2 shrink-0">
        <span className="text-xl">🦈</span>
        <span className="font-bold text-white tracking-tight hidden sm:block">
          Shark Attack Analytics
        </span>
        <span className="font-bold text-white tracking-tight sm:hidden">SAA</span>
      </div>

      {/* Map / List toggle */}
      <div className="flex bg-gray-800/70 rounded-lg p-0.5 ml-2">
        {['map', 'list'].map(mode => (
          <button
            key={mode}
            onClick={() => setViewMode(mode)}
            className={`px-3 py-1 text-xs font-medium rounded-md capitalize transition-colors ${
              viewMode === mode
                ? 'bg-blue-600 text-white shadow'
                : 'text-gray-400 hover:text-gray-200'
            }`}
          >
            {mode}
          </button>
        ))}
      </div>

      {/* Loading indicator */}
      {loading && (
        <div className="flex items-center gap-1.5 text-xs text-gray-500">
          <span className="inline-block w-2 h-2 rounded-full bg-blue-500 animate-pulse" />
          <span className="hidden sm:inline">Loading…</span>
        </div>
      )}

      <div className="ml-auto flex items-center gap-2">
        {/* Incident count chip */}
        {incidentCount > 0 && (
          <span className="hidden lg:inline text-xs text-gray-500 bg-gray-800 px-2 py-1 rounded-md">
            {incidentCount.toLocaleString()} incidents
          </span>
        )}

        {/* Heatmap toggle — only visible in map view */}
        {viewMode === 'map' && (
          <button
            onClick={onToggleHeatmap}
            className={`flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium rounded-lg transition-all hidden sm:flex ${
              showHeatmap
                ? 'bg-orange-600 text-white shadow-lg shadow-orange-900/40'
                : 'bg-gray-800 text-gray-300 hover:bg-gray-700 hover:text-white'
            }`}
            title="Toggle heatmap overlay"
          >
            <svg width="12" height="12" viewBox="0 0 24 24" fill="currentColor">
              <circle cx="12" cy="12" r="4" opacity="0.4" />
              <circle cx="12" cy="12" r="8" fill="none" stroke="currentColor" strokeWidth="1.5" opacity="0.6" />
              <circle cx="12" cy="12" r="12" fill="none" stroke="currentColor" strokeWidth="1" opacity="0.3" />
            </svg>
            Heat
          </button>
        )}

        {/* Risk analysis toggle */}
        {viewMode === 'map' && (
          <button
            onClick={onToggleRisk}
            disabled={!hasCountryFilter}
            title={hasCountryFilter ? 'Local risk analysis' : 'Filter by country first'}
            className={`flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium rounded-lg transition-all hidden sm:flex ${
              showRisk && hasCountryFilter
                ? 'bg-blue-600 text-white shadow-lg shadow-blue-900/40'
                : hasCountryFilter
                  ? 'bg-gray-800 text-gray-300 hover:bg-gray-700 hover:text-white'
                  : 'bg-gray-900 text-gray-700 cursor-not-allowed'
            }`}
          >
            <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" />
            </svg>
            Risk
          </button>
        )}

        {/* Filters toggle */}
        <button
          onClick={() => setFiltersOpen(!filtersOpen)}
          className={`flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium rounded-lg transition-all ${
            filtersOpen
              ? 'bg-blue-600 text-white shadow-lg shadow-blue-900/40'
              : 'bg-gray-800 text-gray-300 hover:bg-gray-700 hover:text-white'
          }`}
        >
          <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
            <line x1="4" y1="6" x2="20" y2="6" />
            <line x1="8" y1="12" x2="16" y2="12" />
            <line x1="11" y1="18" x2="13" y2="18" />
          </svg>
          Filters
        </button>

        {/* Recent feed toggle */}
        <button
          onClick={() => setFeedOpen(!feedOpen)}
          className={`flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium rounded-lg transition-all hidden sm:flex ${
            feedOpen
              ? 'bg-blue-600 text-white shadow-lg shadow-blue-900/40'
              : 'bg-gray-800 text-gray-300 hover:bg-gray-700 hover:text-white'
          }`}
        >
          <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
            <path d="M3 4h18M3 8h18M3 12h12" />
          </svg>
          Feed
        </button>

        {/* Predict link */}
        <Link
          to="/predict"
          className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium rounded-lg
            bg-gray-800 text-gray-300 hover:bg-gray-700 hover:text-white transition-all hidden sm:flex"
        >
          <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <path d="M3 3v18h18" /><polyline points="18 9 12 15 8 11 3 16" />
          </svg>
          Predict
        </Link>

        {/* Insights link */}
        <Link
          to="/insights"
          className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium rounded-lg
            bg-gray-800 text-gray-300 hover:bg-gray-700 hover:text-white transition-all hidden sm:flex"
        >
          <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <polyline points="22 12 18 12 15 21 9 3 6 12 2 12" />
          </svg>
          Insights
        </Link>

        {/* Alerts bell */}
        <div className="relative">
          <button
            onClick={onToggleAlerts}
            className={`relative p-1.5 rounded-lg text-sm transition-colors ${
              alertsOpen
                ? 'bg-blue-600 text-white'
                : 'bg-gray-800 text-gray-400 hover:bg-gray-700 hover:text-white'
            }`}
            title="Pipeline & Alerts"
          >
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9" />
              <path d="M13.73 21a2 2 0 0 1-3.46 0" />
            </svg>
            {alertCount > 0 && (
              <span className="absolute -top-1 -right-1 w-4 h-4 bg-red-600 text-white text-[9px]
                font-bold rounded-full flex items-center justify-center">
                {alertCount > 9 ? '9+' : alertCount}
              </span>
            )}
          </button>
        </div>

        {/* Dark / light toggle */}
        <button
          onClick={() => setDarkMode(!darkMode)}
          className="p-1.5 rounded-lg bg-gray-800 text-gray-400 hover:bg-gray-700 hover:text-white transition-colors text-sm"
          title={darkMode ? 'Switch to light mode' : 'Switch to dark mode'}
        >
          {darkMode ? '☀️' : '🌙'}
        </button>
      </div>
    </header>
  )
}
