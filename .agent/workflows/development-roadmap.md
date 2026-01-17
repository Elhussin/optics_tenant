---
description: System Development Roadmap - خطة تطوير نظام البصريات الشامل
---

# خطة تطوير نظام البصريات الشامل
## Optics Retail/Wholesale Management System

### تاريخ التحليل: 2026-01-09

---

## 📊 التقييم الحالي للنظام

### ✅ نقاط القوة
1. **بنية Multi-Tenant** - django-tenants مع schema isolation
2. **تطبيقات منفصلة** - tenants, users, branches, products, sales, crm, hrm, accounting, prescriptions
3. **نظام صلاحيات RBAC** - مع BranchAccessMixin
4. **نظام المخزون** - Stock per Branch, Reserved Quantity, Stock Movements, Stock Transfers

### 📈 الدرجات
- البنية المعمارية: 9/10
- قابلية التوسع: 8/10
- الأداء: 7/10
- اكتمال الميزات: 6/10
- المحاسبة: 5/10
- النتيجة العامة: 7.5/10

---

## 🎯 المراحل المطلوبة

### المرحلة 1: نظام الشركاء والتأمين ⭐ (أولوية عالية) - ✅ مكتملة
- [x] إنشاء نموذج Partner (insurance, bnpl, corporate, wholesaler)
- [x] إنشاء نموذج PartnerPriceList (قوائم الأسعار الخاصة)
- [x] إنشاء نموذج InsuranceClaim (مطالبات التأمين)
- [x] إنشاء CustomerPartnerLink (ربط العميل بالشريك)
- [x] تحديث Order ليدعم Partner
- [x] إنشاء Serializers
- [x] إنشاء Views و APIs
- [x] تطبيق migrations
- [ ] إنشاء Frontend pages (معلق - يمكن البدء فيه لاحقاً)

### المرحلة 2: تنويع طرق الدفع ⭐ (أولوية عالية) - ✅ مكتملة
- [x] إضافة طرق دفع: tabby, tamara, apple_pay, stc_pay, mada, visa, mastercard
- [x] نظام التقسيط (Installment model)
- [x] ربط BNPL providers بالنظام (TabbyGateway, TamaraGateway)
- [x] PaymentViewSet مع جلسات BNPL
- [x] تطبيق migrations
- [ ] Integration مع بوابات الدفع الفعلية (يحتاج API keys)

### المرحلة 3: ربط المحاسبة التلقائي (أولوية متوسطة) - ✅ مكتملة
- [x] إنشاء Chart of Accounts (دليل الحسابات)
- [x] إنشاء General Journal (قيود اليومية)
- [x] إنشاء Journal entries تلقائياً من الفواتير (AutoJournalService)
- [x] ربط Sales ↔ Accounting عبر Django Signals
- [x] تقارير القوائم المالية (ميزان المراجعة، قائمة الدخل، الميزانية العمومية)
- [x] تطبيق migrations

### المرحلة 4: دعم البيع بالجملة (أولوية متوسطة) - ✅ مكتملة
- [x] تفريق بين Retail و Wholesale (Customer.pricing_tier)
- [x] أسعار الجملة للكميات الكبيرة (FlexiblePrice.pricing_tier)
- [x] Customer.type = "wholesaler"/"distributor"
- [x] نظام الائتمان (credit_limit, credit_status, payment_terms)
- [x] WholesaleService للتسعير والطلبات
- [x] كشف حساب العميل (customer_statement)
- [x] لوحة تحكم الجملة (wholesale_dashboard)
- [x] تطبيق migrations

### المرحلة 5: تحسينات الأداء (أولوية منخفضة) - ✅ مكتملة
- [x] إضافة Database indexes (sales, crm, accounting)
- [x] تحسين heavy queries (QueryOptimizer, ReportOptimizer)
- [x] Caching للبيانات المتكررة (CacheManager, cache_result decorator)
- [x] Mobile-optimized APIs (mobile_dashboard, mobile_quick_sale, mobile_sync)
- [x] تطبيق migrations

---

## 📁 الملفات الرئيسية

### Backend
- `apps/crm/models.py` - نماذج CRM والشركاء
- `apps/sales/models.py` - الطلبات والفواتير
- `apps/products/models/product.py` - المنتجات وFlexiblePrice
- `apps/accounting/models.py` - المحاسبة
- `apps/branches/models.py` - الفروع

### Frontend
- `src/features/reports/` - صفحات التقارير
- `src/features/orders/` - إدارة الطلبات
- `src/features/inventory/` - إدارة المخزون
- `src/app/[locale]/dashboard/` - لوحة التحكم

---

## 🔧 الأوامر المهمة

### Backend
```bash
# تشغيل السيرفر
cd osmBack && pdm run python manage.py runserver

# إنشاء migrations
pdm run python manage.py makemigrations

# تطبيق migrations
pdm run python manage.py migrate_schemas --shared
pdm run python manage.py migrate_schemas --tenant
```

### Frontend
```bash
# تشغيل السيرفر
cd osmFront && bun dev

# فحص TypeScript
bun tsc --noEmit

# Build
bun run build
```

---

## 📝 ملاحظات مهمة

1. FlexiblePrice موجود لكن يحتاج ربط بـ Partner
2. Customer يحتاج حقل partner للربط بشركة التأمين/التقسيط
3. Order يحتاج حقل partner_id و claim_info
4. Payment يحتاج تنويع طرق الدفع

---

*آخر تحديث: 2026-01-09*
