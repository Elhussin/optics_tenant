# 🐳 دليل بيئات Docker (Dev & Prod Environments)

تم فصل بيئة Docker إلى ملفين مستقلين لتلبية متطلبات التطوير المحلي السريع وبيئة الإنتاج عالية الأداء.

---

## 🛠️ 1. بيئة التطوير (Development)
تتميز هذه البيئة بدعم **التحديث الحي للأكواد (Hot Reloading)** وربط المجلدات المباشر (`Volumes`).

### الخدمات المضمنة:
- `tenant_db`: خادم PostgreSQL 16.
- `redis`: خادم Redis 7.
- `backend`: خادم Django بمود `runserver`.
- `celery_worker`: عامل Celery للتطوير.
- `frontend`: خادم Next.js بمود `npm run dev`.

### امر التشغيل:
```bash
docker-compose -f docker-compose.dev.yml up -d
```

---

## 🚀 2. بيئة الإنتاج (Production)
تتميز هذه البيئة بالأداء العالي، واستخدام `Gunicorn` ونسخة Next.js المستقلة (`standalone`) مع تحديد الموارد (CPU/RAM Limits).

### امر التشغيل:
```bash
docker-compose -f docker-compose.prod.yml up -d --build
```
