"use client";

import { usePathname } from "next/navigation";
import "./globals.css";

export default function RootLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();

  const navItems = [
    {
      href: "/",
      label: "Organisationer",
      match: (p: string) => p === "/" || p.startsWith("/organisation"),
      icon: (
        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
          <rect x="3" y="3" width="7" height="7" rx="1.5"/>
          <rect x="14" y="3" width="7" height="7" rx="1.5"/>
          <rect x="3" y="14" width="7" height="7" rx="1.5"/>
          <rect x="14" y="14" width="7" height="7" rx="1.5"/>
        </svg>
      ),
    },
    {
      href: "/register",
      label: "Registrera",
      match: (p: string) => p === "/register",
      icon: (
        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
          <path d="M12 5v14M5 12h14"/>
        </svg>
      ),
    },
    {
      href: "/admin",
      label: "Administration",
      match: (p: string) => p.startsWith("/admin"),
      icon: (
        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
          <path d="M12.22 2h-.44a2 2 0 0 0-2 2v.18a2 2 0 0 1-1 1.73l-.43.25a2 2 0 0 1-2 0l-.15-.08a2 2 0 0 0-2.73.73l-.22.38a2 2 0 0 0 .73 2.73l.15.1a2 2 0 0 1 1 1.72v.51a2 2 0 0 1-1 1.74l-.15.09a2 2 0 0 0-.73 2.73l.22.38a2 2 0 0 0 2.73.73l.15-.08a2 2 0 0 1 2 0l.43.25a2 2 0 0 1 1 1.73V20a2 2 0 0 0 2 2h.44a2 2 0 0 0 2-2v-.18a2 2 0 0 1 1-1.73l.43-.25a2 2 0 0 1 2 0l.15.08a2 2 0 0 0 2.73-.73l.22-.39a2 2 0 0 0-.73-2.73l-.15-.08a2 2 0 0 1-1-1.74v-.5a2 2 0 0 1 1-1.74l.15-.09a2 2 0 0 0 .73-2.73l-.22-.38a2 2 0 0 0-2.73-.73l-.15.08a2 2 0 0 1-2 0l-.43-.25a2 2 0 0 1-1-1.73V4a2 2 0 0 0-2-2z"/>
          <circle cx="12" cy="12" r="3"/>
        </svg>
      ),
    },
  ];

  return (
    <html lang="sv">
      <head>
        <title>SPSM Organisationsregister</title>
        <meta name="description" content="Registrera och administrera organisationer hos SPSM" />
      </head>
      <body className="bg-[#f8f8f6] min-h-screen">
        <div className="flex min-h-screen">
          {/* Sidebar */}
          <aside className="w-[260px] shrink-0 bg-white border-r border-gray-200/60 flex flex-col fixed inset-y-0 left-0 z-40">
            {/* Logo */}
            <div className="px-6 pt-6 pb-5">
              <a href="/" className="flex items-center gap-3 group">
                <div className="w-10 h-10 rounded-xl flex items-center justify-center shadow-glass relative overflow-hidden"
                  style={{ background: 'linear-gradient(135deg, #80182f 0%, #a82549 100%)' }}>
                  <span className="text-white font-extrabold text-lg tracking-tighter">S</span>
                  <div className="absolute inset-0 bg-gradient-to-t from-transparent to-white/10" />
                </div>
                <div className="leading-tight">
                  <p className="text-[9px] font-bold uppercase tracking-[0.18em] text-spsm-burgundy-800/60">SPSM</p>
                  <p className="text-sm font-bold text-gray-900 -mt-0.5">Organisationsregister</p>
                </div>
              </a>
            </div>

            {/* Nav */}
            <nav className="flex-1 px-3 space-y-0.5">
              <p className="px-3 mb-2 text-[9px] font-bold uppercase tracking-[0.2em] text-gray-400">Meny</p>
              {navItems.map((item) => {
                const active = item.match(pathname);
                return (
                  <a
                    key={item.href}
                    href={item.href}
                    className={`flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-all duration-200 group ${
                      active
                        ? "bg-spsm-burgundy-800 text-white shadow-glow"
                        : "text-gray-600 hover:text-gray-900 hover:bg-gray-100/80"
                    }`}
                  >
                    <span className={active ? "text-white/90" : "text-gray-400 group-hover:text-gray-600 transition-colors"}>
                      {item.icon}
                    </span>
                    {item.label}
                  </a>
                );
              })}
            </nav>

            {/* Footer of sidebar */}
            <div className="px-6 py-5 border-t border-gray-100">
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-spsm-orange-400 to-spsm-orange-600 flex items-center justify-center shadow-sm">
                  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2" strokeLinecap="round"><path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"/><circle cx="12" cy="7" r="4"/></svg>
                </div>
                <div className="leading-tight">
                  <p className="text-xs font-semibold text-gray-900">Handläggare</p>
                  <p className="text-[10px] text-gray-400">SPSM Intern</p>
                </div>
              </div>
            </div>
          </aside>

          {/* Main content */}
          <div className="flex-1 ml-[260px] flex flex-col min-h-screen">
            {/* Top bar */}
            <header className="h-16 bg-white/80 backdrop-blur-xl border-b border-gray-200/40 sticky top-0 z-30 flex items-center px-8">
              <div className="flex items-center gap-3 ml-auto">
                <div className="h-8 w-px bg-gray-200" />
                <span className="text-[10px] font-semibold text-gray-400 uppercase tracking-wider">v1.0</span>
              </div>
            </header>

            {/* Page content */}
            <main className="flex-1 px-8 py-8 animate-fade-in">
              {children}
            </main>

            {/* Bottom bar */}
            <footer className="px-8 py-4 border-t border-gray-200/40 bg-white/50">
              <div className="flex items-center justify-between text-[10px] text-gray-400 font-medium">
                <span>Specialpedagogiska skolmyndigheten (SPSM)</span>
                <div className="flex items-center gap-3">
                  <span className="w-1.5 h-1.5 rounded-full bg-spsm-green-400 animate-pulse-soft" />
                  <span>System online</span>
                </div>
              </div>
            </footer>
          </div>
        </div>
      </body>
    </html>
  );
}
