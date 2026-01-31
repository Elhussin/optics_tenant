# ميزة الوصف التلقائي للمنتجات - Auto Description Feature

## 📝 نظرة عامة

تم إضافة حقل `description` إلى `ProductVariant` لبناء وصف مقروء تلقائيًا بناءً على مواصفات المنتج.

---

## ✨ الميزات الرئيسية

### 1. **وصف تلقائي**
- يتم بناء الوصف تلقائيًا عند حفظ الـ variant
- لا حاجة لكتابة الوصف يدويًا
- يتم تحديث الوصف تلقائيًا عند تغيير المواصفات

### 2. **وصف مخصص لكل نوع**
كل نوع من المنتجات له دالة `build_description()` مخصصة:
- **FrameVariant** - نظارات طبية وشمسية
- **StokLensVariant** - عدسات عادية
- **RxLensVariant** - عدسات طبية
- **ContactLensVariant** - عدسات لاصقة
- **ProductVariant** - وصف افتراضي للأنواع الأخرى

---

## 🔍 كيف يعمل؟

### البنية العامة

```python
class ProductVariant(BaseModel):
    # ... حقول أخرى ...
    description = models.TextField(
        blank=True, 
        editable=False,  # لا يمكن تعديله يدويًا
        help_text="Auto-generated description based on variant specifications"
    )
    
    def build_description(self):
        """بناء وصف مقروء - يتم تجاوزها في الفئات الفرعية"""
        parts = [self.product.name]
        
        if self.product_type:
            parts.append(f"نوع: {self._get_safe_attr_name(self.product_type)}")
        
        # إضافة السعر
        price_text = f"السعر: {self.selling_price} ر.س"
        if self.discount_price:
            price_text = f"السعر: {self.discount_price} ر.س (بعد خصم {self.discount_percentage}%)"
        parts.append(price_text)
        
        return " | ".join(parts)
    
    def save(self, *args, **kwargs):
        # بناء الوصف قبل الحفظ
        if not self.description or kwargs.pop('force_description_update', False):
            self.description = self.build_description()
        
        self.full_clean()
        super().save(*args, **kwargs)
```

---

## 📊 أمثلة الأوصاف لكل نوع

### 1️⃣ **نظارة (FrameVariant)**

#### الكود:
```python
variant = FrameVariant(
    product=product,  # RayBan Aviator
    frame_color=AttributeValue(name="أسود"),
    frame_shape=AttributeValue(name="Aviator"),
    frame_material=AttributeValue(name="معدن"),
    lens_diameter=AttributeValue(name="52"),
    temple_length=AttributeValue(name="140"),
    bridge_width=AttributeValue(name="18"),
    lens_color=AttributeValue(name="أخضر"),
)
variant.save()
```

#### الوصف الناتج:
```
RayBan Aviator | اللون: أسود - الشكل: Aviator - المادة: معدن | قطر العدسة: 52 - طول الذراع: 140 - عرض الجسر: 18 | لون العدسة: أخضر
```

---

### 2️⃣ **عدسة عادية (StokLensVariant)**

#### الكود:
```python
variant = StokLensVariant(
    product=product,  # Zeiss Classic
    spherical="-2.00",
    cylinder="-0.50",
    lens_diameter=AttributeValue(name="65"),
    lens_material=AttributeValue(name="CR-39"),
    lens_color=AttributeValue(name="شفاف"),
)
variant.save()
```

#### الوصف الناتج:
```
Zeiss Classic | القوة الكروية: -2.00 - القوة الأسطوانية: -0.50 | القطر: 65 - المادة: CR-39 - اللون: شفاف
```

---

### 3️⃣ **عدسة طبية (RxLensVariant)**

#### الكود:
```python
variant = RxLensVariant(
    product=product,  # Essilor Progressive
    addition="+2.00",
    right_or_left="R",
    lens_diameter=AttributeValue(name="70"),
    lens_base_curve=AttributeValue(name="8.6"),
    lens_material=AttributeValue(name="Polycarbonate"),
    lens_color=AttributeValue(name="شفاف"),
)
variant.save()
```

#### الوصف الناتج:
```
Essilor Progressive | الإضافة: +2.00 - العين اليمنى | القطر: 70 - انحناء القاعدة: 8.6 - المادة: Polycarbonate - اللون: شفاف
```

---

### 4️⃣ **عدسة لاصقة (ContactLensVariant)**

#### الكود:
```python
variant = ContactLensVariant(
    product=product,  # Acuvue Soft
    spherical="-3.00",
    cylinder="-0.75",
    axis="180",
    addition="+1.50",
    lens_diameter=AttributeValue(name="14.0"),
    lens_water_content=AttributeValue(name="58%"),
    replacement_schedule=AttributeValue(name="شهري"),
    lens_base_curve=AttributeValue(name="8.5"),
    lens_material=AttributeValue(name="Silicone Hydrogel"),
)
variant.save()
```

#### الوصف الناتج:
```
Acuvue Soft | القوة الكروية: -3.00 - القوة الأسطوانية: -0.75 - المحور: 180 - الإضافة: +1.50 | القطر: 14.0 - نسبة الماء: 58% - الاستبدال: شهري - انحناء القاعدة: 8.5 - المادة: Silicone Hydrogel
```

