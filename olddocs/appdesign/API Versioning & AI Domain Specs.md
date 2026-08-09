# API Versioning & AI Domain Specifications
**الإصدار: v1.0**
**الحالة: معتمد للمشروع**

---

## 1. مقدمة (Introduction)
تحدد هذه الوثيقة متطلبات تصميم وتوجيه المرحلة الخامسة والأخيرة (Stage 5: Enterprise Optimization) من مشروع Hussam Optical ERP. تركز هذه المرحلة على تعزيز جودة هندسة البرمجيات عبر فرض معايير إصدارات واجهات برمجة التطبيقات (API Versioning)، بجانب تأسيس نطاق الذكاء الاصطناعي (AI Domain) لتقديم تحليلات وتنبؤات ذكية للأعمال ومقترحات البصريات.

---

## 2. مواصفات إصدارات الـ API (API Versioning Specification)

لتجنب حدوث كسر في تكامل التطبيقات الخارجية والواجهات المحمولة والمستقبلية عند تحديث النماذج، يجب فرض إصدارات واضحة للمسارات باستخدام المسار البادئ (Path-based Prefixes).

### أ. الهيكل المقترح للمسارات:
*   كافة الروابط الداخلية للمستأجرين يجب أن تبدأ بـ `/api/v1/` بدلاً من `/api/` المباشر.
*   أمثلة:
    *   إدارة الفواتير: `/api/v1/sales/invoices/`
    *   إدارة المبيعات: `/api/v1/sales/orders/`
    *   إدارة المنتجات: `/api/v1/products/`
    *   البصريات والعملاء: `/api/v1/crm/`

### ب. خطة الهجرة التدريجية (URL Migration Plan):
1.  تحديث ملف الروابط الرئيسي `optics_tenant/api/urls.py` ليقوم بتوجيه الطلبات عبر بادئة إصدار:
    ```python
    # optics_tenant/api/urls.py
    
    urlpatterns = [
        path('v1/', include([
            path('sales/', include('apps.sales.urls')),
            path('products/', include('apps.products.urls')),
            path('crm/', include('apps.crm.urls')),
            # ... باقي التطبيقات
        ])),
    ]
    ```
2.  توفير توافقية تراجعية (Backward Compatibility) عبر توجيه المسارات القديمة الخالية من إصدار تلقائياً لإصدار `v1` (Fallback/Redirect middleware or legacy URL routing) لفترة مؤقتة حتى استكمال الهجرة لكامل الواجهات.

---

## 3. هندسة وتصميم نطاق الذكاء الاصطناعي (AI Domain Architecture)

يُنشأ تطبيق Django جديد باسم `ai` ليكون معزولاً عن بقية التطبيقات، ويقدم خدماته عبر الخدمات الذكية (Service Classes).

### أ. مسؤولية نطاق الـ AI:
1.  **التنبؤ بحجم المبيعات (Sales Forecasting):** تنبؤ الطلب على المنتجات والمخزون وحجم المبيعات لكل فرع بناءً على البيانات التاريخية للمبيعات والمواسم.
2.  **تحليل البصريات ومقترحات العدسات (Prescription Insights):** تحليل مقاسات البصر وتوليد اقتراحات تلقائية لنوع العدسات المناسب (Anti-glare, Blue light block, High-index lenses) ونوع الإطارات الموصى بها.

### ب. هيكلية الكود لتطبيق الـ AI:
```text
  apps/ai/
  ├── __init__.py
  ├── apps.py
  ├── services/
  │   ├── __init__.py
  │   ├── forecasting_service.py       # خدمات التنبؤ بالطلب والمبيعات
  │   └── prescription_analyzer.py     # خدمات اقتراح وتحليل العدسات
  ├── views.py                         # واجهات الـ API للذكاء الاصطناعي
  └── urls.py
```

### ج. تصميم واجهات الخدمات للـ AI:
```python
# apps/ai/services/forecasting_service.py
class SalesForecastingService:
    @staticmethod
    def forecast_branch_sales(branch_id, days_ahead=30):
        """
        تسترد البيانات التاريخية للمبيعات من تطبيق sales
        وتقوم بتوليد تحليلات التنبؤ بالطلب وحجم الإيرادات المتوقع.
        """
        pass

# apps/ai/services/prescription_analyzer.py
class PrescriptionAnalyzerService:
    @staticmethod
    def suggest_lenses_for_prescription(prescription):
        """
        تحلل قيم الـ Sphere والـ Cylinder والـ Axis لمقاس البصر
        وتقترح العدسات المناسبة وخصائصها الفنية (مثل معامل الانكسار Index ومقاومة الانعكاس).
        """
        pass
```
