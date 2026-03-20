# Mappning: Dokumentet vs Implementation

**Dokument:** Rekommendationer och handlingsplan – Informationsarkitektur och kartläggning för Organisationsregistret
**Datum:** 2026-03-20

Detta dokument mappar varje krav och koncept i rekommendationsdokumentet mot vad som faktiskt är implementerat i lösningen.

---

## 1. Informationsmodell – Organisation

### 1.1 Organisation

| Dokumentkrav | Implementerat | Fil(er) |
|---|---|---|
| Organisation som överordnat strukturobjekt | Ja | `Models/Organisation/Organisation.cs` |
| Id (Guid) | Ja | Organisation.cs |
| Name (string) | Ja | Organisation.cs |
| OrgNumber (organisationsnummer) | Ja | Organisation.cs |
| Status (livscykel: Ny, Passiv, Aktiv, Vilande, Borttagen) | Ja | OrganisationEnums.cs → `OrganisationStatus` |
| SourceType (källa: Extern, Självregistrerad, Intern) | Ja | OrganisationEnums.cs → `SourceType` |
| Relation till OrganisationType | Ja | Organisation.cs → `OrganisationTypeId` + navigation |
| Relation till AddressDetails | Ja | Organisation.cs → `Addresses` (List) |
| Relation till ContactDetails | Ja | Organisation.cs → `Contacts` (List) |
| Relation till Units | Ja | Organisation.cs → `Units` (List) |
| Relation till Groups | Ja | Organisation.cs → `Groups` (List) |
| Relation till Memberships | Ja | Organisation.cs → `Memberships` (List) |
| CreatedAt / UpdatedAt | Ja | Organisation.cs |

**API-täckning:**

| Operation | Endpoint | Status |
|---|---|---|
| Hämta alla (paginerat) | GET `/api/v1/organisations` | Implementerat |
| Hämta enskild | GET `/api/v1/organisations/{id}` | Implementerat |
| Sök | GET `/api/v1/organisations/search?q=` | Implementerat |
| Skapa | POST `/api/v1/organisations` | Implementerat |
| Uppdatera | PUT `/api/v1/organisations/{id}` | Implementerat |
| Ta bort | DELETE `/api/v1/organisations/{id}` | Implementerat |

**Frontend-täckning:**

| Funktion | Sida | Status |
|---|---|---|
| Lista organisationer | `page.tsx` (startsida) | Implementerat |
| Sök organisationer | `page.tsx` (startsida) | Implementerat |
| Visa detalj | `organisation/[id]/page.tsx` | Implementerat |
| Skapa (självregistrering) | `register/page.tsx` | Implementerat |
| Redigera namn | `organisation/[id]/page.tsx` | Implementerat |
| Ändra status | `organisation/[id]/page.tsx` | Implementerat |
| Ta bort | `organisation/[id]/page.tsx` | Implementerat |
| Visa adresser | `organisation/[id]/page.tsx` (info-tab) | Implementerat |
| Visa kontaktuppgifter | `organisation/[id]/page.tsx` (info-tab) | Implementerat |

---

### 1.2 OrganisationType (Organisationstyp)

| Dokumentkrav | Implementerat | Fil(er) |
|---|---|---|
| Fristående referensobjekt | Ja | `Models/Organisation/OrganisationType.cs` |
| Id, Name, Description | Ja | OrganisationType.cs |
| Återanvändbar för flera organisationer | Ja | FK i Organisation |
| Exponeras via API | Ja | GET `/api/v1/reference-data/organisation-types` |
| Används i frontend-formulär | Ja | `register/page.tsx` (dropdown) |

---

### 1.3 AddressDetails (Adressuppgifter)

| Dokumentkrav | Implementerat | Fil(er) |
|---|---|---|
| Separat objekt för adresser | Ja | `Models/Organisation/AddressDetails.cs` |
| AddressType (Post, Besök etc.) | Ja | AddressDetails.cs |
| Street, PostalCode, City, Country | Ja | AddressDetails.cs |
| Kopplad till Organisation via FK | Ja | AddressDetails.cs → `OrganisationId` |
| Visas i frontend | Ja | Info-tab på organisationsdetalj |

---

### 1.4 ContactDetails (Kontaktuppgifter)