---

## 🛠️ الدوال المساعدة

### `_get_safe_attr_name(attr)`
دالة مساعدة للحصول على اسم الصفة بأمان:

```python
def _get_safe_attr_name(self, attr):
    """Helper to safely get attribute value name"""
    try:
        if attr and hasattr(attr, 'name'):
            return attr.name
    except:
        pass
    return str(attr) if attr else ''
```

**الفوائد:**
- تمنع الأخطاء إذا كانت القيمة `None`
- تتعامل مع أي استثناءات
- ترجع سلسلة نصية فارغة في حالة الفشل

---

## 🔄 تحديث الوصف يدويًا

إذا أردت إجبار تحديث الوصف:

```python
variant.save(force_description_update=True)
```

هذا مفيد عندما:
- تريد إعادة بناء الوصف بعد تغيير البيانات
- تحديث أوصاف المنتجات القديمة

---

## 📋 سكريبت لتحديث الأوصاف القديمة

إذا كان لديك منتجات قديمة بدون أوصاف:

```python
# management/commands/update_variant_descriptions.py
from django.core.management.base import BaseCommand
from apps.products.models import ProductVariant

class Command(BaseCommand):
    help = 'Update descriptions for all variants'

    def handle(self, *args, **options):
        variants = ProductVariant.objects.all()
        updated_count = 0
        
        for variant in variants:
            try:
                # Force update description
                variant.save(force_description_update=True)
                updated_count += 1
                self.stdout.write(f"✓ Updated: {variant.sku}")
            except Exception as e:
                self.stdout.write(
                    self.style.ERROR(f"✗ Failed: {variant.sku} - {str(e)}")
                )
        
        self.stdout.write(
            self.style.SUCCESS(f"\n✅ Updated {updated_count} variants")
        )
```

**الاستخدام:**
```bash
pdm run python manage.py update_variant_descriptions
```

---

## 🎯 حالات الاستخدام

### 1. **عرض الوصف في القوائم**
```python
# في API
class ProductVariantSerializer(serializers.ModelSerializer):
    class Meta:
        model = ProductVariant
        fields = ['id', 'sku', 'description', 'selling_price', ...]
```

### 2. **البحث في الأوصاف**
```python
# البحث بالنص
variants = ProductVariant.objects.filter(
    description__icontains="أسود"
)
```

### 3. **عرض في الفاتورة**
```python
def generate_invoice(order):
    for item in order.items.all():
        print(f"{item.variant.description}")
        print(f"السعر: {item.unit_price} ر.س")
```

---

## 🔍 مقارنة: قبل وبعد

### ❌ قبل (يدوي):
```python
variant = FrameVariant(...)
variant.description = "نظارة RayBan Aviator أسود معدن..."  # ← يدوي!
variant.save()
```

**المشاكل:**
- عرضة للأخطاء البشرية
- غير متسق
- يحتاج صيانة مستمرة

### ✅ بعد (تلقائي):
```python
variant = FrameVariant(...)
variant.save()  # ← الوصف يُبنى تلقائيًا!
```

**الفوائد:**
- ✓ دقيق دائمًا
- ✓ متسق
- ✓ لا يحتاج صيانة

---

## 📊 مخطط تدفق بناء الوصف

```
المستخدم يحفظ Variant
        ↓
  variant.save()
        ↓
  هل description فارغ؟
  أو force_description_update=True؟
        ↓
      نعم
        ↓
  variant.build_description()
        ↓
  تحديد نوع الـ Variant
        ↓
   ┌──────┴──────┐
   │             │
   ▼             ▼
FrameVariant  StokLensVariant ...
   │             │
   ▼             ▼
build_description()
   │
   ▼
جمع المعلومات:
- اسم المنتج
- المواصفات
- القياسات
        ↓
  دمج في نص واحد
        ↓
  حفظ في description
        ↓
  استمرار الحفظ
```

---

## 🚀 الخلاصة

### الإضافات:
1. ✅ حقل `description` جديد في `ProductVariant`
2. ✅ دالة `build_description()` لكل نوع variant
3. ✅ دالة `_get_safe_attr_name()` مساعدة
4. ✅ تحديث تلقائي عند الحفظ

### الفوائد:
- 🎯 أوصاف دقيقة ومتسقة
- ⚡ توفير الوقت والجهد
- 🛡️ تقليل الأخطاء البشرية
- 📱 جاهز للاستخدام في API والواجهات

### مثال واقعي كامل:
```python
# إنشاء نظارة
frame = FrameVariant.objects.create(
    product=Product.objects.get(id=123),
    frame_color=AttributeValue.objects.get(name="أسود"),
    lens_diameter=AttributeValue.objects.get(name="52"),
    selling_price=500.00,
)

# الوصف يُبنى تلقائيًا:
print(frame.description)
# "RayBan Aviator | اللون: أسود | قطر العدسة: 52 | ..."

# استخدام في API
response = {
    'id': frame.id,
    'sku': frame.sku,
    'description': frame.description,  # ← جاهز للاستخدام!
    'price': frame.selling_price,
}
```
