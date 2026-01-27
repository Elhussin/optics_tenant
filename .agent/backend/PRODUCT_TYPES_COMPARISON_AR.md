# جدول مقارنة أنواع المنتجات والحقول المستخدمة في SKU

## 📊 جدول شامل لأنواع المنتجات والحقول

| نوع المنتج | الكود | الدالة المستخدمة | الحقول المستخدمة في SKU | مثال للكود |
|-----------|------|------------------|------------------------|-----------|
| **نظارات طبية** | `EW` | `_eyewear_fields()` | • frame_color<br>• lens_diameter<br>• temple_length<br>• bridge_width<br>• frame_shape<br>• frame_material<br>• lens_color | `V-EW-RA-AVIA-F1A2B3C4` |
| **نظارات شمسية** | `SG` | `_eyewear_fields()` | • frame_color<br>• lens_diameter<br>• temple_length<br>• bridge_width<br>• frame_shape<br>• frame_material<br>• lens_color | `V-SG-OA-FRGS-D5E6F7G8` |
| **عدسات عادية** | `SL` | `_lenses_fields()` | • lens_diameter<br>• lens_color<br>• lens_material<br>• spherical<br>• cylinder | `V-SL-ZE-CLAS-A1B2C3D4` |
| **عدسات لاصقة** | `CL` | `_lenses_fields()` | • lens_diameter<br>• lens_color<br>• lens_material<br>• lens_water_content<br>• replacement_schedule<br>• spherical<br>• cylinder<br>• axis<br>• addition<br>• lens_base_curve | `V-CL-AC-SOFT-E6F7G8H9` |
| **عدسات طبية** | `RL` | `_lenses_fields()` | • lens_diameter<br>• lens_color<br>• lens_material<br>• lens_base_curve<br>• addition<br>• right_or_left | `V-RL-ES-PROG-B3C4D5E6` |
| **إكسسوارات** | `AX` | - | • type<br>• model | `V-AX-GE-CASE-C4D5E6F7` |
| **أجهزة** | `DV` | - | • type<br>• model | `V-DV-NI-AUTO-G8H9I0J1` |
| **أخرى** | `OT` | - | • type<br>• model | `V-OT-UN-MISC-I0J1K2L3` |

---

## 🔍 تفاصيل الحقول لكل نموذج (Model)

### 1️⃣ FrameVariant (نظارات EW/SG)

```python
class FrameVariant(ProductVariant):
    # الحقول المستخدمة في SKU
    frame_color         # ForeignKey → AttributeValue (لون الإطار)
    lens_diameter       # ForeignKey → AttributeValue (قطر العدسة)
    temple_length       # ForeignKey → AttributeValue (طول الذراع)
    bridge_width        # ForeignKey → AttributeValue (عرض الجسر)
    frame_shape         # ForeignKey → AttributeValue (شكل الإطار)
    frame_material      # ForeignKey → AttributeValue (مادة الإطار)
    lens_color          # ForeignKey → AttributeValue (لون العدسة)
    
    def _eyewear_fields(self):
        return [
            str(self.frame_color.id if self.frame_color else ''),
            str(self.lens_diameter.id if self.lens_diameter else ''),
            str(self.temple_length.id if self.temple_length else ''),
            str(self.bridge_width.id if self.bridge_width else ''),
            str(self.frame_shape.id if self.frame_shape else ''),
            str(self.frame_material.id if self.frame_material else ''),
            str(self.lens_color.id if self.lens_color else ''),
        ]
```

**كيف يتم استخدامها:**
```python
# عند حفظ Variant جديد
variant = FrameVariant(
    product=product,
    frame_color=AttributeValue.objects.get(id=5),  # أسود
    lens_diameter=AttributeValue.objects.get(id=10),  # 52mm
    ...
)
variant.save()  # ← يستدعي clean() → build_sku() → generate_sku_code()
# SKU: V-EW-RA-AVIA-F1A2B3C4
```

---

### 2️⃣ StokLensVariant (عدسات عادية SL)

