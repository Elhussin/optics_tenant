# شرح دالة generate_sku_code - توليد كود SKU فريد للمنتجات

## 📋 نظرة عامة

دالة `generate_sku_code` تقوم بإنشاء كود SKU (Stock Keeping Unit) فريد ومقروء للمنتجات والـ Variants.

---

## 🔍 كيف تعمل الدالة؟

### 1️⃣ **تحديد نوع المدخل (Product أو Variant)**

```python
if hasattr(instance, 'product'):
    product = instance.product  # إذا كان variant
    variant = instance
else:
    product = instance  # إذا كان product
    variant = None
```

**الشرح:**
- إذا كان المدخل `ProductVariant`، فإنه يحتوي على خاصية `product`
- إذا كان المدخل `Product`، فلا يحتوي على هذه الخاصية

---

### 2️⃣ **جمع الحقول حسب نوع المنتج**

#### أ) **بدء قائمة الحقول**
```python
fields = [str(product.id or '')]
```
يبدأ بمعرف المنتج (ID)

#### ب) **إضافة حقول خاصة بالـ Variant**

##### 🕶️ **للنظارات (Eyewear) والنظارات الشمسية (Sunglasses)**
```python
if product.type in ['EW', 'SG'] and hasattr(variant, '_eyewear_fields'):
    fields += variant._eyewear_fields()
```

**حقول النظارات من `FrameVariant._eyewear_fields()`:**
- `frame_color.id` - لون الإطار
- `lens_diameter.id` - قطر العدسة
- `temple_length.id` - طول الذراع
- `bridge_width.id` - عرض الجسر
- `frame_shape.id` - شكل الإطار
- `frame_material.id` - مادة الإطار
- `lens_color.id` - لون العدسة

##### 👓 **للعدسات العادية (Stock Lenses - SL)**
```python
elif product.type in ['SL'] and hasattr(variant, '_lenses_fields'):
    fields += variant._lenses_fields()
```

**حقول العدسات العادية من `StokLensVariant._lenses_fields()`:**
- `lens_diameter.id` - قطر العدسة
- `lens_color.id` - لون العدسة
- `lens_material.id` - مادة العدسة
- `spherical` - القوة الكروية
- `cylinder` - القوة الأسطوانية

##### 👁️ **للعدسات الطبية (RxLens - RL)**

**حقول العدسات الطبية من `RxLensVariant._lenses_fields()`:**
- `lens_diameter.id` - قطر العدسة
- `lens_color.id` - لون العدسة
- `lens_material.id` - مادة العدسة
- `lens_base_curve.id` - انحناء القاعدة
- `addition` - الإضافة
- `right_or_left` - العين (يمين/يسار)

##### 🔵 **للعدسات اللاصقة (Contact Lenses - CL)**

**حقول العدسات اللاصقة من `ContactLensVariant._lenses_fields()`:**
- `lens_diameter.id` - قطر العدسة
- `lens_color.id` - لون العدسة
- `lens_material.id` - مادة العدسة
- `lens_water_content.id` - نسبة الماء
- `replacement_schedule.id` - جدول الاستبدال
- `spherical` - القوة الكروية
- `cylinder` - القوة الأسطوانية
- `axis` - المحور
- `addition` - الإضافة
- `lens_base_curve.id` - انحناء القاعدة

#### ج) **للأنواع الأخرى**
```python
if product.type in ['AX', 'DV', 'OT'] or not variant:
    fields += [str(product.type), str(product.model or '')]
```

**الأنواع:**
- `AX` - Accessories (إكسسوارات)
- `DV` - Devices (أجهزة)
- `OT` - Other (أخرى)

---

### 3️⃣ **إنشاء Hash للتفرد**

```python
base_string = "-".join(fields)
hash_value = hashlib.sha256(base_string.encode()).hexdigest()[:8].upper()
```

**الشرح:**
1. دمج جميع الحقول بـ `-`
2. تشفيرها باستخدام SHA-256
3. أخذ أول 8 أحرف وتحويلها لأحرف كبيرة

**مثال:**
```
fields = ['123', '5', '10', '15', '20']
base_string = "123-5-10-15-20"
hash_value = "A1B2C3D4"
```

---

### 4️⃣ **بناء الكود النهائي (Human-Readable)**

```python
type_code = product.type
brand_name = 'XX'
try:
    if product.brand:
        brand_name = product.brand.name
except:
    pass

brand_code = brand_name[:2].upper()
model_code = (product.model or '')[:4].upper()

prefix = "P" if not variant else "V"

return f"{prefix}-{type_code}-{brand_code}-{model_code}-{hash_value}"
```

**مكونات الكود:**
- `prefix`: `P` للمنتج، `V` للـ variant
- `type_code`: نوع المنتج (EW, SG, SL, CL, إلخ)
- `brand_code`: أول حرفين من اسم العلامة التجارية
- `model_code`: أول 4 أحرف من الموديل
- `hash_value`: 8 أحرف من الـ hash

