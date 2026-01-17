# مرحباً بك في توثيق منصة EyeCare 🚀

مرحباً بك في المركز المعرفي الشامل لنظام إدارة البصريات (Optics Management System). هذا الموقع يحتوي على كل ما تحتاجه لفهم، تطوير، وتشغيل النظام.

## 📌 نبذة عن النظام
نظام **EyeCare** هو منصة متكاملة لإدارة محلات البصريات، تدعم نظام تعدد المستأجرين (Multi-tenancy)، المحاسبة المالية، إدارة العملاء (CRM)، وإدارة المخزون.

---

## 🛠 الأجزاء الرئيسية للتوثيق

<div class="grid cards" markdown>

-   :material-rocket-launch:{ .lg .middle } __البداية السريعة__

    تعلم كيفية تثبيت وتشغيل النظام في أقل من 5 دقائق.

    [:octicons-arrow-right-24: ابدأ الآن](./getting-started/installation.md)

-   :material-office-building:{ .lg .middle } __بنية النظام (Architecture)__

    فهم كيف يعمل نظام الـ Multi-tenancy والربط بين الفرونت آند والباك آند.

    [:octicons-arrow-right-24: استكشف الهيكلية](./architecture/overview.md)

-   :material-api:{ .lg .middle } __مرجع الـ API__

    توثيق كامل لجميع الـ Endpoints باستخدام Swagger و Redoc.

    [:octicons-arrow-right-24: عرض الـ API](./api/swagger.md)

-   :material-calculator:{ .lg .middle } __النظام المحاسبي__

    شرح تفصيلي لدليل الحسابات، قيود اليومية، والتقارير المالية.

    [:octicons-arrow-right-24: الدليل المحاسبي](./modules/accounting.md)

</div>

---

## 🧱 هيكلية المجلدات (Project Directory)

```text
optics_tenant/
├── osmBack/              # Backend (Django REST Framework)
│   ├── apps/             # تطبيقات النظام (Core Modules)
│   ├── core/             # الإعدادات الرئيسية
│   └── docs/             # ملفات التوثيق التي تقرأها الآن
└── osmFront/             # Frontend (Next.js + Tailwind)
    └── src/              # كود الواجهات والمكونات
```

## 🚀 الخطوات القادمة
إذا كنت مطوراً جديداً في المشروع، ننصحك بالبدء بصفحة [التثبيت والإعداد](./getting-started/installation.md).
