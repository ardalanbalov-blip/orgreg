import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "SPSM Organisationsregister",
  description: "Registrera och administrera organisationer hos SPSM",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="sv">
      <body className="bg-gray-50 min-h-screen">
        <header className="bg-white border-b border-gray-200">
          <div className="max-w-7xl mx-auto px-4 py-4 flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 bg-blue-600 rounded flex items-center justify-center text-white font-bold text-sm">S</div>
              <h1 className="text-xl font-semibold text-gray-900">SPSM Organisationsregister</h1>
            </div>
            <nav className="flex gap-6 text-sm">
              <a href="/" className="text-gray-700 hover:text-blue-600">Mina organisationer</a>
              <a href="/register" className="text-gray-700 hover:text-blue-600">Registrera</a>
              <a href="/admin" className="text-gray-500 hover:text-blue-600 border-l pl-6 ml-2 border-gray-300">Admin</a>
            </nav>
          </div>
        </header>
        <main className="max-w-7xl mx-auto px-4 py-8">{children}</main>
      </body>
    </html>
  );
}