```python
class StokLensVariant(ProductVariant, BaseLens):
    # من BaseLens
    lens_diameter       # ForeignKey → AttributeValue
    lens_color          # ForeignKey → AttributeValue
    lens_material       # ForeignKey → AttributeValue
    lens_coatings       # ManyToManyField → AttributeValue (غير مستخدم في SKU)
    
    # خاص بـ StokLens
    spherical           # CharField (القوة الكروية: مثل '-2.00')
    cylinder            # CharField (القوة الأسطوانية: مثل '-0.50')
    
    def _lenses_fields(self):
        return [
            str(self.lens_diameter.id if self.lens_diameter else ''),
            str(self.lens_color.id if self.lens_color else ''),
            str(self.lens_material.id if self.lens_material else ''),
            str(self.spherical or ''),
            str(self.cylinder or ''),
        ]
```

**كيف يتم استخدامها:**
```python
variant = StokLensVariant(
    product=product,
    lens_diameter=AttributeValue.objects.get(id=12),  # 65mm
    lens_color=AttributeValue.objects.get(id=8),  # شفاف
    lens_material=AttributeValue.objects.get(id=14),  # CR-39
    spherical='-2.00',
    cylinder='-0.50'
)
variant.save()
# fields = ['456', '12', '8', '14', '-2.00', '-0.50']
# SKU: V-SL-ZE-CLAS-D5E6F7G8
```

---

### 3️⃣ RxLensVariant (عدسات طبية RL)

```python
class RxLensVariant(ProductVariant, BaseLens):
    # من BaseLens
    lens_diameter       # ForeignKey → AttributeValue
    lens_color          # ForeignKey → AttributeValue
    lens_material       # ForeignKey → AttributeValue
    lens_coatings       # ManyToManyField (غير مستخدم في SKU)
    
    # خاص بـ RxLens
    lens_base_curve     # ForeignKey → AttributeValue (انحناء القاعدة)
    addition            # CharField (الإضافة للقراءة)
    right_or_left       # CharField ('R' أو 'L')
    
    def _lenses_fields(self):
        return [
            str(self.lens_diameter.id if self.lens_diameter else ''),
            str(self.lens_color.id if self.lens_color else ''),
            str(self.lens_material.id if self.lens_material else ''),
            str(self.lens_base_curve.id if self.lens_base_curve else ''),
            str(self.addition or ''),
            str(self.right_or_left or ''),
        ]
```

**كيف يتم استخدامها:**
```python
variant = RxLensVariant(
    product=product,
    lens_diameter=AttributeValue.objects.get(id=15),
    lens_base_curve=AttributeValue.objects.get(id=20),
    addition='+2.00',
    right_or_left='R'  # عين يمين
)
variant.save()
# fields = ['789', '15', '...', '20', '+2.00', 'R']
# SKU: V-RL-ES-PROG-B3C4D5E6
```

---

### 4️⃣ ContactLensVariant (عدسات لاصقة CL)

```python
class ContactLensVariant(ProductVariant, BaseLens):
    # من BaseLens
    lens_diameter       # ForeignKey → AttributeValue
    lens_color          # ForeignKey → AttributeValue
    lens_material       # ForeignKey → AttributeValue
    lens_coatings       # ManyToManyField (غير مستخدم)
    
    # خاص بـ ContactLens
    lens_water_content      # ForeignKey → AttributeValue (نسبة الماء)
    replacement_schedule    # ForeignKey → AttributeValue (جدول الاستبدال)
    units                   # ForeignKey → AttributeValue (الوحدة)
    spherical               # CharField (القوة الكروية)
    cylinder                # CharField (القوة الأسطوانية)
    axis                    # CharField (المحور)
    addition                # CharField (الإضافة)
    lens_base_curve         # ForeignKey → AttributeValue
    
    def _lenses_fields(self):
        return [
            str(self.lens_diameter.id if self.lens_diameter else ''),
            str(self.lens_color.id if self.lens_color else ''),
            str(self.lens_material.id if self.lens_material else ''),
            str(self.lens_water_content.id if self.lens_water_content else ''),
            str(self.replacement_schedule.id if self.replacement_schedule else ''),
            str(self.spherical or ''),
            str(self.cylinder or ''),
            str(self.axis or ''),
            str(self.addition or ''),
            str(self.lens_base_curve.id if self.lens_base_curve else ''),
        ]
```

