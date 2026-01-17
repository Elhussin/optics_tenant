# دليل المكونات - Components Guide

## 📋 نظرة عامة

هذا الدليل يوثق المكونات المتوفرة في مشروع نظام البصريات الشامل.

---

## 🎨 مكونات UI الأساسية

### Skeleton

مكون التحميل الهيكلي لعرض حالة التحميل.

```tsx
import { Skeleton, SkeletonGroup } from '@/src/shared/components/ui/Skeleton';

// استخدام أساسي
<Skeleton variant="text" />
<Skeleton variant="title" />
<Skeleton variant="avatar" />
<Skeleton variant="button" />
<Skeleton variant="card" />
<Skeleton variant="image" />

// مع أبعاد مخصصة
<Skeleton width={200} height={100} />
<Skeleton width="50%" height="auto" />

// مجموعة skeletons
<SkeletonGroup type="list-item" count={5} />
<SkeletonGroup type="card" count={3} />
<SkeletonGroup type="table-row" count={10} />
<SkeletonGroup type="profile" />
```

**Props:**
| Prop | Type | Default | Description |
|------|------|---------|-------------|
| variant | 'text' \| 'title' \| 'avatar' \| 'button' \| 'card' \| 'image' \| 'custom' | 'text' | نوع الـ skeleton |
| width | string \| number | - | العرض |
| height | string \| number | - | الارتفاع |
| rounded | 'none' \| 'sm' \| 'md' \| 'lg' \| 'full' | 'md' | الزوايا |
| animate | boolean | true | تفعيل الحركة |

---

### Badge

مكون الشارة لعرض الحالات والعدادات.

```tsx
import { Badge, CountBadge, StatusBadge } from '@/src/shared/components/ui/Badge';

// شارة أساسية
<Badge variant="primary">جديد</Badge>
<Badge variant="success">نشط</Badge>
<Badge variant="danger">منتهي</Badge>
<Badge variant="warning">تحذير</Badge>
<Badge variant="info">معلومة</Badge>
<Badge variant="neutral">عادي</Badge>

// مع نقطة
<Badge variant="success" dot>متصل</Badge>

// مع أيقونة
<Badge variant="info" icon={<InfoIcon />}>معلومة</Badge>

// outline
<Badge variant="primary" outline>إطار</Badge>

// شارة عداد
<CountBadge count={5} />
<CountBadge count={150} max={99} /> // يعرض "99+"

// شارة الحالة
<StatusBadge status="online" />
<StatusBadge status="offline" />
<StatusBadge status="busy" />
<StatusBadge status="away" />
```

**Props (Badge):**
| Prop | Type | Default | Description |
|------|------|---------|-------------|
| variant | 'primary' \| 'success' \| 'danger' \| 'warning' \| 'info' \| 'neutral' | 'primary' | اللون |
| size | 'sm' \| 'md' \| 'lg' | 'md' | الحجم |
| dot | boolean | false | عرض نقطة |
| outline | boolean | false | إطار فقط |

---

### Avatar

مكون الصورة الشخصية.

```tsx
import { Avatar, AvatarGroup } from '@/src/shared/components/ui/Avatar';

// avatar أساسي
<Avatar name="محمد أحمد" />
<Avatar src="/avatar.jpg" alt="صورة" />

// أحجام مختلفة
<Avatar name="م" size="xs" /> // 24px
<Avatar name="م" size="sm" /> // 32px
<Avatar name="م" size="md" /> // 40px
<Avatar name="م" size="lg" /> // 56px
<Avatar name="م" size="xl" /> // 80px
<Avatar name="م" size="2xl" /> // 112px

// مع حالة
<Avatar name="محمد" status="online" />
<Avatar name="أحمد" status="offline" />
<Avatar name="سعيد" status="busy" />

// مجموعة avatars
<AvatarGroup
  avatars={[
    { name: 'محمد' },
    { name: 'أحمد', src: '/avatar1.jpg' },
    { name: 'سعيد' },
    { name: 'خالد' },
    { name: 'فهد' },
  ]}
  max={4}
/>
```

