import CircularChart from './CircularChart'

export default function Stats({ stats }) {
  return (
    <div className="max-w-7xl mx-auto px-4 -mt-8 relative z-10">
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* Circular Chart - Accuracy */}
        <div className="glass-card rounded-xl p-6 flex items-center justify-center">
          <CircularChart 
            percentage={stats.accuracy} 
            label="Win Rate" 
            color="gold"
          />
        </div>

        {/* Total Predictions */}
        <div className="glass-card rounded-xl p-6 flex flex-col justify-center items-center">
          <div className="text-5xl font-black text-gold-gradient mb-2">
            {stats.total || 0}
          </div>
          <div className="text-sm text-slate-400 font-bold uppercase tracking-wider">
            Active Predictions
          </div>
          <div className="mt-3 flex items-center gap-2 text-xs text-slate-500">
            <span className="w-2 h-2 bg-accent-green rounded-full animate-pulse"></span>
            <span>Updated {stats.updated || 'daily'}</span>
          </div>
        </div>

        {/* Success Rate Chart */}
        <div className="glass-card rounded-xl p-6 flex items-center justify-center">
          <CircularChart 
            percentage={stats.successRate} 
            label="Success Rate" 
            color="green"
          />
        </div>
      </div>

      {/* Auto-Update Status Bar */}
      {stats.lastUpdate && (
        <div className="mt-4 glass-card rounded-xl p-3">
          <div className="flex items-center justify-between text-xs">
            <div className="flex items-center gap-2">
              <span className="w-2 h-2 bg-accent-green rounded-full animate-pulse"></span>
              <span className="text-slate-400">Auto-updating every hour</span>
            </div>
            <div className="text-slate-500">
              Last updated: {new Date(stats.lastUpdate).toLocaleTimeString()}
            </div>
          </div>
        </div>
      )}

      {/* Premium Features Bar */}
      <div className="mt-6 glass-card rounded-xl p-4">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-center">
          <div className="flex flex-col items-center gap-2">
            <div className="w-10 h-10 bg-gold/20 rounded-lg flex items-center justify-center">
              <span className="text-gold text-xl">📊</span>
            </div>
            <span className="text-xs text-slate-400 font-semibold">Live Analytics</span>
          </div>
          <div className="flex flex-col items-center gap-2">
            <div className="w-10 h-10 bg-accent-blue/20 rounded-lg flex items-center justify-center">
              <span className="text-accent-blue text-xl">⚡</span>
            </div>
            <span className="text-xs text-slate-400 font-semibold">Real-time Odds</span>
          </div>
          <div className="flex flex-col items-center gap-2">
            <div className="w-10 h-10 bg-accent-green/20 rounded-lg flex items-center justify-center">
              <span className="text-accent-green text-xl">🎯</span>
            </div>
            <span className="text-xs text-slate-400 font-semibold">{stats.accuracy}% Accuracy</span>
          </div>
          <div className="flex flex-col items-center gap-2">
            <div className="w-10 h-10 bg-gold/20 rounded-lg flex items-center justify-center">
              <span className="text-gold text-xl">🔒</span>
            </div>
            <span className="text-xs text-slate-400 font-semibold">Verified Tips</span>
          </div>
        </div>
      </div>
    </div>
  )
}
