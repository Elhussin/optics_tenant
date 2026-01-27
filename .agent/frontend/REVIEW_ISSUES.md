# 🔍 تقرير مراجعة نظام الطلبات - قائمة المشاكل والحلول

تاريخ المراجعة: 2026-01-15

## 🔴 مشاكل حرجة (يجب إصلاحها فوراً)

### 1. تناقض في اسم حقل طريقة الدفع

**المشكلة:**
- Backend يستخدم `payment_method` في Model
- Frontend يرسل `payment_type` في payload
- هذا يسبب فشل API request أو تجاهل القيمة

**الملفات المتأثرة:**
- `/osmBack/apps/sales/models.py` (Line 114: `payment_method`)
- `/osmFront/src/features/orders/create/index.tsx` (Line 135: يرسل `payment_type`)
- `/osmFront/src/features/orders/types/index.ts` (Line 19: `payment_type`)

**الحل:**
إضافة property في Backend للتوافق:
```python
@property
def payment_type(self):
    return self.payment_method
```
أو تغيير Frontend ليرسل `payment_method`

---

### 2. عدم تحديد الفرع والمستخدم تلقائياً

**المشكلة:**
- الملاحظة تقول "سيتم تحديد الفرع والمستخدم تلقائياً"
- لكن لا يوجد كود يفعل ذلك
- `branchId` و `salesPersonId` يبقيان `null`

**الملفات المتأثرة:**
- `/osmFront/src/features/orders/create/index.tsx`
- `/osmFront/src/features/orders/store/useOrderFormStore.ts`

**الحل المطلوب:**
```typescript
// في create/index.tsx
const { data: currentUser } = useApiForm({ alias: 'auth_me' });

useEffect(() => {
    if (currentUser?.branch_user) {
        store.setBranch(currentUser.branch_user.branch);
        store.setSalesPerson(currentUser.branch_user.id);
    }
}, [currentUser]);
```

---

### 3. عدم التحقق من المخزون عند إنشاء الطلب

**المشكلة:**
- يتم إنشاء الطلب دون التحقق من توفر الكمية في المخزون
- التحقق يحدث فقط عند `confirm_order()`
- هذا يؤدي لإنشاء طلبات لا يمكن تنفيذها

**الملفات المتأثرة:**
- `/osmBack/apps/sales/serializers/order.py` (create method)

**الحل المقترح:**
```python
def validate_items(self, items):
    # ... الـ validations الحالية ...
    
    # التحقق من المخزون (soft check)
    from apps.products.models import Stock
    from decimal import Decimal
    
    branch_id = self.context.get('request').user.branch_user.branch_id
    
    for item in items:
        variant_id = item.get('product_variant').id if hasattr(item.get('product_variant'), 'id') else item.get('product_variant')
        quantity = item.get('quantity', 1)
        
        stock = Stock.objects.filter(
            branch_id=branch_id,
            variant_id=variant_id
        ).first()
        
        if not stock:
            raise ValidationError(f"المنتج غير متوفر في مخزون هذا الفرع")
        
        if stock.available_quantity < quantity:
            raise ValidationError(
                f"الكمية المتوفرة ({stock.available_quantity}) أقل من المطلوبة ({quantity})"
            )
    
    return items
```

---

### 4. عدم معالجة أخطاء Backend في Frontend

**المشكلة:**
- عند فشل API request، لا يتم عرض الأخطاء للمستخدم بشكل واضح
- لا يتم ربط الأخطاء بالحقول المناسبة

**الملفات المتأثرة:**
- `/osmFront/src/features/orders/create/index.tsx` (handleSubmit)

