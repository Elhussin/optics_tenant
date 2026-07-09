# ZATCA Phase 1 & 2 Integration Specifications
**الإصدار: v1.0**
**الحالة: معتمد للمشروع**

---

## 1. مقدمة (Introduction)
تحدد هذه الوثيقة متطلبات وتصميم الربط الضريبي مع هيئة الزكاة والضريبة والجمارك (ZATCA) لمشروع Hussam Optical ERP. يهدف هذا التصميم إلى دعم المرحلة الأولى (الإصدار والتبسيط) والمرحلة الثانية (الربط والتكامل الفعلي)، مع ضمان سرعة استجابة النظام للمستخدم عبر المعالجة غير المتزامنة (Asynchronous Background Processing).

---

## 2. متطلبات الفاتورة الإلكترونية للزكاة والدخل (ZATCA Requirements)

### أ. المرحلة الأولى: توليد وحفظ الفواتير (Phase 1: Generation)
*   **عناصر الفاتورة الإلزامية:**
    *   الرقم التسلسلي للفاتورة (`invoice_number`).
    *   الرقم الموحد للمستأجر (الرقم الضريبي VAT ID).
    *   تاريخ ووقت التوليد بالدقة الكاملة.
    *   رمز الاستجابة السريعة (QR Code) والذي يجب ترميزه بصيغة Base64 ويحتوي على قيم TLV (Tag-Length-Value) للتالي:
        1. اسم المورد (Seller Name)
        2. الرقم الضريبي للمورد (Seller VAT Number)
        3. الطابع الزمني للفاتورة (Timestamp)
        4. إجمالي الفاتورة مع الضريبة (Invoice Total)
        5. مبلغ ضريبة القيمة المضافة (VAT Total)
*   **ثبات البيانات (Immutability):** لا يُسمح بتعديل أو حذف أي فاتورة بمجرد تأكيدها (`status = confirmed`). يتم التعديل حصراً عبر إصدار إشعارات دائنة (Credit Notes) أو مدينة (Debit Notes).

### ب. المرحلة الثانية: الربط والتكامل (Phase 2: Integration)
*   **صيغة المستند (Document Format):** توليد فاتورة بصيغة UBL 2.1 XML المتوافقة مع معايير ZATCA (محلياً أو عبر بوابة ربط).
*   **التوقيع والتشفير:** استخدام شهادة التشفير والمفتاح الخاص (X.509 Certificate and Private Key) لتوقيع الفواتير الضريبية (B2B) رقمياً وتوليد معرّف التجزئة الفريد (Invoice Hash SHA-256).
*   **سلسلة الفواتير (Invoice Chaining):** 
    *   ترتبط كل فاتورة سكنية/مبسطة (B2C) أو ضريبية بالفاتورة السابقة لها في قاعدة البيانات عبر دمج هاش الفاتورة السابقة (`previous_invoice_hash`) في مدخلات حساب هاش الفاتورة الحالية (`current_invoice_hash`).
    *   تضمن السلسلة حماية سجلات الفواتير من التلاعب التاريخي.
*   **الرفع والإرسال (Submission):** إرسال الفواتير الضريبية (B2B) للـ Clearance (اعتماد فوري)، والفواتير المبسطة (B2C) للـ Reporting (الإرسال خلال 24 ساعة).

---

## 3. تدفق البيانات والربط غير المتزامن (Asynchronous Architecture)

لتفادي تأخر استجابة العميل أو توقف شاشة البيع (POS) عند حدوث مشاكل في شبكة الإنترنت أو بطء استجابة خوادم ZATCA، يتم تطبيق بنية ربط غير متزامنة باستخدام **Redis & Celery**:

```text
  [Confirmed Invoice] ──> (Create DB Records)
                                │
                                └──> [Celery Task Trigger] ──(Redis Queue)──> [Celery Worker]
                                                                                     │
                                                                         Generates XML, Hash & Sign
                                                                                     │
                                                                          Submit to ZATCA API
                                                                                     │
                                                                     Update Status (Cleared/Reported)
```

### خطوات التدفق البرمجي:
1. يضغط البائع على "تأكيد البيع" في الـ POS.
2. يقوم النظام محلياً بتأكيد الفاتورة، وتوليد الرقم الضريبي المؤقت وإنشاء القيود المحاسبية، وحفظها فوراً في قاعدة البيانات وتحديث حالة الفاتورة إلى `confirmed`.
3. يُطلق النظام حدث `InvoiceConfirmed` الذي يضع مهمة Celery غير متزامنة في طابور العمل (`Redis`).
4. يستقبل عامل Celery (`Celery Worker`) المهمة ويقوم بـ:
    *   بناء ملف الـ UBL XML الخاص بالفاتورة.
    *   استرجاع هاش الفاتورة السابقة وحساب هاش الفاتورة الحالية.
    *   الاتصال بخدمة ZATCA وإرسال الفاتورة رقمياً.
    *   تحديث حالة الفاتورة في قاعدة البيانات إلى `cleared` أو `reported` وتخزين الهاش النهائي والملاحظات.

---

## 4. تصميم قاعدة البيانات وسلسلة الهاش (Database & Chaining Design)

تمت تهيئة الجداول مسبقاً لاستيعاب معايير المرحلة الثانية من خلال الحقول التالية في نموذج الفاتورة `Invoice` والإشعارات الدائنة:
*   `invoice_uuid`: معرّف فريد عالمياً (UUID4).
*   `zatca_tax_number`: الرقم التسلسلي الضريبي النهائي المولد بالتنسيق المطلوب ضريبياً.
*   `previous_invoice_hash`: الهاش المسترجع من الفاتورة السابقة للمستأجر الحالي.
*   `current_invoice_hash`: الهاش المحسوب للفاتورة الحالية عبر تشفير SHA-256 للمستند الحالي.

### طريقة حساب الهاش المتسلسل:
$$\text{Current Invoice Hash} = \text{SHA-256}(\text{Current Document Metadata} + \text{Previous Invoice Hash})$$

---

## 5. هيكلية مهام Celery المقترحة (Celery Tasks Design)

```python
# apps/sales/tasks.py

@app.task(bind=True, max_retries=3, default_retry_delay=60)
def submit_invoice_to_zatca_task(self, invoice_id):
    """
    مهمة خلفية لمعالجة الفاتورة وإرسالها رقمياً لهيئة الزكاة والدخل
    """
    from apps.sales.models import Invoice
    from apps.sales.services.zatca_service import ZATCAService
    
    try:
        invoice = Invoice.objects.get(pk=invoice_id)
        
        # 1. حساب الهاش وتوليد XML والتوقيع
        xml_data = ZATCAService.generate_ubl_xml(invoice)
        invoice_hash = ZATCAService.calculate_invoice_hash(xml_data, invoice.previous_invoice_hash)
        
        # 2. حفظ الهاش محلياً
        invoice.current_invoice_hash = invoice_hash
        invoice.save(update_fields=['current_invoice_hash'])
        
        # 3. إرسال المستند
        response = ZATCAService.submit_to_zatca(xml_data, invoice)
        
        # 4. تحديث الحالة النهائية
        if response.status == 'CLEARED':
            invoice.status = 'cleared'
        else:
            invoice.status = 'reported'
        invoice.save(update_fields=['status'])
        
    except Invoice.DoesNotExist:
        pass
    except Exception as exc:
        # إعادة المحاولة في حال وجود مشكلات مؤقتة في خوادم الهيئة أو الشبكة
        raise self.retry(exc=exc)
```
