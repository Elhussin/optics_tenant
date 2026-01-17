---
description: خطة تطوير الواجهة الأمامية - Frontend Development Roadmap
---

# 🎯 خطة تطوير الواجهة الأمامية (Frontend)

## تاريخ التحليل: 2026-01-10

---

## 📊 التقييم الحالي للمشروع

### ✅ نقاط القوة

| المعيار | التقييم | ملاحظات |
|---------|---------|---------|
| **Next.js 15** | ⭐⭐⭐⭐⭐ | أحدث إصدار مع Turbopack |
| **React 19** | ⭐⭐⭐⭐⭐ | أحدث إصدار |
| **TypeScript** | ⭐⭐⭐⭐ | استخدام جيد مع بعض التحسينات الممكنة |
| **Tailwind CSS 4** | ⭐⭐⭐⭐⭐ | أحدث إصدار |
| **Zod + Zodios** | ⭐⭐⭐⭐⭐ | تكامل ممتاز مع OpenAPI |
| **i18n** | ⭐⭐⭐⭐ | next-intl مع دعم RTL |
| **State Management** | ⭐⭐⭐⭐ | Zustand للحالة المحلية |

### ⚠️ نقاط تحتاج تحسين

| المعيار | التقييم | المشكلة |
|---------|---------|---------|
| **تكامل مع Backend الجديد** | ⭐⭐ | APIs جديدة غير مدعومة |
| **UI/UX Design** | ⭐⭐⭐ | تصميم جيد لكن يحتاج تحديث للحداثة |
| **Mobile Experience** | ⭐⭐ | Responsive لكن غير محسن للموبايل |
| **Performance** | ⭐⭐⭐ | يحتاج lazy loading وoptimizations |
| **Error Handling** | ⭐⭐⭐ | أساسي، يحتاج تحسين |
| **Testing** | ⭐ | لا يوجد اختبارات |

### 📈 التقييم العام: 6.5/10

---

## 🏗️ البنية الحالية

```
src/
├── app/                    # Next.js App Router
│   └── [locale]/          # دعم اللغات
│       ├── dashboard/     # لوحة التحكم
│       ├── auth/          # المصادقة
│       └── payment/       # الدفع
├── features/              # Feature-based modules
│   ├── auth/             # ✅ جيد
│   ├── orders/           # ⚠️ يحتاج تحديث
│   ├── inventory/        # ⚠️ يحتاج تحديث
│   ├── products/         # ✅ جيد
│   ├── payment/          # ⚠️ ناقص
│   ├── prescription/     # ✅ جيد
│   └── reports/          # ⚠️ ناقص جداً
├── shared/               # الموارد المشتركة
│   ├── api/             # Zodios client
│   ├── components/      # UI Components
│   ├── hooks/           # Custom hooks
│   └── utils/           # Utilities
└── styles/              # CSS files
```

---

## 🎯 خطة التطوير

### المرحلة 1: تحديث الـ API Schema (أولوية عليا) ✅ مكتملة

**الهدف:** تحديث schemas.ts لتشمل جميع APIs الجديدة

**المهام:**
- [x] تشغيل `bun run gen-zod-client` لتوليد schemas جديدة
- [x] إضافة endpoints للـ Wholesale
- [x] إضافة endpoints للـ Accounting
- [x] إضافة endpoints للـ Partners/Insurance
- [x] إضافة endpoints للـ Mobile APIs
- [x] إضافة endpoints للـ Payments/Installments

**الملفات:**
- `src/shared/api/schemas.ts` ✅ تم التحديث

**الوقت المتوقع:** 2-3 ساعات ✅ مكتمل

---

### المرحلة 2: إضافة دعم الجملة (Wholesale) ✅ مكتملة

**الهدف:** واجهات البيع بالجملة

