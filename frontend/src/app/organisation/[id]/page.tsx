"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { Organisation, getOrganisation, updateOrganisation, deleteOrganisation, getStatusLabel, getStatusColor, getSourceLabel } from "@/lib/api";

export default function OrganisationDetail() {
  const params = useParams();
  const router = useRouter();
  const [org, setOrg] = useState<Organisation | null>(null);
  const [editing, setEditing] = useState(false);
  const [editName, setEditName] = useState("");
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const id = params.id as string;
    getOrganisation(id).then(setOrg).catch(() => setError("Kunde inte ladda organisationen"));
  }, [params.id]);

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

  if (error) return <div className="bg-red-50 border border-red-200 text-red-700 p-4 rounded-lg text-sm">{error}</div>;
  if (!org) return <div className="text-center py-12 text-gray-500">Laddar...</div>;

  return (
    <div className="max-w-3xl mx-auto">
      <div className="flex items-center gap-2 text-sm text-gray-500 mb-4">
        <a href="/" className="hover:text-blue-600">Organisationer</a>
        <span>/</span>
        <span className="text-gray-900">{org.name}</span>
      </div>

      <div className="bg-white rounded-lg border border-gray-200 p-6">
        <div className="flex items-start justify-between mb-6">
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
          <span className={`px-3 py-1 rounded-full text-sm font-medium ${getStatusColor(org.status)}`}>
            {getStatusLabel(org.status)}
          </span>
        </div>

        <div className="grid grid-cols-2 gap-6 mb-6">
          <div>
            <h3 className="font-semibold text-gray-900 mb-3 text-sm uppercase tracking-wide">Information</h3>
            <dl className="space-y-2 text-sm">
              <div className="flex justify-between"><dt className="text-gray-500">Typ</dt><dd>{org.organisationType?.name || "-"}</dd></div>
              <div className="flex justify-between"><dt className="text-gray-500">Kalla</dt><dd>{getSourceLabel(org.sourceType)}</dd></div>
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
        </div>

        <div className="mb-6">
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

        <div className="flex gap-3 pt-4 border-t">
          {org.status !== 2 && (
            <button onClick={handleActivate} className="bg-green-600 text-white px-4 py-2 rounded-lg text-sm hover:bg-green-700">Aktivera</button>
          )}
          <button onClick={handleDelete} className="bg-red-600 text-white px-4 py-2 rounded-lg text-sm hover:bg-red-700">Ta bort</button>
        </div>
      </div>
    </div>
  );
}
