const API_BASE = process.env.NEXT_PUBLIC_API_URL ?? "";

// --- Types ---

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

export interface Unit {
  id: string;
  name: string;
  status: number;
  sourceType: number;
  unitType: { id: string; name: string; description: string | null };
  organisationId: string;
  educationTypes: { id: string; name: string; code: string; description: string | null }[];
  createdAt: string;
  updatedAt: string;
}

export interface Group {
  id: string;
  name: string;
  description: string | null;
  organisationId: string | null;
  unitId: string | null;
  roles: { id: string; name: string; description: string | null; environmentId: string }[];
  createdAt: string;
  updatedAt: string;
}

export interface User {
  id: string;
  firstName: string;
  lastName: string;
  email: string | null;
  spsmAccountId: string | null;
  createdAt: string;
  updatedAt: string;
}

export interface Membership {
  id: string;
  userId: string;
  userName: string;
  roleId: string | null;
  roleName: string | null;
  startDate: string;
  endDate: string | null;
}

export interface Agreement {
  id: string;
  name: string;
  description: string;
  organisationId: string;
  agreementType: { id: string; name: string; description: string | null };
  validity: { id: string; startDate: string; endDate: string | null; renewalLogic: string | null; terminationCondition: string | null };
  template: { id: string; name: string } | null;
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

// --- Labels ---

const statusLabels: Record<number, string> = { 0: "Ny", 1: "Passiv", 2: "Aktiv", 3: "Vilande", 4: "Borttagen" };
const sourceLabels: Record<number, string> = { 0: "Extern", 1: "Självregistrerad", 2: "Intern" };

export function getStatusLabel(status: number): string { return statusLabels[status] ?? "Okänd"; }
export function getSourceLabel(source: number): string { return sourceLabels[source] ?? "Okänd"; }

export function getStatusColor(status: number): string {
  const colors: Record<number, string> = {
    0: "bg-spsm-orange-50 text-spsm-orange-700",
    1: "bg-gray-100 text-gray-600",
    2: "bg-spsm-green-50 text-spsm-green-700",
    3: "bg-amber-50 text-amber-700",
    4: "bg-spsm-burgundy-50 text-spsm-burgundy-800",
  };
  return colors[status] ?? "bg-gray-100 text-gray-600";
}

// --- Fetch helper ---

async function apiFetch(path: string, options?: RequestInit) {
  const res = await fetch(`${API_BASE}${path}`, {
    ...options,
    headers: { "Content-Type": "application/json", ...options?.headers },
  });
  if (!res.ok) throw new Error(`API error: ${res.status}`);
  if (res.status === 204) return null;
  return res.json();
}

// --- Organisation API ---

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
  return apiFetch("/api/v1/organisations", { method: "POST", body: JSON.stringify(data) });
}

export async function updateOrganisation(id: string, data: { name?: string; orgNumber?: string; status?: number }): Promise<Organisation> {
  return apiFetch(`/api/v1/organisations/${id}`, { method: "PUT", body: JSON.stringify(data) });
}

export async function deleteOrganisation(id: string): Promise<void> {
  await fetch(`${API_BASE}/api/v1/organisations/${id}`, { method: "DELETE" });
}

// --- Units API ---

export async function getUnitsByOrganisation(organisationId: string): Promise<Unit[]> {
  return apiFetch(`/api/v1/units/by-organisation/${organisationId}`);
}

export async function createUnit(data: { name: string; sourceType: number; unitTypeId: string; organisationId: string }): Promise<Unit> {
  return apiFetch("/api/v1/units", { method: "POST", body: JSON.stringify(data) });
}

export async function deleteUnit(id: string): Promise<void> {
  await fetch(`${API_BASE}/api/v1/units/${id}`, { method: "DELETE" });
}

// --- Groups API ---

export async function getGroupsByOrganisation(organisationId: string): Promise<Group[]> {
  return apiFetch(`/api/v1/groups/by-organisation/${organisationId}`);
}

export async function createGroup(data: { name: string; description?: string; organisationId?: string; unitId?: string }): Promise<Group> {
  return apiFetch("/api/v1/groups", { method: "POST", body: JSON.stringify(data) });
}

export async function deleteGroup(id: string): Promise<void> {
  await fetch(`${API_BASE}/api/v1/groups/${id}`, { method: "DELETE" });
}

// --- Users API ---

export async function getUsers(page = 1, pageSize = 50): Promise<PagedResult<User>> {
  return apiFetch(`/api/v1/users?page=${page}&pageSize=${pageSize}`);
}

