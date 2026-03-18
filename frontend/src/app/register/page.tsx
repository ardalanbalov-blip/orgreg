"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { createOrganisation } from "@/lib/api";

const ORG_TYPES = [
  { id: "c1000000-0000-0000-0000-000000000001", name: "Kommun" },
  { id: "c1000000-0000-0000-0000-000000000002", name: "Fristaende huvudman" },
  { id: "c1000000-0000-0000-0000-000000000003", name: "Statlig" },
  { id: "c1000000-0000-0000-0000-000000000004", name: "Ovrig" },
];

export default function RegisterPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    const form = new FormData(e.currentTarget);
    try {
      await createOrganisation({
        name: form.get("name") as string,
        orgNumber: (form.get("orgNumber") as string) || undefined,
        sourceType: 1, // SelfRegistered
        organisationTypeId: form.get("orgType") as string,
        addresses: [
          {
            addressType: "Postal",
            street: (form.get("street") as string) || undefined,
            postalCode: (form.get("postalCode") as string) || undefined,
            city: (form.get("city") as string) || undefined,
            country: "Sverige",
          },
        ],
        contacts: [
          ...(form.get("email") ? [{ contactType: "Email", value: form.get("email") as string }] : []),
          ...(form.get("phone") ? [{ contactType: "Phone", value: form.get("phone") as string }] : []),
        ],
      });
      router.push("/");
    } catch {
      setError("Kunde inte registrera organisationen. Forsok igen.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-2xl mx-auto">
      <h2 className="text-2xl font-bold text-gray-900 mb-6">Registrera ny organisation</h2>

      {error && (
        <div className="bg-red-50 border border-red-200 text-red-700 p-4 rounded-lg mb-6 text-sm">{error}</div>
      )}

      <form onSubmit={handleSubmit} className="bg-white rounded-lg border border-gray-200 p-6 space-y-6">
        <div className="space-y-4">
          <h3 className="font-semibold text-gray-900 border-b pb-2">Grunduppgifter</h3>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Organisationsnamn *</label>
            <input name="name" required className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500" />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Organisationsnummer</label>
              <input name="orgNumber" placeholder="XXXXXX-XXXX" className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500" />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Organisationstyp *</label>
              <select name="orgType" required className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500">
                <option value="">Valj typ...</option>
                {ORG_TYPES.map((t) => (
                  <option key={t.id} value={t.id}>{t.name}</option>
                ))}
              </select>
            </div>
          </div>
        </div>

        <div className="space-y-4">
          <h3 className="font-semibold text-gray-900 border-b pb-2">Adress</h3>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Gatuadress</label>
            <input name="street" className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500" />
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Postnummer</label>
              <input name="postalCode" className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500" />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Ort</label>
              <input name="city" className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500" />
            </div>
          </div>
        </div>

        <div className="space-y-4">
          <h3 className="font-semibold text-gray-900 border-b pb-2">Kontaktuppgifter</h3>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">E-post</label>
              <input name="email" type="email" className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500" />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Telefon</label>
              <input name="phone" className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500" />
            </div>
          </div>
        </div>

        <div className="flex gap-3 pt-4 border-t">
          <button type="submit" disabled={loading} className="bg-blue-600 text-white px-6 py-2 rounded-lg hover:bg-blue-700 text-sm font-medium disabled:opacity-50">
            {loading ? "Registrerar..." : "Registrera organisation"}
          </button>
          <a href="/" className="px-6 py-2 border border-gray-300 rounded-lg text-sm text-gray-700 hover:bg-gray-50">Avbryt</a>
        </div>
      </form>
    </div>
  );
}
