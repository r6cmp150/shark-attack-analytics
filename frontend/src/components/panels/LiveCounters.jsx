function Counter({ label, value, color }) {
  return (
    <div className="bg-gray-900/90 backdrop-blur border border-gray-700/50 rounded-xl
      px-4 py-2.5 text-center min-w-[80px] shadow-xl">
      <div className={`text-xl font-bold tabular-nums ${color}`}>
        {value ?? 0}
      </div>
      <div className="text-[10px] text-gray-500 mt-0.5 uppercase tracking-wider">{label}</div>
    </div>
  )
}

export default function LiveCounters({ stats }) {
  return (
    <div className="absolute bottom-10 left-1/2 -translate-x-1/2 z-[1000]
      flex gap-2 pointer-events-none select-none">
      <Counter label="Today"      value={stats?.today}      color="text-red-400" />
      <Counter label="This Month" value={stats?.this_month} color="text-orange-400" />
      <Counter label="This Year"  value={stats?.this_year}  color="text-blue-400" />
      <Counter label="All Time"   value={stats?.total}      color="text-gray-300" />
    </div>
  )
}
