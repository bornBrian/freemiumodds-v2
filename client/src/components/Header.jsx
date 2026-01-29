export default function Header() {
  return (
    <header className="bg-slate-950 border-b border-slate-800/50 sticky top-0 z-50 shadow-xl backdrop-blur-xl">
      <div className="max-w-7xl mx-auto px-4 py-4">
        <div className="flex items-center justify-between">
          {/* Logo */}
          <div className="flex items-center gap-3">
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 bg-gradient-to-br from-gold via-yellow-400 to-gold rounded-lg flex items-center justify-center shadow-lg shadow-gold/30">
                <span className="text-slate-950 font-black text-xl">F</span>
              </div>
              <span className="text-xl md:text-2xl font-black text-gold-gradient tracking-tight">
                FreemiumOdds
              </span>
            </div>
            <span className="hidden sm:inline-block bg-gold/20 text-gold border border-gold/30 px-2 py-0.5 rounded text-xs font-bold">
              PRO
            </span>
          </div>

          {/* Nav */}
          <nav className="flex items-center gap-4">
            <a 
              href="#matches" 
              className="text-platinum hover:text-gold font-semibold text-sm transition-colors"
            >
              Dashboard
            </a>
            <a 
              href="https://youtube.com/@footbaplays" 
              target="_blank" 
              rel="noopener noreferrer"
              className="hidden sm:flex items-center gap-2 bg-slate-800/50 hover:bg-slate-800 text-platinum border border-slate-700 px-4 py-2 rounded-lg font-semibold text-sm transition-all"
            >
              <span>📺</span>
              <span>YouTube</span>
            </a>
          </nav>
        </div>
      </div>
    </header>
  )
}
