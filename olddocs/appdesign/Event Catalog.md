# Enterprise Event Catalog
**الإصدار: v1.0**
**الحالة: معتمد للمشروع**

---

## 1. مقدمة (Introduction)

يمثل دليل الأحداث (Event Catalog) المرجع الحاكم للعمليات اللامتزامنة والتكامل بين النطاقات المختلفة داخل النظام. كل حدث يمثل واقعة تجارية حقيقية حدثت بالفعل ولا يمكن تغييرها (Immutable). 

---

## 2. قائمة الأحداث الرسمية (Official Event Registry)

### 1. `CustomerRegistered`
*   **الوصف:** يُثار عند تسجيل عميل جديد بنجاح في النظام.
*   **المنتج (Producer):** Customer Domain
*   **المستهلكون (Consumers):**
    *   CRM (لإنشاء فرصة تسويقية أو ترحيب بالعميل).
    *   Marketing (لربط العميل ببرامج الولاء والعروض المتاحة).
*   **بنية البيانات الأساسية (Payload Schema):**
    ```json
    {
      "event_id": "uuid",
      "timestamp": "iso-datetime",
      "tenant_id": "string",
      "customer_id": "integer",
      "name": "string",
      "email": "string",
      "phone": "string"
    }
    ```

---

### 2. `PatientCreated`
*   **الوصف:** يُثار عند إنشاء ملف طبي جديد لمريض.
*   **المنتج (Producer):** Patient Domain
*   **المستهلكون (Consumers):**
    *   CRM (لجدولة المواعيد والمتابعات الطبية).
    *   Prescription (لتهيئة بيئة فحوصات النظر المربوطة بالمريض).
*   **بنية البيانات الأساسية (Payload Schema):**
    ```json
    {
      "event_id": "uuid",
      "timestamp": "iso-datetime",
      "tenant_id": "string",
      "patient_id": "integer",
      "medical_record_number": "string",
      "name": "string"
    }
    ```

---

### 3. `PrescriptionApproved`
*   **الوصف:** يُثار عند قيام الطبيب أو أخصائي البصريات باعتماد وصفة فحص نظر جديدة.
*   **المنتج (Producer):** Prescription Domain
*   **المستهلكون (Consumers):**
    *   Sales (للسماح بربط الوصفة الطبية بأمر مبيعات العدسات الطبية).
    *   Notification (لإرسال تفاصيل الوصفة للمريض عبر رسالة نصية أو بريد إلكتروني).
*   **بنية البيانات الأساسية (Payload Schema):**
    ```json
    {
      "event_id": "uuid",
      "timestamp": "iso-datetime",
      "tenant_id": "string",
      "prescription_id": "integer",
      "patient_id": "integer",
      "optometrist_id": "integer",
      "sph_right": "decimal",
      "cyl_right": "decimal",
      "sph_left": "decimal",
      "cyl_left": "decimal"
    }
    ```

---

### 4. `SalesOrderCreated`
*   **الوصف:** يُثار عند تأكيد أمر مبيعات جديد وحفظه كمسودة أو طلب جاهز للتجهيز.
*   **المنتج (Producer):** Sales Domain
*   **المستهلكون (Consumers):**
    *   Inventory (لحجز الكميات في المستودع مؤقتاً ومنع بيعها لعميل آخر).
*   **بنية البيانات الأساسية (Payload Schema):**
    ```json
    {
      "event_id": "uuid",
      "timestamp": "iso-datetime",
      "tenant_id": "string",
      "order_id": "integer",
      "branch_id": "integer",
      "items": [
        {
          "variant_id": "integer",
          "quantity": "integer"
        }
      ]
    }
    ```

---

### 5. `InvoiceConfirmed`
*   **الوصف:** يُثار عند إصدار واعتماد الفاتورة بشكل نهائي وترحيلها.
*   **المنتج (Producer):** Sales Domain
*   **المستهلكون (Consumers):**
    *   Inventory (لخصم كميات الأصناف المبيعة فعلياً وتعديل رصيد المخزن).
    *   Accounting (لتوليد قيد اليومية المالي وإثبات المبيعات وضريبة القيمة المضافة المدخلة).
    *   Integration (لترحيل الفاتورة إلى هيئة الزكاة والضريبة والجمارك ZATCA).
*   **بنية البيانات الأساسية (Payload Schema):**
    ```json
    {
      "event_id": "uuid",
      "timestamp": "iso-datetime",
      "tenant_id": "string",
      "invoice_id": "integer",
      "invoice_number": "string",
      "branch_id": "integer",
      "customer_id": "integer",
      "total_amount": "decimal",
      "tax_amount": "decimal",
      "items": [
        {
          "variant_id": "integer",
          "quantity": "integer",
          "unit_price": "decimal",
          "tax_rate": "decimal"
        }
      ]
    }
    ```

---

### 6. `PaymentReceived`
*   **الوصف:** يُثار عند استلام دفعة مالية (سواء نقدية، بطاقة، أو شيك) مرتبطة بفاتورة مبيعات أو حساب عميل.
*   **المنتج (Producer):** Finance Domain
*   **المستهلكون (Consumers):**
    *   Accounting (لتسوية حساب العميل المدين والطرف النزيل بالخزينة أو البنك).
    *   Sales (لتغيير حالة الفاتورة المرتبطة إلى "مدفوعة بالكامل" أو "مدفوعة جزئياً").
*   **بنية البيانات الأساسية (Payload Schema):**
    ```json
    {
      "event_id": "uuid",
      "timestamp": "iso-datetime",
      "tenant_id": "string",
      "payment_id": "integer",
      "invoice_id": "integer",
      "amount": "decimal",
      "payment_method": "string",
      "cash_register_id": "integer"
    }
    ```

---

### 7. `GoodsReceived`
*   **الوصف:** يُثار عند استلام بضائع جديدة من مورد وتأكيد إدخالها المخازن بعد فحص الجودة.
*   **المنتج (Producer):** Purchasing Domain
*   **المستهلكون (Consumers):**
    *   Inventory (لإضافة الكميات للمخزون الفعلي وتحديث متوسط تكلفة الأصناف).
    *   Accounting (لتوليد قيد إثبات استلام البضائع وحساب البضائع الواردة غير المفوترة).
*   **بنية البيانات الأساسية (Payload Schema):**
    ```json
    {
      "event_id": "uuid",
      "timestamp": "iso-datetime",
      "tenant_id": "string",
      "goods_receipt_id": "integer",
      "supplier_id": "integer",
      "warehouse_id": "integer",
      "items": [
        {
          "variant_id": "integer",
          "quantity_received": "integer",
          "unit_cost": "decimal"
        }
      ]
    }
    ```

---

## 3. معايير إدارة وجودة الأحداث (Event Quality Standards)

1. **ثبات الأحداث (Immutability):** لا يُسمح بتعديل بيانات أي حدث تم إرساله مسبقاً. في حال حدوث خطأ، يجب إصدار حدث تصحيحي معاكس.
2. **سياسة المحاولة مجدداً (Retry Policy):** أي معالجة فاشلة للحدث من جانب المستهلك يجب أن تتم إعادتها تلقائياً (بحد أقصى 5 محاولات مع Backoff لأسي لامتصاص توقف النظام المؤقت).
3. **تحديد الهوية والارتباط (Correlation ID):** كل حدث يجب أن يحتوي على معرف ارتباط (Correlation ID) يُتيح تتبع سلسلة العمليات المترابطة عبر الأنظمة وسجلات المراقبة (Logs) بسهولة.