**المهام:**
- [x] إنشاء `features/wholesale/` module
- [x] صفحة عملاء الجملة `WholesaleCustomers`
- [x] صفحة كشف حساب العميل `CustomerStatementPage`
- [x] لوحة تحكم الجملة `WholesaleDashboard`
- [x] مكون التسعير الديناميكي `PricingCalculator`
- [x] مكون بطاقة الائتمان `CustomerCreditCard`
- [x] مكون جدول كشف الحساب `CustomerStatementTable`
- [x] Hooks للـ APIs `useWholesale.ts`
- [x] أنواع TypeScript `wholesale.types.ts`
- [x] إضافة الـ Routes في Dashboard
- [x] إضافة الترجمات العربية

**الملفات المُنشأة:**
```
features/wholesale/
├── index.ts
├── types/
│   └── wholesale.types.ts
├── hooks/
│   └── useWholesale.ts
├── components/
│   ├── CustomerCreditCard.tsx
│   ├── PricingCalculator.tsx
│   └── CustomerStatementTable.tsx
└── pages/
    ├── WholesaleDashboard.tsx
    ├── WholesaleCustomers.tsx
    └── CustomerStatementPage.tsx

app/[locale]/dashboard/wholesale/
├── page.tsx
├── customers/page.tsx
└── statement/[customerId]/page.tsx
```

**الوقت المتوقع:** 8-10 ساعات ✅ مكتمل

---

### المرحلة 3: إضافة دعم المحاسبة (Accounting) ✅ مكتملة

**الهدف:** واجهات المحاسبة والتقارير المالية

**المهام:**
- [x] إنشاء `features/accounting/` module
- [x] صفحة دليل الحسابات `ChartOfAccountsPage`
- [x] صفحة قيود اليومية `JournalEntriesPage`
- [x] صفحة التقارير المالية `FinancialReportsPage`
- [x] مكون شجرة الحسابات `AccountTree`
- [x] مكون نموذج قيد اليومية `JournalEntryForm`
- [x] مكون بطاقات التقارير المالية `FinancialReportCard`
- [x] Hooks للـ APIs `useAccounting.ts`
- [x] أنواع TypeScript `accounting.types.ts`
- [x] إضافة الـ Routes في Dashboard

**الملفات المُنشأة:**
```
features/accounting/
├── index.ts
├── types/
│   └── accounting.types.ts
├── hooks/
│   └── useAccounting.ts
├── components/
│   ├── AccountTree.tsx
│   ├── JournalEntryForm.tsx
│   └── FinancialReportCard.tsx
└── pages/
    ├── ChartOfAccountsPage.tsx
    ├── JournalEntriesPage.tsx
    └── FinancialReportsPage.tsx

app/[locale]/dashboard/accounting/
├── page.tsx
├── chart-of-accounts/page.tsx
├── journal-entries/page.tsx
└── reports/page.tsx
```

**الوقت المتوقع:** 10-12 ساعة ✅ مكتمل


---

### المرحلة 4: إضافة دعم الشركاء والتأمين ✅ مكتملة

**الهدف:** واجهات إدارة الشركاء والتأمين

**المهام:**
- [x] إنشاء `features/partners/` module
- [x] صفحة إدارة الشركاء `PartnersListPage`
- [x] صفحة مطالبات التأمين `InsuranceClaimsPage`
- [x] مكون بطاقة الشريك `PartnerCard`
- [x] مكون شارة حالة المطالبة `ClaimStatusBadge`
- [x] مكون حاسبة تقسيم الدفع `PaymentSplitCalculator`
- [x] Hooks للـ APIs `usePartners.ts`
- [x] أنواع TypeScript `partners.types.ts`
- [x] إضافة الـ Routes في Dashboard

**الملفات المُنشأة:**
```
features/partners/
├── index.ts
├── types/
│   └── partners.types.ts
├── hooks/
│   └── usePartners.ts
├── components/
│   ├── PartnerCard.tsx
│   ├── PaymentSplitCalculator.tsx
│   └── ClaimStatusBadge.tsx
└── pages/
    ├── PartnersListPage.tsx
    └── InsuranceClaimsPage.tsx

app/[locale]/dashboard/partners/
├── page.tsx
└── claims/page.tsx
```

**الوقت المتوقع:** 6-8 ساعات ✅ مكتمل


---

