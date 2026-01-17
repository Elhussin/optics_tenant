// __tests__/components/Skeleton.test.tsx
/**
 * Tests for Skeleton component
 */

import { describe, it, expect } from "vitest";
import { render, screen } from "@testing-library/react";
import { Skeleton, SkeletonGroup } from "@/src/shared/components/ui/Skeleton";

describe("Skeleton", () => {
  it("renders with default variant", () => {
    const { container } = render(<Skeleton />);
    expect(container.firstChild).toHaveClass("bg-elevated");
  });

  it("renders text variant", () => {
    const { container } = render(<Skeleton variant="text" />);
    expect(container.firstChild).toHaveClass("h-4", "w-full");
  });

  it("renders title variant", () => {
    const { container } = render(<Skeleton variant="title" />);
    expect(container.firstChild).toHaveClass("h-6", "w-3/4");
  });

  it("renders avatar variant", () => {
    const { container } = render(<Skeleton variant="avatar" />);
    expect(container.firstChild).toHaveClass("h-10", "w-10", "rounded-full");
  });

  it("renders button variant", () => {
    const { container } = render(<Skeleton variant="button" />);
    expect(container.firstChild).toHaveClass("h-10", "w-24");
  });

  it("renders with custom width and height", () => {
    const { container } = render(<Skeleton width={200} height={100} />);
    const element = container.firstChild as HTMLElement;
    expect(element.style.width).toBe("200px");
    expect(element.style.height).toBe("100px");
  });

  it("renders with string dimensions", () => {
    const { container } = render(<Skeleton width="50%" height="auto" />);
    const element = container.firstChild as HTMLElement;
    expect(element.style.width).toBe("50%");
    expect(element.style.height).toBe("auto");
  });

  it("renders with different rounded values", () => {
    const { rerender, container } = render(<Skeleton rounded="none" />);
    expect(container.firstChild).toHaveClass("rounded-none");

    rerender(<Skeleton rounded="lg" />);
    expect(container.firstChild).toHaveClass("rounded-lg");

    rerender(<Skeleton rounded="full" />);
    expect(container.firstChild).toHaveClass("rounded-full");
  });

  it("applies shimmer animation by default", () => {
    const { container } = render(<Skeleton />);
    expect(container.firstChild).toHaveClass("animate-shimmer");
  });

  it("can disable animation", () => {
    const { container } = render(<Skeleton animate={false} />);
    expect(container.firstChild).not.toHaveClass("animate-shimmer");
  });

  it("applies custom className", () => {
    const { container } = render(<Skeleton className="custom-class" />);
    expect(container.firstChild).toHaveClass("custom-class");
  });
});

describe("SkeletonGroup", () => {
  it("renders list-item type", () => {
    const { container } = render(<SkeletonGroup type="list-item" count={3} />);
    const items = container.querySelectorAll(".flex.items-center.gap-4");
    expect(items).toHaveLength(3);
  });

  it("renders card type", () => {
    const { container } = render(<SkeletonGroup type="card" count={2} />);
    const items = container.querySelectorAll(".p-4.border");
    expect(items).toHaveLength(2);
  });

  it("renders table-row type", () => {
    const { container } = render(<SkeletonGroup type="table-row" count={4} />);
    const items = container.querySelectorAll(".border-b");
    expect(items).toHaveLength(4);
  });

  it("renders profile type", () => {
    const { container } = render(<SkeletonGroup type="profile" />);
    expect(container.firstChild).toHaveClass("flex-col", "items-center");
  });

  it("uses default count of 1", () => {
    const { container } = render(<SkeletonGroup type="list-item" />);
    const items = container.querySelectorAll(".flex.items-center.gap-4");
    expect(items).toHaveLength(1);
  });
});
