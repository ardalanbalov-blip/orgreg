"use client";

import { useEffect, useState } from "react";
import {
  Organisation, PagedResult, User, Environment, Role,
  getOrganisations, searchOrganisations, getUsers,
  deleteOrganisation, createOrganisation,
  getStatusLabel, getStatusColor, getSourceLabel,
  getEnvironments, createEnvironment, deleteEnvironment,
  createRole, deleteRole,
  createUser, updateUser, deleteUser
} from "@/lib/api";

const API_BASE = process.env.NEXT_PUBLIC_API_URL ?? "";
type AdminTab = "overview" | "review" | "organisations" | "users" | "environments" | "import";

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
  const [environments, setEnvironments] = useState<Environment[]>([]);
  const [showNewEnv, setShowNewEnv] = useState(false);
  const [newEnvName, setNewEnvName] = useState("");
  const [newEnvDesc, setNewEnvDesc] = useState("");
  const [showNewRole, setShowNewRole] = useState<string | null>(null);
  const [newRoleName, setNewRoleName] = useState("");
  const [newRoleDesc, setNewRoleDesc] = useState("");
  const [showNewUser, setShowNewUser] = useState(false);
  const [newUserFirst, setNewUserFirst] = useState("");
  const [newUserLast, setNewUserLast] = useState("");
  const [newUserEmail, setNewUserEmail] = useState("");
  const [newUserSpsm, setNewUserSpsm] = useState("");
  const [editingUser, setEditingUser] = useState<string | null>(null);
  const [editUserFirst, setEditUserFirst] = useState("");
  const [editUserLast, setEditUserLast] = useState("");
  const [editUserEmail, setEditUserEmail] = useState("");
  const [editUserSpsm, setEditUserSpsm] = useState("");

  const loadOrgs = async () => {
    try { setOrgs(search ? await searchOrganisations(search, page) : await getOrganisations(page, 50)); } catch {}
  };
  const loadPending = async () => {
    try { const res = await fetch(`${API_BASE}/api/v1/review/pending`); setPendingReview(await res.json()); } catch {}
  };
  const loadUsers = async () => {
    try { setUsers(await getUsers(1, 200)); } catch {}
  };
  const loadEnvironments = async () => {
    try { setEnvironments(await getEnvironments()); } catch {}
  };

  useEffect(() => {
    if (tab === "overview" || tab === "organisations") loadOrgs();
    if (tab === "review") loadPending();
    if (tab === "users") loadUsers();
    if (tab === "environments") loadEnvironments();
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
  const handleCreateEnv = async () => {
    if (!newEnvName.trim()) return;
    await createEnvironment({ name: newEnvName, description: newEnvDesc || undefined });
    setNewEnvName(""); setNewEnvDesc(""); setShowNewEnv(false);
    loadEnvironments();
  };
  const handleDeleteEnv = async (id: string, name: string) => {
    if (!confirm(`Ta bort miljö "${name}"?`)) return;
    await deleteEnvironment(id);
    loadEnvironments();
  };
  const handleCreateRole = async (envId: string) => {
    if (!newRoleName.trim()) return;
    await createRole({ name: newRoleName, description: newRoleDesc || undefined, environmentId: envId });
    setNewRoleName(""); setNewRoleDesc(""); setShowNewRole(null);
    loadEnvironments();
  };
  const handleDeleteRole = async (id: string, name: string) => {
    if (!confirm(`Ta bort roll "${name}"?`)) return;
    await deleteRole(id);
    loadEnvironments();
  };
  const handleCreateUser = async () => {
    if (!newUserFirst.trim() || !newUserLast.trim()) return;
    await createUser({ firstName: newUserFirst, lastName: newUserLast, email: newUserEmail || undefined, spsmAccountId: newUserSpsm || undefined });
    setNewUserFirst(""); setNewUserLast(""); setNewUserEmail(""); setNewUserSpsm(""); setShowNewUser(false);
    loadUsers();
  };
  const handleDeleteUser = async (id: string, name: string) => {
    if (!confirm(`Ta bort användare "${name}"?`)) return;
    await deleteUser(id);
    loadUsers();
  };
  const startEditUser = (u: User) => {
    setEditingUser(u.id); setEditUserFirst(u.firstName); setEditUserLast(u.lastName);
    setEditUserEmail(u.email || ""); setEditUserSpsm(u.spsmAccountId || "");
  };
  const handleSaveUser = async () => {
    if (!editingUser) return;
    await updateUser(editingUser, { firstName: editUserFirst, lastName: editUserLast, email: editUserEmail || undefined, spsmAccountId: editUserSpsm || undefined });
    setEditingUser(null);
    loadUsers();
  };

  const tabs: { key: AdminTab; label: string; badge?: number }[] = [
    { key: "overview", label: "Översikt" },
    { key: "review", label: "Granska", badge: pendingReview?.totalCount },
    { key: "organisations", label: "Organisationer" },
    { key: "users", label: "Användare" },
    { key: "environments", label: "Miljöer & Roller" },
    { key: "import", label: "Import / Export" },
  ];

  const statCards = [
    { label: "Totalt", value: orgs?.totalCount ?? "-", gradient: "from-gray-800 to-gray-900" },
    { label: "Aktiva", value: orgs?.items.filter(o => o.status === 2).length ?? "-", gradient: "from-spsm-green-500 to-spsm-green-700" },
    { label: "Väntar granskning", value: orgs?.items.filter(o => o.status === 0 && o.sourceType === 1).length ?? "-", gradient: "from-spsm-orange-400 to-spsm-orange-600" },
    { label: "Självregistrerade", value: orgs?.items.filter(o => o.sourceType === 1).length ?? "-", gradient: "from-spsm-burgundy-700 to-spsm-burgundy-900" },
  ];

  return (
    <div className="max-w-6xl mx-auto animate-slide-up">
      {/* Header */}
      <div className="mb-10">
        <div className="flex items-center gap-2.5 mb-3">
          <div className="h-8 w-1 rounded-full bg-gradient-to-b from-gray-900 to-gray-500" />
          <p className="text-[10px] font-bold uppercase tracking-[0.2em] text-gray-400">Intern</p>
        </div>
        <h2 className="page-title">Administration</h2>
        <p className="page-subtitle">Intern hantering av organisationer, användare och systemdata</p>
      </div>

      {/* Tabs */}
      <div className="bg-white rounded-2xl border border-gray-200/60 shadow-glass mb-8 px-2">
        <nav className="flex gap-0.5">
          {tabs.map((t) => (
            <button
              key={t.key}
              onClick={() => { setTab(t.key); setPage(1); }}
              className={`tab-item ${tab === t.key ? "tab-item-active" : "tab-item-inactive"}`}
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
          <div className="grid grid-cols-4 gap-5 animate-fade-in">
            {statCards.map((s, i) => (
              <div key={s.label} className={`stat-card bg-gradient-to-br ${s.gradient} animate-slide-up stagger-${i + 1}`}>
                <p className="stat-value">{s.value}</p>
                <p className="stat-label">{s.label}</p>
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
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-bold text-gray-900">Användare</h3>
              <button onClick={() => setShowNewUser(!showNewUser)} className={showNewUser ? "btn-ghost btn-sm" : "btn-cta btn-sm"}>
                {showNewUser ? "Avbryt" : "Skapa användare"}
              </button>
            </div>
            {showNewUser && (
              <div className="card p-5 mb-4 bg-stone-50/50 animate-slide-up">
                <div className="grid grid-cols-2 gap-3 mb-3">
                  <div><label className="label">Förnamn *</label><input value={newUserFirst} onChange={(e) => setNewUserFirst(e.target.value)} className="input" placeholder="Förnamn" autoFocus /></div>
                  <div><label className="label">Efternamn *</label><input value={newUserLast} onChange={(e) => setNewUserLast(e.target.value)} className="input" placeholder="Efternamn" /></div>
                  <div><label className="label">E-post</label><input value={newUserEmail} onChange={(e) => setNewUserEmail(e.target.value)} className="input" placeholder="namn@exempel.se" type="email" /></div>
                  <div><label className="label">SPSM Konto-ID</label><input value={newUserSpsm} onChange={(e) => setNewUserSpsm(e.target.value)} className="input" placeholder="Valfritt" /></div>
                </div>
                <button onClick={handleCreateUser} disabled={!newUserFirst.trim() || !newUserLast.trim()} className="btn-primary">Skapa användare</button>
              </div>
            )}
            <div className="card overflow-hidden">
              <table className="w-full text-sm">
                <thead>
                  <tr className="bg-stone-50 border-b">
                    <th className="text-left px-5 py-3 font-semibold text-gray-500 text-xs uppercase tracking-wider">Namn</th>
                    <th className="text-left px-5 py-3 font-semibold text-gray-500 text-xs uppercase tracking-wider">E-post</th>
                    <th className="text-left px-5 py-3 font-semibold text-gray-500 text-xs uppercase tracking-wider">SPSM Konto-ID</th>
                    <th className="text-left px-5 py-3 font-semibold text-gray-500 text-xs uppercase tracking-wider">Registrerad</th>
                    <th className="w-20 px-5 py-3"></th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100">
                  {users?.items.map((u) => (
                    editingUser === u.id ? (
                      <tr key={u.id} className="bg-stone-50/50">
                        <td className="px-5 py-2">
                          <div className="flex gap-2"><input value={editUserFirst} onChange={(e) => setEditUserFirst(e.target.value)} className="input py-1 text-sm" /><input value={editUserLast} onChange={(e) => setEditUserLast(e.target.value)} className="input py-1 text-sm" /></div>
                        </td>
                        <td className="px-5 py-2"><input value={editUserEmail} onChange={(e) => setEditUserEmail(e.target.value)} className="input py-1 text-sm" /></td>
                        <td className="px-5 py-2"><input value={editUserSpsm} onChange={(e) => setEditUserSpsm(e.target.value)} className="input py-1 text-sm font-mono" /></td>
                        <td className="px-5 py-2"></td>
                        <td className="px-5 py-2 text-right">
                          <div className="flex gap-1 justify-end">
                            <button onClick={handleSaveUser} className="btn-primary btn-sm">Spara</button>
                            <button onClick={() => setEditingUser(null)} className="btn-ghost btn-sm">Avbryt</button>
                          </div>
                        </td>
                      </tr>
                    ) : (
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
                        <td className="px-5 py-3 text-right">
                          <div className="flex gap-2 justify-end">
                            <button onClick={() => startEditUser(u)} className="text-gray-300 hover:text-spsm-burgundy-800 transition-colors" title="Redigera">
                              <svg width="14" height="14" viewBox="0 0 16 16" fill="currentColor"><path d="M11.013 1.427a1.75 1.75 0 0 1 2.474 0l1.086 1.086a1.75 1.75 0 0 1 0 2.474l-8.61 8.61c-.21.21-.47.364-.756.445l-3.251.93a.75.75 0 0 1-.927-.928l.929-3.25c.081-.286.235-.547.445-.758l8.61-8.61Z"/></svg>
                            </button>
                            <button onClick={() => handleDeleteUser(u.id, `${u.firstName} ${u.lastName}`)} className="text-gray-300 hover:text-red-500 transition-colors" title="Ta bort">
                              <svg width="14" height="14" viewBox="0 0 16 16" fill="currentColor"><path fillRule="evenodd" d="M5 3.25V4H2.75a.75.75 0 0 0 0 1.5h.3l.815 8.15A1.5 1.5 0 0 0 5.357 15h5.285a1.5 1.5 0 0 0 1.493-1.35l.815-8.15h.3a.75.75 0 0 0 0-1.5H11v-.75A2.25 2.25 0 0 0 8.75 1h-1.5A2.25 2.25 0 0 0 5 3.25Zm2.25-.75a.75.75 0 0 0-.75.75V4h3v-.75a.75.75 0 0 0-.75-.75h-1.5Z"/></svg>
                            </button>
                          </div>
                        </td>
                      </tr>
                    )
                  ))}
                </tbody>
              </table>
              {(!users || users.items.length === 0) && (
                <div className="p-12 text-center text-gray-300 font-medium">Inga användare registrerade</div>
              )}
            </div>
          </div>
        )}

        {/* === ENVIRONMENTS & ROLES === */}
        {tab === "environments" && (
          <div>
            <div className="flex items-center justify-between mb-4">
              <div>
                <h3 className="text-lg font-bold text-gray-900">Miljöer & Roller</h3>
                <p className="text-sm text-gray-500">Hantera systemmiljöer och deras tillhörande roller</p>
              </div>
              <button onClick={() => setShowNewEnv(!showNewEnv)} className={showNewEnv ? "btn-ghost btn-sm" : "btn-cta btn-sm"}>
                {showNewEnv ? "Avbryt" : "Lägg till miljö"}
              </button>
            </div>
            {showNewEnv && (
              <div className="card p-5 mb-4 bg-stone-50/50 animate-slide-up">
                <div className="flex gap-3 items-end">
                  <div className="flex-1">
                    <label className="label">Miljönamn</label>
                    <input value={newEnvName} onChange={(e) => setNewEnvName(e.target.value)} className="input" placeholder="t.ex. Digitala Samlingen" autoFocus />
                  </div>
                  <div className="flex-1">
                    <label className="label">Beskrivning</label>
                    <input value={newEnvDesc} onChange={(e) => setNewEnvDesc(e.target.value)} className="input" placeholder="Valfri beskrivning" />
                  </div>
                  <button onClick={handleCreateEnv} disabled={!newEnvName.trim()} className="btn-primary">Skapa</button>
                </div>
              </div>
            )}
            {environments.length > 0 ? (
              <div className="grid gap-4">
                {environments.map((env) => (
                  <div key={env.id} className="card p-5">
                    <div className="flex items-center justify-between mb-3">
                      <div>
                        <h4 className="font-bold text-gray-900">{env.name}</h4>
                        {env.description && <p className="text-sm text-gray-500">{env.description}</p>}
                      </div>
                      <div className="flex items-center gap-2">
                        <button onClick={() => { setShowNewRole(showNewRole === env.id ? null : env.id); setNewRoleName(""); setNewRoleDesc(""); }} className="btn-ghost btn-sm text-spsm-burgundy-800">
                          {showNewRole === env.id ? "Avbryt" : "+ Roll"}
                        </button>
                        <button onClick={() => handleDeleteEnv(env.id, env.name)} className="text-gray-300 hover:text-red-500 transition-colors">
                          <svg width="14" height="14" viewBox="0 0 16 16" fill="currentColor"><path fillRule="evenodd" d="M5 3.25V4H2.75a.75.75 0 0 0 0 1.5h.3l.815 8.15A1.5 1.5 0 0 0 5.357 15h5.285a1.5 1.5 0 0 0 1.493-1.35l.815-8.15h.3a.75.75 0 0 0 0-1.5H11v-.75A2.25 2.25 0 0 0 8.75 1h-1.5A2.25 2.25 0 0 0 5 3.25Zm2.25-.75a.75.75 0 0 0-.75.75V4h3v-.75a.75.75 0 0 0-.75-.75h-1.5Z"/></svg>
                        </button>
                      </div>
                    </div>
                    {showNewRole === env.id && (
                      <div className="bg-stone-50 rounded-lg p-4 mb-3 animate-slide-up">
                        <div className="flex gap-3 items-end">
                          <div className="flex-1">
                            <label className="label">Rollnamn</label>
                            <input value={newRoleName} onChange={(e) => setNewRoleName(e.target.value)} className="input" placeholder="t.ex. Administratör" autoFocus />
                          </div>
                          <div className="flex-1">
                            <label className="label">Beskrivning</label>
                            <input value={newRoleDesc} onChange={(e) => setNewRoleDesc(e.target.value)} className="input" placeholder="Valfri beskrivning" />
                          </div>
                          <button onClick={() => handleCreateRole(env.id)} disabled={!newRoleName.trim()} className="btn-primary">Skapa</button>
                        </div>
                      </div>
                    )}
                    {env.roles.length > 0 ? (
                      <div className="flex flex-wrap gap-2">
                        {env.roles.map(r => (
                          <span key={r.id} className="badge bg-spsm-green-50 text-spsm-green-700 inline-flex items-center gap-1.5 pr-1.5">
                            {r.name}
                            <button onClick={() => handleDeleteRole(r.id, r.name)} className="text-spsm-green-400 hover:text-red-500 transition-colors">
                              <svg width="10" height="10" viewBox="0 0 10 10" fill="currentColor"><path d="M2.5 2.5l5 5M7.5 2.5l-5 5" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" fill="none"/></svg>
                            </button>
                          </span>
                        ))}
                      </div>
                    ) : <p className="text-sm text-gray-300">Inga roller i denna miljö</p>}
                  </div>
                ))}
              </div>
            ) : <div className="card p-8 text-center text-gray-300 font-medium">Inga miljöer konfigurerade</div>}
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