### المرحلة 5: تحديث نظام الدفع (Payments) ✅ مكتملة

**الهدف:** دعم طرق الدفع الجديدة

**المهام:**
- [x] إنشاء `features/payment/` module
- [x] إضافة دعم Tabby/Tamara BNPL
- [x] إضافة نظام الأقساط `InstallmentsPage`
- [x] مكون بطاقة القسط `InstallmentCard`
- [x] مكون محدد طريقة الدفع `PaymentMethodSelector`
- [x] أزرار الدفع الآجل `BNPLButton`
- [x] صفحة Callback من BNPL `BNPLCallbackPage`
- [x] Hooks للـ APIs `usePayment.ts`
- [x] أنواع TypeScript `payment.types.ts`
- [x] إضافة الـ Routes

**الملفات المُنشأة:**
```
features/payment/
├── index.ts
├── types/
│   └── payment.types.ts
├── hooks/
│   └── usePayment.ts
├── components/
│   ├── BNPLButton.tsx
│   ├── InstallmentCard.tsx
│   └── PaymentMethodSelector.tsx
└── pages/
    ├── InstallmentsPage.tsx
    └── BNPLCallbackPage.tsx

app/[locale]/dashboard/payment/installments/page.tsx
app/[locale]/payment/callback/[provider]/page.tsx
```

**الوقت المتوقع:** 6-8 ساعات ✅ مكتمل


---

### المرحلة 6: تحديث التقارير (Reports) ✅ مكتملة

**الهدف:** تقارير شاملة ومتكاملة

**المهام:**
- [x] إنشاء `features/reports/` module
- [x] لوحة تحكم التقارير `ReportsDashboard`
- [x] تقرير المبيعات المتقدم `SalesReportPage`
- [x] تقرير الذمم المدينة `ReceivablesReportPage`
- [x] مكون محدد التاريخ `DateRangePicker`
- [x] مكونات البطاقات `ReportCard`
- [x] مكونات الرسوم البيانية `ReportChart` (Bar, Line, Donut)
- [x] Hooks للـ APIs `useReports.ts`
- [x] أنواع TypeScript `reports.types.ts`
- [x] إضافة الـ Routes

**الملفات المُنشأة:**
```
features/reports/
├── index.ts
├── types/
│   └── reports.types.ts
├── hooks/
│   └── useReports.ts
├── components/
│   ├── ReportCard.tsx
│   ├── ReportChart.tsx
│   └── DateRangePicker.tsx
└── pages/
    ├── ReportsDashboard.tsx
    ├── SalesReportPage.tsx
    └── ReceivablesReportPage.tsx

app/[locale]/dashboard/reports/
├── page.tsx
├── sales/page.tsx
└── receivables/page.tsx
```

**الوقت المتوقع:** 8-10 ساعات ✅ مكتمل


---

### المرحلة 7: تحسين UI/UX ✅ مكتملة

**الهدف:** تصميم عصري ومتطور

**المهام:**
- [x] إنشاء `animations.css` مع Keyframes و Animation utilities
- [x] إنشاء `ui-components.css` مع Enhanced UI classes
- [x] إضافة Micro-animations (fadeIn, scaleIn, slideIn, etc.)
- [x] إضافة Glassmorphism effects (glass, glass-dark, glass-auto)
- [x] إضافة Loading skeletons (skeleton, skeleton-card, etc.)
- [x] تحسين Buttons (btn-primary, btn-secondary, btn-fab)
- [x] تحسين Cards (card-interactive, card-glass, card-stat)
- [x] إضافة Badges و Avatars و Progress bars
- [x] إضافة Hover effects (hover-lift, hover-scale, hover-glow)
- [x] إضافة Focus states و Gradient utilities
- [x] إضافة Shadow utilities و Dark mode compatible
- [x] تحسين Fonts (500, 600 weights)

