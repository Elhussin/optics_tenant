/**
 * 📝 دليل إضافة Error Messages للـ Product Form
 * 
 * useApiForm يوفر الأخطاء تلقائياً عبر fieldState.error
 * يمكنك عرضها باستخدام FormMessage من shadcn
 */

## ✅ الطريقة الصحيحة لعرض الأخطاء:

### **1. باستخدام FormMessage (موصى به)**

```tsx
import {
  FormField,
  FormItem,
  FormLabel,
  FormControl,
  FormMessage,
} from "@/src/shared/components/shadcn/ui/form";

<FormField
  control={form.control}
  name="name"
  render={({ field }) => (
    <FormItem>
      <FormLabel>اسم المنتج *</FormLabel>
      <FormControl>
        <Input {...field} placeholder="أدخل اسم المنتج" />
      </FormControl>
      {/* ✅ يعرض الخطأ تلقائياً */}
      <FormMessage />
    </FormItem>
  )}
/>
```

### **2. باستخدام fieldState (مخصص)**

```tsx
<FormField
  control={form.control}
  name="price"
  render={({ field, fieldState }) => (
    <FormItem>
      <FormLabel>السعر *</FormLabel>
      <FormControl>
        <Input type="number" {...field} />
      </FormControl>
      {/* ✅ عرض مخصص للخطأ */}
      {fieldState.error && (
        <p className="text-sm text-destructive mt-1 flex items-center gap-1">
          <AlertCircle className="w-4 h-4" />
          {fieldState.error.message}
        </p>
      )}
    </FormItem>
  )}
/>
```

### **3. للحقول المتعددة (Arrays)**

```tsx
<FormField
  control={form.control}
  name="categories"
  render={({ field, fieldState }) => (
    <FormItem>
      <FormLabel>التصنيفات *</FormLabel>
      <FormControl>
        <MultiSelect {...field} />
      </FormControl>
      <FormMessage />
    </FormItem>
  )}
/>
```

---

## 🎨 **Enhanced Error Display**

```tsx
{fieldState.error && (
  <motion.p
    initial={{ opacity: 0, y: -10 }}
    animate={{ opacity: 1, y: 0 }}
    className={cn(
      "text-sm font-medium mt-2",
      "text-destructive",
      "flex items-center gap-2",
      "bg-destructive/10 px-3 py-2 rounded-lg"
    )}
  >
    <AlertCircle className="w-4 h-4" />
    {fieldState.error.message}
  </motion.p>
)}
```

---

## 📋 **الـ Steps التي تحتاج تحديث:**

1. **ProductTypeStep.tsx**
   - type field
   - categories field
   - brand field

2. **ProductInfoStep.tsx**
   - name field
   - description field
   - price field
   - images field

3. **ProductVariantStep.tsx**
   - variant_type field
   - variants array fields

---

## 🚀 **الخطوات التالية:**

1. ✅ تم إنشاء TabsLayout
2. ✅ تم تطبيق النموذج الهجين
3. ⏳ إضافة Error Messages للـ steps
4. ⏳ تحسين UI/UX للـ steps الموجودة

هل تريد أن أبدأ في تحديث ProductTypeStep مع error messages؟