**الحل:**
```typescript
const handleSubmit = async () => {
    if (!store.customerId) {
        safeToast("يجب اختيار العميل", { type: "error" });
        setCurrentStep(1);
        return;
    }

    if (store.items.length === 0) {
        safeToast("يجب إضافة منتج واحد على الأقل", { type: "error" });
        setCurrentStep(3);
        return;
    }

    setIsSubmitting(true);
    try {
        const payload = {
            customer: store.customerId,
            branch: store.branchId,
            sales_person: store.salesPersonId,
            order_type: store.orderType,
            payment_method: store.paymentType, // تغيير من payment_type
            discount_amount: store.discountAmount.toFixed(2),
            tax_rate: store.taxRate.toFixed(4),
            paid_amount: store.paidAmount.toFixed(2),
            notes: store.notes,
            internal_notes: store.internalNotes,
            expected_delivery: store.expectedDelivery,
            items: store.items.map((item) => ({
                product_variant: item.product_variant,
                quantity: item.quantity,
                unit_price: item.unit_price.toFixed(2),
                prescription: item.prescription || store.prescriptionId,
            })),
        };

        await form.submitForm(payload);
    } catch (error: any) {
        // معالجة الأخطاء من Backend
        if (error.response?.data) {
            const errors = error.response.data;
            
            // عرض أخطاء الحقول
            if (typeof errors === 'object') {
                Object.entries(errors).forEach(([field, messages]) => {
                    const errorMsg = Array.isArray(messages) ? messages.join(', ') : String(messages);
                    safeToast(`${field}: ${errorMsg}`, { type: "error" });
                });
            }
        }
        
        console.error('Order creation error:', error);
    } finally {
        setIsSubmitting(false);
    }
};
```

---

## 🟡 مشاكل متوسطة الأولوية

### 5. عدم التحقق من صلاحية الوصفة الطبية

**المشكلة:**
- يمكن ربط وصفة طبية لا تخص العميل
- يمكن استخدام وصفة منتهية الصلاحية
- لا يوجد تحقق من أن المنتج يحتاج وصفة

**الحل:**
إضافة validation في OrderItemSerializer:
```python
def validate(self, data):
    prescription = data.get('prescription')
    if prescription:
        # سيتم إضافة order في context من OrderSerializer
        order = self.context.get('order')
        if order and prescription.customer_id != order.customer_id:
            raise ValidationError("الوصفة الطبية لا تخص هذا العميل")
        
        # التحقق من الصلاحية
        from django.utils import timezone
        if hasattr(prescription, 'expiry_date') and prescription.expiry_date:
            if prescription.expiry_date < timezone.now().date():
                raise ValidationError("الوصفة الطبية منتهية الصلاحية")
    
    return data
```

---

### 6. عدم منع تداخل العملاء مع الموردين

**المشكلة:**
- لا يوجد validation يمنع إن كان Customer هو Supplier

**الحل:**
في OrderSerializer:
```python
def validate_customer(self, value):
    """التحقق من أن العميل ليس مورداً"""
    if hasattr(value, 'customer_type'):
        if value.customer_type == 'supplier':
            raise ValidationError("لا يمكن إنشاء طلب بيع لمورد")
    return value
```

---

### 7. مشكلة في حساب الخصم عند تغيير المنتجات

**المشكلة:**
- عند إضافة/حذف منتجات، قد يصبح discountAmount أكبر من subtotal
- calculateTotals لا يُحدث discountPercent

**الحل:**
في `/osmFront/src/features/orders/store/useOrderFormStore.ts`:
```typescript
calculateTotals: () => {
    const { items, discountAmount, taxRate } = get();

    // حساب المجموع الفرعي
    const subtotal = items.reduce((sum, item) => {
        const itemTotal = item.quantity * item.unit_price;
        return sum + itemTotal;
    }, 0);

    // التحقق من أن الخصم لا يتجاوز المجموع
    let adjustedDiscount = discountAmount;
    if (adjustedDiscount > subtotal) {
        adjustedDiscount = subtotal;
    }

    // حساب نسبة الخصم
    const discountPercent = subtotal > 0 ? (adjustedDiscount / subtotal) * 100 : 0;

    // حساب الضريبة
    const taxableAmount = subtotal - adjustedDiscount;
    const taxAmount = taxableAmount * taxRate;

    // حساب الإجمالي
    const totalAmount = taxableAmount + taxAmount;

    set({ 
        subtotal, 
        taxAmount, 
        totalAmount,
        discountAmount: adjustedDiscount,
        discountPercent 
    });
},
```