| Dokumentkrav | Implementerat | Fil(er) |
|---|---|---|
| Separat objekt för kontakt | Ja | `Models/Organisation/ContactDetails.cs` |
| ContactType (Email, Phone etc.) | Ja | ContactDetails.cs |
| Value | Ja | ContactDetails.cs |
| Kopplad till Organisation via FK | Ja | ContactDetails.cs → `OrganisationId` |
| Visas i frontend | Ja | Info-tab på organisationsdetalj |

---

### 1.5 Unit (Enhet)

| Dokumentkrav | Implementerat | Fil(er) |
|---|---|---|
| Organisatorisk enhet under Organisation | Ja | `Models/Organisation/Unit.cs` |
| Id, Name | Ja | Unit.cs |
| Status (livscykel) | Ja | Unit.cs → `OrganisationStatus` |
| SourceType | Ja | Unit.cs |
| Relation till UnitType | Ja | Unit.cs → `UnitTypeId` + navigation |
| Relation till EducationType (lista) | Ja | Unit.cs → `EducationTypes` (List) |
| Relation till Organisation (FK) | Ja | Unit.cs → `OrganisationId` |
| Relation till Groups | Ja | Unit.cs → `Groups` (List) |
| Relation till Memberships | Ja | Unit.cs → `Memberships` (List) |
| CreatedAt / UpdatedAt | Ja | Unit.cs |

**API-täckning:**

| Operation | Endpoint | Status |
|---|---|---|
| Hämta per organisation | GET `/api/v1/units/by-organisation/{orgId}` | Implementerat |
| Hämta enskild | GET `/api/v1/units/{id}` | Implementerat |
| Skapa | POST `/api/v1/units` | Implementerat |
| Uppdatera (inkl. educationTypeIds) | PUT `/api/v1/units/{id}` | Implementerat |
| Ta bort | DELETE `/api/v1/units/{id}` | Implementerat |

**Frontend-täckning:**

| Funktion | Status |
|---|---|
| Lista enheter | Implementerat |
| Skapa enhet (med UnitType) | Implementerat |
| Visa EducationType på enheter | Implementerat |
| Välja EducationType vid skapande | Implementerat |
| Redigera enhet | Implementerat |
| Ta bort enhet | Implementerat |
| Visa medlemmar (expandera) | Implementerat |

---

### 1.6 UnitType (Enhetstyp)

| Dokumentkrav | Implementerat | Fil(er) |
|---|---|---|
| Separat referensobjekt | Ja | `Models/Organisation/UnitType.cs` |
| Id, Name, Description | Ja | UnitType.cs |
| Exponeras via API | Ja | GET `/api/v1/reference-data/unit-types` |
| Används i frontend | Ja | Dropdown vid skapande av enhet |

---

### 1.7 EducationType (Utbildningsform)

| Dokumentkrav | Implementerat | Fil(er) |
|---|---|---|
| Kopplas till Unit (en-till-många) | Ja | Unit.cs → `EducationTypes` (List) |
| Id, Name, Code, Description | Ja | `Models/Organisation/EducationType.cs` |
| Speglar SS12000/Thesaurus | Ja | Integrationsmodulen |
| Exponeras via API | Ja | GET `/api/v1/reference-data/education-types` |
| Visas i frontend | Implementerat | Enheter-tab |

---

### 1.8 Group (Grupp)

| Dokumentkrav | Implementerat | Fil(er) |
|---|---|---|
| Logisk gruppering under Org eller Unit | Ja | `Models/Organisation/Group.cs` |
| Id, Name, Description | Ja | Group.cs |
| OrganisationId (nullable FK) | Ja | Group.cs |
| UnitId (nullable FK) | Ja | Group.cs |
| Relation till Role (lista) | Ja | Group.cs → `Roles` (List) |
| Relation till Memberships | Ja | Group.cs → `Memberships` (List) |
| CreatedAt / UpdatedAt | Ja | Group.cs |

**API-täckning:**

| Operation | Endpoint | Status |
|---|---|---|
| Hämta per organisation | GET `/api/v1/groups/by-organisation/{orgId}` | Implementerat |
| Hämta per enhet | GET `/api/v1/groups/by-unit/{unitId}` | Implementerat |
| Hämta enskild | GET `/api/v1/groups/{id}` | Implementerat |
| Skapa (org eller unit) | POST `/api/v1/groups` | Implementerat |
| Uppdatera | PUT `/api/v1/groups/{id}` | Implementerat |
| Ta bort | DELETE `/api/v1/groups/{id}` | Implementerat |

