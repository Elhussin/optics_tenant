# 🏗️ Application Design & Build Guide

**Version:** 1.0  
**Last Updated:** 2026-02-07

---

## 📚 Overview

This document serves as the primary reference for the application's architecture, design patterns, and development standards. It consolidates best practices to ensure consistency and maintainability across the codebase.

## 🏗️ Project Architecture

We follow a **Feature-Based Architecture** to keep the codebase modular and scalable.

```
src/
├── app/                  # Next.js App Router pages (routes)
├── features/             # Business logic & UI grouped by feature
│   ├── orders/           # Order management feature
│   ├── products/         # Product management feature
│   └── auth/             # Authentication feature
├── shared/               # Reusable components, hooks, and utils
│   ├── components/       # Shadcn UI & custom shared components
│   ├── hooks/            # Global hooks (useApiForm, etc.)
│   └── utils/            # Helper functions
├── messages/             # Translation files (en/ar)
└── styles/               # Global styles (Tailwind, animations)
```

### 🔹 Feature Directory Structure
Each feature folder (e.g., `src/features/orders`) should generally contain:
- `components/`: React components specific to the feature.
- `hooks/`: Feature-specific hooks.
- `store/`: Zustand stores for local state management (e.g., `useOrderFormStore`).
- `types/`: TypeScript interfaces and types.
- `index.tsx`: Main entry point/container component.

---

## 🎨 UI/UX Design System

We adhere to a **Premium Design System** that prioritizes aesthetics, responsiveness, and interactivity.

### 1. **Core Principles**
- **Theme Colors**: ALWAYS use semantic Tailwind classes (`bg-background`, `text-primary`, `border-border`) instead of hardcoded hex/colors.
- **Micro-Interactions**: Use animations for hover states, modal entries, and list items.
- **Glassmorphism**: Use `backdrop-blur` and semi-transparent backgrounds for floating elements.
- **Gradients**: Use subtle gradients for primary actions and active states.

### 2. **Component Library**
- **Base**: [Shadcn UI](https://ui.shadcn.com/) (Radix UI + Tailwind).
- **Icons**: [Lucide React](https://lucide.dev/).
- **Animations**: [Framer Motion](https://www.framer.com/motion/).

### 3. **Styling Pattern**
Use `cn()` for class merging and strictly follow the utility-first approach.

```tsx
import { cn } from "@/src/shared/utils/cn";

<div className={cn(
  "flex items-center p-4 rounded-xl transition-all duration-300",
  "bg-elevated hover:bg-muted border border-transparent hover:border-border",
  "shadow-sm hover:shadow-md"
)}>
  ...
</div>
```

**References:**
- 📄 [Field Components Guide](./field-components-guide.md)
- 📄 [Development Methodology](./DEVELOPMENT_METHODOLOGY.md) (Arabic)

---

## 🛠️ State Management

### 1. **Server State**
- Use **`useApiForm`** (custom wrapper around generic fetch patterns) for data fetching and mutations.
- Avoid `useEffect` for data fetching where possible; prefer hooks that handle loading/error states automatically.

### 2. **Client State**
- Use **[Zustand](https://github.com/pmndrs/zustand)** for complex global or feature-scoped state (e.g., shopping cart, multi-step forms).
- Keep stores small and focused.

```tsx
// Example: src/features/orders/store/useOrderFormStore.ts
export const useOrderFormStore = create<OrderFormState>((set) => ({
  items: [],
  addItem: (item) => set((state) => ({ items: [...state.items, item] })),
}));
```

---

## 🌐 Internationalization (i18n)

- **Library**: `next-intl`.
- **Structure**:
  - `src/messages/en/*.json`: English translations.
  - `src/messages/ar/*.json`: Arabic translations.
- **Usage**:
  - Group keys logically (e.g., `orders.create.title`).
  - Always implement both EN and AR translations for new features.

```tsx
const t = useTranslations("orders");
<h1>{t("create.title")}</h1>
```

---

## 🚀 Development Workflow

1.  **Analyze**: Understand the requirements and existing component structure.
2.  **Plan**: Check specific guides (e.g., `COMPONENTS.md`) for verified patterns.
3.  **Implement**:
    - Build using Shadcn components.
    - Apply consistent styling and animations.
    - Wire up state with Zustand/useApiForm.
4.  **Translate**: Add keys to `messages/en|ar`.
5.  **Polishing**: Review responsive behavior (Mobile First) and Dark Mode support.

---

## 📝 Best Practices Checklist

- [ ] **No Hardcoded Values**: Use constants or translation keys.
- [ ] **Responsive**: Check generic layouts on mobile/tablet.
- [ ] **Type Safety**: Avoid `any`; define interfaces in `types.ts`.
- [ ] **Error Handling**: Use `safeToast` for user notifications.
- [ ] **Clean Code**: Smaller components are better; extra logic into hooks.

