# optics_tenant
# EyeCare Platform (Next.js + Django)

A full-stack project for managing and testing eye prescriptions using **Next.js** as the frontend and **Django REST Framework** as the backend.

---

## 🚀 Features
- **Next.js (App Router)** for the frontend interface.
- **Django REST Framework** for customer and prescription management.
- Clear separation of **static** and **media**:
  - `/public` in Next.js for fixed frontend assets (logo, icons).
  - `/media` in Django for user-uploaded files.

---

## 📂 Project Structure

```bash
project-root/
│
├── backend/                 # Django Backend
│   ├── manage.py
│   ├── requirements.txt
│   ├── core/                # Django project settings
│   ├── apps/                # Django apps (customers, prescriptions, etc.)
│   ├── media/               # Uploaded user files
│   └── static/              # Collected static files
│
├── frontend/                # Next.js Frontend
│   ├── app/                 # App Router (pages, layouts, routes)
│   ├── components/          # React components
│   ├── public/              # Static assets (logo, icons, etc.)
│   │   ├── favicon.ico
│   │   ├── logo.png
│   │   └── aside.png
│   ├── styles/              # Tailwind/CSS styles
│   ├── package.json
│   └── tsconfig.json
│
├── docs/                    # Optional documentation
│   ├── DEPLOYMENT.md
│   └── API.md
│
└── README.md
```
## Start App

```bash
pdm install
pdm run python manage.py collectstatic
pdm run python manage.py makemigrations
pdm run python manage.py createsuperuser
pdm run python manage.py migrate_all_tenants
pdm run python manage.py migrate

pdm run  python manage.py create_tenant_superuser --schema_name public --username admin --email admin@public.com
#or pdm run  python manage.py create_tenant_superuser --schema_name public
# pdm run python manage.py createsuperuser
pdm run python manage.py runserver
```

## Create Tenant

```bash
pdm run python manage.py create_public_tenant
```

## Add Development Tenant

```bash
pdm run python manage.py import_csv_with_foreign --config data/csv_config.json --schema public
```

## Start Frontend
```bash
bun install
bun run dev
bun run build
bun run start
```
