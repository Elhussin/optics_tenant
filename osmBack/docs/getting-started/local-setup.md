# 🚀 دليل التشغيل المحلي (Local Setup Guide)

يشرح هذا الدليل كيفية تشغيل المنظومة بكافة مكوناتها على جهاز التطوير المحلي.

---

## 📋 المكونات المطلوبة
1. **Python 3.12+** مع مدير الحزم `pdm`.
2. **Node.js 20+** مع `npm`.
3. **PostgreSQL 16** (تدعم Schema Creation).
4. **Redis Server** (كـ Broker لـ Celery).

---

## 🛠️ خطوات التشغيل المرتبة

### 1. تشغيل قواعد البيانات و Redis
تأكد من تشغيل خادم PostgreSQL على البورت `5432` وخادم Redis على البورت `6379`.

### 2. تشغيل الواجهة الخلفية (Django Backend)
```bash
cd osmBack
pdm install
pdm run python manage.py migrate
pdm run python manage.py runserver 0.0.0.0:8000
```

### 3. تشغيل معالج المهام الخلفية (Celery Worker)
في نافذة Terminal جديدة:
```bash
cd osmBack
# ملاحظة: --pool=solo ضروري لنظام تشغيل Windows
pdm run celery -A optics_tenant worker -l info --pool=solo
```

### 4. تشغيل الواجهة الأمامية (Next.js Frontend)
في نافذة Terminal جديدة:
```bash
cd osmFront
npm install
npm run dev
```

---

## 🌐 روابط الوصول المحلية
- **الواجهة الأمامية:** `http://localhost:3000`
- **الواجهة الخلفية (API):** `http://localhost:8000/api/`
- **موقع التوثيق (MkDocs):** `http://127.0.0.1:8000` (عند تشغيل `pdm run mkdocs serve`).
