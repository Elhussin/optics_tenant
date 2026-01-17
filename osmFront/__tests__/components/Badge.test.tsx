// __tests__/components/Badge.test.tsx
/**
 * Tests for Badge component
 */

import { describe, it, expect } from "vitest";
import { render, screen } from "@testing-library/react";
import {
  Badge,
  CountBadge,
  StatusBadge,
} from "@/src/shared/components/ui/Badge";

describe("Badge", () => {
  it("renders with default variant", () => {
    render(<Badge>Default Badge</Badge>);
    expect(screen.getByText("Default Badge")).toBeInTheDocument();
  });

  it("renders with primary variant", () => {
    render(<Badge variant="primary">Primary</Badge>);
    const badge = screen.getByText("Primary");
    expect(badge).toBeInTheDocument();
    expect(badge).toHaveClass("bg-primary/10");
  });

  it("renders with success variant", () => {
    render(<Badge variant="success">Success</Badge>);
    const badge = screen.getByText("Success");
    expect(badge).toHaveClass("bg-success/10");
  });

  it("renders with danger variant", () => {
    render(<Badge variant="danger">Danger</Badge>);
    const badge = screen.getByText("Danger");
    expect(badge).toHaveClass("bg-danger/10");
  });

  it("renders with dot indicator", () => {
    render(
      <Badge variant="success" dot>
        Active
      </Badge>
    );
    const badge = screen.getByText("Active");
    expect(badge.previousSibling).toHaveClass("rounded-full");
  });

  it("renders with icon", () => {
    render(
      <Badge variant="info" icon={<span data-testid="icon">★</span>}>
        With Icon
      </Badge>
    );
    expect(screen.getByTestId("icon")).toBeInTheDocument();
  });

  it("renders outline variant", () => {
    render(
      <Badge variant="primary" outline>
        Outline
      </Badge>
    );
    const badge = screen.getByText("Outline");
    expect(badge).toHaveClass("border");
  });

  it("renders with different sizes", () => {
    const { rerender } = render(<Badge size="sm">Small</Badge>);
    expect(screen.getByText("Small")).toHaveClass("text-xs");

    rerender(<Badge size="lg">Large</Badge>);
    expect(screen.getByText("Large")).toHaveClass("text-base");
  });
});

describe("CountBadge", () => {
  it("renders count", () => {
    render(<CountBadge count={5} />);
    expect(screen.getByText("5")).toBeInTheDocument();
  });

  it("renders max count with plus", () => {
    render(<CountBadge count={150} max={99} />);
    expect(screen.getByText("99+")).toBeInTheDocument();
  });

  it("does not render when count is 0", () => {
    const { container } = render(<CountBadge count={0} />);
    expect(container.firstChild).toBeNull();
  });

  it("does not render when count is negative", () => {
    const { container } = render(<CountBadge count={-5} />);
    expect(container.firstChild).toBeNull();
  });

  it("renders with different colors", () => {
    const { rerender } = render(<CountBadge count={5} color="danger" />);
    expect(screen.getByText("5")).toHaveClass("bg-danger");

    rerender(<CountBadge count={5} color="primary" />);
    expect(screen.getByText("5")).toHaveClass("bg-primary");
  });
});

describe("StatusBadge", () => {
  it("renders online status", () => {
    render(<StatusBadge status="online" />);
    // The component renders a dot and label
    expect(screen.getByText("متصل")).toBeInTheDocument();
  });

  it("renders offline status", () => {
    render(<StatusBadge status="offline" />);
    expect(screen.getByText("غير متصل")).toBeInTheDocument();
  });

  it("renders busy status", () => {
    render(<StatusBadge status="busy" />);
    expect(screen.getByText("مشغول")).toBeInTheDocument();
  });

  it("renders with custom label", () => {
    render(<StatusBadge status="online" label="متاح الآن" />);
    expect(screen.getByText("متاح الآن")).toBeInTheDocument();
  });
});
