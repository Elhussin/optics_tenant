# System Architecture 🏗️

EyeCare is architected as a **Multi-tenant SaaS Platform**, allowing multiple organizations to run on a single instance while maintaining strict data isolation.

## 📐 High-Level Overview

The system consists of two main components:

1.  **Back-end (Django & DRF)**:
    -   Handles business logic, data persistence, and complex calculations.
    -   Implements **schema-based multi-tenancy**.
    -   Exposes a comprehensive RESTful API.

2.  **Front-end (Next.js)**:
    -   Modern, responsive UI.
    -   State management via Redux/Zustand.
    -   Bilingual support (RTL/LTR).

---

## 🏗️ Core Layer Architecture

The `core/` module is the backbone of the system, providing shared services used by all business apps.

### 1. Unified Error Handling
Located in `core/exceptions.py`. The system uses a centralized exception handler to ensure consistent JSON error responses.
-   **Structure**: `{ "error": { "code": "...", "message": "...", "details": ... } }`
-   **Localization**: All error messages are translatable (`gettext`).

### 2. Caching Strategy
Located in `core/caching.py`.
-   **Decorator-based**: `@cache_result(ttl=300)` for easy function-level caching.
-   **CacheManager**: A central interface for common cache keys (e.g., dashboard stats).
-   **Backends**: Supports Redis (Production) and LocMem (Development).

### 3. Authentication & Permissions
Located in `core/permissions/`.
-   **JWT**: Stateless authentication using JSON Web Tokens.
-   **RoleOrPermissionRequired**: A custom decorator/permission class allowing fine-grained access control based on Roles (e.g., Manager) or Specific Permissions (e.g., `view_dashboard`).

### 4. Query Optimization
Located in `core/query_optimizer.py`.
-   Automatically handles `select_related` and `prefetch_related` based on serializer fields to preventing N+1 query issues.

---

## 🔄 Data Flow & Multi-tenancy

```mermaid
graph LR
    A[Client Request] --> B[TenantMiddleware]
    B -- Extract Tenant from Host/Header --> C{Tenant Exists?}
    C -- Yes --> D[Set Postgres Schema]
    C -- No --> E[Return 404]
    D --> F[Django Views/API]
    F --> G[Database (Tenant Schema)]
```

### Schema Isolation
Each tenant (company) has its own **PostgreSQL Schema**.
-   **Public Schema**: Contains shared data like `Tenants` and `Users`.
-   **Tenant Schema**: Contains business data (Products, Orders, Accounting).

---

## 🛡️ Security Measures
-   **Middleware Validation**: `PlanValidationMiddleware` ensures tenants don't exceed their plan limits (e.g., max users, branches).
-   **Input Sanitization**: All inputs are validated via DRF Serializers.
-   **Audit Trails**: Critical actions (like Journal Entries) are immutable and tracked.
