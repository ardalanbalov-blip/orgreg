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
      setTimeout(() => router.push("/"), 2000);
    } catch {
      setError("Kunde inte registrera organisationen. Försök igen.");
    } finally {
      setLoading(false);
    }
  };

  if (success) {
    return (
      <div className="max-w-lg mx-auto mt-16 animate-scale-in">
        <div className="card p-12 text-center">
          <div className="w-20 h-20 mx-auto mb-6 rounded-2xl flex items-center justify-center relative overflow-hidden"
            style={{ background: 'linear-gradient(135deg, #81a832 0%, #638524 100%)' }}>
            <svg width="36" height="36" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2.5" strokeLinecap="round"><path d="M20 6L9 17l-5-5"/></svg>
            <div className="absolute inset-0 bg-gradient-to-t from-transparent to-white/10" />
          </div>
          <h3 className="text-xl font-bold text-gray-900">Organisation registrerad!</h3>
          <p className="text-sm text-gray-500 mt-3 max-w-xs mx-auto">Din organisation har registrerats och väntar på granskning av SPSM.</p>
          <div className="mt-6 flex items-center justify-center gap-2 text-xs text-gray-400">
            <div className="w-4 h-4 border-2 border-gray-300 border-t-spsm-burgundy-800 rounded-full animate-spin" />
            Omdirigerar...
          </div>
        </div>
      </div>
    );
  }

  const steps = [
    { num: 1, label: "Grunduppgifter", color: "from-spsm-burgundy-800 to-spsm-burgundy-600" },
    { num: 2, label: "Adress", color: "from-spsm-orange-500 to-spsm-orange-600" },
    { num: 3, label: "Kontakt", color: "from-spsm-green-500 to-spsm-green-600" },
  ];

  return (
    <div className="max-w-2xl mx-auto animate-slide-up">
      {/* Breadcrumb */}
      <div className="flex items-center gap-2 text-xs text-gray-400 mb-8 font-medium">
        <a href="/" className="hover:text-spsm-burgundy-800 transition-colors">Organisationer</a>
        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round"><path d="m9 18 6-6-6-6"/></svg>
        <span className="text-gray-700">Registrera</span>
      </div>

      <div className="mb-8">
        <div className="flex items-center gap-2.5 mb-3">
          <div className="h-8 w-1 rounded-full bg-gradient-to-b from-spsm-burgundy-800 to-spsm-burgundy-400" />
          <p className="text-[10px] font-bold uppercase tracking-[0.2em] text-spsm-burgundy-800/60">Nyregistrering</p>
        </div>
        <h2 className="page-title">Registrera organisation</h2>
        <p className="page-subtitle">Fyll i uppgifterna nedan. Obligatoriska fält är markerade med *</p>
      </div>

      {/* Progress indicators */}
      <div className="flex items-center gap-4 mb-8">
        {steps.map((s, i) => (
          <div key={s.num} className="flex items-center gap-3 flex-1">
            <div className={`w-8 h-8 rounded-xl bg-gradient-to-br ${s.color} text-white flex items-center justify-center text-xs font-bold shadow-sm`}>
              {s.num}
            </div>
            <span className="text-xs font-semibold text-gray-500">{s.label}</span>
            {i < 2 && <div className="flex-1 h-px bg-gray-200 ml-2" />}
          </div>
        ))}
      </div>

      {error && (
        <div className="card p-4 mb-6 border-red-200/60 bg-red-50/50 animate-scale-in">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-lg bg-red-100 flex items-center justify-center shrink-0">
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#dc2626" strokeWidth="2" strokeLinecap="round"><circle cx="12" cy="12" r="10"/><path d="M12 8v4"/></svg>
            </div>
            <p className="text-sm font-medium text-red-800">{error}</p>
          </div>
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Section 1 */}
        <div className="card p-7">
          <div className="flex items-center gap-3 mb-6">
            <div className="w-8 h-8 rounded-xl bg-gradient-to-br from-spsm-burgundy-800 to-spsm-burgundy-600 text-white flex items-center justify-center text-xs font-bold shadow-sm">1</div>
            <h3 className="font-bold text-gray-900">Grunduppgifter</h3>
          </div>
          <div className="space-y-5">
            <div>
              <label className="label">Organisationsnamn *</label>
              <input name="name" required className="input-lg" placeholder="t.ex. Stockholms kommun" />
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
        <div className="card p-7">
          <div className="flex items-center gap-3 mb-6">
            <div className="w-8 h-8 rounded-xl bg-gradient-to-br from-spsm-orange-500 to-spsm-orange-600 text-white flex items-center justify-center text-xs font-bold shadow-sm">2</div>
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
                <input name="postalCode" className="input" placeholder="t.ex. 111 22" />
              </div>
              <div>
                <label className="label">Ort</label>
                <input name="city" className="input" placeholder="t.ex. Stockholm" />
              </div>
            </div>
          </div>
        </div>

        {/* Section 3 */}
        <div className="card p-7">
          <div className="flex items-center gap-3 mb-6">
            <div className="w-8 h-8 rounded-xl bg-gradient-to-br from-spsm-green-500 to-spsm-green-600 text-white flex items-center justify-center text-xs font-bold shadow-sm">3</div>
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
        <div className="flex items-center gap-3 pt-2">
          <button type="submit" disabled={loading} className="btn-primary px-8 py-3 text-base rounded-2xl">
            {loading ? (
              <>
                <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                Registrerar...
              </>
            ) : "Registrera organisation"}
          </button>
          <a href="/" className="btn-ghost px-6">Avbryt</a>
        </div>
      </form>
    </div>
  );
}
