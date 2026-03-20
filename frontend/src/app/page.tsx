"use client";

import { useEffect, useState } from "react";
import { Organisation, PagedResult, getOrganisations, searchOrganisations, deleteOrganisation, getStatusLabel, getStatusColor, getSourceLabel } from "@/lib/api";

export default function Home() {
  const [data, setData] = useState<PagedResult<Organisation> | null>(null);
  const [search, setSearch] = useState("");
  const [page, setPage] = useState(1);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const load = async () => {
    setLoading(true);
    setError(null);
    try {
      const result = search
        ? await searchOrganisations(search, page)
        : await getOrganisations(page);
      setData(result);
    } catch {
      setError("Kunde inte ladda organisationer. Kontrollera att API:et körs.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { load(); }, [page]);

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    setPage(1);
    load();
  };

  const handleDelete = async (id: string, name: string) => {
    if (!confirm(`Vill du ta bort "${name}"?`)) return;
    await deleteOrganisation(id);
    load();
  };

  return (
    <div className="max-w-6xl mx-auto animate-slide-up">
      {/* Hero header */}
      <div className="flex items-end justify-between mb-10">
        <div>
          <div className="flex items-center gap-2.5 mb-3">
            <div className="h-8 w-1 rounded-full bg-gradient-to-b from-spsm-burgundy-800 to-spsm-burgundy-400" />
            <p className="text-[10px] font-bold uppercase tracking-[0.2em] text-spsm-burgundy-800/60">Register</p>
          </div>
          <h2 className="page-title">Organisationer</h2>
          <p className="page-subtitle">Hantera och sök bland registrerade organisationer</p>
        </div>
        <a href="/register" className="btn-cta">
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round"><path d="M12 5v14M5 12h14"/></svg>
          Registrera ny
        </a>
      </div>

      {/* Search */}
      <form onSubmit={handleSearch} className="mb-8">
        <div className="flex gap-3">
          <div className="relative flex-1">
            <div className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400">
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round"><circle cx="11" cy="11" r="8"/><path d="m21 21-4.35-4.35"/></svg>
            </div>
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Sök på namn eller organisationsnummer..."
              className="input-lg pl-12"
            />
          </div>
          <button type="submit" className="btn-primary px-8 rounded-2xl text-base">Sök</button>
          {search && (
            <button type="button" onClick={() => { setSearch(""); setPage(1); setTimeout(load, 0); }} className="btn-ghost">
              Rensa
            </button>
          )}
        </div>
      </form>

      {/* Error */}
      {error && (
        <div className="card p-5 mb-6 border-red-200/60 bg-red-50/50 animate-scale-in">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-red-100 flex items-center justify-center shrink-0">
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#dc2626" strokeWidth="2" strokeLinecap="round"><circle cx="12" cy="12" r="10"/><path d="M12 8v4"/><circle cx="12" cy="16" r="0.5" fill="#dc2626"/></svg>
            </div>
            <div>
              <p className="text-sm font-semibold text-red-800">{error}</p>
              <p className="text-xs text-red-600/70 mt-0.5">Kontrollera att backend-API:erna körs på rätt port</p>
            </div>
          </div>
        </div>
      )}

      {/* Loading */}
      {loading ? (
        <div className="card p-16 text-center">
          <div className="relative inline-block">
            <div className="w-12 h-12 rounded-full border-[3px] border-gray-200 border-t-spsm-burgundy-800 animate-spin" />
            <div className="absolute inset-0 w-12 h-12 rounded-full border-[3px] border-transparent border-b-spsm-orange-400 animate-spin" style={{ animationDuration: '1.5s', animationDirection: 'reverse' }} />
          </div>
          <p className="text-sm text-gray-400 mt-5 font-medium">Laddar organisationer...</p>
        </div>
      ) : data && data.items.length > 0 ? (
        <>
          {/* Stats bar */}
          <div className="flex items-center gap-6 mb-6">
            <div className="flex items-center gap-2">
              <span className="text-2xl font-extrabold text-gray-900 tracking-tight">{data.totalCount}</span>
              <span className="text-xs font-semibold text-gray-400 uppercase tracking-wider">totalt</span>
            </div>
            <div className="h-5 w-px bg-gray-200" />
            <span className="text-xs text-gray-400 font-medium">Sida {page} av {data.totalPages || 1}</span>
          </div>

          {/* Table */}
          <div className="table-container">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-gray-100 bg-gray-50/50">
                  <th className="table-header">Namn</th>
                  <th className="table-header">Org.nr</th>
                  <th className="table-header">Typ</th>
                  <th className="table-header">Status</th>
                  <th className="table-header">Källa</th>
                  <th className="table-header">Ort</th>
                  <th className="w-12 table-header"></th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100/80">
                {data.items.map((org, i) => (
                  <tr key={org.id} className={`table-row animate-slide-up stagger-${Math.min(i + 1, 5)}`}>
                    <td className="table-cell">
                      <a href={`/organisation/${org.id}`} className="text-gray-900 hover:text-spsm-burgundy-800 font-semibold transition-colors group">
                        <span className="group-hover:underline underline-offset-2 decoration-spsm-burgundy-300">{org.name}</span>
                      </a>
                    </td>
                    <td className="table-cell">
                      <span className="font-mono text-xs text-gray-500 bg-gray-100/80 rounded-md px-2 py-0.5">{org.orgNumber || "-"}</span>
                    </td>
                    <td className="table-cell text-gray-600 font-medium">{org.organisationType?.name || "-"}</td>
                    <td className="table-cell">
                      <span className={`badge ${getStatusColor(org.status)}`}>
                        <span className={`badge-dot ${org.status === 2 ? 'bg-spsm-green-500' : org.status === 0 ? 'bg-spsm-orange-500' : org.status === 4 ? 'bg-red-400' : 'bg-gray-400'}`} />
                        {getStatusLabel(org.status)}
                      </span>
                    </td>
                    <td className="table-cell">
                      <span className="text-[11px] text-gray-400 font-medium">{getSourceLabel(org.sourceType)}</span>
                    </td>
                    <td className="table-cell text-gray-600">{org.addresses?.[0]?.city || "-"}</td>
                    <td className="table-cell text-right">
                      <button
                        onClick={() => handleDelete(org.id, org.name)}
                        className="p-1.5 rounded-lg text-gray-300 hover:text-red-500 hover:bg-red-50 transition-all"
                        title="Ta bort"
                      >
                        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round"><path d="M3 6h18M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6M8 6V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"/></svg>
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* Pagination */}
          <div className="flex items-center justify-between mt-6">
            <span className="text-xs text-gray-400 font-medium">
              Visar <span className="text-gray-700 font-semibold">{data.items.length}</span> av <span className="text-gray-700 font-semibold">{data.totalCount}</span> organisationer
            </span>
            <div className="flex items-center gap-1.5">
              <button
                onClick={() => setPage(p => Math.max(1, p - 1))}
                disabled={page <= 1}
                className="btn-secondary btn-sm"
              >
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round"><path d="m15 18-6-6 6-6"/></svg>
                Föregående
              </button>
              <div className="flex items-center gap-0.5">
                {Array.from({ length: Math.min(data.totalPages || 1, 5) }, (_, i) => i + 1).map(p => (
                  <button
                    key={p}
                    onClick={() => setPage(p)}
                    className={`w-9 h-9 rounded-lg text-xs font-semibold transition-all duration-200 ${
                      page === p ? "bg-spsm-burgundy-800 text-white shadow-glow" : "text-gray-500 hover:bg-gray-100"
                    }`}
                  >
                    {p}
                  </button>
                ))}
              </div>
              <button
                onClick={() => setPage(p => p + 1)}
                disabled={!data.hasNextPage}
                className="btn-secondary btn-sm"
              >
                Nästa
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round"><path d="m9 18 6-6-6-6"/></svg>
              </button>
            </div>
          </div>
        </>
      ) : (
        <div className="card p-16 text-center animate-scale-in">
          <div className="w-20 h-20 mx-auto mb-6 rounded-2xl bg-gradient-to-br from-gray-100 to-gray-200/50 flex items-center justify-center">
            <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" className="text-gray-400" strokeLinecap="round">
              <rect x="3" y="3" width="7" height="7" rx="1.5"/>
              <rect x="14" y="3" width="7" height="7" rx="1.5"/>
              <rect x="3" y="14" width="7" height="7" rx="1.5"/>
              <rect x="14" y="14" width="7" height="7" rx="1.5"/>
            </svg>
          </div>
          <p className="text-gray-700 font-semibold text-lg">{search ? "Inga organisationer hittades" : "Inga organisationer ännu"}</p>
          <p className="text-gray-400 text-sm mt-2 max-w-sm mx-auto">Klicka på &quot;Registrera ny&quot; för att lägga till din första organisation i registret</p>
          <a href="/register" className="btn-cta mt-6 inline-flex">Registrera organisation</a>
        </div>
      )}
    </div>
  );
}
