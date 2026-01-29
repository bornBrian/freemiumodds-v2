export default function MatchCard({ match }) {
  const statusColors = {
    pending: 'bg-gold/20 text-gold border-gold/30',
    live: 'bg-accent-red/20 text-accent-red border-accent-red/30',
    won: 'bg-accent-green/20 text-accent-green border-accent-green/30',
    lost: 'bg-accent-red/20 text-accent-red border-accent-red/30',
    completed: 'bg-slate-700 text-slate-300 border-slate-600'
  }

  return (
    <article className="glass-card rounded-xl overflow-hidden card-premium">
      {/* Header */}
      <div className="bg-slate-800/30 px-4 py-3 border-b border-slate-700/50 flex items-center justify-between">
        <span className="flex items-center gap-2 text-sm font-bold text-slate-300">
          <span className="text-gold">⏰</span>
          <span>{formatTime(match.kickoff)}</span>
        </span>
        <span className={`px-3 py-1 rounded-full text-xs font-bold uppercase border ${statusColors[match.status] || statusColors.pending}`}>
          {match.status}
        </span>
      </div>

      {/* Body */}
      <div className="p-5">
        {/* Teams */}
        <div className="text-center mb-5">
          <div className="font-black text-xl text-white leading-tight mb-2">
            {match.home}
          </div>
          <div className="text-xs text-gold font-bold my-3 tracking-widest">
            VS
          </div>
          <div className="font-black text-xl text-white leading-tight">
            {match.away}
          </div>
        </div>

        {/* League */}
        <div className="text-xs text-slate-400 text-center mb-5 font-medium flex items-center justify-center gap-2">
          <span className="text-gold">📍</span>
          <span>{match.league}</span>
        </div>

        {/* Double Chance Odds - Premium Style */}
        <div className="bg-gradient-to-br from-gold/10 to-gold/5 rounded-xl p-4 border border-gold/20 shadow-lg shadow-gold/5">
          <div className="text-xs text-gold font-bold uppercase tracking-widest mb-4 text-center flex items-center justify-center gap-2">
            <span>💎</span>
            <span>Double Chance Odds</span>
          </div>
          <div className="grid grid-cols-3 gap-3">
            <OddBox label="1X" odd={match.doubleChance?.['1X']} bestPick={match.bestPick === '1X'} />
            <OddBox label="X2" odd={match.doubleChance?.['X2']} bestPick={match.bestPick === 'X2'} />
            <OddBox label="12" odd={match.doubleChance?.['12']} bestPick={match.bestPick === '12'} />
          </div>
        </div>

        {/* Confidence */}
        {match.confidence && (
          <div className="mt-4 flex items-center justify-center">
            <span className="inline-flex items-center gap-2 bg-gradient-to-r from-gold to-yellow-600 text-slate-950 px-4 py-2 rounded-lg text-sm font-black shadow-lg shadow-gold/30">
              <span>🔥</span>
              <span>{match.confidence}% Confidence</span>
            </span>
          </div>
        )}

        {/* Tip */}
        {match.tip && (
          <div className="mt-3 text-center">
            <span className="inline-block bg-slate-800 border border-gold/30 text-gold px-3 py-1 rounded-md text-xs font-bold uppercase">
              Tip: {match.tip}
            </span>
          </div>
        )}
      </div>
    </article>
  )
}

function OddBox({ label, odd, bestPick }) {
  return (
    <div className={`rounded-lg p-3 text-center transition-all ${
      bestPick 
        ? 'bg-gold text-slate-950 shadow-lg shadow-gold/30 scale-105' 
        : 'bg-slate-800/50 border border-slate-700/50'
    }`}>
      <div className={`text-xs font-bold mb-1 ${bestPick ? 'text-slate-950' : 'text-slate-400'}`}>
        {label}
      </div>
      <div className={`text-xl font-black ${bestPick ? 'text-slate-950' : 'text-gold-gradient'}`}>
        {odd ? Number(odd).toFixed(2) : '-'}
      </div>
    </div>
  )
}

function formatTime(kickoffString) {
  try {
    const date = new Date(kickoffString)
    return date.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit', hour12: false })
  } catch {
    return kickoffString
  }
}
