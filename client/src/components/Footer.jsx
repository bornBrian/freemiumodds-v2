export default function Footer() {
  const currentYear = new Date().getFullYear()

  return (
    <footer className="bg-slate-950 border-t border-slate-800/50 py-8 mt-12">
      <div className="max-w-7xl mx-auto px-4">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-8">
          {/* Brand */}
          <div>
            <h4 className="text-lg font-black text-gold-gradient mb-3">FreemiumOdds Pro</h4>
            <p className="text-slate-400 text-sm leading-relaxed">
              Advanced betting analytics powered by real-time data and AI-driven insights.
            </p>
          </div>

          {/* Quick Links */}
          <div>
            <h5 className="text-sm font-bold text-white mb-3 uppercase tracking-wider">Platform</h5>
            <ul className="space-y-2">
              <li>
                <a href="#matches" className="text-slate-400 hover:text-gold text-sm transition-colors">
                  Dashboard
                </a>
              </li>
              <li>
                <a href="https://youtube.com/@footbaplays" target="_blank" rel="noopener noreferrer" className="text-slate-400 hover:text-gold text-sm transition-colors">
                  YouTube Channel
                </a>
              </li>
            </ul>
          </div>

          {/* Contact */}
          <div>
            <h5 className="text-sm font-bold text-white mb-3 uppercase tracking-wider">Contact</h5>
            <ul className="space-y-2 text-slate-400 text-sm">
              <li>
                <a href="mailto:bonbrian2@gmail.com" className="hover:text-gold transition-colors">
                   bonbrian2@gmail.com
                </a>
              </li>
              <li>
                <a href="tel:+255653931988" className="hover:text-gold transition-colors">
                   +255 653 931 988
                </a>
              </li>
            </ul>
          </div>
        </div>

        {/* Bottom Bar */}
        <div className="pt-6 border-t border-slate-800/50 flex flex-col sm:flex-row items-center justify-between gap-4">
          <p className="text-slate-500 text-xs">
             {currentYear} FreemiumOdds. Premium betting analytics platform.
          </p>
          <div className="flex items-center gap-2">
            <span className="w-2 h-2 bg-accent-green rounded-full animate-pulse"></span>
            <span className="text-slate-500 text-xs font-semibold">Real-time Updates Active</span>
          </div>
        </div>
      </div>
    </footer>
  )
}
