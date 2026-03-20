"use client";

import React, { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import {
  Organisation, Unit, Group, Agreement, Membership, UnitType, Role, User, EducationType,
  getOrganisation, updateOrganisation, deleteOrganisation,
  getUnitsByOrganisation, getGroupsByOrganisation,
  getAgreementsByOrganisation, getMembershipsByOrganisation,
  getMembershipsByUnit, getMembershipsByGroup,
  createUnit, updateUnit, createGroup, updateGroup, deleteUnit, deleteGroup,
  addMember, addUnitMember, addGroupMember,
  createAgreement, deleteAgreement,
  getStatusLabel, getStatusColor, getSourceLabel,
  getUnitTypes, getRoles, getUsers, getEducationTypes
} from "@/lib/api";

type Tab = "info" | "units" | "groups" | "members" | "agreements";

export default function OrganisationDetail() {
  const params = useParams();
  const router = useRouter();
  const [org, setOrg] = useState<Organisation | null>(null);
  const [units, setUnits] = useState<Unit[]>([]);
  const [groups, setGroups] = useState<Group[]>([]);
  const [agreements, setAgreements] = useState<Agreement[]>([]);
  const [memberships, setMemberships] = useState<Membership[]>([]);
  const [tab, setTab] = useState<Tab>("info");
  const [editing, setEditing] = useState(false);
  const [editName, setEditName] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [showNewUnit, setShowNewUnit] = useState(false);
  const [newUnitName, setNewUnitName] = useState("");
  const [showNewGroup, setShowNewGroup] = useState(false);
  const [newGroupName, setNewGroupName] = useState("");
  const [newGroupDesc, setNewGroupDesc] = useState("");
  const [unitTypes, setUnitTypes] = useState<UnitType[]>([]);
  const [newUnitTypeId, setNewUnitTypeId] = useState("");
  const [allRoles, setAllRoles] = useState<Role[]>([]);
  const [unitMemberships, setUnitMemberships] = useState<Record<string, Membership[]>>({});
  const [groupMemberships, setGroupMemberships] = useState<Record<string, Membership[]>>({});
  const [expandedUnit, setExpandedUnit] = useState<string | null>(null);
  const [expandedGroup, setExpandedGroup] = useState<string | null>(null);
  // Add member
  const [showAddMember, setShowAddMember] = useState(false);
  const [allUsers, setAllUsers] = useState<User[]>([]);
  const [newMemberUserId, setNewMemberUserId] = useState("");
  const [newMemberRoleId, setNewMemberRoleId] = useState("");
  // Add agreement
  const [showNewAgreement, setShowNewAgreement] = useState(false);
  const [newAgrName, setNewAgrName] = useState("");
  const [newAgrDesc, setNewAgrDesc] = useState("");
  const [newAgrTypeId, setNewAgrTypeId] = useState("");
  const [newAgrStart, setNewAgrStart] = useState(new Date().toISOString().split("T")[0]);
  const [newAgrEnd, setNewAgrEnd] = useState("");
  // Education types
  const [eduTypes, setEduTypes] = useState<EducationType[]>([]);
  const [newUnitEduTypeIds, setNewUnitEduTypeIds] = useState<string[]>([]);
  // Edit units/groups
  const [editingUnit, setEditingUnit] = useState<string | null>(null);
  const [editUnitName, setEditUnitName] = useState("");
  const [editingGroup, setEditingGroup] = useState<string | null>(null);
  const [editGroupName, setEditGroupName] = useState("");
  const [editGroupDesc, setEditGroupDesc] = useState("");
  // Add unit/group members
  const [showAddUnitMember, setShowAddUnitMember] = useState<string | null>(null);
  const [newUnitMemberUserId, setNewUnitMemberUserId] = useState("");
  const [showAddGroupMember, setShowAddGroupMember] = useState<string | null>(null);
  const [newGroupMemberUserId, setNewGroupMemberUserId] = useState("");

  const id = params.id as string;

  useEffect(() => {
    getOrganisation(id).then(setOrg).catch(() => setError("Kunde inte ladda organisationen"));
    getUnitTypes().then(setUnitTypes).catch(() => {});
    getRoles().then(setAllRoles).catch(() => {});
    getUsers(1, 500).then(r => setAllUsers(r.items)).catch(() => {});
    getEducationTypes().then(setEduTypes).catch(() => {});
  }, [id]);

  useEffect(() => {
    if (!org) return;
    if (tab === "units") getUnitsByOrganisation(id).then(setUnits).catch(() => {});
    if (tab === "groups") getGroupsByOrganisation(id).then(setGroups).catch(() => {});
    if (tab === "agreements") getAgreementsByOrganisation(id).then(setAgreements).catch(() => {});
    if (tab === "members") getMembershipsByOrganisation(id).then(setMemberships).catch(() => {});
  }, [tab, org, id]);

  const handleSave = async () => {
    if (!org) return;
    const updated = await updateOrganisation(org.id, { name: editName });
    setOrg(updated);
    setEditing(false);
  };

  const handleDelete = async () => {
    if (!org || !confirm(`Vill du ta bort "${org.name}"?`)) return;
    await deleteOrganisation(org.id);
    router.push("/");
  };

  const handleActivate = async () => {
    if (!org) return;
    const updated = await updateOrganisation(org.id, { status: 2 });
    setOrg(updated);
  };

  const handleCreateUnit = async () => {
    if (!newUnitName.trim()) return;
    const typeId = newUnitTypeId || unitTypes[0]?.id || "c1000000-0000-0000-0000-000000000001";
    const unit = await createUnit({ name: newUnitName, sourceType: 2, unitTypeId: typeId, organisationId: id });
    if (newUnitEduTypeIds.length > 0) {
      await updateUnit(unit.id, { educationTypeIds: newUnitEduTypeIds });
    }
    setNewUnitName(""); setNewUnitTypeId(""); setNewUnitEduTypeIds([]); setShowNewUnit(false);
    getUnitsByOrganisation(id).then(setUnits);
  };

  const toggleUnitMembers = async (unitId: string) => {
    if (expandedUnit === unitId) { setExpandedUnit(null); return; }
    setExpandedUnit(unitId);
    if (!unitMemberships[unitId]) {
      const members = await getMembershipsByUnit(unitId);
      setUnitMemberships(prev => ({ ...prev, [unitId]: members }));
    }
  };

  const toggleGroupMembers = async (groupId: string) => {
    if (expandedGroup === groupId) { setExpandedGroup(null); return; }
    setExpandedGroup(groupId);
    if (!groupMemberships[groupId]) {
      const members = await getMembershipsByGroup(groupId);
      setGroupMemberships(prev => ({ ...prev, [groupId]: members }));
    }
  };

  const handleDeleteUnit = async (unitId: string, name: string) => {
    if (!confirm(`Ta bort enhet "${name}"?`)) return;
    await deleteUnit(unitId);
    getUnitsByOrganisation(id).then(setUnits);
  };

  const handleCreateGroup = async () => {
    if (!newGroupName.trim()) return;
    await createGroup({ name: newGroupName, description: newGroupDesc || undefined, organisationId: id });
    setNewGroupName(""); setNewGroupDesc(""); setShowNewGroup(false);
    getGroupsByOrganisation(id).then(setGroups);
  };

  const handleDeleteGroup = async (groupId: string, name: string) => {
    if (!confirm(`Ta bort grupp "${name}"?`)) return;
    await deleteGroup(groupId);
    getGroupsByOrganisation(id).then(setGroups);
  };

  const handleAddMember = async () => {
    if (!newMemberUserId) return;
    await addMember(id, { userId: newMemberUserId, roleId: newMemberRoleId || undefined });
    setNewMemberUserId(""); setNewMemberRoleId(""); setShowAddMember(false);
    getMembershipsByOrganisation(id).then(setMemberships);
  };

  const handleAddUnitMember = async (unitId: string) => {
    if (!newUnitMemberUserId) return;
    await addUnitMember(unitId, { userId: newUnitMemberUserId });
    setNewUnitMemberUserId(""); setShowAddUnitMember(null);
    const members = await getMembershipsByUnit(unitId);
    setUnitMemberships(prev => ({ ...prev, [unitId]: members }));
  };

  const handleAddGroupMember = async (groupId: string) => {
    if (!newGroupMemberUserId) return;
    await addGroupMember(groupId, { userId: newGroupMemberUserId });
    setNewGroupMemberUserId(""); setShowAddGroupMember(null);
    const members = await getMembershipsByGroup(groupId);
    setGroupMemberships(prev => ({ ...prev, [groupId]: members }));
  };

  const handleCreateAgreement = async () => {
    if (!newAgrName.trim() || !newAgrTypeId) return;
    await createAgreement({
      name: newAgrName, description: newAgrDesc, organisationId: id,
      agreementTypeId: newAgrTypeId,
      validity: { startDate: newAgrStart, endDate: newAgrEnd || undefined },
    });
    setNewAgrName(""); setNewAgrDesc(""); setNewAgrTypeId(""); setNewAgrEnd(""); setShowNewAgreement(false);
    getAgreementsByOrganisation(id).then(setAgreements);
  };

  const handleDeleteAgreement = async (agrId: string, name: string) => {
    if (!confirm(`Ta bort avtal "${name}"?`)) return;
    await deleteAgreement(agrId);
    getAgreementsByOrganisation(id).then(setAgreements);
  };

  const handleSaveUnit = async (unitId: string) => {
    await updateUnit(unitId, { name: editUnitName });
    setEditingUnit(null);
    getUnitsByOrganisation(id).then(setUnits);
  };

  const handleSaveGroup = async (groupId: string) => {
    await updateGroup(groupId, { name: editGroupName, description: editGroupDesc || undefined });
    setEditingGroup(null);
    getGroupsByOrganisation(id).then(setGroups);
  };

  const toggleEduType = (etId: string) => {
    setNewUnitEduTypeIds(prev => prev.includes(etId) ? prev.filter(x => x !== etId) : [...prev, etId]);
  };

  if (error) return (
    <div className="max-w-lg mx-auto mt-12">
      <div className="card p-8 text-center">
        <div className="w-12 h-12 mx-auto mb-4 rounded-full bg-spsm-burgundy-50 flex items-center justify-center">
          <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="text-spsm-burgundy-800"><circle cx="12" cy="12" r="10"/><path d="M12 8v4"/><path d="M12 16h.01"/></svg>
        </div>
        <p className="text-gray-600 font-medium">{error}</p>
        <a href="/" className="btn-secondary btn-sm mt-4 inline-flex">Tillbaka</a>
      </div>
    </div>
  );

  if (!org) return (
    <div className="card max-w-lg mx-auto mt-12 p-12 text-center">
      <div className="inline-block w-8 h-8 border-3 border-gray-200 border-t-spsm-burgundy-800 rounded-full animate-spin" style={{borderWidth: 3}} />
      <p className="text-sm text-gray-500 mt-3">Laddar organisation...</p>
    </div>
  );

  const tabs: { key: Tab; label: string; count?: number }[] = [
    { key: "info", label: "Information" },
    { key: "units", label: "Enheter", count: units.length || undefined },
    { key: "groups", label: "Grupper", count: groups.length || undefined },
    { key: "members", label: "Medlemmar", count: memberships.length || undefined },
    { key: "agreements", label: "Avtal", count: agreements.length || undefined },
  ];

  return (
    <div className="max-w-4xl mx-auto animate-slide-up">
      {/* Breadcrumb */}
      <div className="flex items-center gap-2 text-sm text-gray-400 mb-6">
        <a href="/" className="hover:text-spsm-burgundy-800 transition-colors">Organisationer</a>
        <svg width="12" height="12" viewBox="0 0 12 12" fill="currentColor" className="text-gray-300"><path d="M4.5 2l4 4-4 4"/></svg>
        <span className="text-gray-700 font-medium">{org.name}</span>
      </div>

      {/* Header card */}
      <div className="card p-6 mb-6">
        <div className="flex items-start justify-between">
          <div className="flex-1">
            {editing ? (
              <div className="flex gap-2 items-center mb-1">
                <input value={editName} onChange={(e) => setEditName(e.target.value)} className="input text-xl font-bold py-1 max-w-md" autoFocus />
                <button onClick={handleSave} className="btn-primary btn-sm">Spara</button>
                <button onClick={() => setEditing(false)} className="btn-ghost btn-sm">Avbryt</button>
              </div>
            ) : (
              <div className="flex items-center gap-3 mb-1">
                <h2 className="text-2xl font-bold text-gray-900">{org.name}</h2>
                <button onClick={() => { setEditing(true); setEditName(org.name); }} className="text-gray-300 hover:text-spsm-burgundy-800 transition-colors" title="Redigera namn">
                  <svg width="16" height="16" viewBox="0 0 16 16" fill="currentColor"><path d="M11.013 1.427a1.75 1.75 0 0 1 2.474 0l1.086 1.086a1.75 1.75 0 0 1 0 2.474l-8.61 8.61c-.21.21-.47.364-.756.445l-3.251.93a.75.75 0 0 1-.927-.928l.929-3.25c.081-.286.235-.547.445-.758l8.61-8.61Zm1.414 1.06a.25.25 0 0 0-.354 0L3.46 11.1a.25.25 0 0 0-.057.1l-.555 1.943 1.943-.555a.25.25 0 0 0 .1-.057l8.614-8.613a.25.25 0 0 0 0-.354l-1.078-1.078Z"/></svg>
                </button>
              </div>
            )}
            <p className="text-gray-500 font-mono text-sm">{org.orgNumber || "Inget organisationsnummer"}</p>
          </div>

          <div className="flex items-center gap-2 shrink-0">
            <span className={`badge text-sm px-3 py-1 ${getStatusColor(org.status)}`}>
              {getStatusLabel(org.status)}
            </span>
            {org.status !== 2 && (
              <button onClick={handleActivate} className="btn-success btn-sm">Aktivera</button>
            )}
            <button onClick={handleDelete} className="btn-ghost btn-sm text-gray-400 hover:text-red-600" title="Ta bort">
              <svg width="16" height="16" viewBox="0 0 16 16" fill="currentColor"><path fillRule="evenodd" d="M5 3.25V4H2.75a.75.75 0 0 0 0 1.5h.3l.815 8.15A1.5 1.5 0 0 0 5.357 15h5.285a1.5 1.5 0 0 0 1.493-1.35l.815-8.15h.3a.75.75 0 0 0 0-1.5H11v-.75A2.25 2.25 0 0 0 8.75 1h-1.5A2.25 2.25 0 0 0 5 3.25Zm2.25-.75a.75.75 0 0 0-.75.75V4h3v-.75a.75.75 0 0 0-.75-.75h-1.5Z"/></svg>
            </button>
          </div>
        </div>
      </div>

      {/* Tabs */}
      <div className="border-b border-gray-200 mb-6">
        <nav className="flex gap-0 -mb-px">
          {tabs.map((t) => (
            <button
              key={t.key}
              onClick={() => setTab(t.key)}
              className={`px-5 py-3.5 text-sm font-semibold border-b-[3px] transition-colors ${
                tab === t.key
                  ? "border-spsm-burgundy-800 text-spsm-burgundy-800"
                  : "border-transparent text-gray-400 hover:text-gray-700 hover:border-gray-300"
              }`}
            >
              {t.label}
              {t.count !== undefined && t.count > 0 && (
                <span className="ml-2 text-[10px] bg-gray-100 text-gray-500 rounded-full px-1.5 py-0.5">{t.count}</span>
              )}
            </button>
          ))}
        </nav>
      </div>

      {/* Tab Content */}
      <div className="animate-fade-in">
        {/* === INFO === */}
        {tab === "info" && (
          <div className="grid grid-cols-2 gap-6">
            <div className="card p-5">
              <p className="section-title">Grunduppgifter</p>
              <dl className="space-y-3 text-sm">
                <div className="flex justify-between"><dt className="text-gray-400">Typ</dt><dd className="font-medium text-gray-900">{org.organisationType?.name || "-"}</dd></div>
                <div className="flex justify-between"><dt className="text-gray-400">Källa</dt><dd className="font-medium text-gray-900">{getSourceLabel(org.sourceType)}</dd></div>
                <div className="flex justify-between"><dt className="text-gray-400">Skapad</dt><dd className="text-gray-600">{new Date(org.createdAt).toLocaleDateString("sv-SE")}</dd></div>
                <div className="flex justify-between"><dt className="text-gray-400">Uppdaterad</dt><dd className="text-gray-600">{new Date(org.updatedAt).toLocaleDateString("sv-SE")}</dd></div>
              </dl>
            </div>

            <div className="card p-5">
              <p className="section-title">Adresser</p>
              {org.addresses.length > 0 ? org.addresses.map((a) => (
                <div key={a.id} className="text-sm mb-3 last:mb-0">
                  <span className="badge bg-stone-100 text-stone-600 mb-1">{a.addressType}</span>
                  <p className="text-gray-900 font-medium">{a.street}</p>
                  <p className="text-gray-600">{a.postalCode} {a.city}</p>
                  {a.country && <p className="text-gray-400">{a.country}</p>}
                </div>
              )) : <p className="text-sm text-gray-300">Inga adresser</p>}
            </div>

            <div className="card p-5 col-span-2">
              <p className="section-title">Kontaktuppgifter</p>
              {org.contacts.length > 0 ? (
                <div className="flex gap-8">
                  {org.contacts.map((c) => (
                    <div key={c.id} className="text-sm">
                      <span className="badge bg-stone-100 text-stone-600 mb-1">{c.contactType}</span>
                      <p className="text-gray-900 font-medium">{c.value}</p>
                    </div>
                  ))}
                </div>
              ) : <p className="text-sm text-gray-300">Inga kontaktuppgifter</p>}
            </div>
          </div>
        )}

        {/* === UNITS === */}
        {tab === "units" && (
          <div>
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-bold text-gray-900">Enheter</h3>
              <button onClick={() => setShowNewUnit(!showNewUnit)} className={showNewUnit ? "btn-ghost btn-sm" : "btn-cta btn-sm"}>
                {showNewUnit ? "Avbryt" : "Lägg till enhet"}
              </button>
            </div>
            {showNewUnit && (
              <div className="card p-5 mb-4 bg-stone-50/50 animate-slide-up space-y-3">
                <div className="flex gap-3 items-end">
                  <div className="flex-1">
                    <label className="label">Enhetsnamn</label>
                    <input value={newUnitName} onChange={(e) => setNewUnitName(e.target.value)} className="input" placeholder="t.ex. Södra Latins gymnasium" autoFocus />
                  </div>
                  <div className="w-48">
                    <label className="label">Enhetstyp</label>
                    <select value={newUnitTypeId} onChange={(e) => setNewUnitTypeId(e.target.value)} className="input">
                      <option value="">Välj typ...</option>
                      {unitTypes.map(t => <option key={t.id} value={t.id}>{t.name}</option>)}
                    </select>
                  </div>
                </div>
                {eduTypes.length > 0 && (
                  <div>
                    <label className="label">Utbildningsformer</label>
                    <div className="flex flex-wrap gap-2">
                      {eduTypes.map(et => (
                        <button key={et.id} type="button" onClick={() => toggleEduType(et.id)}
                          className={`badge cursor-pointer transition-colors ${newUnitEduTypeIds.includes(et.id) ? "bg-spsm-burgundy-800 text-white" : "bg-gray-100 text-gray-600 hover:bg-gray-200"}`}>
                          {et.name} {et.code && <span className="opacity-60 ml-0.5">({et.code})</span>}
                        </button>
                      ))}
                    </div>
                  </div>
                )}
                <button onClick={handleCreateUnit} disabled={!newUnitName.trim()} className="btn-primary">Skapa enhet</button>
              </div>
            )}
            {units.length > 0 ? (
              <div className="card overflow-hidden">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="bg-stone-50 border-b">
                      <th className="text-left px-5 py-3 font-semibold text-gray-500 text-xs uppercase tracking-wider">Namn</th>
                      <th className="text-left px-5 py-3 font-semibold text-gray-500 text-xs uppercase tracking-wider">Typ</th>
                      <th className="text-left px-5 py-3 font-semibold text-gray-500 text-xs uppercase tracking-wider">Status</th>
                      <th className="w-10 px-5 py-3"></th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-100">
                    {units.map((u) => (
                      <React.Fragment key={u.id}>
                        <tr className="hover:bg-stone-50/50 transition-colors cursor-pointer" onClick={() => toggleUnitMembers(u.id)}>
                          <td className="px-5 py-3">
                            {editingUnit === u.id ? (
                              <div className="flex gap-2 items-center" onClick={e => e.stopPropagation()}>
                                <input value={editUnitName} onChange={e => setEditUnitName(e.target.value)} className="input py-1 text-sm" autoFocus />
                                <button onClick={() => handleSaveUnit(u.id)} className="btn-primary btn-sm">Spara</button>
                                <button onClick={() => setEditingUnit(null)} className="btn-ghost btn-sm">Avbryt</button>
                              </div>
                            ) : (
                              <div>
                                <span className="inline-flex items-center gap-2 font-semibold text-gray-900">
                                  <svg width="12" height="12" viewBox="0 0 12 12" fill="currentColor" className={`text-gray-400 transition-transform ${expandedUnit === u.id ? "rotate-90" : ""}`}><path d="M4.5 2l4 4-4 4"/></svg>
                                  {u.name}
                                </span>
                                {u.educationTypes && u.educationTypes.length > 0 && (
                                  <div className="flex gap-1 mt-1 ml-5">
                                    {u.educationTypes.map(et => <span key={et.id} className="badge bg-spsm-orange-50 text-spsm-orange-700 text-[10px]">{et.name}</span>)}
                                  </div>
                                )}
                              </div>
                            )}
                          </td>
                          <td className="px-5 py-3 text-gray-600">{u.unitType?.name || "-"}</td>
                          <td className="px-5 py-3"><span className={`badge ${getStatusColor(u.status)}`}>{getStatusLabel(u.status)}</span></td>
                          <td className="px-5 py-3 text-right" onClick={(e) => e.stopPropagation()}>
                            <div className="flex gap-2 justify-end">
                              <button onClick={() => { setEditingUnit(u.id); setEditUnitName(u.name); }} className="text-gray-300 hover:text-spsm-burgundy-800 transition-colors" title="Redigera">
                                <svg width="14" height="14" viewBox="0 0 16 16" fill="currentColor"><path d="M11.013 1.427a1.75 1.75 0 0 1 2.474 0l1.086 1.086a1.75 1.75 0 0 1 0 2.474l-8.61 8.61c-.21.21-.47.364-.756.445l-3.251.93a.75.75 0 0 1-.927-.928l.929-3.25c.081-.286.235-.547.445-.758l8.61-8.61Z"/></svg>
                              </button>
                              <button onClick={() => handleDeleteUnit(u.id, u.name)} className="text-gray-300 hover:text-red-500 transition-colors" title="Ta bort">
                                <svg width="14" height="14" viewBox="0 0 16 16" fill="currentColor"><path fillRule="evenodd" d="M5 3.25V4H2.75a.75.75 0 0 0 0 1.5h.3l.815 8.15A1.5 1.5 0 0 0 5.357 15h5.285a1.5 1.5 0 0 0 1.493-1.35l.815-8.15h.3a.75.75 0 0 0 0-1.5H11v-.75A2.25 2.25 0 0 0 8.75 1h-1.5A2.25 2.25 0 0 0 5 3.25Zm2.25-.75a.75.75 0 0 0-.75.75V4h3v-.75a.75.75 0 0 0-.75-.75h-1.5Z"/></svg>
                              </button>
                            </div>
                          </td>
                        </tr>
                        {expandedUnit === u.id && (
                          <tr>
                            <td colSpan={4} className="px-5 py-3 bg-stone-50/50">
                              <div className="flex items-center justify-between mb-2">
                                <p className="text-xs font-semibold uppercase tracking-wider text-gray-400">Medlemmar i {u.name}</p>
                                <button onClick={(e) => { e.stopPropagation(); setShowAddUnitMember(showAddUnitMember === u.id ? null : u.id); setNewUnitMemberUserId(""); }} className="text-xs text-spsm-burgundy-800 hover:underline font-medium">+ Lägg till</button>
                              </div>
                              {showAddUnitMember === u.id && (
                                <div className="flex gap-2 mb-3 items-end" onClick={e => e.stopPropagation()}>
                                  <select value={newUnitMemberUserId} onChange={e => setNewUnitMemberUserId(e.target.value)} className="input py-1 text-sm flex-1">
                                    <option value="">Välj användare...</option>
                                    {allUsers.map(usr => <option key={usr.id} value={usr.id}>{usr.firstName} {usr.lastName}</option>)}
                                  </select>
                                  <button onClick={() => handleAddUnitMember(u.id)} disabled={!newUnitMemberUserId} className="btn-primary btn-sm">Lägg till</button>
                                </div>
                              )}
                              {(unitMemberships[u.id] ?? []).length > 0 ? (
                                <div className="space-y-1">
                                  {unitMemberships[u.id].map(m => (
                                    <div key={m.id} className="flex items-center gap-3 text-sm py-1">
                                      <span className="font-medium text-gray-900">{m.userName}</span>
                                      {m.roleName && <span className="badge bg-spsm-green-50 text-spsm-green-700 text-xs">{m.roleName}</span>}
                                      <span className="text-gray-400 text-xs ml-auto">{new Date(m.startDate).toLocaleDateString("sv-SE")}</span>
                                    </div>
                                  ))}
                                </div>
                              ) : <p className="text-sm text-gray-300">Inga medlemmar</p>}
                            </td>
                          </tr>
                        )}
                      </React.Fragment>
                    ))}
                  </tbody>
                </table>
              </div>
            ) : <div className="card p-8 text-center text-gray-300 font-medium">Inga enheter registrerade</div>}
          </div>
        )}

        {/* === GROUPS === */}
        {tab === "groups" && (
          <div>
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-bold text-gray-900">Grupper</h3>
              <button onClick={() => setShowNewGroup(!showNewGroup)} className={showNewGroup ? "btn-ghost btn-sm" : "btn-cta btn-sm"}>
                {showNewGroup ? "Avbryt" : "Lägg till grupp"}
              </button>
            </div>
            {showNewGroup && (
              <div className="card p-5 mb-4 bg-stone-50/50 animate-slide-up space-y-4">
                <div>
                  <label className="label">Gruppnamn</label>
                  <input value={newGroupName} onChange={(e) => setNewGroupName(e.target.value)} className="input" placeholder="t.ex. Arbetslag 1" autoFocus />
                </div>
                <div>
                  <label className="label">Beskrivning</label>
                  <input value={newGroupDesc} onChange={(e) => setNewGroupDesc(e.target.value)} className="input" placeholder="Valfri beskrivning" />
                </div>
                <button onClick={handleCreateGroup} disabled={!newGroupName.trim()} className="btn-primary">Skapa</button>
              </div>
            )}
            {groups.length > 0 ? (
              <div className="grid gap-3">
                {groups.map((g) => (
                  <div key={g.id} className="card-hover p-5">
                    <div className="flex items-center justify-between">
                      <div className="flex-1 cursor-pointer" onClick={() => toggleGroupMembers(g.id)}>
                        {editingGroup === g.id ? (
                          <div className="flex gap-2 items-center" onClick={e => e.stopPropagation()}>
                            <input value={editGroupName} onChange={e => setEditGroupName(e.target.value)} className="input py-1 text-sm" autoFocus />
                            <input value={editGroupDesc} onChange={e => setEditGroupDesc(e.target.value)} className="input py-1 text-sm" placeholder="Beskrivning" />
                            <button onClick={() => handleSaveGroup(g.id)} className="btn-primary btn-sm">Spara</button>
                            <button onClick={() => setEditingGroup(null)} className="btn-ghost btn-sm">Avbryt</button>
                          </div>
                        ) : (
                          <>
                            <div className="flex items-center gap-2">
                              <svg width="12" height="12" viewBox="0 0 12 12" fill="currentColor" className={`text-gray-400 transition-transform ${expandedGroup === g.id ? "rotate-90" : ""}`}><path d="M4.5 2l4 4-4 4"/></svg>
                              <h4 className="font-semibold text-gray-900">{g.name}</h4>
                            </div>
                            {g.description && <p className="text-sm text-gray-500 mt-0.5 ml-5">{g.description}</p>}
                            {g.roles.length > 0 && (
                              <div className="flex gap-1.5 mt-2 ml-5">
                                {g.roles.map(r => <span key={r.id} className="badge bg-spsm-green-50 text-spsm-green-700">{r.name}</span>)}
                              </div>
                            )}
                          </>
                        )}
                      </div>
                      <div className="flex gap-2 shrink-0">
                        <button onClick={() => { setEditingGroup(g.id); setEditGroupName(g.name); setEditGroupDesc(g.description || ""); }} className="text-gray-300 hover:text-spsm-burgundy-800 transition-colors" title="Redigera">
                          <svg width="14" height="14" viewBox="0 0 16 16" fill="currentColor"><path d="M11.013 1.427a1.75 1.75 0 0 1 2.474 0l1.086 1.086a1.75 1.75 0 0 1 0 2.474l-8.61 8.61c-.21.21-.47.364-.756.445l-3.251.93a.75.75 0 0 1-.927-.928l.929-3.25c.081-.286.235-.547.445-.758l8.61-8.61Z"/></svg>
                        </button>
                        <button onClick={() => handleDeleteGroup(g.id, g.name)} className="text-gray-300 hover:text-red-500 transition-colors" title="Ta bort">
                          <svg width="14" height="14" viewBox="0 0 16 16" fill="currentColor"><path fillRule="evenodd" d="M5 3.25V4H2.75a.75.75 0 0 0 0 1.5h.3l.815 8.15A1.5 1.5 0 0 0 5.357 15h5.285a1.5 1.5 0 0 0 1.493-1.35l.815-8.15h.3a.75.75 0 0 0 0-1.5H11v-.75A2.25 2.25 0 0 0 8.75 1h-1.5A2.25 2.25 0 0 0 5 3.25Zm2.25-.75a.75.75 0 0 0-.75.75V4h3v-.75a.75.75 0 0 0-.75-.75h-1.5Z"/></svg>
                        </button>
                      </div>
                    </div>
                    {expandedGroup === g.id && (
                      <div className="mt-3 pt-3 border-t border-gray-100 ml-5">
                        <div className="flex items-center justify-between mb-2">
                          <p className="text-xs font-semibold uppercase tracking-wider text-gray-400">Medlemmar</p>
                          <button onClick={() => { setShowAddGroupMember(showAddGroupMember === g.id ? null : g.id); setNewGroupMemberUserId(""); }} className="text-xs text-spsm-burgundy-800 hover:underline font-medium">+ Lägg till</button>
                        </div>
                        {showAddGroupMember === g.id && (
                          <div className="flex gap-2 mb-3 items-end">
                            <select value={newGroupMemberUserId} onChange={e => setNewGroupMemberUserId(e.target.value)} className="input py-1 text-sm flex-1">
                              <option value="">Välj användare...</option>
                              {allUsers.map(usr => <option key={usr.id} value={usr.id}>{usr.firstName} {usr.lastName}</option>)}
                            </select>
                            <button onClick={() => handleAddGroupMember(g.id)} disabled={!newGroupMemberUserId} className="btn-primary btn-sm">Lägg till</button>
                          </div>
                        )}
                        {(groupMemberships[g.id] ?? []).length > 0 ? (
                          <div className="space-y-1">
                            {groupMemberships[g.id].map(m => (
                              <div key={m.id} className="flex items-center gap-3 text-sm py-1">
                                <span className="font-medium text-gray-900">{m.userName}</span>
                                <span className="text-gray-400 text-xs ml-auto">{new Date(m.startDate).toLocaleDateString("sv-SE")}</span>
                              </div>
                            ))}
                          </div>
                        ) : <p className="text-sm text-gray-300">Inga medlemmar</p>}
                      </div>
                    )}
                  </div>
                ))}
              </div>
            ) : <div className="card p-8 text-center text-gray-300 font-medium">Inga grupper registrerade</div>}
          </div>
        )}

        {/* === MEMBERS === */}
        {tab === "members" && (
          <div>
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-bold text-gray-900">Medlemmar</h3>
              <button onClick={() => setShowAddMember(!showAddMember)} className={showAddMember ? "btn-ghost btn-sm" : "btn-cta btn-sm"}>
                {showAddMember ? "Avbryt" : "Lägg till medlem"}
              </button>
            </div>
            {showAddMember && (
              <div className="card p-5 mb-4 bg-stone-50/50 animate-slide-up">
                <div className="flex gap-3 items-end">
                  <div className="flex-1">
                    <label className="label">Användare</label>
                    <select value={newMemberUserId} onChange={e => setNewMemberUserId(e.target.value)} className="input">
                      <option value="">Välj användare...</option>
                      {allUsers.map(u => <option key={u.id} value={u.id}>{u.firstName} {u.lastName}</option>)}
                    </select>
                  </div>
                  <div className="w-48">
                    <label className="label">Roll (valfri)</label>
                    <select value={newMemberRoleId} onChange={e => setNewMemberRoleId(e.target.value)} className="input">
                      <option value="">Ingen roll</option>
                      {allRoles.map(r => <option key={r.id} value={r.id}>{r.name}</option>)}
                    </select>
                  </div>
                  <button onClick={handleAddMember} disabled={!newMemberUserId} className="btn-primary">Lägg till</button>
                </div>
              </div>
            )}
            {memberships.length > 0 ? (
              <div className="card overflow-hidden">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="bg-stone-50 border-b">
                      <th className="text-left px-5 py-3 font-semibold text-gray-500 text-xs uppercase tracking-wider">Namn</th>
                      <th className="text-left px-5 py-3 font-semibold text-gray-500 text-xs uppercase tracking-wider">Roll</th>
                      <th className="text-left px-5 py-3 font-semibold text-gray-500 text-xs uppercase tracking-wider">Fr.o.m.</th>
                      <th className="text-left px-5 py-3 font-semibold text-gray-500 text-xs uppercase tracking-wider">T.o.m.</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-100">
                    {memberships.map((m) => (
                      <tr key={m.id} className="hover:bg-stone-50/50 transition-colors">
                        <td className="px-5 py-3 font-semibold text-gray-900">{m.userName}</td>
                        <td className="px-5 py-3">{m.roleName ? <span className="badge bg-spsm-green-50 text-spsm-green-700">{m.roleName}</span> : <span className="text-gray-300">-</span>}</td>
                        <td className="px-5 py-3 text-gray-600">{new Date(m.startDate).toLocaleDateString("sv-SE")}</td>
                        <td className="px-5 py-3 text-gray-600">{m.endDate ? new Date(m.endDate).toLocaleDateString("sv-SE") : <span className="text-gray-300">-</span>}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            ) : <div className="card p-8 text-center text-gray-300 font-medium">Inga medlemmar kopplade till denna organisation</div>}
          </div>
        )}

        {/* === AGREEMENTS === */}
        {tab === "agreements" && (
          <div>
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-bold text-gray-900">Avtal</h3>
              <button onClick={() => setShowNewAgreement(!showNewAgreement)} className={showNewAgreement ? "btn-ghost btn-sm" : "btn-cta btn-sm"}>
                {showNewAgreement ? "Avbryt" : "Skapa avtal"}
              </button>
            </div>
            {showNewAgreement && (
              <div className="card p-5 mb-4 bg-stone-50/50 animate-slide-up space-y-3">
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="label">Avtalsnamn *</label>
                    <input value={newAgrName} onChange={e => setNewAgrName(e.target.value)} className="input" placeholder="t.ex. PUB-avtal 2026" autoFocus />
                  </div>
                  <div>
                    <label className="label">Avtalstyp *</label>
                    <select value={newAgrTypeId} onChange={e => setNewAgrTypeId(e.target.value)} className="input">
                      <option value="">Välj typ...</option>
                      <option value="a1b2c3d4-e5f6-7890-abcd-ef1234567890">PUB-avtal</option>
                      <option value="b2c3d4e5-f6a7-8901-bcde-f12345678901">Samarbetsavtal</option>
                    </select>
                  </div>
                </div>
                <div>
                  <label className="label">Beskrivning</label>
                  <input value={newAgrDesc} onChange={e => setNewAgrDesc(e.target.value)} className="input" placeholder="Beskrivning av avtalet" />
                </div>
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="label">Startdatum *</label>
                    <input type="date" value={newAgrStart} onChange={e => setNewAgrStart(e.target.value)} className="input" />
                  </div>
                  <div>
                    <label className="label">Slutdatum</label>
                    <input type="date" value={newAgrEnd} onChange={e => setNewAgrEnd(e.target.value)} className="input" />
                  </div>
                </div>
                <button onClick={handleCreateAgreement} disabled={!newAgrName.trim() || !newAgrTypeId} className="btn-primary">Skapa avtal</button>
              </div>
            )}
            {agreements.length > 0 ? (
              <div className="grid gap-3">
                {agreements.map((a) => (
                  <div key={a.id} className="card-hover p-5">
                    <div className="flex items-start justify-between mb-3">
                      <div>
                        <h4 className="font-bold text-gray-900">{a.name}</h4>
                        <p className="text-sm text-gray-500 mt-1">{a.description}</p>
                      </div>
                      <div className="flex items-center gap-2 shrink-0">
                        <span className="badge bg-spsm-orange-50 text-spsm-orange-700">{a.agreementType?.name}</span>
                        <button onClick={() => handleDeleteAgreement(a.id, a.name)} className="text-gray-300 hover:text-red-500 transition-colors" title="Ta bort">
                          <svg width="14" height="14" viewBox="0 0 16 16" fill="currentColor"><path fillRule="evenodd" d="M5 3.25V4H2.75a.75.75 0 0 0 0 1.5h.3l.815 8.15A1.5 1.5 0 0 0 5.357 15h5.285a1.5 1.5 0 0 0 1.493-1.35l.815-8.15h.3a.75.75 0 0 0 0-1.5H11v-.75A2.25 2.25 0 0 0 8.75 1h-1.5A2.25 2.25 0 0 0 5 3.25Zm2.25-.75a.75.75 0 0 0-.75.75V4h3v-.75a.75.75 0 0 0-.75-.75h-1.5Z"/></svg>
                        </button>
                      </div>
                    </div>
                    <div className="flex items-center gap-4 text-xs text-gray-400 pt-3 border-t border-gray-100">
                      <span className="flex items-center gap-1">
                        <svg width="12" height="12" viewBox="0 0 16 16" fill="currentColor"><path d="M4.75 0a.75.75 0 0 1 .75.75V2h5V.75a.75.75 0 0 1 1.5 0V2h1.25c.966 0 1.75.784 1.75 1.75v10.5A1.75 1.75 0 0 1 13.25 16H2.75A1.75 1.75 0 0 1 1 14.25V3.75C1 2.784 1.784 2 2.75 2H4V.75A.75.75 0 0 1 4.75 0Z"/></svg>
                        Fr.o.m. {new Date(a.validity.startDate).toLocaleDateString("sv-SE")}
                      </span>
                      {a.validity.endDate && <span>T.o.m. {new Date(a.validity.endDate).toLocaleDateString("sv-SE")}</span>}
                      {a.validity.renewalLogic && <span className="text-spsm-green-600">Förnyelse: {a.validity.renewalLogic}</span>}
                    </div>
                  </div>
                ))}
              </div>
            ) : <div className="card p-8 text-center text-gray-300 font-medium">Inga avtal kopplade till denna organisation</div>}
          </div>
        )}
      </div>
    </div>
  );
}
