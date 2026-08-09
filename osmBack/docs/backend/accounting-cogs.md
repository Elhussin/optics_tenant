# 📊 النظام المحاسبي وتكلفة البضاعة المباعة (Accounting & COGS)

يقدم النظام محرك محاسبة قيود مزدوجة (Double-Entry Accounting Engine) آلي بالكامل متوافق مع معايير ERP العالمية.

---

## 🧮 1. طريقة تقييم المخزون (Weighted Average Cost)

يعتمد قطاع النظارات على طريقة **المتوسط المرجح للتكلفة (Weighted Average Cost - WAC)** لحساب تكلفة المخزون وتكلفة البضاعة المباعة.

### معادلة حساب متوسط التكلفة:
$$\text{New WAC} = \frac{\text{Current Total Value} + \text{New Purchase Value}}{\text{Current Quantity} + \text{New Purchase Quantity}}$$

يتم تحديث هذا الرقم تلقائياً في نموذج `ProductVariant` أو `StockMovement` مع كل حركة شراء أو توريد.

---

## 📝 2. قيود اليومية الآلية لفاتورة المبيعات

عند اعتماد فاتورة مبيعات في ملف `invoice_service.py` واستدعاء `entry_service.py` يتم إدراج قيود اليومية التالية تلقائياً:

### قيد المبيعات والضريبة:
- **مدين (Debit):** حساب الذمم المدينة / النقدية (Total Invoice Amount).
- **دائن (Credit):** حساب إيرادات المبيعات (Subtotal Net Revenue).
- **دائن (Credit):** حساب ضريبة المخرجات / القيمة المضافة (VAT Output).

### قيد تكلفة البضاعة المباعة والمخزون (COGS & Inventory Entry):
- **مدين (Debit):** حساب تكلفة البضاعة المباعة (COGS Account) = (الكمية × متوسط التكلفة WAC).
- **دائن (Credit):** حساب المخزون (Inventory Account) = (الكمية × متوسط التكلفة WAC).

---

## 🔄 3. قيود مرتجع المبيعات (Sales Return Entry)
عند إرجاع فاتورة أو صنف:
- **مدين (Debit):** حساب المخزون (Inventory Account).
- **دائن (Credit):** حساب تكلفة البضاعة المباعة (COGS Account).
- عكس قيد الإيراد والضريبة والعميل تلقائياً.
