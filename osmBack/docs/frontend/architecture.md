# 🎨 معمارية الواجهة الأمامية (Frontend Architecture)

تعتمد الواجهة الأمامية لنظام `osmFront` على معمارية modern Next.js 15 مع تنظيم معتمد على الـ Feature-Sliced Design.

---

## 📁 هيكلة المجلدات (`src/`)

```
osmFront/src/
├── app/               # Next.js App Router Pages & Layouts & i18n
├── features/          # Feature-Sliced Application Modules
│   ├── accounting/    # شاشات وتقارير المحاسبة
│   ├── invoices/      # شاشات وإدارة الفواتير
│   ├── products/      # شاشات كارت المنتجات والمخزون
│   ├── prescription/  # شاشات فحص النظر والوصفات
│   └── ...
├── shared/            # المكونات والخدمات الموزعة
│   ├── components/    # مكتبة المكونات الجاهزة (Buttons, Modals, Inputs)
│   ├── api/           # إعدادات Axios و React Query
│   ├── constants/     # الثوابت ومصفوفات التنقل (url.ts)
│   └── utils/         # الدوال المساعدة
```

---

## 🎨 الهوية البصرية ونظام التصميم (Design System)

- **Glassmorphism & Gradients:** استخدام مظهر عصري وخفي مع إضاءات لونية وخلفيات ضبابية.
- **RTL & Localization:** دعم كامل للغة العربية والإنجليزية من خلال `next-intl`.
- **Animations:** حركات تفاعلية سلسة باستخدام `framer-motion`.
