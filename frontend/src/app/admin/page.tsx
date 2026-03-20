"use client";

import { useEffect, useState } from "react";
import {
  Organisation, PagedResult, User,
  getOrganisations, searchOrganisations, getUsers,
  deleteOrganisation, createOrganisation,
  getStatusLabel, getStatusColor, getSourceLabel
} from "@/lib/api";

const API_BASE = process.env.NEXT_PUBLIC_API_URL ?? "";
type AdminTab = "overview" | "review" | "organisations" | "users" | "import";

interface ReviewOrg { items: Organisation[]; totalCount: number; }

export default function AdminPage() {
  const [tab, setTab] = useState<AdminTab>("overview");
  const [orgs, setOrgs] = useState<PagedResult<Organisation> | null>(null);
  const [pendingReview, setPendingReview] = useState<ReviewOrg | null>(null);
  const [users, setUsers] = useState<PagedResult<User> | null>(null);
  const [search, setSearch] = useState("");
  const [page, setPage] = useState(1);
  const [importJson, setImportJson] = useState("");
  const [importResult, setImportResult] = useState<string | null>(null);
  const [exportData, setExportData] = useState<string | null>(null);

  const loadOrgs = async () => {
    try { setOrgs(search ? await searchOrganisations(search, page) : await getOrganisations(page, 50)); } catch {}
  };
  const loadPending = async () => {
    try { const res = await fetch(`${API_BASE}/api/v1/review/pending`); setPendingReview(await res.json()); } catch {}
  };
  const loadUsers = async () => {
    try { setUsers(await getUsers(1, 200)); } catch {}
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
    try { const all = await getOrganisations(1, 1000); setExportData(JSON.stringify(all.items, null, 2)); } catch { setExportData("Fel vid export"); }
  };
  const handleImport = async () => {
    setImportResult(null);
    try {
      const items = JSON.parse(importJson);
      const arr = Array.isArray(items) ? items : [items];
      let success = 0;
      for (const item of arr) {
        try {
          await createOrganisation({ name: item.name, orgNumber: item.orgNumber, sourceType: item.sourceType ?? 2, organisationTypeId: item.organisationTypeId ?? item.organisationType?.id ?? "c1000000-0000-0000-0000-000000000004", addresses: item.addresses, contacts: item.contacts });
          success++;
        } catch {}
      }
      setImportResult(`Importerade ${success} av ${arr.length} organisationer`);
      setImportJson("");
    } catch { setImportResult("Ogiltig JSON. Kontrollera formatet."); }
  };
  const handleDeleteOrg = async (id: string, name: string) => {
    if (!confirm(`Ta bort "${name}"?`)) return;
    await deleteOrganisation(id);
    loadOrgs();
  };

  const tabs: { key: AdminTab; label: string; badge?: number }[] = [
    { key: "overview", label: "Översikt" },
    { key: "review", label: "Granska", badge: pendingReview?.totalCount },
    { key: "organisations", label: "Organisationer" },
    { key: "users", label: "Användare" },
    { key: "import", label: "Import / Export" },
  ];

  const statCards = [
    { label: "Totalt", value: orgs?.totalCount ?? "-", color: "text-gray-900", bg: "bg-white" },
    { label: "Aktiva", value: orgs?.items.filter(o => o.status === 2).length ?? "-", color: "text-spsm-green-600", bg: "bg-spsm-green-50/50" },
    { label: "Väntar granskning", value: orgs?.items.filter(o => o.status === 0 && o.sourceType === 1).length ?? "-", color: "text-spsm-orange-500", bg: "bg-spsm-orange-50/50" },
    { label: "Självregistrerade", value: orgs?.items.filter(o => o.sourceType === 1).length ?? "-", color: "text-spsm-burgundy-800", bg: "bg-spsm-burgundy-50/50" },
  ];

  return (
    <div className="animate-slide-up">
      {/* Header */}
      <div className="mb-8">
        <div className="flex items-center gap-3 mb-1">
          <div className="w-10 h-10 rounded-lg bg-gray-900 flex items-center justify-center">
            <svg width="20" height="20" viewBox="0 0 20 20" fill="white"><path fillRule="evenodd" d="M4.5 2A1.5 1.5 0 0 0 3 3.5v13A1.5 1.5 0 0 0 4.5 18h11a1.5 1.5 0 0 0 1.5-1.5V7.621a1.5 1.5 0 0 0-.44-1.06l-4.12-4.122A1.5 1.5 0 0 0 11.378 2H4.5Zm4.75 6.75a.75.75 0 0 0-1.5 0v2.546l-.943-1.048a.75.75 0 1 0-1.114 1.004l2.25 2.5a.75.75 0 0 0 1.114 0l2.25-2.5a.75.75 0 1 0-1.114-1.004l-.943 1.048V8.75Z"/></svg>
          </div>
          <div>
            <h2 className="text-2xl font-bold text-gray-900">Administration</h2>
            <p className="text-sm text-gray-500">Intern hantering av organisationer och användare</p>
          </div>
        </div>
      </div>

      {/* Tabs */}
      <div className="border-b border-gray-200 mb-6">
        <nav className="flex gap-0 -mb-px">
          {tabs.map((t) => (
            <button
              key={t.key}
              onClick={() => { setTab(t.key); setPage(1); }}
              className={`px-5 py-3.5 text-sm font-semibold border-b-[3px] transition-colors ${
                tab === t.key
                  ? "border-spsm-burgundy-800 text-spsm-burgundy-800"
                  : "border-transparent text-gray-400 hover:text-gray-700 hover:border-gray-300"
              }`}
            >
              {t.label}
              {t.badge !== undefined && t.badge > 0 && (
                <span className="ml-2 bg-spsm-burgundy-800 text-white text-[10px] font-bold rounded-full px-1.5 py-0.5 min-w-[18px] inline-block text-center">{t.badge}</span>
              )}
            </button>
          ))}
        </nav>
      </div>

      <div className="animate-fade-in">
        {/* === OVERVIEW === */}
        {tab === "overview" && (
          <div className="grid grid-cols-4 gap-4">
            {statCards.map((s) => (
              <div key={s.label} className={`card p-5 ${s.bg}`}>
                <p className="text-xs font-semibold uppercase tracking-wider text-gray-400 mb-2">{s.label}</p>
                <p className={`text-3xl font-bold ${s.color}`}>{s.value}</p>
              </div>
            ))}
          </div>
        )}

        {/* === REVIEW === */}
        {tab === "review" && (
          <div>
            <div className="mb-4">
              <h3 className="text-lg font-bold text-gray-900">Granskning</h3>
              <p className="text-sm text-gray-500">Självregistrerade organisationer som väntar på godkännande</p>
            </div>
            {pendingReview && pendingReview.items.length > 0 ? (
              <div className="grid gap-3">
                {pendingReview.items.map((org) => (
                  <div key={org.id} className="card-hover p-5 flex items-center justify-between">
                    <div>
                      <a href={`/organisation/${org.id}`} className="font-bold text-spsm-burgundy-800 hover:underline underline-offset-2">{org.name}</a>
                      <div className="flex items-center gap-3 mt-1 text-sm text-gray-500">
                        <span className="font-mono text-xs">{org.orgNumber || "Inget org.nr"}</span>
                        <span className="w-1 h-1 bg-gray-300 rounded-full" />
                        <span>{org.organisationType?.name}</span>
                        <span className="w-1 h-1 bg-gray-300 rounded-full" />
                        <span>{org.addresses?.[0]?.city || "Okänd ort"}</span>
                      </div>
                      <p className="text-xs text-gray-400 mt-1.5">Registrerad {new Date(org.createdAt).toLocaleDateString("sv-SE")}</p>
                    </div>
                    <div className="flex gap-2 shrink-0">
                      <button onClick={() => handleApprove(org.id)} className="btn-success btn-sm">Godkänn</button>
                      <button onClick={() => handleReject(org.id)} className="btn-danger btn-sm">Avslå</button>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="card p-12 text-center">
                <div className="w-12 h-12 mx-auto mb-3 rounded-full bg-spsm-green-50 flex items-center justify-center">
                  <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="text-spsm-green-500"><path d="M20 6L9 17l-5-5"/></svg>
                </div>
                <p className="text-gray-500 font-medium">Allt klart!</p>
                <p className="text-sm text-gray-400 mt-1">Inga organisationer väntar på granskning</p>
              </div>
            )}
          </div>
        )}

        {/* === ORGANISATIONS === */}
        {tab === "organisations" && (
          <div>
            <form onSubmit={(e) => { e.preventDefault(); setPage(1); loadOrgs(); }} className="mb-4">
              <div className="flex gap-3">
                <div className="relative flex-1">
                  <svg className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400" width="16" height="16" viewBox="0 0 16 16" fill="currentColor"><path fillRule="evenodd" d="M9.965 11.026a5 5 0 1 1 1.06-1.06l2.755 2.754a.75.75 0 1 1-1.06 1.06l-2.755-2.754ZM10.5 7a3.5 3.5 0 1 1-7 0 3.5 3.5 0 0 1 7 0Z"/></svg>
                  <input value={search} onChange={(e) => setSearch(e.target.value)} placeholder="Sök organisation..." className="input pl-10" />
                </div>
                <button type="submit" className="btn-primary">Sök</button>
              </div>
            </form>
            <div className="card overflow-hidden">
              <table className="w-full text-sm">
                <thead>
                  <tr className="bg-stone-50 border-b">
                    <th className="text-left px-5 py-3 font-semibold text-gray-500 text-xs uppercase tracking-wider">Namn</th>
                    <th className="text-left px-5 py-3 font-semibold text-gray-500 text-xs uppercase tracking-wider">Org.nr</th>
                    <th className="text-left px-5 py-3 font-semibold text-gray-500 text-xs uppercase tracking-wider">Typ</th>
                    <th className="text-left px-5 py-3 font-semibold text-gray-500 text-xs uppercase tracking-wider">Status</th>
                    <th className="text-left px-5 py-3 font-semibold text-gray-500 text-xs uppercase tracking-wider">Källa</th>
                    <th className="w-10 px-5 py-3"></th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100">
                  {orgs?.items.map((org) => (
                    <tr key={org.id} className="hover:bg-stone-50/50 transition-colors">
                      <td className="px-5 py-3"><a href={`/organisation/${org.id}`} className="text-spsm-burgundy-800 hover:underline underline-offset-2 font-semibold">{org.name}</a></td>
                      <td className="px-5 py-3 text-gray-500 font-mono text-xs">{org.orgNumber || "-"}</td>
                      <td className="px-5 py-3 text-gray-600">{org.organisationType?.name || "-"}</td>
                      <td className="px-5 py-3"><span className={`badge ${getStatusColor(org.status)}`}>{getStatusLabel(org.status)}</span></td>
                      <td className="px-5 py-3 text-gray-400 text-xs font-medium">{getSourceLabel(org.sourceType)}</td>
                      <td className="px-5 py-3 text-right">
                        <button onClick={() => handleDeleteOrg(org.id, org.name)} className="text-gray-300 hover:text-red-500 transition-colors">
                          <svg width="14" height="14" viewBox="0 0 16 16" fill="currentColor"><path fillRule="evenodd" d="M5 3.25V4H2.75a.75.75 0 0 0 0 1.5h.3l.815 8.15A1.5 1.5 0 0 0 5.357 15h5.285a1.5 1.5 0 0 0 1.493-1.35l.815-8.15h.3a.75.75 0 0 0 0-1.5H11v-.75A2.25 2.25 0 0 0 8.75 1h-1.5A2.25 2.25 0 0 0 5 3.25Zm2.25-.75a.75.75 0 0 0-.75.75V4h3v-.75a.75.75 0 0 0-.75-.75h-1.5Z"/></svg>
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
            {orgs && (
              <div className="flex items-center justify-between mt-5 text-sm">
                <span className="text-gray-500"><span className="font-semibold text-gray-700">{orgs.totalCount}</span> organisationer</span>
                <div className="flex items-center gap-1">
                  <button onClick={() => setPage(p => Math.max(1, p - 1))} disabled={page <= 1} className="btn-secondary btn-sm">Föregående</button>
                  <span className="px-3 py-1.5 text-xs font-semibold text-gray-600">{page} / {orgs.totalPages || 1}</span>
                  <button onClick={() => setPage(p => p + 1)} disabled={!orgs.hasNextPage} className="btn-secondary btn-sm">Nästa</button>
                </div>
              </div>
            )}
          </div>
        )}

        {/* === USERS === */}
        {tab === "users" && (
          <div>
            <h3 className="text-lg font-bold text-gray-900 mb-4">Användare</h3>
            <div className="card overflow-hidden">
              <table className="w-full text-sm">
                <thead>
                  <tr className="bg-stone-50 border-b">
                    <th className="text-left px-5 py-3 font-semibold text-gray-500 text-xs uppercase tracking-wider">Namn</th>
                    <th className="text-left px-5 py-3 font-semibold text-gray-500 text-xs uppercase tracking-wider">E-post</th>
                    <th className="text-left px-5 py-3 font-semibold text-gray-500 text-xs uppercase tracking-wider">SPSM Konto-ID</th>
                    <th className="text-left px-5 py-3 font-semibold text-gray-500 text-xs uppercase tracking-wider">Registrerad</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100">
                  {users?.items.map((u) => (
                    <tr key={u.id} className="hover:bg-stone-50/50 transition-colors">
                      <td className="px-5 py-3">
                        <div className="flex items-center gap-3">
                          <div className="w-8 h-8 rounded-full bg-spsm-burgundy-50 flex items-center justify-center text-spsm-burgundy-800 font-bold text-xs">
                            {u.firstName[0]}{u.lastName[0]}
                          </div>
                          <span className="font-semibold text-gray-900">{u.firstName} {u.lastName}</span>
                        </div>
                      </td>
                      <td className="px-5 py-3 text-gray-600">{u.email || <span className="text-gray-300">-</span>}</td>
                      <td className="px-5 py-3 font-mono text-xs text-gray-500">{u.spsmAccountId || <span className="text-gray-300">-</span>}</td>
                      <td className="px-5 py-3 text-gray-500">{new Date(u.createdAt).toLocaleDateString("sv-SE")}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
              {(!users || users.items.length === 0) && (
                <div className="p-12 text-center text-gray-300 font-medium">Inga användare registrerade</div>
              )}
            </div>
          </div>
        )}

        {/* === IMPORT/EXPORT === */}
        {tab === "import" && (
          <div className="grid grid-cols-2 gap-6">
            <div className="card p-6">
              <div className="flex items-center gap-3 mb-4">
                <div className="w-8 h-8 rounded-lg bg-spsm-green-50 flex items-center justify-center">
                  <svg width="16" height="16" viewBox="0 0 16 16" fill="currentColor" className="text-spsm-green-600"><path d="M7.25 10.25a.75.75 0 0 0 1.5 0V4.56l2.22 2.22a.75.75 0 1 0 1.06-1.06l-3.5-3.5a.75.75 0 0 0-1.06 0l-3.5 3.5a.75.75 0 0 0 1.06 1.06l2.22-2.22v5.69Z"/><path d="M3.5 13.75a.75.75 0 0 0 0-1.5h-1a.25.25 0 0 1-.25-.25V9a.75.75 0 0 0-1.5 0v3c0 .966.784 1.75 1.75 1.75h1Zm9 0a.75.75 0 0 1 0-1.5h1a.25.25 0 0 0 .25-.25V9a.75.75 0 0 1 1.5 0v3A1.75 1.75 0 0 1 13.5 13.75h-1Z"/></svg>
                </div>
                <h3 className="font-bold text-gray-900">Massimport</h3>
              </div>
              <p className="text-sm text-gray-500 mb-4">Klistra in en JSON-array med organisationer för att importera dem till registret.</p>
              <textarea
                value={importJson}
                onChange={(e) => setImportJson(e.target.value)}
                rows={10}
                className="input font-mono text-xs"
                placeholder={`[\n  {\n    "name": "Testorganisation",\n    "orgNumber": "000000-0000",\n    "organisationTypeId": "c1...001"\n  }\n]`}
              />
              <button onClick={handleImport} disabled={!importJson.trim()} className="btn-primary mt-3 w-full">Importera</button>
              {importResult && (
                <div className={`mt-3 text-sm p-3 rounded-lg font-medium ${importResult.startsWith("Ogiltig") ? "bg-spsm-burgundy-50 text-spsm-burgundy-800" : "bg-spsm-green-50 text-spsm-green-700"}`}>
                  {importResult}
                </div>
              )}
            </div>

            <div className="card p-6">
              <div className="flex items-center gap-3 mb-4">
                <div className="w-8 h-8 rounded-lg bg-spsm-orange-50 flex items-center justify-center">
                  <svg width="16" height="16" viewBox="0 0 16 16" fill="currentColor" className="text-spsm-orange-500"><path d="M8.75 5.75a.75.75 0 0 0-1.5 0v5.69L5.03 9.22a.75.75 0 0 0-1.06 1.06l3.5 3.5a.75.75 0 0 0 1.06 0l3.5-3.5a.75.75 0 1 0-1.06-1.06L8.75 11.44V5.75Z"/><path d="M3.5 2.25a.75.75 0 0 0 0 1.5h1a.25.25 0 0 1 .25.25V7a.75.75 0 0 0 1.5 0V4A1.75 1.75 0 0 0 4.5 2.25h-1Zm9 0a.75.75 0 0 1 0 1.5h-1a.25.25 0 0 0-.25.25V7a.75.75 0 0 1-1.5 0V4c0-.966.784-1.75 1.75-1.75h1Z"/></svg>
                </div>
                <h3 className="font-bold text-gray-900">Massexport</h3>
              </div>
              <p className="text-sm text-gray-500 mb-4">Exportera alla organisationer i registret som JSON-format.</p>
              <button onClick={handleExport} className="btn-secondary w-full">Exportera alla organisationer</button>
              {exportData && (
                <textarea readOnly value={exportData} rows={10} className="input font-mono text-xs mt-4 bg-stone-50" />
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
