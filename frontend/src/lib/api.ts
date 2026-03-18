const API_BASE = process.env.NEXT_PUBLIC_API_URL || "http://localhost:5010";

export interface Organisation {
  id: string;
  name: string;
  orgNumber: string | null;
  status: number;
  sourceType: number;
  organisationType: { id: string; name: string; description: string | null };
  addresses: { id: string; addressType: string; street: string | null; postalCode: string | null; city: string | null; country: string | null }[];
  contacts: { id: string; contactType: string; value: string }[];
  createdAt: string;
  updatedAt: string;
}

export interface PagedResult<T> {
  items: T[];
  totalCount: number;
  page: number;
  pageSize: number;
  totalPages: number;
  hasNextPage: boolean;
  hasPreviousPage: boolean;
}

const statusLabels: Record<number, string> = {
  0: "Ny",
  1: "Passiv",
  2: "Aktiv",
  3: "Vilande",
  4: "Borttagen",
};

const sourceLabels: Record<number, string> = {
  0: "Extern",
  1: "Självregistrerad",
  2: "Intern",
};

export function getStatusLabel(status: number): string {
  return statusLabels[status] ?? "Okänd";
}

export function getSourceLabel(source: number): string {
  return sourceLabels[source] ?? "Okänd";
}

export function getStatusColor(status: number): string {
  const colors: Record<number, string> = {
    0: "bg-yellow-100 text-yellow-800",
    1: "bg-gray-100 text-gray-800",
    2: "bg-green-100 text-green-800",
    3: "bg-orange-100 text-orange-800",
    4: "bg-red-100 text-red-800",
  };
  return colors[status] ?? "bg-gray-100 text-gray-800";
}

async function apiFetch(path: string, options?: RequestInit) {
  const res = await fetch(`${API_BASE}${path}`, {
    ...options,
    headers: { "Content-Type": "application/json", ...options?.headers },
  });
  if (!res.ok) throw new Error(`API error: ${res.status}`);
  return res.json();
}

export async function getOrganisations(page = 1, pageSize = 20): Promise<PagedResult<Organisation>> {
  return apiFetch(`/api/v1/organisations?page=${page}&pageSize=${pageSize}`);
}

export async function getOrganisation(id: string): Promise<Organisation> {
  return apiFetch(`/api/v1/organisations/${id}`);
}

export async function searchOrganisations(q: string, page = 1): Promise<PagedResult<Organisation>> {
  return apiFetch(`/api/v1/organisations/search?q=${encodeURIComponent(q)}&page=${page}`);
}

export async function createOrganisation(data: {
  name: string;
  orgNumber?: string;
  sourceType: number;
  organisationTypeId: string;
  addresses?: { addressType: string; street?: string; postalCode?: string; city?: string; country?: string }[];
  contacts?: { contactType: string; value: string }[];
}): Promise<Organisation> {
  return apiFetch("/api/v1/organisations", {
    method: "POST",
    body: JSON.stringify(data),
  });
}

export async function updateOrganisation(id: string, data: {
  name?: string;
  orgNumber?: string;
  status?: number;
}): Promise<Organisation> {
  return apiFetch(`/api/v1/organisations/${id}`, {
    method: "PUT",
    body: JSON.stringify(data),
  });
}

export async function deleteOrganisation(id: string): Promise<void> {
  await fetch(`${API_BASE}/api/v1/organisations/${id}`, { method: "DELETE" });
}
