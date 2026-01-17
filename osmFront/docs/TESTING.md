# دليل الاختبارات - Testing Guide

## 📋 الملخص

هذا الدليل يشرح كيفية كتابة وتشغيل الاختبارات في مشروع نظام البصريات الشامل.

## 🛠️ الأدوات المستخدمة

- **Vitest**: إطار اختبار سريع ومتوافق مع Vite
- **React Testing Library**: لاختبار مكونات React
- **@testing-library/jest-dom**: matchers إضافية للـ DOM

## 📁 هيكل الملفات

```
__tests__/
├── components/          # اختبارات المكونات
│   ├── Badge.test.tsx
│   ├── Skeleton.test.tsx
│   ├── Spinner.test.tsx
│   └── EmptyState.test.tsx
├── hooks/               # اختبارات الـ Hooks
│   ├── useDebounce.test.ts
│   ├── useLocalStorage.test.ts
│   └── useMobile.test.ts
├── utils/               # اختبارات دوال المساعدة
│   └── cn.test.ts
└── integration/         # اختبارات التكامل
```

## 🚀 تشغيل الاختبارات

```bash
# تشغيل جميع الاختبارات
bun test

# تشغيل الاختبارات مع المراقبة
bun test --watch

# تشغيل اختبارات ملف محدد
bun test Badge

# تشغيل مع تغطية الكود
bun test --coverage

# تشغيل اختبارات UI
bun test --ui
```

## ✍️ كتابة الاختبارات

### اختبار Hook

```typescript
import { describe, it, expect, vi } from 'vitest';
import { renderHook, act } from '@testing-library/react';
import { useMyHook } from '@/src/shared/hooks/useMyHook';

describe('useMyHook', () => {
  it('should return initial value', () => {
    const { result } = renderHook(() => useMyHook('initial'));
    expect(result.current.value).toBe('initial');
  });

  it('should update value', () => {
    const { result } = renderHook(() => useMyHook('initial'));
    
    act(() => {
      result.current.setValue('updated');
    });
    
    expect(result.current.value).toBe('updated');
  });
});
```

### اختبار Component

```typescript
import { describe, it, expect } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import { MyComponent } from '@/src/components/MyComponent';

describe('MyComponent', () => {
  it('renders correctly', () => {
    render(<MyComponent title="عنوان" />);
    expect(screen.getByText('عنوان')).toBeInTheDocument();
  });

  it('handles click', () => {
    const onClick = vi.fn();
    render(<MyComponent onClick={onClick} />);
    
    fireEvent.click(screen.getByRole('button'));
    
    expect(onClick).toHaveBeenCalled();
  });
});
```

### اختبار Async

```typescript
import { describe, it, expect, vi } from 'vitest';
import { render, screen, waitFor } from '@testing-library/react';

describe('AsyncComponent', () => {
  it('loads data', async () => {
    vi.mocked(fetch).mockResolvedValueOnce({
      ok: true,
      json: async () => ({ data: 'test' }),
    } as Response);

    render(<AsyncComponent />);

    await waitFor(() => {
      expect(screen.getByText('test')).toBeInTheDocument();
    });
  });
});
```

## 🎯 أفضل الممارسات

### 1. اسم الاختبار واضح
```typescript
// ❌ سيء
it('works', () => {});

// ✅ جيد
it('should display error message when form is invalid', () => {});
```

### 2. Arrange-Act-Assert
```typescript
it('increments counter on click', () => {
  // Arrange
  render(<Counter initialValue={0} />);
  
  // Act
  fireEvent.click(screen.getByRole('button'));
  
  // Assert
  expect(screen.getByText('1')).toBeInTheDocument();
});
```

### 3. استخدام data-testid للعناصر المعقدة
```typescript
// في المكون
<div data-testid="user-avatar" className={styles.avatar} />

// في الاختبار
expect(screen.getByTestId('user-avatar')).toBeInTheDocument();
```

### 4. Mock الـ APIs
```typescript
beforeEach(() => {
  vi.mocked(fetch).mockReset();
});

it('handles API error', async () => {
  vi.mocked(fetch).mockRejectedValueOnce(new Error('Network error'));
  // ...
});
```

## 📊 تغطية الكود

نستهدف تغطية كود بنسبة 80% على الأقل.

```bash
# تشغيل مع تغطية
bun test --coverage

# تقرير التغطية
open coverage/index.html
```

### الملفات المستثناة من التغطية:
- `node_modules/`
- `.next/`
- `src/app/` (صفحات Next.js)
- `**/*.d.ts` (ملفات التعريف)

## 🔧 الإعداد

### vitest.config.ts
```typescript
import { defineConfig } from 'vitest/config';
import react from '@vitejs/plugin-react';

export default defineConfig({
  plugins: [react()],
  test: {
    globals: true,
    environment: 'jsdom',
    setupFiles: ['./vitest.setup.ts'],
  },
});
```

### vitest.setup.ts
يحتوي على:
- Mock لـ `window.matchMedia`
- Mock لـ `IntersectionObserver`
- Mock لـ `ResizeObserver`
- Mock لـ `localStorage` / `sessionStorage`
- Mock لـ `fetch`

## 📝 Matchers متاحة

```typescript
// من @testing-library/jest-dom
expect(element).toBeInTheDocument();
expect(element).toHaveClass('my-class');
expect(element).toBeVisible();
expect(element).toBeDisabled();
expect(element).toHaveAttribute('href', '/path');
expect(element).toHaveTextContent('text');
expect(element).toHaveStyle({ color: 'red' });
expect(element).toHaveValue('value');
expect(element).toBeChecked();
expect(element).toHaveFocus();
```

## 🐛 تصحيح الأخطاء

```typescript
// طباعة DOM للتصحيح
import { screen } from '@testing-library/react';
screen.debug();

// طباعة عنصر محدد
screen.debug(screen.getByRole('button'));
```