---

### 8. Options غير متطابقة بين Frontend و Backend

**المشكلة:**
- Frontend: `ORDER_TYPE_OPTIONS = ["cash", "credit", "insurance"]`
- Backend: `ORDER_TYPE_CHOICES = ["cash", "credit", "insurance", "bnpl", "corporate", "wholesale"]`

**التأثير:**
- المستخدم لا يستطيع اختيار "تقسيط" أو "شركات" من الواجهة

**الحل:**
تحديث `/osmFront/src/features/orders/types/index.ts`:
```typescript
export const ORDER_TYPE_OPTIONS = [
    { value: "cash", label: "نقدي" },
    { value: "credit", label: "آجل" },
    { value: "insurance", label: "تأمين" },
    { value: "bnpl", label: "تقسيط (BNPL)" },
    { value: "corporate", label: "شركات" },
    { value: "wholesale", label: "جملة" },
];

export const PAYMENT_TYPE_OPTIONS = [
    { value: "cash", label: "نقدي" },
    { value: "card", label: "بطاقة" },
    { value: "mada", label: "مدى" },
    { value: "visa", label: "فيزا" },
    { value: "mastercard", label: "ماستر كارد" },
    { value: "stc_pay", label: "STC Pay" },
    { value: "apple_pay", label: "Apple Pay" },
    { value: "tabby", label: "تابي" },
    { value: "tamara", label: "تمارا" },
    { value: "bank_transfer", label: "تحويل بنكي" },
    { value: "insurance", label: "تأمين" },
    { value: "credit", label: "آجل" },
];
```

---

## 🟢 اقتراحات تحسين (اختيارية)

### 9. إضافة Loading States أفضل

**الاقتراح:**
- عرض Skeleton في ProductsStep أثناء البحث
- عرض Progress bar في StepIndicator
- Disable navigation buttons أثناء Submit

### 10. إضافة Confirmation Dialog

**الاقتراح:**
قبل Submit النهائي، عرض ملخص شامل للطلب:
```typescript
const [showConfirmation, setShowConfirmation] = useState(false);

// في PaymentStep، زر "التالي" يفتح Dialog بدلاً من Submit مباشرة
```

### 11. حفظ Draft تلقائياً

**الاقتراح:**
```typescript
useEffect(() => {
    const timer = setTimeout(() => {
        localStorage.setItem('order_draft', JSON.stringify(store));
    }, 2000);
    
    return () => clearTimeout(timer);
}, [store]);
```

### 12. Audit Log للتعديلات

**الاقتراح:**
تسجيل كل تعديل على الطلب:
```python
# في OrderSerializer.update()
from apps.audit.models import AuditLog

AuditLog.objects.create(
    user=request.user,
    action='order_updated',
    model='Order',
    object_id=instance.id,
    changes=changes_dict
)
```

---

## 📊 ملخص الأولويات

| الأولوية | عدد المشاكل | الحالة |
|---------|------------|--------|
| 🔴 حرجة | 4 | يجب إصلاحها فوراً |
| 🟡 متوسطة | 4 | يجب إصلاحها قريباً |
| 🟢 تحسينات | 4 | اختيارية |

---

## ✅ الخطوات التالية الموصى بها

1. ✅ إصلاح `payment_type` → `payment_method`
2. ✅ إضافة تحديد تلقائي للفرع والمستخدم
3. ✅ إضافة stock validation عند create
4. ✅ تحسين error handling في frontend
5. 🔄 إضافة prescription validation
6. 🔄 تحديث OPTIONS في frontend
7. 🔄 إصلاح calculateTotals في store
8. 📝 إضافة tests للـ validations

---

**تمت المراجعة بواسطة:** Antigravity AI
**التاريخ:** 2026-01-15T23:23
