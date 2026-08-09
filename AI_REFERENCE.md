# SYSTEM ARCHITECTURE & AI AGENT GUIDELINES (AI_REFERENCE.md)

> **IMPORTANT FOR AI AGENTS & DEVELOPERS**: 
> Read this document thoroughly before writing, modifying, or refactoring code in this repository. It serves as the single source of truth for architecture, domain logic, coding standards, and inter-app communication.

---

## 1. System Overview & Architecture Paradigm

This codebase is a **Multi-Tenant Enterprise Resource Planning (ERP) System tailored for the Optics & Eyewear Sector**.

- **Monorepo / Clean Separation Structure**:
  - `osmBack/`: Django REST Framework Backend (Multi-tenant isolated schemas).
  - `osmFront/`: Next.js 15+ Frontend (App Router, Feature-Sliced Layout, App-Centric Navigation).
- **Isolation Strategy**: Database-level isolation using `django-tenants` (PostgreSQL schemas per tenant).
- **Core Business Pillars**:
  - Double-Entry Accounting Engine (COGS automatically calculated via Weighted Average Cost).
  - Stock & Inventory Movements linked directly to Sales and Accounting.
  - Optical Prescriptions & Medical Eye-Test Management.
  - Tenant & Branch Hierarchy Control.

---

## 2. Backend Architecture (`osmBack`)

### 2.1 Core Rules for Backend Code
1. **Fat Services, Thin Views**: NEVER write business logic directly inside DRF `views.py` or `serializers.py`. All business operations (creating invoices, processing returns, posting entries) MUST be placed inside dedicated `services.py` files (e.g., `apps/sales/services/invoice_service.py`, `apps/accounting/services/entry_service.py`).
2. **Double-Entry Accounting & COGS**:
   - Creating a sale invoice MUST create corresponding `StockMovement` records AND generate balanced accounting journal entries (`GeneralJournal` + `JournalLine`).
   - Cost of Goods Sold (COGS) is computed automatically using **Weighted Average Cost**.
   - Journal Entries MUST balance: `Debit COGS` + `Debit AR/Cash` = `Credit Sales Revenue` + `Credit Inventory` + `Credit VAT`.
3. **Async Task Execution**: Heavy tasks (PDF generation via `WeasyPrint`, batch reports, emails) MUST be offloaded to `Celery` workers using `Redis` as the message broker.

### 2.2 Backend Apps Structure & Inter-App Communication

```
osmBack/apps/
├── accounting/     # Chart of Accounts, Journal Entries, Ledger, COGS Service
├── api/            # Central OpenAPI Schemas & Routing
├── branches/       # Multi-Branch & Store Management
├── cms/            # Tenant CMS, Dynamic Content & Branding
├── crm/            # Customer Profiles, Loyalty & Interaction History
├── hrm/            # Employee Records, Roles & Payroll
├── prescriptions/  # Optical Prescriptions (Sph, Cyl, Axis, Add, PD)
├── products/       # Products, Lens Attributes, Categories, Stock Movement & WAC
├── sales/          # Invoices, Quotations, Payments, Orders, Sales Service
├── tenants/        # Tenant Schemas, Domain Mapping, Subscription Models
└── users/          # Authentication, Permissions & User Context
```

#### Inter-App Workflow Example (Processing a Sale Invoice):
```
[User Action: Create Invoice]
       │
       ▼
[sales.services.invoice_service] ──► Validates items & Stock availability
       │
       ├──────────────────────────► [products.models.StockMovement] Deducts stock & applies WAC
       │
       └──────────────────────────► [accounting.services.entry_service] Posts balanced Journal Entry
                                        - Dr. AR / Cash
                                        - Dr. Cost of Goods Sold (COGS)
                                        - Cr. Revenue
                                        - Cr. Inventory
                                        - Cr. Output VAT
```

---

## 3. Frontend Architecture (`osmFront`)

### 3.1 Framework & Pattern Standards
- **Framework**: Next.js 15+ (App Router, React 19).
- **Pattern**: Feature-Sliced Design inside `src/features/`.
- **Styling**: Vanilla CSS / Tailwind CSS with strict CSS variables for dynamic tenant themes.
- **Iconography**: Lucide React.
- **Animations**: Framer Motion.

### 3.2 App-Centric Navigation (`Aside.tsx` & `url.ts`)
The sidebar navigation is structured into **Independent Application Modules** (`APPS_MODULES` in `src/shared/constants/url.ts`) using an Accordion UX pattern:
- 📊 **Dashboard App**: Overview & Core Metrics.
- 🛒 **Sales App**: Invoices, Payments, Quotations.
- 👥 **CRM App**: Customers, Partners.
- 🩺 **Medical App**: Prescriptions, Eye Examinations.
- 📦 **Inventory App**: Products, Stock Adjustments, Suppliers.
- ⚙️ **Settings App**: Users, Roles, Tenant Configuration, Profile.

### 3.3 State Management Guidelines
- **UI & Global Layout State**: Use `Zustand` (e.g., `AsideContext`, Theme store).
- **Server Data State**: Use `@tanstack/react-query` for API fetching, caching, and mutations. Do NOT store server response data in global Zustand stores.

