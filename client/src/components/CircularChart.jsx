export default function CircularChart({ percentage, label, color = 'gold' }) {
  const circumference = 2 * Math.PI * 45 // radius = 45
  const offset = circumference - (percentage / 100) * circumference

  const colorMap = {
    gold: { stroke: '#D4AF37', glow: 'rgba(212, 175, 55, 0.3)' },
    green: { stroke: '#10B981', glow: 'rgba(16, 185, 129, 0.3)' },
    blue: { stroke: '#3B82F6', glow: 'rgba(59, 130, 246, 0.3)' },
    red: { stroke: '#EF4444', glow: 'rgba(239, 68, 68, 0.3)' },
  }

  const currentColor = colorMap[color] || colorMap.gold

  return (
    <div className="flex flex-col items-center">
      <div className="relative">
        {/* Glow effect */}
        <div 
          className="absolute inset-0 rounded-full blur-xl opacity-50"
          style={{ backgroundColor: currentColor.glow }}
        />
        
        <svg width="120" height="120" className="relative -rotate-90">
          {/* Background circle */}
          <circle
            cx="60"
            cy="60"
            r="45"
            fill="none"
            stroke="rgb(30, 41, 59)"
            strokeWidth="8"
          />
          
          {/* Progress circle */}
          <circle
            cx="60"
            cy="60"
            r="45"
            fill="none"
            stroke={currentColor.stroke}
            strokeWidth="8"
            strokeLinecap="round"
            strokeDasharray={circumference}
            strokeDashoffset={offset}
            style={{
              transition: 'stroke-dashoffset 1s ease-in-out',
              filter: `drop-shadow(0 0 8px ${currentColor.glow})`
            }}
          />
          
          {/* Center text */}
          <text
            x="60"
            y="60"
            textAnchor="middle"
            dominantBaseline="central"
            className="text-2xl font-black fill-white"
            transform="rotate(90 60 60)"
          >
            {percentage}%
          </text>
        </svg>
      </div>
      
      <div className="mt-3 text-center">
        <div className="text-sm font-bold text-slate-300">{label}</div>
      </div>
    </div>
  )
}
