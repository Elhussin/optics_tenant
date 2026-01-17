# 📊 تحليل مقارن: useSWR vs useApiForm

**التاريخ**: 2026-01-14  
**الموضوع**: مقارنة بين طريقتين لاستدعاء API

---

## 🎯 **الطريقتان:**

### **1. Inventory Hook (useSWR + api.customRequest)**
```tsx
// useInventory.ts
export function useStocks(branchId?: number) {
    return useSWR<Stock[]>(
        branchId ? [endpoint, branchId] : endpoint,
        () => api.customRequest("products_stocks_list", {}),
        { revalidateOnFocus: false }
    );
}
```

### **2. Form Hook (useApiForm - React Query + useForm)**
```tsx
// useApiForm.ts
export function useApiForm(options: useFormRequestProps) {
    const query = useQuery({
        queryKey: [alias, defaultValues],
        queryFn: () => api.customRequest(alias, defaultValues),
        enabled: Boolean(enabled && alias && endpoint?.method === "get"),
    });
    
    const mutation = useMutation({
        mutationFn: (payload) => api.customRequest(endpoint.alias, payload),
    });
    
    return { ...methods, query, mutation, submitForm };
}
```

---

## 📋 **المقارنة التفصيلية:**

| Feature | **useSWR** (Inventory) | **useApiForm** (Form) | Winner |
|---------|------------------------|----------------------|---------|
| **Purpose** | Data fetching only | Form + Data fetching | Depends |
| **Form Management** | ❌ None | ✅ React Hook Form | useApiForm |
| **Validation** | ❌ Manual | ✅ Zod Schema | useApiForm |
| **Mutations** | ❌ Manual | ✅ useMutation | useApiForm |
| **Error Handling** | ⚠️ Basic | ✅ Advanced | useApiForm |
| **File Upload** | ❌ Manual | ✅ Auto FormData | useApiForm |
| **Bundle Size** | ✅ Smaller | ⚠️ Larger | useSWR |
| **Simplicity** | ✅ Simpler | ⚠️ Complex | useSWR |
| **Caching** | ✅ SWR Cache | ✅ React Query Cache | Tie |
| **Revalidation** | ✅ Auto | ✅ Manual | useSWR |
| **TypeScript** | ⚠️ Manual | ✅ Auto from Schema | useApiForm |

---

## ✅ **متى تستخدم useSWR (Inventory Style)?**

### **Use Cases:**
1. **Data Fetching Only** - لا تحتاج forms
2. **Simple CRUD** - قراءة بيانات بسيطة
3. **Real-time Updates** - تحتاج auto-revalidation
4. **Lightweight** - تريد bundle size صغير
5. **Global State** - بيانات مشتركة بين components

### **Example (Perfect for useSWR):**
```tsx
// ✅ Good: Just fetching list of items
export function useProductsList() {
    return useSWR<Product[]>(
        "products_list",
        () => api.customRequest("products_products_list", {}),
        { revalidateOnFocus: true }
    );
}

// Usage
function ProductsTable() {
    const { data, error, isLoading } = useProductsList();
    if (isLoading) return <Spinner />;
    return <Table data={data} />;
}
```

### **Advantages:**
- ✅ **Simpler API** - فقط `useSWR(key, fetcher)`
- ✅ **Auto Revalidation** - على focus/reconnect/interval
- ✅ **Dedupe Requests** - requests متعددة تصير واحد
- ✅ **Lightweight** - حجم أصغر من React Query
- ✅ **Mutation Broadcasting** - تحديثات تلقائية لكل components

---

## ✅ **متى تستخدم useApiForm (Form Style)?**

### **Use Cases:**
1. **Forms** - إدخال بيانات من المستخدم
2. **Validation** - تحتاج Zod/Yup validation
3. **Complex Mutations** - POST/PUT/DELETE مع error handling
4. **File Uploads** - رفع ملفات
5. **Transform Data** - تحويل البيانات قبل الإرسال

### **Example (Perfect for useApiForm):**
```tsx
// ✅ Good: Form with validation
function ProductAdd() {
    const { submitForm, ...form } = useApiForm({
        alias: "products_products_create",
        defaultValues: { name: "", price: 0 },
        onSuccess: (data) => router.push(`/products/${data.id}`),
    });
    
    return (
        <form onSubmit={form.handleSubmit(submitForm)}>
            <Input {...form.register("name")} />
            <Input {...form.register("price")} />
            <Button type="submit">Save</Button>
        </form>
    );
}
```

### **Advantages:**
- ✅ **Form Integration** - React Hook Form مدمج
- ✅ **Schema Validation** - Zod auto validation
- ✅ **Error Handling** - Backend errors → form fields
- ✅ **File Upload** - Auto FormData conversion
- ✅ **Transform** - تحويل البيانات قبل/بعد API
- ✅ **TypeScript** - Types من Zod schema

---

## 🔄 **الفرق في الـ Workflow:**

