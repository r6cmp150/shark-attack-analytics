const OUTCOMES   = ['fatal', 'injured', 'unharmed', 'unknown']
const ACTIVITIES = ['surfing', 'swimming', 'diving', 'fishing', 'boating', 'snorkeling', 'wading', 'other']
const MOTIVATIONS = ['predatory', 'investigatory', 'territorial', 'warning', 'retaliatory']
const TIME_OF_DAY = ['dawn', 'morning', 'afternoon', 'dusk', 'night']

function Label({ children }) {
  return <div className="text-[11px] font-semibold text-gray-500 uppercase tracking-wider mb-1.5">{children}</div>
}

function Select({ value, onChange, options, placeholder }) {
  return (
    <select
      value={value}
      onChange={e => onChange(e.target.value)}
      className="w-full bg-gray-800 border border-gray-700 rounded-lg px-3 py-2 text-sm
        text-gray-200 focus:outline-none focus:border-blue-500 transition-colors cursor-pointer"
    >
      <option value="">{placeholder}</option>
      {options.map(o => (
        <option key={o} value={o} className="capitalize">{o.charAt(0).toUpperCase() + o.slice(1)}</option>
      ))}
    </select>
  )
}

function TextInput({ value, onChange, placeholder }) {
  return (
    <input
      type="text"
      value={value}
      onChange={e => onChange(e.target.value)}
      placeholder={placeholder}
      className="w-full bg-gray-800 border border-gray-700 rounded-lg px-3 py-2 text-sm
        text-gray-200 placeholder-gray-600 focus:outline-none focus:border-blue-500 transition-colors"
    />
  )
}

function DateInput({ value, onChange }) {
  return (
    <input
      type="date"
      value={value}
      onChange={e => onChange(e.target.value)}
      className="w-full bg-gray-800 border border-gray-700 rounded-lg px-3 py-2 text-sm
        text-gray-200 focus:outline-none focus:border-blue-500 transition-colors cursor-pointer"
    />
  )
}

export default function FiltersPanel({ filters, onChange, isOpen, onClose, defaultFilters }) {
  const set = (key) => (val) => onChange(prev => ({ ...prev, [key]: val }))
  const reset = () => onChange(defaultFilters)
  const activeCount = Object.values(filters).filter(v => v !== '').length

  return (
    <>
      {/* Mobile backdrop */}
      {isOpen && (
        <div
          className="fixed inset-0 z-[1000] bg-black/50 lg:hidden"
          onClick={onClose}
        />
      )}

      <aside
        className={`
          fixed left-0 top-14 z-[1001]
          h-[calc(100vh-3.5rem)] w-72
          bg-gray-900/95 backdrop-blur-md
          border-r border-gray-800/60
          overflow-y-auto
          transition-transform duration-300 ease-in-out
          ${isOpen ? 'translate-x-0' : '-translate-x-full'}
        `}
      >
        <div className="p-4 space-y-5">

          {/* Panel header */}
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <h2 className="text-sm font-semibold text-white">Filters</h2>
              {activeCount > 0 && (
                <span className="bg-blue-600 text-white text-[10px] font-bold px-1.5 py-0.5 rounded-full">
                  {activeCount}
                </span>
              )}
            </div>
            {activeCount > 0 && (
              <button
                onClick={reset}
                className="text-xs text-blue-400 hover:text-blue-300 transition-colors"
              >
                Clear all
              </button>
            )}
          </div>

          {/* Date range */}
          <div className="space-y-2">
            <Label>Date Range</Label>
            <DateInput value={filters.date_from} onChange={set('date_from')} />
            <DateInput value={filters.date_to} onChange={set('date_to')} />
          </div>

          {/* Outcome */}
          <div>
            <Label>Outcome</Label>
            <Select
              value={filters.outcome}
              onChange={set('outcome')}
              options={OUTCOMES}
              placeholder="All outcomes"
            />
          </div>

          {/* Motivation */}
          <div>
            <Label>Motivation</Label>
            <Select
              value={filters.motivation}
              onChange={set('motivation')}
              options={MOTIVATIONS}
              placeholder="All motivations"
            />
          </div>

          {/* Victim activity */}
          <div>
            <Label>Victim Activity</Label>
            <Select
              value={filters.victim_activity}
              onChange={set('victim_activity')}
              options={ACTIVITIES}
              placeholder="All activities"
            />
          </div>

          {/* Time of day */}
          <div>
            <Label>Time of Day</Label>
            <Select
              value={filters.time_of_day || ''}
              onChange={set('time_of_day')}
              options={TIME_OF_DAY}
              placeholder="Any time"
            />
          </div>

          {/* Country */}
          <div>
            <Label>Country</Label>
            <TextInput
              value={filters.country}
              onChange={set('country')}
              placeholder="e.g. Australia"
            />
          </div>

          {/* Species */}
          <div>
            <Label>Shark Species</Label>
            <TextInput
              value={filters.shark_species}
              onChange={set('shark_species')}
              placeholder="e.g. Bull Shark"
            />
          </div>

          {/* Confirmed only */}
          <div className="flex items-center justify-between py-1">
            <span className="text-sm text-gray-300">Confirmed incidents only</span>
            <button
              onClick={() => set('is_confirmed')(filters.is_confirmed === 'true' ? '' : 'true')}
              className={`relative w-10 h-5 rounded-full transition-colors ${
                filters.is_confirmed === 'true' ? 'bg-blue-600' : 'bg-gray-700'
              }`}
            >
              <span
                className={`absolute top-0.5 left-0.5 w-4 h-4 rounded-full bg-white transition-transform ${
                  filters.is_confirmed === 'true' ? 'translate-x-5' : 'translate-x-0'
                }`}
              />
            </button>
          </div>

          {/* Divider + result hint */}
          <div className="pt-2 border-t border-gray-800 text-xs text-gray-600 text-center">
            Filters apply instantly
          </div>
        </div>
      </aside>
    </>
  )
}