**Frontend-täckning:**

| Funktion | Status |
|---|---|
| Lista grupper | Implementerat |
| Skapa grupp (kopplad till org) | Implementerat |
| Skapa grupp (kopplad till unit) | Implementerat |
| Visa roller på grupp | Implementerat |
| Redigera grupp | Implementerat |
| Ta bort grupp | Implementerat |
| Visa medlemmar (expandera) | Implementerat |

---

### 1.9 Membership-objekt (Tillhörighetsobjekt)

| Dokumentkrav | Implementerat | Fil(er) |
|---|---|---|
| **OrganisationMembership** | Ja | `Models/Organisation/OrganisationMembership.cs` |
| → UserId, OrganisationId, RoleId, StartDate, EndDate | Ja | OrganisationMembership.cs |
| **UnitMembership** | Ja | `Models/Organisation/UnitMembership.cs` |
| → UserId, UnitId, RoleId, StartDate, EndDate | Ja | UnitMembership.cs |
| **GroupMembership** | Ja | `Models/Organisation/GroupMembership.cs` |
| → UserId, GroupId, StartDate, EndDate | Ja | GroupMembership.cs |
| Separata objekt (ej hårdkodat) | Ja | Tre separata modeller |

**API-täckning:**

| Operation | Endpoint | Status |
|---|---|---|
| Hämta org-medlemmar | GET `/api/v1/memberships/by-organisation/{id}` | Implementerat |
| Lägg till org-medlem | POST `/api/v1/memberships/organisation/{id}` | Implementerat |
| Hämta enhetsmedlemmar | GET `/api/v1/memberships/by-unit/{id}` | Implementerat |
| Lägg till enhetsmedlem | POST `/api/v1/memberships/unit/{id}` | Implementerat |
| Hämta gruppmedlemmar | GET `/api/v1/memberships/by-group/{id}` | Implementerat |
| Lägg till gruppmedlem | POST `/api/v1/memberships/group/{id}` | Implementerat |

**Frontend-täckning:**

| Funktion | Status |
|---|---|
| Visa org-medlemmar (tabell) | Implementerat |
| Lägga till org-medlemmar | Implementerat |
| Visa enhetsmedlemmar (expandera) | Implementerat |
| Lägga till enhetsmedlemmar | Implementerat |
| Visa gruppmedlemmar (expandera) | Implementerat |
| Lägga till gruppmedlemmar | Implementerat |

---

### 1.10 User (Användare)

| Dokumentkrav | Implementerat | Fil(er) |
|---|---|---|
| Individ med koppling till org/enhet/grupp | Ja | `Models/Organisation/User.cs` |
| Id, FirstName, LastName | Ja | User.cs |
| Email (nullable) | Ja | User.cs |
| SpsmAccountId (SPSM Konto-ID) | Ja | User.cs |
| Neutral kring autentisering | Ja | Inget IdP-beroende i modellen |
| Navigationsegenskaper till alla membership-typer | Ja | User.cs |
| CreatedAt / UpdatedAt | Ja | User.cs |

**API-täckning:**

| Operation | Endpoint | Status |
|---|---|---|
| Hämta alla (paginerat) | GET `/api/v1/users` | Implementerat |
| Hämta enskild | GET `/api/v1/users/{id}` | Implementerat |
| Skapa | POST `/api/v1/users` | Implementerat |
| Uppdatera | PUT `/api/v1/users/{id}` | Implementerat |
| Ta bort | DELETE `/api/v1/users/{id}` | Implementerat |

**Frontend-täckning:**

| Funktion | Status |
|---|---|
| Lista användare i admin | Implementerat |
| Skapa användare | Implementerat |
| Redigera användare | Implementerat |
| Ta bort användare | Implementerat |

---

### 1.11 Role (Roll)

| Dokumentkrav | Implementerat | Fil(er) |
|---|---|---|
| Separat objekt för funktionella roller | Ja | `Models/Organisation/Role.cs` |
| Id, Name, Description | Ja | Role.cs |
| Kopplad till Environment (FK) | Ja | Role.cs → `EnvironmentId` |
| Används via membership och grupper | Ja | OrganisationMembership, UnitMembership, Group |

