"use client";

import { usePathname } from "next/navigation";
import "./globals.css";

export default function RootLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();

  const navItems = [
    { href: "/", label: "Organisationer", match: (p: string) => p === "/" || p.startsWith("/organisation") },
    { href: "/register", label: "Registrera", match: (p: string) => p === "/register" },
    { href: "/admin", label: "Administration", match: (p: string) => p.startsWith("/admin") },
  ];

  return (
    <html lang="sv">
      <head>
        <title>SPSM Organisationsregister</title>
        <meta name="description" content="Registrera och administrera organisationer hos SPSM" />
      </head>
      <body className="bg-stone-50 min-h-screen">
        {/* Top accent line */}
        <div className="h-1 bg-gradient-to-r from-spsm-burgundy-800 via-spsm-orange-500 to-spsm-green-400" />

        {/* Header */}
        <header className="bg-white border-b border-gray-200 sticky top-0 z-50">
          <div className="max-w-7xl mx-auto px-6">
            <div className="flex items-center justify-between h-16">
              <a href="/" className="flex items-center gap-3 group">
                <div className="flex items-center justify-center w-10 h-10 rounded-lg bg-spsm-burgundy-800 shadow-sm transition-shadow group-hover:shadow-md">
                  <svg width="24" height="24" viewBox="0 0 24 24" fill="none">
                    <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-1 14H9V8h2v8zm4 0h-2V8h2v8z" fill="white" opacity="0.3"/>
                    <text x="6" y="17" fontFamily="Arial" fontSize="14" fontWeight="bold" fill="white">S</text>
                  </svg>
                </div>
                <div className="leading-tight">
                  <p className="text-[10px] font-bold uppercase tracking-[0.2em] text-spsm-burgundy-800">Specialpedagogiska skolmyndigheten</p>
                  <h1 className="text-base font-bold text-gray-900 -mt-0.5">Organisationsregister</h1>
                </div>
              </a>

              <nav className="flex items-center h-full gap-1">
                {navItems.map((item) => {
                  const active = item.match(pathname);
                  return (
                    <a
                      key={item.href}
                      href={item.href}
                      className={`relative h-16 flex items-center px-4 text-sm font-semibold transition-colors ${
                        active ? "text-spsm-burgundy-800" : "text-gray-500 hover:text-gray-800"
                      }`}
                    >
                      {item.label}
                      {active && (
                        <span className="absolute bottom-0 left-2 right-2 h-[3px] bg-spsm-burgundy-800 rounded-t-full" />
                      )}
                    </a>
                  );
                })}
              </nav>
            </div>
          </div>
        </header>

        {/* Main */}
        <main className="max-w-7xl mx-auto px-6 py-8 animate-fade-in">{children}</main>

        {/* Footer */}
        <footer className="border-t border-gray-200 mt-16 bg-white">
          <div className="max-w-7xl mx-auto px-6 py-6 flex items-center justify-between text-xs text-gray-400">
            <span>Specialpedagogiska skolmyndigheten (SPSM)</span>
            <span>Organisationsregister v1.0</span>
          </div>
        </footer>
      </body>
    </html>
  );
}