**مثال للكود النهائي:**
```
V-EW-RA-2000-A1B2C3D4
│ │  │  │    └─ Hash (8 chars)
│ │  │  └────── Model (4 chars)
│ │  └───────── Brand (2 chars)
│ └──────────── Type (EW = Eyewear)
└─────────────── Prefix (V = Variant)
```

---

## 📊 مخطط تدفق البيانات

```
┌─────────────────┐
│  Instance من    │
│ Product/Variant │
└────────┬────────┘
         │
         ▼
   ┌─────────────┐
   │ تحديد النوع  │
   └─────┬───────┘
         │
    ┌────┴────┐
    │         │
    ▼         ▼
Product    Variant
    │         │
    │    ┌────┴────────────────────┐
    │    │                         │
    │    ▼                         ▼
    │  Eyewear               Lenses
    │    │                         │
    │    ▼                         ▼
    │ _eyewear_fields()    _lenses_fields()
    │    │                         │
    └────┴─────────────────────────┘
         │
         ▼
   ┌──────────────┐
   │ جمع الحقول    │
   └──────┬───────┘
          │
          ▼
   ┌──────────────┐
   │ إنشاء Hash   │
   └──────┬───────┘
          │
          ▼
   ┌──────────────┐
   │ بناء الكود    │
   │   النهائي    │
   └──────────────┘
```

---

## 🎯 أمثلة عملية

### مثال 1: نظارة (Frame Variant)
```python
product = Product(
    id=123,
    type='EW',
    brand=Brand(name='RayBan'),
    model='Aviator'
)

variant = FrameVariant(
    product=product,
    frame_color=AttributeValue(id=5),
    lens_diameter=AttributeValue(id=10),
    temple_length=AttributeValue(id=15),
    bridge_width=AttributeValue(id=20),
    frame_shape=AttributeValue(id=25),
    frame_material=AttributeValue(id=30),
    lens_color=AttributeValue(id=35)
)

# النتيجة:
# fields = ['123', '5', '10', '15', '20', '25', '30', '35']
# base_string = "123-5-10-15-20-25-30-35"
# hash = "F1A2B3C4"
# SKU = "V-EW-RA-AVIA-F1A2B3C4"
```

### مثال 2: عدسة عادية (Stock Lens Variant)
```python
product = Product(
    id=456,
    type='SL',
    brand=Brand(name='Zeiss'),
    model='Classic'
)

variant = StokLensVariant(
    product=product,
    lens_diameter=AttributeValue(id=12),
    lens_color=AttributeValue(id=8),
    lens_material=AttributeValue(id=14),
    spherical='-2.00',
    cylinder='-0.50'
)

# النتيجة:
# fields = ['456', '12', '8', '14', '-2.00', '-0.50']
# base_string = "456-12-8-14--2.00--0.50"
# hash = "D5E6F7G8"
# SKU = "V-SL-ZE-CLAS-D5E6F7G8"
```

---

## ⚠️ ملاحظات هامة

1. **التفرد (Uniqueness):**
   - الـ Hash يضمن أن كل variant بمواصفات مختلفة يحصل على كود فريد
   - حتى لو كانت الاختلافات طفيفة

2. **القابلية للقراءة:**
   - الكود يحتوي على معلومات مقروءة (Brand, Model, Type)
   - يسهل التعرف على المنتج من الكود

3. **الحقول الناقصة:**
   - إذا كان حقل غير متوفر (None)، يتم استخدام قيمة فارغة ''
   - هذا يمنع الأخطاء ويضمن استمرار العملية

4. **الأمان:**
   - استخدام try-except عند الوصول للعلامة التجارية
   - يمنع الأخطاء إذا كانت العلامة غير موجودة

---

## 🔄 متى يتم استدعاء الدالة؟

### من `Product.save()`:
```python
if not self.sku:
    self.sku = generate_sku_code(self)
```

### من `ProductVariant.build_sku()`:
```python
return generate_sku_code(self)
```

### من `ProductVariant.clean()`:
```python   
if not self.sku:
    self.sku = self.build_sku()
```

---

## 📚 الخلاصة

دالة `generate_sku_code` هي آلية ذكية لتوليد أكواد SKU فريدة ومقروءة:

1. ✅ تتعامل مع أنواع مختلفة من المنتجات
2. ✅ تجمع الحقول المناسبة لكل نوع
3. ✅ تستخدم Hash لضمان التفرد
4. ✅ تنشئ كودًا مقروءًا يحتوي على معلومات المنتج
5. ✅ آمنة ومقاومة للأخطاء

النتيجة: كود SKU مثل `V-EW-RA-AVIA-F1A2B3C4` يخبرك فورًا:
- ✓ هذا Variant (V)
- ✓ نوعه Eyewear (EW)
- ✓ من علامة RayBan (RA)
- ✓ موديل Aviator (AVIA)
- ✓ مواصفات فريدة (F1A2B3C4)
