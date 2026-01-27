# Welcome to EyeCare Platform Documentation 🚀

Welcome to the comprehensive knowledge center for the **EyeCare Optics Management System (OMS)**. This documentation provides everything you need to understand, develop, and deploy the system.

## 📌 System Overview
**EyeCare** is a state-of-the-art SaaS platform designed for optics retailers. It supports **Multi-tenancy**, **Financial Accounting**, **CRM**, and **Inventory Management** out of the box, ensuring data isolation and high performance for multiple corporate clients properly.

---

## 🛠 Documentation Sections

<div class="grid cards" markdown>

-   :material-rocket-launch:{ .lg .middle } __Quick Start__

    Learn how to install and run the system locally in under 5 minutes.

    [:octicons-arrow-right-24: Get Started](./getting-started/installation.md)

-   :material-office-building:{ .lg .middle } __Architecture & Core__

    Deep dive into Multi-tenancy, Authentication, RBAC, and System Design.

    [:octicons-arrow-right-24: Explore Architecture](./architecture/overview.md)

-   :material-api:{ .lg .middle } __API Reference__

    Complete documentation for standard and mobile-optimized Endpoints.

    [:octicons-arrow-right-24: View APIs](./api/swagger.md)

-   :material-calculator:{ .lg .middle } __Business Modules__

    Detailed guides for Accounting, Sales, Products, and CRM.

    [:octicons-arrow-right-24: Explore Modules](./modules/accounting.md)

</div>

---

## 🧱 Project Structure

```text
optics_tenant/
├── osmBack/              # Backend (Django REST Framework)
│   ├── apps/             # Business Logic Modules (Accounting, Sales, etc.)
│   ├── core/             # Shared Utilities (Auth, Caching, Middleware)
│   └── docs/             # Documentation Source
└── osmFront/             # Frontend (Next.js + Tailwind)
    └── src/              # UI Components & Logic
```

## 🚀 Next Steps
If you are a new developer on the team, we recommend starting with the [Installation & Setup](./getting-started/installation.md) guide.
