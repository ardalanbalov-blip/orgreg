"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { createOrganisation, OrganisationType, getOrganisationTypes } from "@/lib/api";

export default function RegisterPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);
  const [orgTypes, setOrgTypes] = useState<OrganisationType[]>([]);

  useEffect(() => {
    getOrganisationTypes().then(setOrgTypes).catch(() => {});
  }, []);

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    const form = new FormData(e.currentTarget);
    try {
      await createOrganisation({
        name: form.get("name") as string,
        orgNumber: (form.get("orgNumber") as string) || undefined,
        sourceType: 1,
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
      setSuccess(true);
      setTimeout(() => router.push("/"), 1500);
    } catch {
      setError("Kunde inte registrera organisationen. Försök igen.");
    } finally {
      setLoading(false);
    }
  };

  if (success) {
    return (
      <div className="max-w-lg mx-auto mt-12 animate-slide-up">
        <div className="card p-8 text-center">
          <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-spsm-green-50 flex items-center justify-center">
            <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" className="text-spsm-green-500"><path d="M20 6L9 17l-5-5"/></svg>
          </div>
          <h3 className="text-lg font-bold text-gray-900">Organisation registrerad</h3>
          <p className="text-sm text-gray-500 mt-2">Din organisation har registrerats och väntar på granskning av SPSM.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-2xl mx-auto animate-slide-up">
      {/* Breadcrumb */}
      <div className="flex items-center gap-2 text-sm text-gray-400 mb-6">
        <a href="/" className="hover:text-spsm-burgundy-800 transition-colors">Organisationer</a>
        <svg width="12" height="12" viewBox="0 0 12 12" fill="currentColor" className="text-gray-300"><path d="M4.5 2l4 4-4 4"/></svg>
        <span className="text-gray-700 font-medium">Registrera</span>
      </div>

      <div className="mb-6">
        <h2 className="text-2xl font-bold text-gray-900">Registrera ny organisation</h2>
        <p className="text-sm text-gray-500 mt-1">Fyll i uppgifterna nedan. Obligatoriska fält är markerade med *</p>
      </div>

      {error && (
        <div className="bg-spsm-burgundy-50 border border-spsm-burgundy-200 text-spsm-burgundy-800 p-4 rounded-xl mb-6 text-sm font-medium flex items-center gap-3">
          <svg width="20" height="20" viewBox="0 0 20 20" fill="currentColor" className="shrink-0"><path fillRule="evenodd" d="M18 10a8 8 0 1 1-16 0 8 8 0 0 1 16 0Zm-8-5a.75.75 0 0 1 .75.75v4.5a.75.75 0 0 1-1.5 0v-4.5A.75.75 0 0 1 10 5Zm0 10a1 1 0 1 0 0-2 1 1 0 0 0 0 2Z"/></svg>
          {error}
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Section 1 */}
        <div className="card p-6">
          <div className="flex items-center gap-3 mb-5">
            <div className="w-8 h-8 rounded-full bg-spsm-burgundy-800 text-white flex items-center justify-center text-sm font-bold">1</div>
            <h3 className="font-bold text-gray-900">Grunduppgifter</h3>
          </div>

          <div className="space-y-4">
            <div>
              <label className="label">Organisationsnamn *</label>
              <input name="name" required className="input" placeholder="t.ex. Stockholms kommun" />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="label">Organisationsnummer</label>
                <input name="orgNumber" placeholder="XXXXXX-XXXX" className="input" />
              </div>
              <div>
                <label className="label">Organisationstyp *</label>
                <select name="orgType" required className="input">
                  <option value="">Välj typ...</option>
                  {orgTypes.map((t) => (
                    <option key={t.id} value={t.id}>{t.name}</option>
                  ))}
                </select>
              </div>
            </div>
          </div>
        </div>

        {/* Section 2 */}
        <div className="card p-6">
          <div className="flex items-center gap-3 mb-5">
            <div className="w-8 h-8 rounded-full bg-spsm-orange-500 text-white flex items-center justify-center text-sm font-bold">2</div>
            <h3 className="font-bold text-gray-900">Adress</h3>
          </div>

          <div className="space-y-4">
            <div>
              <label className="label">Gatuadress</label>
              <input name="street" className="input" placeholder="t.ex. Storgatan 1" />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="label">Postnummer</label>
                <input name="postalCode" className="input" placeholder="t.ex. 11122" />
              </div>
              <div>
                <label className="label">Ort</label>
                <input name="city" className="input" placeholder="t.ex. Stockholm" />
              </div>
            </div>
          </div>
        </div>

        {/* Section 3 */}
        <div className="card p-6">
          <div className="flex items-center gap-3 mb-5">
            <div className="w-8 h-8 rounded-full bg-spsm-green-400 text-white flex items-center justify-center text-sm font-bold">3</div>
            <h3 className="font-bold text-gray-900">Kontaktuppgifter</h3>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="label">E-post</label>
              <input name="email" type="email" className="input" placeholder="info@exempel.se" />
            </div>
            <div>
              <label className="label">Telefon</label>
              <input name="phone" className="input" placeholder="08-123 456 78" />
            </div>
          </div>
        </div>

        {/* Actions */}
        <div className="flex items-center gap-3">
          <button type="submit" disabled={loading} className="btn-primary">
            {loading ? (
              <>
                <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                Registrerar...
              </>
            ) : "Registrera organisation"}
          </button>
          <a href="/" className="btn-secondary">Avbryt</a>
        </div>
      </form>
    </div>
  );
}
