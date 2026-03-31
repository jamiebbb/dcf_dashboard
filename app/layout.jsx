import "./globals.css";

export const metadata = {
  title: "FTSE 250 Intrinsic Values | DCF Valuation Repository",
  description:
    "A comprehensive repository of DCF valuations and intrinsic values for every company in the FTSE 250.",
};

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <body className="min-h-screen antialiased">
        {/* Top nav */}
        <header className="sticky top-0 z-50 border-b backdrop-blur-xl bg-midnight/80 border-white/5">
          <div className="max-w-7xl mx-auto px-6 h-16 flex items-center justify-between">
            <a href="/" className="flex items-center gap-3 group">
              <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-accent-green to-accent-blue flex items-center justify-center text-midnight font-bold text-sm font-mono">
                IV
              </div>
              <span className="font-display text-lg tracking-tight">
                FTSE 250 Valuations
              </span>
            </a>
            <nav className="flex items-center gap-6 text-sm text-slate-400">
              <a href="/" className="hover:text-white transition-colors">
                All Companies
              </a>
              <a href="#" className="hover:text-white transition-colors">
                Sectors
              </a>
              <a href="#" className="hover:text-white transition-colors">
                Methodology
              </a>
            </nav>
          </div>
        </header>

        <main className="relative z-10">{children}</main>

        {/* Footer */}
        <footer className="border-t border-white/5 mt-24">
          <div className="max-w-7xl mx-auto px-6 py-8 text-sm text-slate-500 flex justify-between">
            <span>
              FTSE 250 Valuations — Data via Financial Reports EU
            </span>
            <span>Not investment advice. Models are illustrative.</span>
          </div>
        </footer>
      </body>
    </html>
  );
}