**API-täckning:**

| Operation | Endpoint | Status |
|---|---|---|
| Hämta alla | GET `/api/v1/roles` | Implementerat |
| Hämta per miljö | GET `/api/v1/roles/by-environment/{id}` | Implementerat |
| Skapa | POST `/api/v1/roles` | Implementerat |
| Uppdatera | PUT `/api/v1/roles/{id}` | Implementerat |
| Ta bort | DELETE `/api/v1/roles/{id}` | Implementerat |

**Frontend:** Skapa/ta bort roller i admin (Miljöer & Roller-tab). Implementerat.

---

### 1.12 Environment (Omgivande kontext)

| Dokumentkrav | Implementerat | Fil(er) |
|---|---|---|
| Kontext som äger roller | Ja | `Models/Organisation/Environment.cs` |
| Id, Name, Description | Ja | Environment.cs |
| Relation till Roles (lista) | Ja | Environment.cs → `Roles` (List) |
| Separerade rolluppsättningar per miljö | Ja | Role.EnvironmentId FK |

**API-täckning:**

| Operation | Endpoint | Status |
|---|---|---|
| Hämta alla | GET `/api/v1/environments` | Implementerat |
| Skapa | POST `/api/v1/environments` | Implementerat |
| Uppdatera | PUT `/api/v1/environments/{id}` | Implementerat |
| Ta bort | DELETE `/api/v1/environments/{id}` | Implementerat |

**Frontend:** CRUD i admin (Miljöer & Roller-tab). Implementerat.

---

## 2. Informationsmodell – Avtal

### 2.1 Agreement (Avtal)

| Dokumentkrav | Implementerat | Fil(er) |
|---|---|---|
| Centralt avtalsobjekt | Ja | `Models/Avtal/Agreement.cs` |
| Id, Name, Description | Ja | Agreement.cs |
| Koppling till Organisation (FK) | Ja | Agreement.cs → `OrganisationId` |
| Relation till AgreementType (obligatorisk) | Ja | Agreement.cs → `AgreementTypeId` |
| Relation till Validity (obligatorisk, exklusiv) | Ja | Agreement.cs → `ValidityId` |
| Relation till Template (valfri) | Ja | Agreement.cs → `TemplateId` (nullable) |
| Separerat från Organisation som eget domänobjekt | Ja | Eget API-projekt: `OrgReg.Avtal.Api` |
| CreatedAt / UpdatedAt | Ja | Agreement.cs |

### 2.2 AgreementType (Avtalstyp)

| Dokumentkrav | Implementerat | Fil(er) |
|---|---|---|
| Klassificering av avtal | Ja | `Models/Avtal/AgreementType.cs` |
| Id, Name, Description | Ja | AgreementType.cs |
| Fristående, återanvändbar | Ja | Separerad modell |
| Seed-data: PUB-avtal, Samarbetsavtal | Ja | `AvtalDbContext.cs` → OnModelCreating |

### 2.3 Validity (Giltighet)

| Dokumentkrav | Implementerat | Fil(er) |
|---|---|---|
| Giltighetsperiod per avtal | Ja | `Models/Avtal/Validity.cs` |
| StartDate, EndDate (nullable) | Ja | Validity.cs |
| RenewalLogic (förlängningslogik) | Ja | Validity.cs |
| TerminationCondition (uppsägningsvillkor) | Ja | Validity.cs |
| Unik per avtal (ej delad) | Ja | 1:1 relation via FK |

### 2.4 Template (Avtalsmall)

| Dokumentkrav | Implementerat | Fil(er) |
|---|---|---|
| Generisk, återanvändbar mall | Ja | `Models/Avtal/Template.cs` |
| Id, Name, Content | Ja | Template.cs |
| Valfri koppling till avtal | Ja | Agreement.TemplateId nullable |
| CreatedAt | Ja | Template.cs |

**Avtal API-täckning:**

| Operation | Endpoint | Status |
|---|---|---|
| Hämta alla (paginerat) | GET `/api/v1/agreements` | Implementerat |
| Hämta enskilt | GET `/api/v1/agreements/{id}` | Implementerat |
| Hämta per organisation | GET `/api/v1/agreements/by-organisation/{id}` | Implementerat |
| Skapa | POST `/api/v1/agreements` | Implementerat |
| Uppdatera | PUT `/api/v1/agreements/{id}` | Implementerat |
| Ta bort | DELETE `/api/v1/agreements/{id}` | Implementerat |
| Hämta mallar | GET `/api/v1/templates` | Implementerat |
| Skapa mall | POST `/api/v1/templates` | Implementerat |

