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
    <div className="animate-slide-up">
      {/* Page header */}
      <div className="flex items-end justify-between mb-8">
        <div>
          <h2 className="text-2xl font-bold text-gray-900">Organisationer</h2>
          <p className="text-sm text-gray-500 mt-1">Hantera och sök bland registrerade organisationer</p>
        </div>
        <a href="/register" className="btn-cta">
          <svg width="16" height="16" viewBox="0 0 16 16" fill="currentColor"><path d="M8 2a.75.75 0 0 1 .75.75v4.5h4.5a.75.75 0 0 1 0 1.5h-4.5v4.5a.75.75 0 0 1-1.5 0v-4.5h-4.5a.75.75 0 0 1 0-1.5h4.5v-4.5A.75.75 0 0 1 8 2Z"/></svg>
          Registrera ny
        </a>
      </div>

      {/* Search */}
      <form onSubmit={handleSearch} className="mb-6">
        <div className="flex gap-3">
          <div className="relative flex-1">
            <svg className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400" width="16" height="16" viewBox="0 0 16 16" fill="currentColor"><path fillRule="evenodd" d="M9.965 11.026a5 5 0 1 1 1.06-1.06l2.755 2.754a.75.75 0 1 1-1.06 1.06l-2.755-2.754ZM10.5 7a3.5 3.5 0 1 1-7 0 3.5 3.5 0 0 1 7 0Z"/></svg>
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Sök på namn eller organisationsnummer..."
              className="input pl-10"
            />
          </div>
          <button type="submit" className="btn-primary">Sök</button>
          {search && (
            <button type="button" onClick={() => { setSearch(""); setPage(1); setTimeout(load, 0); }} className="btn-ghost btn-sm">
              Rensa
            </button>
          )}
        </div>
      </form>

      {/* Error */}
      {error && (
        <div className="bg-spsm-burgundy-50 border border-spsm-burgundy-200 text-spsm-burgundy-800 p-4 rounded-xl mb-6 text-sm font-medium flex items-center gap-3">
          <svg width="20" height="20" viewBox="0 0 20 20" fill="currentColor" className="shrink-0"><path fillRule="evenodd" d="M18 10a8 8 0 1 1-16 0 8 8 0 0 1 16 0Zm-8-5a.75.75 0 0 1 .75.75v4.5a.75.75 0 0 1-1.5 0v-4.5A.75.75 0 0 1 10 5Zm0 10a1 1 0 1 0 0-2 1 1 0 0 0 0 2Z"/></svg>
          {error}
        </div>
      )}

      {/* Loading */}
      {loading ? (
        <div className="card p-12 text-center">
          <div className="inline-block w-8 h-8 border-3 border-gray-200 border-t-spsm-burgundy-800 rounded-full animate-spin" style={{borderWidth: 3}} />
          <p className="text-sm text-gray-500 mt-3">Laddar organisationer...</p>
        </div>
      ) : data && data.items.length > 0 ? (
        <>
          {/* Table */}
          <div className="card overflow-hidden">
            <table className="w-full text-sm">
              <thead>
                <tr className="bg-stone-50 border-b border-gray-200">
                  <th className="text-left px-5 py-3.5 font-semibold text-gray-600 text-xs uppercase tracking-wider">Namn</th>
                  <th className="text-left px-5 py-3.5 font-semibold text-gray-600 text-xs uppercase tracking-wider">Org.nr</th>
                  <th className="text-left px-5 py-3.5 font-semibold text-gray-600 text-xs uppercase tracking-wider">Typ</th>
                  <th className="text-left px-5 py-3.5 font-semibold text-gray-600 text-xs uppercase tracking-wider">Status</th>
                  <th className="text-left px-5 py-3.5 font-semibold text-gray-600 text-xs uppercase tracking-wider">Källa</th>
                  <th className="text-left px-5 py-3.5 font-semibold text-gray-600 text-xs uppercase tracking-wider">Ort</th>
                  <th className="w-10 px-5 py-3.5"></th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {data.items.map((org) => (
                  <tr key={org.id} className="hover:bg-stone-50/80 transition-colors">
                    <td className="px-5 py-3.5">
                      <a href={`/organisation/${org.id}`} className="text-spsm-burgundy-800 hover:text-spsm-burgundy-700 font-semibold hover:underline underline-offset-2">{org.name}</a>
                    </td>
                    <td className="px-5 py-3.5 text-gray-500 font-mono text-xs">{org.orgNumber || "-"}</td>
                    <td className="px-5 py-3.5 text-gray-600">{org.organisationType?.name || "-"}</td>
                    <td className="px-5 py-3.5">
                      <span className={`badge ${getStatusColor(org.status)}`}>
                        {getStatusLabel(org.status)}
                      </span>
                    </td>
                    <td className="px-5 py-3.5 text-gray-400 text-xs font-medium">{getSourceLabel(org.sourceType)}</td>
                    <td className="px-5 py-3.5 text-gray-600">{org.addresses?.[0]?.city || "-"}</td>
                    <td className="px-5 py-3.5 text-right">
                      <button
                        onClick={() => handleDelete(org.id, org.name)}
                        className="text-gray-300 hover:text-red-500 transition-colors"
                        title="Ta bort"
                      >
                        <svg width="16" height="16" viewBox="0 0 16 16" fill="currentColor"><path fillRule="evenodd" d="M5 3.25V4H2.75a.75.75 0 0 0 0 1.5h.3l.815 8.15A1.5 1.5 0 0 0 5.357 15h5.285a1.5 1.5 0 0 0 1.493-1.35l.815-8.15h.3a.75.75 0 0 0 0-1.5H11v-.75A2.25 2.25 0 0 0 8.75 1h-1.5A2.25 2.25 0 0 0 5 3.25Zm2.25-.75a.75.75 0 0 0-.75.75V4h3v-.75a.75.75 0 0 0-.75-.75h-1.5Z"/></svg>
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* Pagination */}
          <div className="flex items-center justify-between mt-5 text-sm">
            <span className="text-gray-500">
              Visar <span className="font-semibold text-gray-700">{data.items.length}</span> av <span className="font-semibold text-gray-700">{data.totalCount}</span>
            </span>
            <div className="flex items-center gap-1">
              <button
                onClick={() => setPage(p => Math.max(1, p - 1))}
                disabled={page <= 1}
                className="btn-secondary btn-sm"
              >
                Föregående
              </button>
              <span className="px-3 py-1.5 text-xs font-semibold text-gray-600">
                {page} / {data.totalPages || 1}
              </span>
              <button
                onClick={() => setPage(p => p + 1)}
                disabled={!data.hasNextPage}
                className="btn-secondary btn-sm"
              >
                Nästa
              </button>
            </div>
          </div>
        </>
      ) : (
        <div className="card p-12 text-center">
          <div className="w-12 h-12 mx-auto mb-4 rounded-full bg-stone-100 flex items-center justify-center">
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" className="text-gray-400"><path d="M19 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2Z"/><path d="M9 7h6"/><path d="M9 11h6"/><path d="M9 15h4"/></svg>
          </div>
          <p className="text-gray-500 font-medium">{search ? "Inga organisationer hittades" : "Inga organisationer registrerade ännu"}</p>
          <p className="text-gray-400 text-sm mt-1">Klicka på &quot;Registrera ny&quot; för att komma igång</p>
        </div>
      )}
    </div>
  );
}
