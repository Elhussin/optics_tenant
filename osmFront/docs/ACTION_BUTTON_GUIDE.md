# دليل استخدام ActionButton المحدث 🎯

## 🎨 فلسفة الألوان الموحدة

تم تطوير نظام ألوان دلالي واضح لكل نوع زر:

### 📋 Variants الأساسية

| Variant | متى تستخدمه | اللون | مثال |
|---------|-------------|-------|------|
| `primary` | الإجراء الأساسي الرئيسي | 🔵 أزرق | حفظ، إرسال |
| `success` | إجراءات إيجابية | 🟢 أخضر | إنشاء، تفعيل |
| `warning` | تحذيرات، تعديلات | 🟠 برتقالي | تعديل، تحديث |
| `danger` | إجراءات خطرة | 🔴 أحمر | حذف، إلغاء |
| `info` | معلومات | 🔷 سماوي | عرض، تفاصيل |
| `secondary` | إجراءات ثانوية | ⚫ رمادي | إغلاق |
| `ghost` | خفيف شفاف | - | - |
| `outline` | إطار فقط | - | - |
| `glass` | زجاجي (Glassmorphism) | - | - |

### 🎯 Icon Button Variants (جديد!)

للأزرار الأيقونية الصغيرة (في Cards، Tables):

```tsx
// ✅ زر عرض/معلومات
<ActionButton 
  variant="icon-view" 
  icon={<Eye />} 
  title="عرض" 
/>

// ✅ زر تعديل
<ActionButton 
  variant="icon-edit" 
  icon={<Pencil />} 
  title="تعديل" 
/>

// ✅ زر حذف
<ActionButton 
  variant="icon-delete" 
  icon={<Trash />} 
  title="حذف" 
/>

// ✅ زر معلومات
<ActionButton 
  variant="icon-info" 
  icon={<Info />} 
  title="معلومات" 
/>

// ✅ زر نجاح/تفعيل
<ActionButton 
  variant="icon-success" 
  icon={<Check />} 
  title="تفعيل" 
/>
```

---

## 📏 الأحجام (Sizes)

```tsx
// Extra Small - للأزرار الأيقونية الصغيرة جداً
<ActionButton size="xs" icon={<Plus />} />

// Small - للأزرار في Cards والجداول (الأكثر استخداماً مع icon-*)
<ActionButton size="sm" icon={<Eye />} />

// Medium (افتراضي) - للأزرار العادية
<ActionButton size="md" label="حفظ" />

// Large - للـ CTA الكبيرة (Call-to-Action)
<ActionButton size="lg" label="إنشاء حساب جديد" />
```

---

## 🎬 الخصائص الجديدة

### 1. Loading State (حالة التحميل)

```tsx
// تلقائياً - الزر يدير التحميل داخلياً
<ActionButton 
  onClick={async () => {
    await saveData(); // سيظهر السبيكر تلقائياً
  }}
/>

// يدوياً - يمكنك التحكم بالتحميل خارجياً
const [saving, setSaving] = useState(false);

<ActionButton 
  isLoading={saving}
  onClick={() => handleSave()}
/>
```

### 2. Haptic Feedback (اهتزاز خفيف للموبايل)

```tsx
// افتراضياً مفعّل - لتعطيله:
<ActionButton haptic={false} />
```

### 3. Full Width

```tsx
// لجعل الزر بعرض كامل (مفيد في الفورمات)
<ActionButton fullWidth label="تسجيل الدخول" />
```

### 4. Animations

```tsx
// لتعطيل التأثيرات الحركية
<ActionButton animate={false} />
```

---

## 💡 أمثلة عملية

### في ViewCard (عرض بطاقات)

```tsx
<div className="flex gap-2">
  <ActionButton 
    variant="icon-view" 
    size="sm"
    icon={<Eye size={18} />}
    navigateTo={`/item/${id}`}
    title="عرض"
  />
  
  <ActionButton 
    variant="icon-edit" 
    size="sm"
    icon={<Pencil size={18} />}
    navigateTo={`/item/${id}/edit`}
    title="تعديل"
  />
  
  <ActionButton 
    variant="icon-delete" 
    size="sm"
    icon={<Trash size={18} />}
    onClick={handleDelete}
    title="حذف"
  />
</div>
```

### في الهيدر (Header)

```tsx
<ActionButton 
  variant="success"
  icon={<Plus />}
  label="إنشاء جديد"
  navigateTo="/create"
/>

<ActionButton 
  variant="ghost"
  icon={<ArrowLeft />}
  label="رجوع"
  navigateTo="/back"
/>
```

### في الفورمات (Forms)

```tsx
<div className="flex gap-3">
  <ActionButton 
    type="submit"
    variant="primary"
    label="حفظ"
    isLoading={isSubmitting}
    fullWidth
  />
  
  <ActionButton 
    variant="ghost"
    label="إلغاء"
    onClick={onCancel}
  />
</div>
```

---

## 🎯 القواعد الذهبية

### ✅ افعل:
1. استخدم `icon-*` للأزرار الأيقونية الصغيرة
2. استخدم `size="sm"` مع `icon-*` variants
3. استخدم ألواناً دلالية واضحة:
   - أزرق للعرض
   - برتقالي للتعديل
   - أحمر للحذف
4. أضف `title` للأزرار الأيقونية دائماً

### ❌ لا تفعل:
1. ❌ استخدام `variant="custom"` إلا للحالات الخاصة جداً
2. ❌ ألوان عشوائية - التزم بالنظام الموحد
3. ❌ أحجام مخصصة - استخدم الـ `size` prop

---

## 🔧 ملاحظة التحديث

إذا واجهت أخطاء TypeScript مثل:
```
Type '"icon-view"' is not assignable to type 'ButtonVariant'
```

قم بإعادة تشغيل TypeScript Server:
- VS Code: `Ctrl+Shift+P` → "TypeScript: Restart TS Server"
- أو أعد تشغيل الـ IDE

---

**تم بناء هذا النظام ليوفر تجربة موحدة ومتسقة عبر التطبيق بالكامل! 🚀**
