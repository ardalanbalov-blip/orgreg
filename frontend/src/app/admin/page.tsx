"use client";

import { useEffect, useState } from "react";
import {
  Organisation, PagedResult, User,
  getOrganisations, searchOrganisations, getUsers,
  updateOrganisation, deleteOrganisation, createOrganisation,
  getStatusLabel, getStatusColor, getSourceLabel
} from "@/lib/api";

const API_BASE = process.env.NEXT_PUBLIC_API_URL ?? "";

type AdminTab = "overview" | "review" | "organisations" | "users" | "import";

interface ReviewOrg {
  items: Organisation[];
  totalCount: number;
}

export default function AdminPage() {
  const [tab, setTab] = useState<AdminTab>("overview");
  const [orgs, setOrgs] = useState<PagedResult<Organisation> | null>(null);
  const [pendingReview, setPendingReview] = useState<ReviewOrg | null>(null);
  const [users, setUsers] = useState<PagedResult<User> | null>(null);
  const [search, setSearch] = useState("");
  const [page, setPage] = useState(1);
  const [loading, setLoading] = useState(false);
  const [importJson, setImportJson] = useState("");
  const [importResult, setImportResult] = useState<string | null>(null);
  const [exportData, setExportData] = useState<string | null>(null);

  const loadOrgs = async () => {
    setLoading(true);
    try {
      const result = search ? await searchOrganisations(search, page) : await getOrganisations(page, 50);
      setOrgs(result);
    } catch { /* ignore */ }
    setLoading(false);
  };

  const loadPending = async () => {
    setLoading(true);
    try {
      const res = await fetch(`${API_BASE}/api/v1/review/pending`);
      const data = await res.json();
      setPendingReview(data);
    } catch { /* ignore */ }
    setLoading(false);
  };

  const loadUsers = async () => {
    setLoading(true);
    try {
      const result = await getUsers(1, 200);
      setUsers(result);
    } catch { /* ignore */ }
    setLoading(false);
  };

  useEffect(() => {
    if (tab === "overview" || tab === "organisations") loadOrgs();
    if (tab === "review") loadPending();
    if (tab === "users") loadUsers();
  }, [tab, page]);

  const handleApprove = async (id: string) => {
    await fetch(`${API_BASE}/api/v1/review/${id}/approve`, { method: "POST" });
    loadPending();
  };

  const handleReject = async (id: string) => {
    if (!confirm("Vill du avslå denna organisation?")) return;
    await fetch(`${API_BASE}/api/v1/review/${id}/reject`, { method: "POST" });
    loadPending();
  };

  const handleExport = async () => {
    try {
      const all = await getOrganisations(1, 1000);
      setExportData(JSON.stringify(all.items, null, 2));
    } catch { setExportData("Kunde inte exportera data"); }
  };

  const handleImport = async () => {
    setImportResult(null);
    try {
      const items = JSON.parse(importJson);
      const arr = Array.isArray(items) ? items : [items];
      let success = 0;
      for (const item of arr) {
        try {
          await createOrganisation({
            name: item.name,
            orgNumber: item.orgNumber,
            sourceType: item.sourceType ?? 2,
            organisationTypeId: item.organisationTypeId ?? item.organisationType?.id ?? "c1000000-0000-0000-0000-000000000004",
            addresses: item.addresses,
            contacts: item.contacts,
          });
          success++;
        } catch { /* skip failed */ }
      }
      setImportResult(`Importerade ${success} av ${arr.length} organisationer`);
      setImportJson("");
    } catch {
      setImportResult("Ogiltig JSON. Kontrollera formatet.");
    }
  };

  const handleDeleteOrg = async (id: string, name: string) => {
    if (!confirm(`Ta bort "${name}"?`)) return;
    await deleteOrganisation(id);
    loadOrgs();
  };

  const tabs: { key: AdminTab; label: string }[] = [
    { key: "overview", label: "Översikt" },
    { key: "review", label: "Granska" },
    { key: "organisations", label: "Organisationer" },
    { key: "users", label: "Användare" },
    { key: "import", label: "Import / Export" },
  ];

  return (
    <div>
      <div className="flex items-center gap-3 mb-6">
        <div className="w-8 h-8 bg-gray-900 rounded flex items-center justify-center text-white font-bold text-sm">A</div>
        <h2 className="text-2xl font-bold text-gray-900">SPSM Administration</h2>
      </div>

      {/* Tabs */}
      <div className="border-b border-gray-200 mb-6">
        <nav className="flex gap-0 -mb-px">
          {tabs.map((t) => (
            <button
              key={t.key}
              onClick={() => { setTab(t.key); setPage(1); }}
              className={`px-4 py-3 text-sm font-medium border-b-2 ${
                tab === t.key
                  ? "border-blue-600 text-blue-600"
                  : "border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300"
              }`}
            >
              {t.label}
              {t.key === "review" && pendingReview && pendingReview.totalCount > 0 && (
                <span className="ml-2 bg-red-500 text-white text-xs rounded-full px-2 py-0.5">{pendingReview.totalCount}</span>
              )}
            </button>
          ))}
        </nav>
      </div>

      {/* Overview */}
      {tab === "overview" && (
        <div className="grid grid-cols-4 gap-4 mb-8">
          <div className="bg-white rounded-lg border p-4">
            <p className="text-sm text-gray-500">Totalt organisationer</p>
            <p className="text-3xl font-bold text-gray-900">{orgs?.totalCount ?? "-"}</p>
          </div>
          <div className="bg-white rounded-lg border p-4">
            <p className="text-sm text-gray-500">Aktiva</p>
            <p className="text-3xl font-bold text-green-600">{orgs?.items.filter(o => o.status === 2).length ?? "-"}</p>
          </div>
          <div className="bg-white rounded-lg border p-4">
            <p className="text-sm text-gray-500">Väntar granskning</p>
            <p className="text-3xl font-bold text-yellow-600">{orgs?.items.filter(o => o.status === 0 && o.sourceType === 1).length ?? "-"}</p>
          </div>
          <div className="bg-white rounded-lg border p-4">
            <p className="text-sm text-gray-500">Självregistrerade</p>
            <p className="text-3xl font-bold text-blue-600">{orgs?.items.filter(o => o.sourceType === 1).length ?? "-"}</p>
          </div>
        </div>
      )}

      {/* Review */}
      {tab === "review" && (
        <div className="bg-white rounded-lg border">
          <div className="p-4 border-b">
            <h3 className="font-semibold text-gray-900">Organisationer att granska</h3>
            <p className="text-sm text-gray-500 mt-1">Självregistrerade organisationer som väntar på godkännande</p>
          </div>
          {pendingReview && pendingReview.items.length > 0 ? (
            <div className="divide-y">
              {pendingReview.items.map((org) => (
                <div key={org.id} className="p-4 flex items-center justify-between hover:bg-gray-50">
                  <div>
                    <a href={`/organisation/${org.id}`} className="font-medium text-blue-600 hover:underline">{org.name}</a>
                    <p className="text-sm text-gray-500">{org.orgNumber || "Inget org.nr"} — {org.organisationType?.name} — {org.addresses?.[0]?.city || "Okänd ort"}</p>
                    <p className="text-xs text-gray-400 mt-1">Registrerad {new Date(org.createdAt).toLocaleDateString("sv-SE")}</p>
                  </div>
                  <div className="flex gap-2">
                    <button onClick={() => handleApprove(org.id)} className="bg-green-600 text-white px-4 py-2 rounded text-sm hover:bg-green-700">Godkänn</button>
                    <button onClick={() => handleReject(org.id)} className="bg-red-600 text-white px-4 py-2 rounded text-sm hover:bg-red-700">Avslå</button>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="p-8 text-center text-gray-400">Inga organisationer väntar på granskning</div>
          )}
        </div>
      )}

      {/* All Organisations */}
      {tab === "organisations" && (
        <div>
          <form onSubmit={(e) => { e.preventDefault(); setPage(1); loadOrgs(); }} className="mb-4 flex gap-3">
            <input value={search} onChange={(e) => setSearch(e.target.value)} placeholder="Sök organisation..." className="flex-1 border rounded-lg px-4 py-2 text-sm" />
            <button type="submit" className="bg-gray-900 text-white px-4 py-2 rounded-lg text-sm">Sök</button>
          </form>
          <div className="bg-white rounded-lg border overflow-hidden">
            <table className="w-full text-sm">
              <thead className="bg-gray-50 border-b">
                <tr>
                  <th className="text-left px-4 py-3 font-medium text-gray-600">Namn</th>
                  <th className="text-left px-4 py-3 font-medium text-gray-600">Org.nr</th>
                  <th className="text-left px-4 py-3 font-medium text-gray-600">Typ</th>
                  <th className="text-left px-4 py-3 font-medium text-gray-600">Status</th>
                  <th className="text-left px-4 py-3 font-medium text-gray-600">Källa</th>
                  <th className="text-right px-4 py-3"></th>
                </tr>
              </thead>
              <tbody className="divide-y">
                {orgs?.items.map((org) => (
                  <tr key={org.id} className="hover:bg-gray-50">
                    <td className="px-4 py-3"><a href={`/organisation/${org.id}`} className="text-blue-600 hover:underline font-medium">{org.name}</a></td>
                    <td className="px-4 py-3 text-gray-600">{org.orgNumber || "-"}</td>
                    <td className="px-4 py-3 text-gray-600">{org.organisationType?.name || "-"}</td>
                    <td className="px-4 py-3"><span className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(org.status)}`}>{getStatusLabel(org.status)}</span></td>
                    <td className="px-4 py-3 text-gray-500 text-xs">{getSourceLabel(org.sourceType)}</td>
                    <td className="px-4 py-3 text-right">
                      <button onClick={() => handleDeleteOrg(org.id, org.name)} className="text-red-500 hover:text-red-700 text-xs">Ta bort</button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          {orgs && (
            <div className="flex items-center justify-between mt-4 text-sm text-gray-600">
              <span>{orgs.totalCount} organisationer totalt</span>
              <div className="flex gap-2">
                <button onClick={() => setPage(p => Math.max(1, p - 1))} disabled={page <= 1} className="px-3 py-1 border rounded disabled:opacity-50">Föregående</button>
                <span className="px-3 py-1">Sida {page}</span>
                <button onClick={() => setPage(p => p + 1)} disabled={!orgs.hasNextPage} className="px-3 py-1 border rounded disabled:opacity-50">Nästa</button>
              </div>
            </div>
          )}
        </div>
      )}

      {/* Users */}
      {tab === "users" && (
        <div className="bg-white rounded-lg border overflow-hidden">
          <table className="w-full text-sm">
            <thead className="bg-gray-50 border-b">
              <tr>
                <th className="text-left px-4 py-3 font-medium text-gray-600">Namn</th>
                <th className="text-left px-4 py-3 font-medium text-gray-600">E-post</th>
                <th className="text-left px-4 py-3 font-medium text-gray-600">SPSM Konto-ID</th>
                <th className="text-left px-4 py-3 font-medium text-gray-600">Skapad</th>
              </tr>
            </thead>
            <tbody className="divide-y">
              {users?.items.map((u) => (
                <tr key={u.id} className="hover:bg-gray-50">
                  <td className="px-4 py-3 font-medium">{u.firstName} {u.lastName}</td>
                  <td className="px-4 py-3 text-gray-600">{u.email || "-"}</td>
                  <td className="px-4 py-3 text-gray-600">{u.spsmAccountId || "-"}</td>
                  <td className="px-4 py-3 text-gray-500">{new Date(u.createdAt).toLocaleDateString("sv-SE")}</td>
                </tr>
              ))}
            </tbody>
          </table>
          {(!users || users.items.length === 0) && (
            <div className="p-8 text-center text-gray-400">Inga användare registrerade</div>
          )}
        </div>
      )}

      {/* Import / Export */}
      {tab === "import" && (
        <div className="grid grid-cols-2 gap-6">
          <div className="bg-white rounded-lg border p-6">
            <h3 className="font-semibold text-gray-900 mb-4">Massimport</h3>
            <p className="text-sm text-gray-500 mb-4">Klistra in en JSON-array med organisationer för att importera dem.</p>
            <textarea
              value={importJson}
              onChange={(e) => setImportJson(e.target.value)}
              rows={12}
              className="w-full border rounded-lg px-3 py-2 text-sm font-mono"
              placeholder={`[\n  {\n    "name": "Testorganisation",\n    "orgNumber": "000000-0000",\n    "organisationTypeId": "c1000000-0000-0000-0000-000000000001"\n  }\n]`}
            />
            <button onClick={handleImport} disabled={!importJson.trim()} className="mt-3 bg-blue-600 text-white px-4 py-2 rounded text-sm hover:bg-blue-700 disabled:opacity-50">
              Importera
            </button>
            {importResult && <p className="mt-3 text-sm text-green-700 bg-green-50 p-3 rounded">{importResult}</p>}
          </div>

          <div className="bg-white rounded-lg border p-6">
            <h3 className="font-semibold text-gray-900 mb-4">Massexport</h3>
            <p className="text-sm text-gray-500 mb-4">Exportera alla organisationer som JSON.</p>
            <button onClick={handleExport} className="bg-gray-900 text-white px-4 py-2 rounded text-sm hover:bg-gray-800">
              Exportera alla organisationer
            </button>
            {exportData && (
              <textarea readOnly value={exportData} rows={12} className="mt-4 w-full border rounded-lg px-3 py-2 text-sm font-mono bg-gray-50" />
            )}
          </div>
        </div>
      )}
    </div>
  );
}
