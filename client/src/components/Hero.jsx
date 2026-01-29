export default function Hero() {
  return (
    <section className="relative bg-gradient-to-br from-slate-950 via-slate-900 to-slate-950 text-white overflow-hidden border-b border-slate-800/50">
      {/* Premium grid pattern */}
      <div className="absolute inset-0 opacity-5">
        <div className="absolute inset-0" style={{
          backgroundImage: 'radial-gradient(circle at 2px 2px, #D4AF37 1px, transparent 0)',
          backgroundSize: '40px 40px'
        }} />
      </div>

      <div className="relative max-w-7xl mx-auto px-4 py-8 md:py-12">
        <div className="text-center mb-8">
          <div className="inline-flex items-center gap-2 bg-gold/10 border border-gold/20 px-4 py-2 rounded-full mb-4">
            <span className="w-2 h-2 bg-accent-green rounded-full animate-pulse"></span>
            <span className="text-gold text-xs font-bold tracking-wider">LIVE PREDICTIONS</span>
          </div>
          
          <h1 className="text-3xl md:text-5xl font-black mb-3 leading-tight">
            Premium
            <span className="text-gold-gradient"> Betting Analytics</span>
          </h1>
          
          <p className="text-base md:text-lg text-slate-400 max-w-2xl mx-auto">
            Advanced double chance calculations • Real-time odds tracking • Data-driven insights
          </p>
        </div>
      </div>
    </section>
  )
}
