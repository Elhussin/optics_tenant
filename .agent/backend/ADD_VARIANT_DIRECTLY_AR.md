# إضافة Variant جديد لمنتج موجود

## 🎯 **الحل**

تم إنشاء endpoint منفصل لإضافة variants مباشرة بدون الحاجة لتعديل المنتج.

---

## 📍 **الـ Endpoint**

```
POST /api/product-variants/
```

---

## 📝 **كيفية الاستخدام**

### من Frontend:

```typescript
// إضافة variant جديد لمنتج موجود
const createVariant = async (productId: number, variantData: any) => {
  const data = {
    product: productId,  // ← معرف المنتج الموجود
    product_type: 209,
    selling_price: "200",
    spherical: "-20.00",
    cylinder: "-07.50",
    lens_coatings: [183, 182],
    lens_diameter: 115,
    lens_color: 210,
    lens_material: 5,
    discount_percentage: "10",
    last_purchase_price: "20"
  };
  
  // POST to variants endpoint (NOT products)
  const response = await api.post('/api/product-variants/', data);
  return response.data;
};
```

---

## 🔧 **أمثلة**

### مثال 1: إضافة عدسة عادية (Stock Lens)

```bash
POST /api/product-variants/
```

```json
{
  "product": 55,
  "product_type": 209,
  "selling_price": "200",
  "spherical": "-20.00",
  "cylinder": "-07.50",
  "lens_diameter": 115,
  "lens_color": 210,
  "lens_material": 5,
  "lens_coatings": [183, 182],
  "discount_percentage": "10",
  "last_purchase_price": "20"
}
```

**الاستجابة:**
```json
{
  "id": 456,
  "sku": "V-SL-ZE-1153-ABC123",
  "description": "Zeiss 1153 | SPH -20.00 - CYL -07.50 | DIAM 62 - MATERIAL Plastic - COLOR Green - COATINGS Anti-Glare, UV Protection",
  "product": 55,
  "product_name": "Zeiss 1153",
  "product_type": 209,
  "selling_price": "200.00",
  "discount_price": "180.00",
  ...
}
```

---

### مثال 2: إضافة إطار (Frame)

```json
{
  "product": 60,
  "product_type": 201,
  "selling_price": "500",
  "frame_color": 5,
  "lens_diameter": 52,
  "temple_length": 140,
  "bridge_width": 18,
  "frame_shape": 10,
  "frame_material": 3,
  "lens_color": 8
}
```

---

### مثال 3: إضافة عدسة لاصقة (Contact Lens)

```json
{
  "product": 70,
  "product_type": 211,
  "selling_price": "120",
  "spherical": "-3.00",
  "cylinder": "-0.75",
  "axis": "180",
  "lens_diameter": 14,
  "lens_water_content": 58,
  "replacement_schedule": 30,
  "lens_base_curve": 8.5,
  "lens_coatings": [185, 186]
}
```

---

## ⚙️ **ما يحدث تحت الغطاء**

### 1. **الإنشاء**
```python
# في ProductVariantViewSet
def get_serializer_class(self):
    if self.action == 'create':
        return Create
ProductVariantSerializer  # ← يسمح بتحديد product
    return ProductVariantSerializer  # ← للقراءة فقط
```

### 2. **معالجة M2M Fields**
```python
# في CreateProductVariantSerializer.create()
# 1. استخراج lens_coatings من validated_data
m2m_fields = {}
if 'lens_coatings' in validated_data:
    m2m_fields['lens_coatings'] = validated_data.pop('lens_coatings')

# 2. إنشاء variant
variant = ProductVariant.objects.create(**validated_data)

# 3. إضافة lens_coatings
variant.lens_coatings.set(m2m_fields['lens_coatings'])

# 4. تحديث الوصف
variant.save(force_description_update=True)
```

### 3. **بناء الوصف**
```python
# الآن lens_coatings موجودة، ستظهر في الوصف
description = "Zeiss 1153 | SPH -20.00 | ... | COATINGS Anti-Glare, UV Protection"
```

---

## 🔄 **الفرق بين الطريقتين**

### الطريقة القديمة (عبر Product):
```bash
# تحديث المنتج وإضافة variant
PATCH /api/products/55/
{
  "variants": [{
    "product_type": 209,
    "selling_price": "200",
    ...
  }]
}
```

**مشاكل:**
- ❌ معقدة - تحتاج إرسال كل variants الموجودة
- ❌ خطر - يمكن حذف variants موجودة بالخطأ
- ❌ غير واضحة - الغرض هو إضافة variant وليس تحديث product

### الطريقة الجديدة (مباشرة):
```bash
# إنشاء variant مباشرة
POST /api/product-variants/
{
  "product": 55,
  "product_type": 209,
  "selling_price": "200",
  ...
}
```

**مميزات:**
- ✅ بسيطة - فقط بيانات الـ variant الجديد
- ✅ آمنة - لا تؤثر على variants موجودة
- ✅ واضحة - الهدف واضح (إضافة variant)

---

## 📊 **الحقول المطلوبة**

### حقول أساسية (لجميع الأنواع):
- ✅ `product` (معرف المنتج الموجود)
- ✅ `product_type`
- ✅ `selling_price`

### حقول إضافية حسب النوع:

| النوع | الحقول المطلوبة |
|------|-----------------|
| **Frame** | frame_color, lens_diameter, temple_length, bridge_width |
| **Stock Lens** | spherical, lens_diameter |
| **Rx Lens** | lens_diameter, addition (optional) |
| **Contact Lens** | spherical, lens_diameter |

### حقول اختيارية:
- `lens_coatings` (array of IDs)
- `discount_percentage`
- `last_purchase_price`
- `sku` (custom SKU)
- وغيرها...

---

## 🧪 **اختبار الـ API**

### باستخدام cURL:
```bash
curl -X POST http://localhost:8000/api/product-variants/ \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -d '{
    "product": 55,
    "product_type": 209,
    "selling_price": "200",
    "spherical": "-20.00",
    "cylinder": "-07.50",
    "lens_coatings": [183, 182],
    "lens_diameter": 115,
    "lens_color": 210,
    "lens_material": 5
  }'
```

### باستخدام JavaScript (Fetch):
```javascript
fetch('/api/product-variants/', {
  method: 'POST',
  headers: {
    'Content-Type': 'application/json',
    'Authorization': 'Bearer YOUR_TOKEN'
  },
  body: JSON.stringify({
    product: 55,
    product_type: 209,
    selling_price: "200",
    spherical: "-20.00",
    cylinder: "-07.50",
    lens_coatings: [183, 182],
    lens_diameter: 115,
    lens_color: 210,
    lens_material: 5
  })
})
.then(res => res.json())
.then(data => console.log('Variant created:', data));
```

---

## ✅ **الخلاصة**

**المشكلة:** لا يمكن إضافة variant مباشرة، فقط عبر تحديث المنتج

**الحل:** 
- ✅ إنشاء `CreateProductVariantSerializer`
- ✅ تعديل `ProductVariantViewSet` لاستخدامه
- ✅ endpoint جديد: `POST /api/product-variants/`

**الاستخدام:**
```javascript
POST /api/product-variants/
{
  "product": <product_id>,
  "product_type": <type_id>,
  "selling_price": "<price>",
  // ... بقية الحقول
}
```

**النتيجة:**
- ✅ إنشاء variant بسهولة
- ✅ lens_coatings تظهر في الوصف
- ✅ آمن ولا يؤثر على variants موجودة

جرب الآن! 🚀