---

## 4. Frontend-Backend Integration & Tenant Routing

1. **Subdomain Context**: The application uses tenant subdomains (e.g., `store1.domain.com`).
   - Backend detects tenant context via `tenant_schemas` middleware.
   - Frontend detects subdomain via Next.js `middleware.ts` and passes `X-Tenant-Domain` header or uses relative pathing.
2. **API Communication**: All HTTP requests use central Axios instances configured with interceptors in `src/shared/api/`.
3. **Database Pooling**: Backend database configuration uses `CONN_MAX_AGE = 600` to optimize PostgreSQL connection pooling.

---

## 5. Strict AI Development Guardrails (Rules of Engagement)

When prompted to build or edit code in this codebase, **YOU MUST ADHERE TO THE FOLLOWING RULES**:

1. **NO RE-INVENTING THE WHEEL**: 
   - Before writing any new UI element, inspect `src/shared/components/` for existing reusable components (Inputs, Modals, Tables, Buttons).
   - Before writing custom API calls, check existing React Query hooks in `src/features/<feature_name>/hooks/`.
2. **STRICT LOGIC PLACEMENT**:
   - Never add business calculations (tax rates, discounts, stock deduction) in React components. Place them in custom backend services or utility helper functions.
3. **PRESERVE MULTI-TENANCY CONSTRAINTS**:
   - Never write raw SQL that bypasses `django-tenants` search paths.
   - Always query tenant models through standard Django ORM within tenant context.
4. **NO OUTDATED / LEGACY LIBRARIES**:
   - Do not install jQuery, Bootstrap, moment.js, or outdated state libraries. Use date-fns / native Intl for dates, and Zustand / React Query for state.
5. **PDF GENERATION RULE**:
   - Always render invoices/receipts using standard browser `window.print()` for immediate user printing, or Celery + `WeasyPrint` for server-side PDF exports.

---

## 6. Docker & DevOps Environments

- **Development**:
  - Run using: `docker-compose -f docker-compose.dev.yml up -d`
  - Includes: `tenant_db` (PostgreSQL), `redis` (Cache/Broker), `backend` (Django devserver), `celery_worker`, `frontend` (Next.js dev).
- **Production**:
  - Run using: `docker-compose -f docker-compose.prod.yml up -d --build`
  - Includes: Standalone Next.js runner, Gunicorn WSGI backend server, resource limits.

---

## 7. Dynamic Form Generator & Zod Schema Automation

The frontend features a metadata-driven dynamic form engine that generates input layouts automatically from backend OpenAPI schemas.

### 7.1 Code Generation & Compilation Fixes
1. **Generation Command**:
   - Running `bun gen-zod` downloads the latest OpenAPI schema from the running Django instance and outputs `src/shared/api/schemas.ts`.
2. **Post-Processing Patching**:
   - To bypass compiler limits (such as `TS2589: Type instantiation is excessively deep`) and fix code formatting, the post-processing script [fix-zod-schemas.js](file:///c:/code/optics_tenant/osmFront/scripts/fix-zod-schemas.js) runs automatically as part of `gen-zod`.
   - It exports the `endpoints` variable, casts the Zodios instantiation arguments as `any`, and replaces `z.instanceof(File)` with custom file validators.
   - **Crucial Rule**: NEVER run `openapi-zod-client` without running `node scripts/fix-zod-schemas.js` immediately afterwards.

### 7.2 Dynamic Form Engine Flow
To register and render a new entity page:
1. **Form Config**: Add the entity metadata configuration to [formsConfig.ts](file:///c:/code/optics_tenant/osmFront/src/shared/constants/formsConfig.ts) specifying:
   - `schemaName`: The name of the Zod schema exported in `schemas.ts` (e.g. `BranchShiftTemplateRequest`).
   - `listAlias`, `createAlias`, `retrieveAlias`, `partialUpdateAlias`, `destroyAlias`: The corresponding Zodios endpoint aliases.
   - `fields`: The columns to display in lists.
   - `detailsField`: The fields to show in the view details modal.
2. **Relations mapping**: If the model has foreign keys, register their value and search field lookups in [generatFormConfig.ts](file:///c:/code/optics_tenant/osmFront/src/features/formGenerator/constants/generatFormConfig.ts#L34) inside the `relationshipConfigs` object.
3. **Translation Namespace**: Map the new entity to its translation JSON directory in [entityTranslationMap.ts](file:///c:/code/optics_tenant/osmFront/src/shared/constants/entityTranslationMap.ts).
4. **Field Translation & Localization**: Add translated labels for all form inputs in both English and Arabic operations/settings JSON translation files (e.g. `operations.json` or `settings.json`).
5. **Dashboard Sidebar Navigation**: Insert the new route to the sidebar navigation list in [index.ts](file:///c:/code/optics_tenant/osmFront/src/features/dashboard/constants/index.ts).

---
*This document is automatically referenced by AI Agents during pair programming.*