**Frontend-täckning:**

| Funktion | Status |
|---|---|
| Visa avtal på organisationsdetalj | Implementerat |
| Skapa avtal | Implementerat |
| Ta bort avtal | Implementerat |

---

## 3. Nya komponenter i lösningen

### 3.1 Publik webbtjänst för Organisation

| Dokumentkrav | Implementerat | Detalj |
|---|---|---|
| Ny publik webtjänst som ersätter Organisationsregistret | Ja | Next.js frontend |
| Extern registrering av organisationer | Ja | `/register` |
| Sök och visa organisationer | Ja | Startsida med sök + detalj |
| Administrera enheter, grupper, medlemmar | Ja | Organisationsdetalj med flikar |
| Visa avtal | Ja | Avtal-tab |

### 3.2 Intern webbtjänst för Organisation

| Dokumentkrav | Implementerat | Detalj |
|---|---|---|
| Massimport (tekniskt administrativ) | Ja | Admin → Import/Export-tab |
| Massexport | Ja | Admin → Import/Export-tab |
| JSON-format stöd | Ja | JSON import/export |

### 3.3 Internt REST API för Organisation

| Dokumentkrav | Implementerat | Detalj |
|---|---|---|
| REST API som ersätter befintligt | Ja | `OrgReg.Organisation.Api` |
| Exponerar informationsmodellen | Ja | Alla entiteter via API |
| CRUD för alla objekt | Ja | Se endpoint-tabeller ovan |
| Paginering | Ja | PagedResult<T> |
| Sök | Ja | `/search?q=` |
| Referensdata (typer) | Ja | `/reference-data/*` |

**Controllers:** OrganisationsController, UnitsController, GroupsController, UsersController, RolesController, EnvironmentsController, MembershipsController, ReviewController, ReferenceDataController

### 3.4 Internt REST API för Avtal

| Dokumentkrav | Implementerat | Detalj |
|---|---|---|
| Separat REST API för Avtal | Ja | `OrgReg.Avtal.Api` |
| CRUD för avtal | Ja | AgreementsController |
| Hantering av mallar | Ja | TemplatesController |
| Egen databas | Ja | `AvtalDbContext` med EF Core |

### 3.5 Databas för Avtal

| Dokumentkrav | Implementerat | Detalj |
|---|---|---|
| Ny databas för avtalsdata | Ja | SQLite via EF Core |
| Seed-data (avtalstyper) | Ja | PUB-avtal, Samarbetsavtal |

### 3.6 Integration mot Skolenhetsregistret

| Dokumentkrav | Implementerat | Detalj |
|---|---|---|
| Ny integration via informationslagret | Ja | `OrgReg.Integrations/Skolenhetsregistret/` |
| SkolenhetsregistretClient | Ja | SkolenhetsregistretClient.cs |
| Paginerad synkronisering | Ja | SyncOrganisationsAsync, SyncSchoolUnitsAsync |
| Skyddar aktiva organisationer mot överskrivning | Ja | Kontrollerar status innan uppdatering |

### 3.7 Integration mot Statistikdatabasen

| Dokumentkrav | Implementerat | Detalj |
|---|---|---|
| Ny integration via informationslagret | Ja | `OrgReg.Integrations/Statistikdatabasen/` |
| StatistikdatabasenClient | Ja | StatistikdatabasenClient.cs |
| Paginerad synkronisering | Ja | SyncOrganisationsAsync |

### 3.8 SS12000-transformation

| Dokumentkrav | Implementerat | Detalj |
|---|---|---|
| Transformation till/från SS12000-format | Ja | `OrgReg.Integrations/SS12000/` |
| SS12000Transformer (bidirektionell) | Ja | ToOrganisation, ToUnit, ToUser, FromOrganisation, FromUnit |
| SS12000-modeller | Ja | SS12000Organisation, SS12000SchoolUnit, SS12000Person etc. |
| Organisationstyp-mappning (Kommun, Friskola, Stat) | Ja | I transformern |

---

## 4. Granskning av organisationsdata