**كيف يتم استخدامها:**
```python
variant = ContactLensVariant(
    product=product,
    lens_diameter=AttributeValue.objects.get(id=18),
    lens_water_content=AttributeValue.objects.get(id=22),  # 58%
    replacement_schedule=AttributeValue.objects.get(id=25),  # شهري
    spherical='-3.00',
    cylinder='-0.75',
    axis='180'
)
variant.save()
# fields = ['321', '18', '...', '22', '25', '-3.00', '-0.75', '180', '', '']
# SKU: V-CL-AC-SOFT-E6F7G8H9
```

---

## 📝 ملاحظات مهمة

### 1. ForeignKey vs CharField
- **ForeignKey** → يستخدم `.id` للحصول على المعرف
- **CharField** → يستخدم القيمة مباشرة

### 2. القيم الفارغة
- استخدام `if field else ''` يضمن عدم حدوث أخطاء
- القيم الفارغة تصبح سلاسل نصية فارغة في الـ hash

### 3. ManyToManyField
- **لا يتم** استخدامها في SKU (مثل `lens_coatings`)
- لأنها يمكن أن تحتوي على قيم متعددة

### 4. الترتيب مهم
- ترتيب الحقول في `_eyewear_fields()` و `_lenses_fields()` مهم
- تغيير الترتيب يغير الـ hash

---

## 🎯 اختبار عملي

### سيناريو 1: نظارتان متطابقتان تمامًا
```python
variant1 = FrameVariant(
    product=product,
    frame_color=attr_5,
    lens_diameter=attr_10,
    ...
)
# SKU: V-EW-RA-AVIA-F1A2B3C4

variant2 = FrameVariant(
    product=product,
    frame_color=attr_5,  # نفس اللون
    lens_diameter=attr_10,  # نفس القطر
    ...
)
# SKU: V-EW-RA-AVIA-F1A2B3C4 (نفس الكود!)
# ❌ خطأ: ValidationError - Variant مكرر
```

### سيناريو 2: نظارتان مختلفتان قليلاً
```python
variant1 = FrameVariant(
    product=product,
    frame_color=attr_5,  # أسود
    ...
)
# SKU: V-EW-RA-AVIA-F1A2B3C4

variant2 = FrameVariant(
    product=product,
    frame_color=attr_6,  # أزرق (ID مختلف)
    ...
)
# SKU: V-EW-RA-AVIA-D8E9F0A1 (hash مختلف!)
# ✅ ناجح: variant منفصل
```

---

## 🔄 تتبع استدعاء الدوال

```
User → يحفظ Variant
    ↓
ProductVariant.save()
    ↓
ProductVariant.full_clean()
    ↓
ProductVariant.clean()
    ↓
ProductVariant.build_sku()
    ↓
generate_sku_code(self)
    ↓
hasattr(variant, '_eyewear_fields') or hasattr(variant, '_lenses_fields')
    ↓
variant._eyewear_fields() أو variant._lenses_fields()
    ↓
إرجاع قائمة الحقول → ['5', '10', '15', ...]
    ↓
دمج الحقول → "123-5-10-15-..."
    ↓
SHA-256 hash → "F1A2B3C4"
    ↓
بناء الكود → "V-EW-RA-AVIA-F1A2B3C4"
    ↓
حفظ في variant.usku
```

---

## 📚 الخلاصة النهائية

| العنصر | الوصف |
|--------|-------|
| **الدوال المستخدمة** | `_eyewear_fields()` للنظارات<br>`_lenses_fields()` للعدسات |
| **مصدر القيم** | `ForeignKey.id` للحقول المرتبطة<br>القيمة مباشرة للحقول النصية |
| **متى تستدعى** | عند حفظ variant جديد أو تعديله |
| **الفائدة** | كود SKU فريد لكل مواصفات مختلفة<br>منع التكرار |
| **الأمان** | معالجة القيم الفارغة<br>try-except للحماية من الأخطاء |
