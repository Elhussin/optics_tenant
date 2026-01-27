# Multi-Tenancy (Tenants) 🏢

The `tenants` app is the core of the SaaS architecture, managing the isolation between different client organizations.

## 🏗️ Schema-Based Isolation
We use **PostgreSQL Schemas** to separate data.
-   **Public Schema**: Shared data.
    -   `Tenant` Model: Stores company metadata (Name, Domain, Subscription Plan).
    -   `User` Model: Users are global but associated with specific tenants.
-   **Tenant Schemas** (`tenant_1`, `tenant_2`...):
    -   Isolated tables for `Orders`, `Products`, `Customers`, etc.

## 🔄 Tenant Middleware
The `core.middleware.TenantMiddleware` is the gatekeeper of every request.

**Workflow:**
1.  **Request Arrival**: Middleware intercepts the request.
2.  **Identification**: Looks for `X-Tenant-ID` header or Subdomain.
3.  **Validation**: Checks if the Tenant exists and is Active.
4.  **Routing**:
    -   Sets the PostgreSQL search path to `SET search_path = tenant_schema`.
    -   Attaches `request.tenant` object.
5.  **Execution**: The view processes the request ensuring it only sees that tenant's data.

## 📅 Subscription Plans
-   **Limits Enforced**:
    -   Max Users.
    -   Max Branches.
    -   Storage Limit.
-   **Middleware Check**: `PlanValidationMiddleware` blocks resource creation if limits are exceeded.