| Dokumentkrav | Implementerat | Detalj |
|---|---|---|
| Formaliserad granskningsprocess | Ja | ReviewController |
| Självregistrerade org. får status "Ny" | Ja | OrganisationService.CreateAsync |
| Lista väntande organisationer | Ja | GET `/api/v1/review/pending` |
| Godkänn → Aktiv | Ja | POST `/api/v1/review/{id}/approve` |
| Avslå → Borttagen | Ja | POST `/api/v1/review/{id}/reject` |
| Handläggare granskar i intern tjänst | Ja | Admin → Granska-tab |
| Enhetlig och förutsägbar hantering | Ja | Samma process för alla |

---

## 5. Arkitekturprinciper

| Dokumentkrav | Implementerat | Detalj |
|---|---|---|
| Informationslager med egna domänmodeller | Ja | OrgReg.Shared/Models + API:er |
| REST API som primär ingång | Ja | Alla tjänster via API |
| Transformation mellan modeller | Ja | SS12000Transformer, Dynamics-repositories |
| Dynamics som underliggande systemstöd | Ja | OrgReg.Dynamics (DynamicsOrganisationRepository etc.) |
| FakeDynamics för test/utveckling | Ja | OrgReg.FakeDynamics |
| Avtal separerat från Organisation | Ja | Eget projekt, egen databas, eget API |
| Tjänstelagret kommunicerar via informationslagret | Ja | Frontend → API → Service → Repository |
| Löst kopplade beroenden | Ja | Interface-baserade repositories |

---

## 6. Livscykel och källhantering

| Dokumentkrav | Implementerat | Detalj |
|---|---|---|
| Status: Ny, Passiv, Aktiv, Vilande, Borttagen | Ja | OrganisationStatus enum (0-4) |
| SourceType: Extern, Självregistrerad, Intern | Ja | SourceType enum (0-2) |
| Importer skapar/uppdaterar passiva org. | Ja | Integrationsklienter kontrollerar status |
| Aktiva org. skyddas mot överskrivning | Ja | Implementerat i sync-metoder |
| Statusändring via API | Ja | PUT med status-fält |
| Visas i frontend | Ja | Badge med färgkodning |

---

## 7. Sammanfattning

### Alla entiteter i informationsmodellen: IMPLEMENTERADE

| Entitet | Backend | API | Frontend |
|---|---|---|---|
| Organisation | ✅ | ✅ | ✅ |
| OrganisationType | ✅ | ✅ | ✅ |
| AddressDetails | ✅ | ✅ | ✅ |
| ContactDetails | ✅ | ✅ | ✅ |
| Unit | ✅ | ✅ | ✅ |
| UnitType | ✅ | ✅ | ✅ |
| EducationType | ✅ | ✅ | ✅ |
| Group | ✅ | ✅ | ✅ |
| User | ✅ | ✅ | ✅ |
| Role | ✅ | ✅ | ✅ |
| Environment | ✅ | ✅ | ✅ |
| OrganisationMembership | ✅ | ✅ | ✅ |
| UnitMembership | ✅ | ✅ | ✅ |
| GroupMembership | ✅ | ✅ | ✅ |
| Agreement | ✅ | ✅ | ✅ |
| AgreementType | ✅ | ✅ | ✅ |
| Validity | ✅ | ✅ | ✅ |
| Template | ✅ | ✅ | ✅ |

### Alla nya komponenter: IMPLEMENTERADE

| Komponent | Status |
|---|---|
| Publik webbtjänst för Organisation | ✅ |
| Intern webbtjänst för Organisation | ✅ |
| Internt REST API för Organisation | ✅ |
| Internt REST API för Avtal | ✅ |
| Databas för Avtal | ✅ |
| Integration Skolenhetsregistret | ✅ |
| Integration Statistikdatabasen | ✅ |
| SS12000-transformation | ✅ |
| Granskningsprocess | ✅ |

### Övriga funktioner

| Funktion | Status |
|---|---|
| Massimport (JSON) | ✅ |
| Massexport (JSON) | ✅ |
| Paginering i alla listor | ✅ |
| Sökning på namn/org.nr | ✅ |
| Referensdata-API | ✅ |
| Livscykelhantering (status) | ✅ |
| Källspårning (SourceType) | ✅ |

---

*Genererat 2026-03-20 baserat på kodbasen i `/home/user/orgreg`*