**الملفات المُنشأة/المحدثة:**
```
styles/
├── app.css            # تحديث imports
├── animations.css     # جديد - 450+ سطر
│   ├── Keyframe Animations (15+)
│   ├── Animation Utilities
│   ├── Transition Classes
│   ├── Hover Effects
│   ├── Glassmorphism
│   ├── Loading Skeletons
│   ├── Focus States
│   ├── Gradients
│   ├── Shadows
│   └── Scrollbar Styling
├── ui-components.css  # جديد - 350+ سطر
│   ├── Card Variants
│   ├── Button Variants
│   ├── Input Enhancements
│   ├── Badges
│   ├── Avatars
│   ├── Progress Bars
│   ├── Tooltips
│   ├── Tabs
│   ├── Dividers
│   ├── Page Header
│   ├── Empty States
│   └── Loading Spinner
└── theme.css          # موجود (6 themes)
```

**الوقت المتوقع:** 6-8 ساعات ✅ مكتمل

**React Components المُنشأة:**
```
shared/components/ui/
├── Skeleton.tsx        # Skeleton + SkeletonGroup
├── GlassCard.tsx       # GlassCard + Header + Footer
├── Badge.tsx           # Badge + CountBadge + StatusBadge
├── Avatar.tsx          # Avatar + AvatarGroup
├── EmptyState.tsx      # EmptyState + CompactEmptyState
└── Spinner.tsx         # Spinner + PageLoading + LoadingOverlay
```



---

### المرحلة 8: تحسين الأداء ✅ مكتملة

**الهدف:** تطبيق أسرع وأخف

**المهام:**
- [x] إنشاء `useInfiniteScroll` hook مع Intersection Observer
- [x] إنشاء `useDebounce` و `useThrottledCallback` hooks
- [x] إنشاء `useLocalStorage` و `useCachedValue` hooks
- [x] إنشاء `VirtualList` و `VirtualGrid` components
- [x] إنشاء `LazyComponent` و `createLazyComponent`
- [x] إنشاء `LazyImage` مع blur placeholder
- [x] إنشاء `Deferred` و `RenderWhenVisible` components

**الملفات المُنشأة:**
```
shared/
├── hooks/
│   ├── useInfiniteScroll.ts   # Infinite scroll + scroll position
│   ├── useDebounce.ts         # Debounce, throttle, search
│   └── useLocalStorage.ts     # localStorage, sessionStorage, cache
└── components/
    ├── VirtualList.tsx        # VirtualList + VirtualGrid
    └── LazyComponent.tsx      # Lazy loading utilities
```

**الوقت المتوقع:** 6-8 ساعات ✅ مكتمل


---

### المرحلة 9: دعم الموبايل ✅ مكتملة

**الهدف:** تجربة موبايل محسنة

**المهام:**
- [x] إضافة Bottom Navigation
- [x] تحسين Touch interactions (Swipeable Cards)
- [x] PWA Support (manifest.json, sw.js)
- [x] Offline-first (useOfflineSync, IndexedDB)
- [x] صفحة عدم الاتصال (offline.html)
- [x] Mobile Dashboard
- [x] Pull to Refresh
- [x] Mobile Header & Drawer

**الملفات المُنشأة:**
```
features/mobile/
├── hooks/
│   ├── useMobile.ts         # Device detection, vibration, network
│   └── useOfflineSync.ts    # IndexedDB, background sync
├── components/
│   ├── BottomNav.tsx        # Bottom navigation + FAB
│   ├── MobileHeader.tsx     # Header + drawer
│   ├── SwipeableCard.tsx    # Swipe actions
│   └── PullToRefresh.tsx    # Pull to refresh
├── pages/
│   └── MobileDashboard.tsx  # Mobile-optimized dashboard
└── index.ts                 # Module exports

public/
├── manifest.json            # PWA manifest
├── sw.js                    # Service worker
└── offline.html             # Offline page
```

**الوقت المتوقع:** 10-12 ساعة ✅ مكتمل

---

### المرحلة 10: الاختبارات والتوثيق ✅ مكتملة

**الهدف:** جودة عالية وتوثيق

