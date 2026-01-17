// __tests__/components/EmptyState.test.tsx
/**
 * Tests for EmptyState component
 */

import { describe, it, expect } from "vitest";
import { render, screen } from "@testing-library/react";
import {
  EmptyState,
  CompactEmptyState,
} from "@/src/shared/components/ui/EmptyState";

describe("EmptyState", () => {
  it("renders with default type", () => {
    render(<EmptyState />);
    expect(screen.getByText("لا توجد بيانات")).toBeInTheDocument();
    expect(screen.getByText("لم يتم العثور على أي عناصر")).toBeInTheDocument();
  });

  it("renders search type", () => {
    render(<EmptyState type="search" />);
    expect(screen.getByText("لا توجد نتائج")).toBeInTheDocument();
    expect(
      screen.getByText("جرب استخدام كلمات بحث مختلفة")
    ).toBeInTheDocument();
  });

  it("renders users type", () => {
    render(<EmptyState type="users" />);
    expect(screen.getByText("لا يوجد مستخدمون")).toBeInTheDocument();
  });

  it("renders orders type", () => {
    render(<EmptyState type="orders" />);
    expect(screen.getByText("لا توجد طلبات")).toBeInTheDocument();
  });

  it("renders products type", () => {
    render(<EmptyState type="products" />);
    expect(screen.getByText("لا توجد منتجات")).toBeInTheDocument();
  });

  it("renders files type", () => {
    render(<EmptyState type="files" />);
    expect(screen.getByText("لا توجد ملفات")).toBeInTheDocument();
  });

  it("renders error type", () => {
    render(<EmptyState type="error" />);
    expect(screen.getByText("حدث خطأ")).toBeInTheDocument();
    expect(screen.getByText("لم نتمكن من تحميل البيانات")).toBeInTheDocument();
  });

  it("uses custom title", () => {
    render(<EmptyState title="عنوان مخصص" />);
    expect(screen.getByText("عنوان مخصص")).toBeInTheDocument();
  });

  it("uses custom description", () => {
    render(<EmptyState description="وصف مخصص" />);
    expect(screen.getByText("وصف مخصص")).toBeInTheDocument();
  });

  it("renders action button", () => {
    render(<EmptyState action={<button>إضافة عنصر</button>} />);
    expect(screen.getByText("إضافة عنصر")).toBeInTheDocument();
  });

  it("renders custom icon", () => {
    render(<EmptyState icon={<span data-testid="custom-icon">🎉</span>} />);
    expect(screen.getByTestId("custom-icon")).toBeInTheDocument();
  });

  it("applies custom className", () => {
    const { container } = render(<EmptyState className="custom-class" />);
    expect(container.firstChild).toHaveClass("custom-class");
  });
});

describe("CompactEmptyState", () => {
  it("renders with default message", () => {
    render(<CompactEmptyState />);
    expect(screen.getByText("لا توجد بيانات")).toBeInTheDocument();
  });

  it("renders with custom message", () => {
    render(<CompactEmptyState message="لا توجد نتائج للبحث" />);
    expect(screen.getByText("لا توجد نتائج للبحث")).toBeInTheDocument();
  });

  it("renders custom icon", () => {
    render(
      <CompactEmptyState icon={<span data-testid="compact-icon">📭</span>} />
    );
    expect(screen.getByTestId("compact-icon")).toBeInTheDocument();
  });

  it("has centered layout", () => {
    const { container } = render(<CompactEmptyState />);
    expect(container.firstChild).toHaveClass(
      "flex",
      "items-center",
      "justify-center"
    );
  });
});