**Props:**
| Prop | Type | Default | Description |
|------|------|---------|-------------|
| src | string | - | رابط الصورة |
| name | string | - | الاسم (يُستخدم للأحرف الأولى) |
| size | 'xs' \| 'sm' \| 'md' \| 'lg' \| 'xl' \| '2xl' | 'md' | الحجم |
| status | 'online' \| 'offline' \| 'busy' \| 'away' | - | الحالة |

---

### Spinner

مكون مؤشر التحميل.

```tsx
import { 
  Spinner, 
  PageLoading, 
  InlineLoading, 
  LoadingOverlay,
  ButtonSpinner 
} from '@/src/shared/components/ui/Spinner';

// spinner أساسي
<Spinner />
<Spinner size="sm" />
<Spinner size="lg" />
<Spinner variant="primary" />
<Spinner variant="white" />

// تحميل صفحة كاملة
<PageLoading message="جاري التحميل..." />

// تحميل inline
<InlineLoading message="جاري البحث..." />

// overlay تحميل
<LoadingOverlay show={isLoading} message="جاري الحفظ..." />

// زر مع تحميل
<button>
  <ButtonSpinner loading={isSubmitting}>
    حفظ
  </ButtonSpinner>
</button>
```

---

### EmptyState

مكون الحالة الفارغة.

```tsx
import { EmptyState, CompactEmptyState } from '@/src/shared/components/ui/EmptyState';

// أنواع مختلفة
<EmptyState type="default" />
<EmptyState type="search" />
<EmptyState type="data" />
<EmptyState type="users" />
<EmptyState type="orders" />
<EmptyState type="products" />
<EmptyState type="files" />
<EmptyState type="error" />

// مخصص
<EmptyState
  title="لا توجد طلبات"
  description="لم يتم إنشاء أي طلبات بعد"
  action={<Button>إنشاء طلب جديد</Button>}
/>

// مختصر
<CompactEmptyState message="لا توجد نتائج" />
```

---

### GlassCard

بطاقة زجاجية مع تأثير blur.

```tsx
import { GlassCard, GlassCardHeader, GlassCardFooter } from '@/src/shared/components/ui/GlassCard';

<GlassCard variant="default" hover animate="fade-in">
  <GlassCardHeader 
    title="عنوان البطاقة"
    subtitle="وصف مختصر"
    icon={<Icon />}
    action={<Button size="sm">إجراء</Button>}
  />
  
  <p>محتوى البطاقة</p>
  
  <GlassCardFooter align="between">
    <Button variant="ghost">إلغاء</Button>
    <Button>حفظ</Button>
  </GlassCardFooter>
</GlassCard>
```

**Props:**
| Prop | Type | Default | Description |
|------|------|---------|-------------|
| variant | 'default' \| 'dark' \| 'primary' \| 'success' \| 'danger' \| 'warning' | 'default' | اللون |
| blur | 'sm' \| 'md' \| 'lg' | 'md' | مستوى الـ blur |
| hover | boolean | false | تأثير hover |
| animate | 'none' \| 'fade-in' \| 'scale-in' \| 'slide-up' | 'none' | حركة الدخول |
| padding | 'none' \| 'sm' \| 'md' \| 'lg' | 'md' | الحشو |

---

## 📱 مكونات الموبايل

### BottomNav

شريط التنقل السفلي.

```tsx
import { BottomNav, FloatingActionButton } from '@/features/mobile';

<BottomNav />

<FloatingActionButton 
  icon={<Plus />}
  onClick={handleAdd}
  label="إضافة"
/>
```

### MobileHeader

رأس صفحة الموبايل.