export async function createUser(data: { firstName: string; lastName: string; email?: string; spsmAccountId?: string }): Promise<User> {
  return apiFetch("/api/v1/users", { method: "POST", body: JSON.stringify(data) });
}

// --- Memberships API ---

export async function getMembershipsByOrganisation(organisationId: string): Promise<Membership[]> {
  return apiFetch(`/api/v1/memberships/by-organisation/${organisationId}`);
}

export async function getMembershipsByUnit(unitId: string): Promise<Membership[]> {
  return apiFetch(`/api/v1/memberships/by-unit/${unitId}`);
}

export async function getMembershipsByGroup(groupId: string): Promise<Membership[]> {
  return apiFetch(`/api/v1/memberships/by-group/${groupId}`);
}

export async function addMember(organisationId: string, data: { userId: string; roleId?: string }): Promise<Membership> {
  return apiFetch(`/api/v1/memberships/organisation/${organisationId}`, { method: "POST", body: JSON.stringify(data) });
}

export async function addUnitMember(unitId: string, data: { userId: string; roleId?: string }): Promise<Membership> {
  return apiFetch(`/api/v1/memberships/unit/${unitId}`, { method: "POST", body: JSON.stringify(data) });
}

export async function addGroupMember(groupId: string, data: { userId: string }): Promise<Membership> {
  return apiFetch(`/api/v1/memberships/group/${groupId}`, { method: "POST", body: JSON.stringify(data) });
}

// --- Roles API ---

export interface Role {
  id: string;
  name: string;
  description: string | null;
  environmentId: string;
}

export async function getRoles(): Promise<Role[]> {
  return apiFetch("/api/v1/roles");
}

export async function getRolesByEnvironment(environmentId: string): Promise<Role[]> {
  return apiFetch(`/api/v1/roles/by-environment/${environmentId}`);
}

export async function createRole(data: { name: string; description?: string; environmentId: string }): Promise<Role> {
  return apiFetch("/api/v1/roles", { method: "POST", body: JSON.stringify(data) });
}

export async function updateRole(id: string, data: { name?: string; description?: string }): Promise<Role> {
  return apiFetch(`/api/v1/roles/${id}`, { method: "PUT", body: JSON.stringify(data) });
}

export async function deleteRole(id: string): Promise<void> {
  await fetch(`${API_BASE}/api/v1/roles/${id}`, { method: "DELETE" });
}

// --- Environments API ---

export interface Environment {
  id: string;
  name: string;
  description: string | null;
  roles: Role[];
}

export async function getEnvironments(): Promise<Environment[]> {
  return apiFetch("/api/v1/environments");
}

export async function createEnvironment(data: { name: string; description?: string }): Promise<Environment> {
  return apiFetch("/api/v1/environments", { method: "POST", body: JSON.stringify(data) });
}

export async function updateEnvironment(id: string, data: { name?: string; description?: string }): Promise<Environment> {
  return apiFetch(`/api/v1/environments/${id}`, { method: "PUT", body: JSON.stringify(data) });
}

export async function deleteEnvironment(id: string): Promise<void> {
  await fetch(`${API_BASE}/api/v1/environments/${id}`, { method: "DELETE" });
}

// --- Reference Data API ---

export interface OrganisationType {
  id: string;
  name: string;
  description: string | null;
}

export interface UnitType {
  id: string;
  name: string;
  description: string | null;
}

export interface EducationType {
  id: string;
  name: string;
  code: string | null;
  description: string | null;
}

export async function getOrganisationTypes(): Promise<OrganisationType[]> {
  return apiFetch("/api/v1/reference-data/organisation-types");
}

export async function getUnitTypes(): Promise<UnitType[]> {
  return apiFetch("/api/v1/reference-data/unit-types");
}

export async function getEducationTypes(): Promise<EducationType[]> {
  return apiFetch("/api/v1/reference-data/education-types");
}

// --- Agreements API ---

export async function getAgreementsByOrganisation(organisationId: string): Promise<Agreement[]> {
  return apiFetch(`/api/v1/agreements/by-organisation/${organisationId}`);
}

export async function createAgreement(data: {
  name: string;
  description: string;
  organisationId: string;
  agreementTypeId: string;
  validity: { startDate: string; endDate?: string; renewalLogic?: string; terminationCondition?: string };
}): Promise<Agreement> {
  return apiFetch("/api/v1/agreements", { method: "POST", body: JSON.stringify(data) });
}

export async function deleteAgreement(id: string): Promise<void> {
  await fetch(`${API_BASE}/api/v1/agreements/${id}`, { method: "DELETE" });
}
