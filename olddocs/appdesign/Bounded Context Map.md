# Bounded Context Map
**الإصدار: v1.0**
**الحالة: معتمد للمشروع**

---

## 1. مقدمة (Introduction)

توضح هذه الوثيقة خريطة العلاقات الرسمية وحدود سياقات الأعمال (Bounded Contexts) بين الـ 20 Domain المحددة في النظام. تُعد هذه العلاقات حاكمة وموجهة لكيفية تصميم الـ APIs والـ Events وطرق تكامل البيانات دون حدوث تداخل أو تسريب لمسؤوليات الكود.

```text
                  [Organization]
                        │
                        │ (Downstream: uses structure)
       ┌────────────────┴────────────────┐
       ▼                                 ▼
  [Identity]                     [Document Management] (OHS)
       │                                 │
       ▼ (Downstream)                    ▼ (Downstream: stores docs)
  [Customer] <────────── [CRM] <─────────┼──────────┐
       │                  │              │          │
       ▼ (Downstream)     ▼ (Downstream) │          │
   [Patient] ────────> [Prescription]    │          │
       │                  │              │          │
       └─────────┬────────┘              │          │
                 ▼                       ▼          ▼
              [Sales] ──────────────> [Catalog] <───[Marketing]
                 │                       ▲
                 │                       │ (Downstream: details variants)
                 ▼ (Event-Driven)        │
            [Inventory] <────────────────┘
                 │
                 ▼ (Event-Driven)
            [Purchasing] ─── (Event-Driven) ──┐
                 │                            │
                 ▼                            ▼
            [Accounting] <─────────────── [Finance]

  [Reporting] (Reads All - Downstream to all)
  [Notification] (OHS - Published Language)
  [Integration] (ACL / Gateway for ZATCA, etc.)
  [AI] (Reads All - Event Listener - Downstream)
```

---

## 2. تعريف العلاقات وأنماط التكامل (Relationship Types)

نستخدم الأنماط القياسية من Domain-Driven Design (DDD) لتعريف التفاعل بين النطاقات:

### أ. Open Host Service (OHS) / Published Language (PL)
*   **[Notification] و [Document Management]:** يقدمان خدمات عامة ومستقرة لجميع الـ Domains الأخرى. لا يعرفان شيئًا عن منطق البيع أو الطب، بل يستقبلان طلبات إرسال إشعارات أو حفظ وتصنيف ملفات.

### ب. النمط الموجه بالأحداث (Event-Driven Integration)
*   **[Sales] ──> [Inventory]:** عند تأكيد الفاتورة، يُصدر نطاق المبيعات حدث `InvoiceConfirmed`. يقوم نطاق المخزون بالاستماع للحدث وإنقاص المخزون الفعلي.
*   **[Sales / Inventory / Purchasing / Finance] ──> [Accounting]:** لا تقوم هذه النطاقات بالكتابة في دفاتر الحسابات مباشرة، بل تُصدر أحداثاً مالية (مثل `InvoiceConfirmed`, `PaymentReceived`, `GoodsReceived`). يستمع نطاق المحاسبة لهذه الأحداث ويقوم بتوليد قيود اليومية (Journal Entries).

### ج. علاقة الزبون والمورد (Customer-Supplier / Upstream-Downstream)
*   **[Prescription] (Downstream) ──> [Patient] (Upstream):** تعتمد الوصفة الطبية كلياً على وجود ملف المريض وتفاصيله الصحية. أي تعديل في هوية المريض أو بياناته الأساسية قد يؤثر على كيفية قراءة أو إثبات الوصفة.
*   **[Sales] (Downstream) ──> [Prescription] (Upstream):** يحتاج أمر مبيعات العدسات الطبية إلى التحقق من صلاحية وجودة بيانات الوصفة الطبية، ولكن نطاق المبيعات لا يحق له تعديل الوصفة.

### د. طبقة منع الفساد (Anti-Corruption Layer - ACL)
*   **[Integration] ──> الأنظمة الخارجية (مثل ZATCA):** يمثل نطاق التكامل طبقة عزل تحمي النطاقات الداخلية (مثل المبيعات والمحاسبة) من التغيرات المستمرة في بروتوكولات وتنسيقات الأنظمة الخارجية. يقوم الـ ACL بتحويل كائنات النظام الداخلية إلى صيغة UBL XML المطلوبة خارجياً.

---

## 3. مصفوفة تواصل النطاقات (Domain Communication Matrix)

| النطاق المصدر (Source) | النطاق المستهدف (Target) | وسيلة التواصل (Medium) | نوع العلاقة (DDD Relationship) | وصف العملية |
| :--- | :--- | :--- | :--- | :--- |
| **Sales** | **Inventory** | Event (`InvoiceConfirmed`) | Event-Driven | تحديث وحجز كميات المخزون بناءً على البيع. |
| **Sales** | **Accounting** | Event (`InvoiceConfirmed`) | Event-Driven | إنشاء مسودة قيد مالي للفاتورة المؤكدة. |
| **Purchasing** | **Inventory** | Event (`GoodsReceived`) | Event-Driven | زيادة كميات المستودع الفعلي عند استلام البضاعة. |
| **Finance** | **Accounting** | Event (`PaymentReceived`) | Event-Driven | إثبات المقبوضات وتوليد قيود تسوية نقدية. |
| **Sales** | **Prescription** | API Selectors | Customer-Supplier | التحقق من تفاصيل وقياسات العدسات الطبية للوصفة. |
| **Any Domain** | **Notification** | API Service (`SendNotification`) | Open Host Service (OHS) | إرسال بريد إلكتروني، رسالة نصية، أو تنبيه نظام. |
| **Any Domain** | **Document** | API Service (`ArchiveDocument`) | Open Host Service (OHS) | حفظ وأرشفة المستندات (مثل المرفقات الطبية أو صور الفواتير). |
