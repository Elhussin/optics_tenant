# 🚀 الدليل الشامل لتشغيل منصة البصريات (Full System Startup Guide)

يقدم هذا الدليل خطوات تفصيلية موحدة لتشغيل جميع سيرفرات ومكونات منصة البصريات (`Optics ERP Platform`)، سواء في بيئة التطوير المحلية (Local Development) أو باستخدام الحاويات (Docker Dev & Prod).

---

## 🏗️ مكونات المنظومة (Architecture Components)

تتكون المنظومة من **5 سيرفرات/خدمات أساسية** يجب تشغيلها ليعمل التطبيق بكفاءة 100%:

1. 🐘 **PostgreSQL (Database):** قاعدة البيانات الرئيسية التي تخزن بيانات المستأجرين والفروع.
2. 🔴 **Redis (Cache & Message Broker):** وسيط الرسائل والذاكرة المؤقتة لنظام Celery.
3. ⚙️ **Django Backend (API Server):** الخادم الخلفي لخدمات المبيعات والمحاسبة والمستأجرين (`Port 8000`).
4. ⚡ **Celery Worker (Task Queue):** خادم معالجة المهام الثقيلة في الخلفية (استخراج الفواتير والـ PDFs والتقارير).
5. 🎨 **Next.js Frontend (Web App):** خادم الواجهة الأمامية التفاعلية للمستخدمين (`Port 3000`).
6. 📚 **MkDocs Documentation:** خادم التوثيق التفاعلي (`Port 8000` محلياً أو `Port 8008` داخل Docker).

---

## 💻 الطريقة الأولى: التشغيل المحلي بدون Docker (Local Native Setup)

إذا كنت تود تطوير وتعديل الكود مباشرة على جهازك دون حاويات:

### 1. تشغيل قواعد البيانات و Redis
تأكد من تشغيل خادم PostgreSQL وخادم Redis على جهازك.

### 2. تشغيل الواجهة الخلفية (Django Backend Server)
افتح نافذة **Terminal (1)**:
```powershell
cd c:\code\optics_tenant\osmBack
pdm install
pdm run python manage.py migrate
pdm run python manage.py runserver 0.0.0.0:8000
```
- الرابط: `http://localhost:8000/api/`

---

### 3. تشغيل معالج المهام الخلفية (Celery Worker Server)
افتح نافذة **Terminal (2)**:
```powershell
cd c:\code\optics_tenant\osmBack
pdm run celery -A optics_tenant worker -l info --pool=solo
```
> [!IMPORTANT]
> المعامل `--pool=solo` ضروري جداً على نظام التشغيل Windows لتجنب تعليق Celery.

---

### 4. تشغيل الواجهة الأمامية (Next.js Frontend Server)
افتح نافذة **Terminal (3)**:
```powershell
cd c:\code\optics_tenant\osmFront
npm install
npm run dev
```
- الرابط: `http://localhost:3000`

---

### 5. (اختياري) تشغيل خادم التوثيق (MkDocs Server)
افتح نافذة **Terminal (4)**:
```powershell
cd c:\code\optics_tenant\osmBack
pdm run mkdocs serve 
```
- الرابط: `http://127.0.0.1:8000`

---

## 🐳 الطريقة الثانية: التشغيل الحاوي بنقرة واحدة (Docker Compose)

توفر المنظومة خيار تشغيل جميع السيرفرات الخمسة المذكورة أعلاه تلقائياً بأمر واحد:

### أ. بيئة التطوير (Development Environment - with Hot Reloading):
تتميز هذه البيئة بدعم المتابعة التلقائية للتعديلات في الكود فور حفظها:
```powershell
cd c:\code\optics_tenant
docker-compose -f docker-compose.dev.yml up -d
```

---

### ب. بيئة الإنتاج الفعلية (Production Environment):
بيئة عالية الأداء تعتمد على `Gunicorn` ونسخة Next.js المستقلة (`standalone`):
```powershell
cd c:\code\optics_tenant
docker-compose -f docker-compose.prod.yml up -d --build
```

---

## 🛠️ أوامر الصيانة وإعادة التشغيل السريعة

- **فحص حالة الحاويات:** `docker-compose -f docker-compose.dev.yml ps`
- **إيقاف الحاويات:** `docker-compose -f docker-compose.dev.yml down`
- **مشاهدة سجل الأخطاء (Logs):** `docker-compose -f docker-compose.dev.yml logs -f backend`