```tsx
import { MobileHeader, MobileDrawer } from '@/features/mobile';

<MobileHeader
  title="الطلبات"
  showBack
  showSearch
  showNotifications
  notificationCount={3}
/>

<MobileDrawer
  open={isOpen}
  onClose={() => setIsOpen(false)}
  title="القائمة"
>
  {children}
</MobileDrawer>
```

### SwipeableCard

بطاقة قابلة للسحب.

```tsx
import { SwipeableCard } from '@/features/mobile';

<SwipeableCard
  rightActions={[
    { icon: <Trash />, label: 'حذف', color: 'danger', onClick: handleDelete },
  ]}
  leftActions={[
    { icon: <Check />, label: 'تأكيد', color: 'success', onClick: handleConfirm },
  ]}
>
  <OrderCard />
</SwipeableCard>
```

### PullToRefresh

السحب للتحديث.

```tsx
import { PullToRefresh } from '@/features/mobile';

<PullToRefresh onRefresh={async () => await refetchData()}>
  <ProductList />
</PullToRefresh>
```

---

## 🔧 مكونات الأداء

### VirtualList

قائمة افتراضية للقوائم الطويلة.

```tsx
import { VirtualList, VirtualGrid } from '@/src/shared/components/VirtualList';

<VirtualList
  items={products}
  height={400}
  itemHeight={80}
  renderItem={(item, index) => <ProductCard product={item} />}
  onEndReached={loadMore}
  loadingMore={isLoadingMore}
/>

<VirtualGrid
  items={images}
  height={600}
  columns={3}
  rowHeight={150}
  gap={8}
  renderItem={(item) => <ImageCard image={item} />}
/>
```

### LazyComponent

تحميل كسول للمكونات.

```tsx
import { LazyComponent, LazyImage, RenderWhenVisible } from '@/src/shared/components/LazyComponent';

// تحميل مكون lazy
<LazyComponent 
  loader={() => import('@/features/reports/pages/SalesReportPage')}
  loadingSize="lg"
/>

// صورة lazy
<LazyImage
  src="/product.jpg"
  alt="المنتج"
  width={300}
  height={200}
/>

// عرض عند الوصول
<RenderWhenVisible fallback={<Skeleton variant="card" />}>
  <ExpensiveComponent />
</RenderWhenVisible>
```

---

## 🎨 CSS Classes

### Cards
```css
.card-interactive  /* بطاقة تفاعلية */
.card-glass        /* بطاقة زجاجية */
.card-gradient     /* بطاقة متدرجة */
.card-stat         /* بطاقة إحصائية */
```

### Buttons
```css
.btn-primary       /* زر رئيسي */
.btn-secondary     /* زر ثانوي */
.btn-ghost         /* زر شفاف */
.btn-icon          /* زر أيقونة */
.btn-fab           /* زر عائم */
```

### Badges
```css
.badge             /* شارة أساسية */
.badge-primary     /* شارة زرقاء */
.badge-success     /* شارة خضراء */
.badge-danger      /* شارة حمراء */
.badge-warning     /* شارة صفراء */
.badge-info        /* شارة سماوية */
.badge-count       /* شارة عداد */
```

### Animations
```css
.animate-fade-in      /* ظهور تدريجي */
.animate-fade-in-up   /* ظهور من الأسفل */
.animate-scale-in     /* تكبير */
.animate-shimmer      /* لمعان */
.hover-lift           /* رفع عند hover */
.hover-scale          /* تكبير عند hover */
.hover-glow           /* توهج عند hover */
```

### Glassmorphism
```css
.glass             /* زجاج فاتح */
.glass-dark        /* زجاج داكن */
.glass-primary     /* زجاج أزرق */
.glass-auto        /* زجاج تلقائي (يتبع الـ theme) */
```

### Shadows
```css
.shadow-soft       /* ظل خفيف */
.shadow-medium     /* ظل متوسط */
.shadow-strong     /* ظل قوي */
.shadow-primary    /* ظل أزرق */
.shadow-success    /* ظل أخضر */
.shadow-danger     /* ظل أحمر */
```
