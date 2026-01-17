# دليل التثبيت والإعداد ⚙️

يركز نظام EyeCare على سهولة البدء. اتبع الخطوات التالية لتشغيل النظام في بيئتك المحلية.

## 📋 المتطلبات الأساسية
- **Python**: 3.12 أو أحدث.
- **Node.js**: 18 أو أحدث (للواجهة الأمامية).
- **PostgreSQL**: مع دعم `hstore` (مطلوب لـ django-tenants).
- **PDM**: لإدارة حزم البايثون.
- **Bun**: لإدارة حزم الواجهة الأمامية.

---

## 🚀 البداية السريعة (Back-end)

### 1. تثبيت الاعتمادات
```bash
cd osmBack
pdm install
```

### 2. إعداد قاعدة البيانات
قم بإنشاء قاعدة بيانات في PostgreSQL، ثم قم بتهجير الجداول الأساسية:
```bash
pdm run python manage.py migrate_schemas --shared
pdm run python manage.py migrate_schemas --tenant
```

### 3. إنشاء المستأجر العام (Public)
```bash
pdm run python manage.py create_public_tenant
```

### 4. تشغيل السيرفر
```bash
pdm run python manage.py runserver
```

---

## 💻 تشغيل الواجهة الأمامية (Front-end)

```bash
cd osmFront
bun install
bun run dev
```

---

## 📖 تشغيل التوثيق (Help Center)
لمشاهدة صفحة التوثيق التي تقرأها الآن محلياً:
```bash
cd osmBack
pdm run mkdocs serve
```
سيظهر التوثيق على الرابط: [http://localhost:8000](http://localhost:8000)