**المهام:**
- [x] إضافة Vitest + React Testing Library
- [x] اختبارات hooks (useDebounce, useLocalStorage, useMobile)
- [x] اختبارات المكونات (Badge, Skeleton, Spinner, EmptyState)
- [x] اختبارات utils (cn)
- [x] توثيق المكونات (COMPONENTS.md)
- [x] دليل الاختبارات (TESTING.md)

**الملفات المُنشأة:**
```
vitest.config.ts        # إعدادات Vitest
vitest.setup.ts         # إعداد بيئة الاختبار

__tests__/
├── hooks/
│   ├── useDebounce.test.ts
│   ├── useLocalStorage.test.ts
│   └── useMobile.test.ts
├── components/
│   ├── Badge.test.tsx
│   ├── Skeleton.test.tsx
│   ├── Spinner.test.tsx
│   └── EmptyState.test.tsx
└── utils/
    └── cn.test.ts

docs/
├── TESTING.md          # دليل الاختبارات
└── COMPONENTS.md       # توثيق المكونات
```

**الأوامر:**
```bash
bun test           # تشغيل الاختبارات
bun test:watch     # مراقبة الاختبارات
bun test:coverage  # تغطية الكود
bun test:ui        # واجهة Vitest
```

**الوقت المتوقع:** 12-15 ساعة ✅ مكتمل

---

## 📅 الجدول الزمني المقترح

| المرحلة | الأولوية | الوقت | الاعتماديات |
|---------|----------|-------|-------------|
| 1. تحديث API Schema | 🔴 عالية | 2-3h | - |
| 2. دعم الجملة | 🟠 متوسطة-عالية | 8-10h | المرحلة 1 |
| 3. دعم المحاسبة | 🟠 متوسطة-عالية | 10-12h | المرحلة 1 |
| 4. دعم الشركاء | 🟠 متوسطة | 6-8h | المرحلة 1 |
| 5. نظام الدفع | 🟡 متوسطة | 6-8h | المرحلة 1 |
| 6. التقارير | 🟡 متوسطة | 8-10h | المراحل 2-5 |
| 7. تحسين UI/UX | 🟢 منخفضة | 6-8h | - |
| 8. تحسين الأداء | 🟢 منخفضة | 6-8h | - |
| 9. دعم الموبايل | 🟢 منخفضة | 10-12h | المرحلة 7 |
| 10. الاختبارات | 🔵 منخفضة | 12-15h | جميع المراحل |

**المجموع التقريبي:** 75-95 ساعة عمل

---

## 🔧 الأوامر المهمة

```bash
# تشغيل السيرفر
cd osmFront && bun dev

# توليد API schemas
bun run gen-zod-client

# فحص TypeScript
bun tsc --noEmit

# Build
bun run build

# Lint
bun lint
```

---

## 📁 الهيكل النهائي المقترح

```
src/
├── app/
│   └── [locale]/
│       ├── dashboard/
│       │   ├── accounting/     # جديد
│       │   ├── wholesale/      # جديد
│       │   ├── partners/       # جديد
│       │   ├── reports/        # تحديث
│       │   └── ...
│       └── ...
├── features/
│   ├── accounting/            # جديد ✨
│   ├── wholesale/             # جديد ✨
│   ├── partners/              # جديد ✨
│   ├── mobile/                # جديد ✨
│   ├── orders/                # تحديث
│   ├── payment/               # تحديث
│   ├── inventory/             # تحديث
│   └── reports/               # تحديث
├── shared/
│   ├── api/
│   ├── components/
│   │   ├── charts/            # جديد ✨
│   │   ├── mobile/            # جديد ✨
│   │   └── ui/                # تحديث
│   └── hooks/
└── styles/
    ├── animations.css         # جديد ✨
    └── ...
```

---

## 📝 ملاحظات إضافية

1. **الأولوية القصوى** هي المرحلة 1 (تحديث API) لأن كل شيء يعتمد عليها
2. **المراحل 2-5** يمكن تنفيذها بالتوازي بعد المرحلة 1
3. **المراحل 7-9** تحسينات يمكن تنفيذها تدريجياً
4. **المرحلة 10** مهمة للجودة لكن يمكن تأجيلها

---

*آخر تحديث: 2026-01-10*
