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
    } catch (e) {
      setError("Kunde inte ladda organisationer. Kontrollera att API:et kors.");
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
    <div>
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-2xl font-bold text-gray-900">Organisationer</h2>
        <a href="/register" className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 text-sm font-medium">
          Registrera ny organisation
        </a>
      </div>

      <form onSubmit={handleSearch} className="mb-6 flex gap-3">
        <input
          type="text"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder="Sok pa namn eller organisationsnummer..."
          className="flex-1 border border-gray-300 rounded-lg px-4 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
        />
        <button type="submit" className="bg-gray-900 text-white px-4 py-2 rounded-lg text-sm hover:bg-gray-800">
          Sok
        </button>
        {search && (
          <button type="button" onClick={() => { setSearch(""); setPage(1); setTimeout(load, 0); }} className="text-sm text-gray-500 hover:text-gray-700">
            Rensa
          </button>
        )}
      </form>

      {error && (
        <div className="bg-red-50 border border-red-200 text-red-700 p-4 rounded-lg mb-6 text-sm">{error}</div>
      )}

      {loading ? (
        <div className="text-center py-12 text-gray-500">Laddar...</div>
      ) : data && data.items.length > 0 ? (
        <>
          <div className="bg-white rounded-lg border border-gray-200 overflow-hidden">
            <table className="w-full text-sm">
              <thead className="bg-gray-50 border-b border-gray-200">
                <tr>
                  <th className="text-left px-4 py-3 font-medium text-gray-600">Namn</th>
                  <th className="text-left px-4 py-3 font-medium text-gray-600">Org.nr</th>
                  <th className="text-left px-4 py-3 font-medium text-gray-600">Typ</th>
                  <th className="text-left px-4 py-3 font-medium text-gray-600">Status</th>
                  <th className="text-left px-4 py-3 font-medium text-gray-600">Kalla</th>
                  <th className="text-left px-4 py-3 font-medium text-gray-600">Ort</th>
                  <th className="text-right px-4 py-3 font-medium text-gray-600"></th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {data.items.map((org) => (
                  <tr key={org.id} className="hover:bg-gray-50">
                    <td className="px-4 py-3">
                      <a href={`/organisation/${org.id}`} className="text-blue-600 hover:underline font-medium">{org.name}</a>
                    </td>
                    <td className="px-4 py-3 text-gray-600">{org.orgNumber || "-"}</td>
                    <td className="px-4 py-3 text-gray-600">{org.organisationType?.name || "-"}</td>
                    <td className="px-4 py-3">
                      <span className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(org.status)}`}>
                        {getStatusLabel(org.status)}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-gray-500 text-xs">{getSourceLabel(org.sourceType)}</td>
                    <td className="px-4 py-3 text-gray-600">{org.addresses?.[0]?.city || "-"}</td>
                    <td className="px-4 py-3 text-right">
                      <button onClick={() => handleDelete(org.id, org.name)} className="text-red-500 hover:text-red-700 text-xs">
                        Ta bort
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          <div className="flex items-center justify-between mt-4 text-sm text-gray-600">
            <span>Visar {data.items.length} av {data.totalCount} organisationer</span>
            <div className="flex gap-2">
              <button onClick={() => setPage(p => Math.max(1, p - 1))} disabled={page <= 1} className="px-3 py-1 border rounded disabled:opacity-50">Foregaende</button>
              <span className="px-3 py-1">Sida {page} av {data.totalPages || 1}</span>
              <button onClick={() => setPage(p => p + 1)} disabled={!data.hasNextPage} className="px-3 py-1 border rounded disabled:opacity-50">Nasta</button>
            </div>
          </div>
        </>
      ) : (
        <div className="text-center py-12 text-gray-500">
          {search ? "Inga organisationer hittades" : "Inga organisationer registrerade annu"}
        </div>
      )}
    </div>
  );
}