### **useSWR Workflow:**
```
Component → useSWR → api.customRequest → API
                ↓
           Auto Cache & Revalidate
```

**Features:**
- Auto revalidation on focus
- Global cache
- Optimistic updates
- Simple mutations (manual)

### **useApiForm Workflow:**
```
Component → useForm → Validation → Transform → Mutation → API
                ↓           ↓           ↓
           Field Errors   Modify Data  React Query Cache
```

**Features:**
- Form validation
- Error → field mapping
- Auto FormData
- Query invalidation

---

## 💡 **لماذا استخدمت useSWR في Inventory؟**

### **السبب:**

1. **No Forms Needed** ✅
   - Inventory = عرض بيانات فقط
   - لا توجد forms معقدة

2. **Real-time Updates** ✅
   - Stock يتغير كثيراً
   - `revalidateOnFocus: true` مفيد

3. **Simpler API** ✅
   - مجرد `useStocks()` وخلاص
   - لا تحتاج form methods

4. **Global State** ✅
   - Stock data مشترك بين components
   - SWR cache أفضل لهذا

### **Code Comparison:**

#### **With useSWR (Current):**
```tsx
// ✅ Clean & Simple
function StockTable() {
    const { data, error } = useStocks();
    return <Table data={data} />;
}
```

#### **With useApiForm (Overkill):**
```tsx
// ⚠️ Too Complex for just fetching
function StockTable() {
    const { query: { data, error } } = useApiForm({
        alias: "products_stocks_list",
        defaultValues: {},
    });
    return <Table data={data} />;
}
```

☝️ **useApiForm هنا overkill** - لا نحتاج form methods!

---

## 📊 **Best Practices:**

### **✅ Use useSWR When:**
```tsx
// 1. List/Table Views
useProducts()
useStocks()
useOrders()

// 2. Dashboard Stats
useStats()
useAnalytics()

// 3. Shared Data
useCurrentUser()
useSettings()
```

### **✅ Use useApiForm When:**
```tsx
// 1. Add/Edit Forms
<ProductAdd />
<ProductEdit />

// 2. Complex Validation
<OrderForm validationSchema={orderSchema} />

// 3. File Uploads
<ImageUpload />

// 4. Multi-step Forms
<WizardForm />
```

---

## 🎯 **Recommendation:**

### **Current Architecture (Perfect!):**

```tsx
// ✅ Inventory - useSWR (Read-Only)
useStocks()
useLowStock()
useStockTransfers()

// ✅ Products Forms - useApiForm (Forms)
<ProductAdd />
<ProductEdit />

// ✅ Mix Both!
function ProductEdit() {
    // Fetch current data
    const { data: product } = useProduct(id);
    
    // Form for editing
    const form = useApiForm({
        alias: "products_products_update",
        defaultValues: product,
    });
    
    return <form onSubmit={form.handleSubmit(form.submitForm)}>...</form>;
}
```

---

## 📈 **Performance:**

| Metric | useSWR | useApiForm |
|--------|--------|-----------|
| **Bundle Size** | ~4KB | ~40KB |
| **First Load** | Fast | Fast |
| **Re-renders** | Optimized | Optimized |
| **Memory** | Low | Medium |

**Winner:** useSWR (lighter)

---

## 🔧 **Migration Guide:**

### **When to Migrate useSWR → useApiForm:**

```tsx
// ❌ Bad: Using useSWR for form
function ProductAdd() {
    const { mutate } = useSWR("products_list");
    
    const handleSubmit = async (data) => {
        await api.customRequest("products_create", data);
        mutate(); // Manual revalidation
    };
    
    return <form onSubmit={handleSubmit}>...</form>;
}

// ✅ Good: Use useApiForm
function ProductAdd() {
    const { submitForm, ...form } = useApiForm({
        alias: "products_products_create",
    });
    
    return <form onSubmit={form.handleSubmit(submitForm)}>...</form>;
}
```

---

## ✨ **Summary:**

### **useSWR (Inventory Style):**
- ✅ **Best for:** Data fetching, lists, dashboards
- ✅ **Pros:** Simple, lightweight, auto-revalidation
- ❌ **Cons:** No form integration, manual mutations

### **useApiForm (Form Style):**
- ✅ **Best for:** Forms, validation, complex mutations
- ✅ **Pros:** Form integration, validation, error handling
- ❌ **Cons:** Heavier, more complex

### **الخلاصة النهائية:**

```
📊 Data Fetching → useSWR
📝 Forms → useApiForm
🎯 Mixed → Both!
```

**Current architecture is PERFECT!** 🎊

---

## 🎯 **الخلاصة:**

| Scenario | Use |
|----------|-----|
| Stock List | ✅ useSWR |
| Product Add Form | ✅ useApiForm |
| Dashboard Stats | ✅ useSWR |
| Order Edit Form | ✅ useApiForm |
| Real-time Data | ✅ useSWR |
| File Upload | ✅ useApiForm |

**Both are correct - choose based on use case!** ✨
