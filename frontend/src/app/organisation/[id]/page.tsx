"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import {
  Organisation, Unit, Group, Agreement, Membership,
  getOrganisation, updateOrganisation, deleteOrganisation,
  getUnitsByOrganisation, getGroupsByOrganisation,
  getAgreementsByOrganisation, getMembershipsByOrganisation,
  createUnit, createGroup, deleteUnit, deleteGroup,
  getStatusLabel, getStatusColor, getSourceLabel
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

  // New unit form
  const [showNewUnit, setShowNewUnit] = useState(false);
  const [newUnitName, setNewUnitName] = useState("");

  // New group form
  const [showNewGroup, setShowNewGroup] = useState(false);
  const [newGroupName, setNewGroupName] = useState("");
  const [newGroupDesc, setNewGroupDesc] = useState("");

  const id = params.id as string;

  useEffect(() => {
    getOrganisation(id).then(setOrg).catch(() => setError("Kunde inte ladda organisationen"));
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
    await createUnit({ name: newUnitName, sourceType: 2, unitTypeId: "c1000000-0000-0000-0000-000000000001", organisationId: id });
    setNewUnitName("");
    setShowNewUnit(false);
    getUnitsByOrganisation(id).then(setUnits);
  };

  const handleDeleteUnit = async (unitId: string, name: string) => {
    if (!confirm(`Ta bort enhet "${name}"?`)) return;
    await deleteUnit(unitId);
    getUnitsByOrganisation(id).then(setUnits);
  };

  const handleCreateGroup = async () => {
    if (!newGroupName.trim()) return;
    await createGroup({ name: newGroupName, description: newGroupDesc || undefined, organisationId: id });
    setNewGroupName("");
    setNewGroupDesc("");
    setShowNewGroup(false);
    getGroupsByOrganisation(id).then(setGroups);
  };

  const handleDeleteGroup = async (groupId: string, name: string) => {
    if (!confirm(`Ta bort grupp "${name}"?`)) return;
    await deleteGroup(groupId);
    getGroupsByOrganisation(id).then(setGroups);
  };

  if (error) return <div className="bg-red-50 border border-red-200 text-red-700 p-4 rounded-lg text-sm">{error}</div>;
  if (!org) return <div className="text-center py-12 text-gray-500">Laddar...</div>;

  const tabs: { key: Tab; label: string }[] = [
    { key: "info", label: "Information" },
    { key: "units", label: "Enheter" },
    { key: "groups", label: "Grupper" },
    { key: "members", label: "Medlemmar" },
    { key: "agreements", label: "Avtal" },
  ];

  return (
    <div className="max-w-4xl mx-auto">
      {/* Breadcrumb */}
      <div className="flex items-center gap-2 text-sm text-gray-500 mb-4">
        <a href="/" className="hover:text-blue-600">Mina organisationer</a>
        <span>/</span>
        <span className="text-gray-900">{org.name}</span>
      </div>

      {/* Header */}
      <div className="bg-white rounded-lg border border-gray-200 p-6 mb-4">
        <div className="flex items-start justify-between">
          <div>
            {editing ? (
              <div className="flex gap-2 items-center">
                <input value={editName} onChange={(e) => setEditName(e.target.value)} className="border rounded px-3 py-1 text-lg font-bold" />
                <button onClick={handleSave} className="text-sm bg-blue-600 text-white px-3 py-1 rounded">Spara</button>
                <button onClick={() => setEditing(false)} className="text-sm text-gray-500">Avbryt</button>
              </div>
            ) : (
              <h2 className="text-2xl font-bold text-gray-900 flex items-center gap-2">
                {org.name}
                <button onClick={() => { setEditing(true); setEditName(org.name); }} className="text-sm text-blue-600 font-normal hover:underline">Redigera</button>
              </h2>
            )}
            <p className="text-gray-500 mt-1">{org.orgNumber || "Inget organisationsnummer"}</p>
          </div>
          <div className="flex items-center gap-3">
            <span className={`px-3 py-1 rounded-full text-sm font-medium ${getStatusColor(org.status)}`}>
              {getStatusLabel(org.status)}
            </span>
            {org.status !== 2 && (
              <button onClick={handleActivate} className="bg-green-600 text-white px-3 py-1 rounded text-sm hover:bg-green-700">Aktivera</button>
            )}
            <button onClick={handleDelete} className="bg-red-600 text-white px-3 py-1 rounded text-sm hover:bg-red-700">Ta bort</button>
          </div>
        </div>
      </div>

      {/* Tabs */}
      <div className="border-b border-gray-200 mb-4">
        <nav className="flex gap-0 -mb-px">
          {tabs.map((t) => (
            <button
              key={t.key}
              onClick={() => setTab(t.key)}
              className={`px-4 py-3 text-sm font-medium border-b-2 ${
                tab === t.key
                  ? "border-blue-600 text-blue-600"
                  : "border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300"
              }`}
            >
              {t.label}
            </button>
          ))}
        </nav>
      </div>

      {/* Tab Content */}
      <div className="bg-white rounded-lg border border-gray-200 p-6">
        {tab === "info" && (
          <div className="grid grid-cols-2 gap-6">
            <div>
              <h3 className="font-semibold text-gray-900 mb-3 text-sm uppercase tracking-wide">Grunduppgifter</h3>
              <dl className="space-y-2 text-sm">
                <div className="flex justify-between"><dt className="text-gray-500">Typ</dt><dd>{org.organisationType?.name || "-"}</dd></div>
                <div className="flex justify-between"><dt className="text-gray-500">Källa</dt><dd>{getSourceLabel(org.sourceType)}</dd></div>
                <div className="flex justify-between"><dt className="text-gray-500">Skapad</dt><dd>{new Date(org.createdAt).toLocaleDateString("sv-SE")}</dd></div>
                <div className="flex justify-between"><dt className="text-gray-500">Uppdaterad</dt><dd>{new Date(org.updatedAt).toLocaleDateString("sv-SE")}</dd></div>
              </dl>
            </div>
            <div>
              <h3 className="font-semibold text-gray-900 mb-3 text-sm uppercase tracking-wide">Adresser</h3>
              {org.addresses.length > 0 ? org.addresses.map((a) => (
                <div key={a.id} className="text-sm mb-2">
                  <span className="text-gray-500 text-xs uppercase">{a.addressType}</span>
                  <p>{a.street}</p>
                  <p>{a.postalCode} {a.city}</p>
                  {a.country && <p className="text-gray-500">{a.country}</p>}
                </div>
              )) : <p className="text-sm text-gray-400">Inga adresser</p>}
            </div>
            <div className="col-span-2">
              <h3 className="font-semibold text-gray-900 mb-3 text-sm uppercase tracking-wide">Kontakt</h3>
              {org.contacts.length > 0 ? (
                <div className="flex gap-6">
                  {org.contacts.map((c) => (
                    <div key={c.id} className="text-sm">
                      <span className="text-gray-500 text-xs uppercase">{c.contactType}</span>
                      <p>{c.value}</p>
                    </div>
                  ))}
                </div>
              ) : <p className="text-sm text-gray-400">Inga kontaktuppgifter</p>}
            </div>
          </div>
        )}

        {tab === "units" && (
          <div>
            <div className="flex items-center justify-between mb-4">
              <h3 className="font-semibold text-gray-900">Enheter</h3>
              <button onClick={() => setShowNewUnit(!showNewUnit)} className="bg-blue-600 text-white px-3 py-1 rounded text-sm hover:bg-blue-700">
                {showNewUnit ? "Avbryt" : "Lägg till enhet"}
              </button>
            </div>
            {showNewUnit && (
              <div className="bg-gray-50 p-4 rounded-lg mb-4 flex gap-3 items-end">
                <div className="flex-1">
                  <label className="block text-sm font-medium text-gray-700 mb-1">Enhetsnamn</label>
                  <input value={newUnitName} onChange={(e) => setNewUnitName(e.target.value)} className="w-full border rounded px-3 py-2 text-sm" placeholder="t.ex. Södra Latins gymnasium" />
                </div>
                <button onClick={handleCreateUnit} className="bg-green-600 text-white px-4 py-2 rounded text-sm hover:bg-green-700">Skapa</button>
              </div>
            )}
            {units.length > 0 ? (
              <table className="w-full text-sm">
                <thead className="bg-gray-50 border-b">
                  <tr>
                    <th className="text-left px-4 py-2 font-medium text-gray-600">Namn</th>
                    <th className="text-left px-4 py-2 font-medium text-gray-600">Typ</th>
                    <th className="text-left px-4 py-2 font-medium text-gray-600">Status</th>
                    <th className="text-right px-4 py-2"></th>
                  </tr>
                </thead>
                <tbody className="divide-y">
                  {units.map((u) => (
                    <tr key={u.id} className="hover:bg-gray-50">
                      <td className="px-4 py-2 font-medium">{u.name}</td>
                      <td className="px-4 py-2 text-gray-600">{u.unitType?.name || "-"}</td>
                      <td className="px-4 py-2">
                        <span className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(u.status)}`}>{getStatusLabel(u.status)}</span>
                      </td>
                      <td className="px-4 py-2 text-right">
                        <button onClick={() => handleDeleteUnit(u.id, u.name)} className="text-red-500 hover:text-red-700 text-xs">Ta bort</button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            ) : <p className="text-sm text-gray-400">Inga enheter registrerade</p>}
          </div>
        )}

        {tab === "groups" && (
          <div>
            <div className="flex items-center justify-between mb-4">
              <h3 className="font-semibold text-gray-900">Grupper</h3>
              <button onClick={() => setShowNewGroup(!showNewGroup)} className="bg-blue-600 text-white px-3 py-1 rounded text-sm hover:bg-blue-700">
                {showNewGroup ? "Avbryt" : "Lägg till grupp"}
              </button>
            </div>
            {showNewGroup && (
              <div className="bg-gray-50 p-4 rounded-lg mb-4 space-y-3">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Gruppnamn</label>
                  <input value={newGroupName} onChange={(e) => setNewGroupName(e.target.value)} className="w-full border rounded px-3 py-2 text-sm" placeholder="t.ex. Arbetslag 1" />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Beskrivning</label>
                  <input value={newGroupDesc} onChange={(e) => setNewGroupDesc(e.target.value)} className="w-full border rounded px-3 py-2 text-sm" placeholder="Valfri beskrivning" />
                </div>
                <button onClick={handleCreateGroup} className="bg-green-600 text-white px-4 py-2 rounded text-sm hover:bg-green-700">Skapa</button>
              </div>
            )}
            {groups.length > 0 ? (
              <table className="w-full text-sm">
                <thead className="bg-gray-50 border-b">
                  <tr>
                    <th className="text-left px-4 py-2 font-medium text-gray-600">Namn</th>
                    <th className="text-left px-4 py-2 font-medium text-gray-600">Beskrivning</th>
                    <th className="text-left px-4 py-2 font-medium text-gray-600">Roller</th>
                    <th className="text-right px-4 py-2"></th>
                  </tr>
                </thead>
                <tbody className="divide-y">
                  {groups.map((g) => (
                    <tr key={g.id} className="hover:bg-gray-50">
                      <td className="px-4 py-2 font-medium">{g.name}</td>
                      <td className="px-4 py-2 text-gray-600">{g.description || "-"}</td>
                      <td className="px-4 py-2 text-gray-600">{g.roles.map(r => r.name).join(", ") || "-"}</td>
                      <td className="px-4 py-2 text-right">
                        <button onClick={() => handleDeleteGroup(g.id, g.name)} className="text-red-500 hover:text-red-700 text-xs">Ta bort</button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            ) : <p className="text-sm text-gray-400">Inga grupper registrerade</p>}
          </div>
        )}

        {tab === "members" && (
          <div>
            <h3 className="font-semibold text-gray-900 mb-4">Medlemmar</h3>
            {memberships.length > 0 ? (
              <table className="w-full text-sm">
                <thead className="bg-gray-50 border-b">
                  <tr>
                    <th className="text-left px-4 py-2 font-medium text-gray-600">Namn</th>
                    <th className="text-left px-4 py-2 font-medium text-gray-600">Roll</th>
                    <th className="text-left px-4 py-2 font-medium text-gray-600">Startdatum</th>
                    <th className="text-left px-4 py-2 font-medium text-gray-600">Slutdatum</th>
                  </tr>
                </thead>
                <tbody className="divide-y">
                  {memberships.map((m) => (
                    <tr key={m.id} className="hover:bg-gray-50">
                      <td className="px-4 py-2 font-medium">{m.userName}</td>
                      <td className="px-4 py-2 text-gray-600">{m.roleName || "-"}</td>
                      <td className="px-4 py-2 text-gray-600">{new Date(m.startDate).toLocaleDateString("sv-SE")}</td>
                      <td className="px-4 py-2 text-gray-600">{m.endDate ? new Date(m.endDate).toLocaleDateString("sv-SE") : "-"}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            ) : <p className="text-sm text-gray-400">Inga medlemmar kopplade till denna organisation</p>}
          </div>
        )}

        {tab === "agreements" && (
          <div>
            <h3 className="font-semibold text-gray-900 mb-4">Avtal</h3>
            {agreements.length > 0 ? (
              <div className="space-y-3">
                {agreements.map((a) => (
                  <div key={a.id} className="border rounded-lg p-4">
                    <div className="flex items-start justify-between">
                      <div>
                        <h4 className="font-medium">{a.name}</h4>
                        <p className="text-sm text-gray-500 mt-1">{a.description}</p>
                      </div>
                      <span className="px-2 py-1 bg-blue-100 text-blue-800 rounded-full text-xs font-medium">{a.agreementType?.name}</span>
                    </div>
                    <div className="mt-3 flex gap-6 text-sm text-gray-600">
                      <span>Giltig fr.o.m. {new Date(a.validity.startDate).toLocaleDateString("sv-SE")}</span>
                      {a.validity.endDate && <span>t.o.m. {new Date(a.validity.endDate).toLocaleDateString("sv-SE")}</span>}
                      {a.validity.renewalLogic && <span>Förnyelse: {a.validity.renewalLogic}</span>}
                    </div>
                  </div>
                ))}
              </div>
            ) : <p className="text-sm text-gray-400">Inga avtal kopplade till denna organisation</p>}
          </div>
        )}
      </div>
    </div>
  );
}
