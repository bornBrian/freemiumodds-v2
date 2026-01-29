import MatchCard from './MatchCard'

export default function MatchList({ matches, loading, selectedDate, onDateChange }) {
  const isToday = selectedDate === new Date().toISOString().split('T')[0]

  return (
    <section id="matches" className="pb-12">
      {/* Date Selector */}
      <div className="mb-6 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-2xl md:text-3xl font-black text-white mb-1">
            <span className="text-gold-gradient">Premium</span> Predictions
          </h2>
          <p className="text-sm text-slate-400">Double chance odds with advanced analytics</p>
        </div>
        
        <div className="flex items-center gap-3">
          <input
            type="date"
            value={selectedDate}
            onChange={(e) => onDateChange(e.target.value)}
            className="bg-slate-800 border border-slate-700 text-white px-4 py-2 rounded-lg focus:outline-none focus:ring-2 focus:ring-gold/50 font-semibold"
          />
          {!isToday && (
            <button
              onClick={() => onDateChange(new Date().toISOString().split('T')[0])}
              className="btn-gold px-4 py-2 rounded-lg text-sm">Today</button>
          )}
        </div>
      </div>

      {/* Loading State */}
      {loading && (
        <div className="text-center py-12">
          <div className="inline-flex items-center gap-3 glass-card px-6 py-4 rounded-xl">
            <div className="w-6 h-6 border-4 border-gold border-t-transparent rounded-full animate-spin"></div>
            <span className="text-slate-300 font-semibold">Loading premium data...</span>
          </div>
        </div>
      )}

      {/* Matches Grid */}
      {!loading && matches.length > 0 && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {matches.map((match) => (
            <MatchCard key={match.id} match={match} />
          ))}
        </div>
      )}

      {/* Empty State */}
      {!loading && matches.length === 0 && (
        <div className="text-center py-16 glass-card rounded-xl">
          <div className="text-6xl mb-4"></div>
          <h3 className="text-xl font-bold text-white mb-2">No predictions available</h3>
          <p className="text-slate-400 mb-6">Try selecting a different date or check back later</p>
          {!isToday && (
            <button
              onClick={() => onDateChange(new Date().toISOString().split('T')[0])}
              className="btn-gold px-6 py-3 rounded-lg">View Today's Predictions</button>
          )}
        </div>
      )}
    </section>
  )
}
