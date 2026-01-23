---
description: Frontend Accounting Module Development Roadmap
---

# خطة تطوير واجهة المحاسبة 📊
# Accounting Frontend Development Roadmap

---

## ✅ المنجز (Completed)

### 1. تحديث الإعدادات الأساسية
- [x] تحديث `entityConfig.ts` - إضافة كيانات المحاسبة
  - `chart-of-accounts`
  - `journal-entries`
  - `financial-periods`
  - `accounting-taxes`
  - `accounting-categories`

- [x] تحديث `generatFormConfig.ts` - إضافة علاقات المحاسبة
  - `account`, `chart_of_account`
  - `financial_period`
  - `tax`
  - `accounting_category`

- [x] تحديث ملفات الترجمة
  - `ar/formGenerator.json` - الترجمة العربية
  - `en/formGenerator.json` - الترجمة الإنجليزية

### 2. الصفحات المُنشأة

| الصفحة | المسار | الوصف |
|--------|--------|-------|
| `AccountingDashboard` | `/accounting` | داشبورد المحاسبة الرئيسي |
| `ChartOfAccountsPage` | `/accounting/chart-of-accounts` | دليل الحسابات ✅ موجود |
| `JournalEntriesPage` | `/accounting/journal-entries` | قيود اليومية ✅ موجود |
| `FinancialReportsPage` | `/accounting/reports` | التقارير المالية ✅ موجود |
| `FinancialPeriodsPage` | `/accounting/financial-periods` | إدارة الفترات المالية 🆕 |
| `TaxesPage` | `/accounting/taxes` | إدارة الضرائب 🆕 |
| `AccountingCategoriesPage` | `/accounting/categories` | فئات المحاسبة 🆕 |
| `AccountLedgerPage` | `/accounting/ledger` | دفتر الأستاذ 🆕 |

---

## 📁 هيكل الملفات

```
src/features/accounting/
├── components/
│   ├── AccountTree.tsx ✅
│   ├── JournalEntryForm.tsx ✅
│   └── FinancialReportCard.tsx ✅
├── hooks/
│   └── useAccounting.ts ✅
├── pages/
│   ├── AccountingDashboard.tsx 🆕
│   ├── ChartOfAccountsPage.tsx ✅
│   ├── JournalEntriesPage.tsx ✅
│   ├── FinancialReportsPage.tsx ✅
│   ├── FinancialPeriodsPage.tsx 🆕
│   ├── TaxesPage.tsx 🆕
│   ├── AccountingCategoriesPage.tsx 🆕
│   └── AccountLedgerPage.tsx 🆕
├── types/
│   └── accounting.types.ts ✅
└── index.ts ✅ (محدث)
```

```
src/app/[locale]/dashboard/accounting/
├── page.tsx ✅ (AccountingDashboard)
├── chart-of-accounts/
│   └── page.tsx ✅
├── journal-entries/
│   └── page.tsx ✅
├── reports/
│   └── page.tsx ✅
├── financial-periods/
│   └── page.tsx 🆕
├── taxes/
│   └── page.tsx 🆕
├── categories/
│   └── page.tsx 🆕
└── ledger/
    └── page.tsx 🆕
```

---

## 🎨 التصميم المُطبق

تم تطبيق قواعد الجمالية الفاخرة (Premium Design):
- ✅ **Glassmorphism**: خلفيات زجاجية مع `backdrop-blur`
- ✅ **Gradients**: تدرجات لونية فاخرة
- ✅ **Shadows**: ظلال عميقة للبعد الثالث
- ✅ **Micro-interactions**: تأثيرات الحوم والانتقال
- ✅ **Consistent Spacing**: مسافات موحدة
- ✅ **RTL Support**: دعم العربية بالكامل

---

## 🔗 الـ API Endpoints المستخدمة

### Chart of Accounts
```
GET  /api/accounting/chart-of-accounts/
POST /api/accounting/chart-of-accounts/
GET  /api/accounting/chart-of-accounts/{id}/
PUT  /api/accounting/chart-of-accounts/{id}/
DELETE /api/accounting/chart-of-accounts/{id}/
GET  /api/accounting/chart-of-accounts/tree/
POST /api/accounting/chart-of-accounts/setup_defaults/
```

### Journal Entries
```
GET  /api/accounting/journal-entries/
POST /api/accounting/journal-entries/
GET  /api/accounting/journal-entries/{id}/
POST /api/accounting/journal-entries/{id}/post_entry/
POST /api/accounting/journal-entries/{id}/reverse_entry/
GET  /api/accounting/journal-entries/unposted/
```

### Financial Reports
```
GET /api/accounting/reports/trial-balance/
GET /api/accounting/reports/income-statement/
GET /api/accounting/reports/balance-sheet/
GET /api/accounting/reports/ledger/{account_id}/
```

### Financial Periods
```
GET  /api/accounting/financial-periods/
POST /api/accounting/financial-periods/
GET  /api/accounting/financial-periods/current/
```

### Taxes
```
GET  /api/accounting/taxes/
POST /api/accounting/taxes/
PUT  /api/accounting/taxes/{id}/
DELETE /api/accounting/taxes/{id}/
```

### Categories
```
GET  /api/accounting/categories/
POST /api/accounting/categories/
PUT  /api/accounting/categories/{id}/
DELETE /api/accounting/categories/{id}/
```

---

## 🚀 خطوات التطوير التالية (Optional Enhancements)

// turbo-all

### المرحلة القادمة

1. **تحسين نموذج إضافة/تعديل الحسابات**
   - إضافة modal متكامل لإنشاء حساب جديد
   - اختيار الحساب الأب من شجرة تفاعلية

2. **إضافة Chart/Graph للتقارير**
   - رسوم بيانية للميزانية العمومية
   - تحليل الإيرادات والمصروفات

3. **تحسين الطباعة**
   - قوالب طباعة احترافية
   - تصدير PDF

4. **إضافة الإشعارات**
   - تنبيهات الفترات المالية القريبة من الإغلاق
   - تنبيهات القيود غير المرحلة

---

## 📝 ملاحظات

- جميع الصفحات تتبع قاعدة الجمالية الفاخرة
- استخدام `useCallback` و `useEffect` بشكل صحيح
- معالجة الأخطاء وحالات التحميل
- دعم كامل للـ RTL

---

**آخر تحديث:** 2026-01-20
