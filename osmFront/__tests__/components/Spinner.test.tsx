// __tests__/components/Spinner.test.tsx
/**
 * Tests for Spinner component
 */

import { describe, it, expect } from "vitest";
import { render, screen } from "@testing-library/react";
import {
  Spinner,
  PageLoading,
  InlineLoading,
  LoadingOverlay,
  ButtonSpinner,
} from "@/src/shared/components/ui/Spinner";

describe("Spinner", () => {
  it("renders with default size", () => {
    const { container } = render(<Spinner />);
    expect(container.firstChild).toHaveClass("w-6", "h-6");
  });

  it("renders with small size", () => {
    const { container } = render(<Spinner size="sm" />);
    expect(container.firstChild).toHaveClass("w-4", "h-4");
  });

  it("renders with large size", () => {
    const { container } = render(<Spinner size="lg" />);
    expect(container.firstChild).toHaveClass("w-8", "h-8");
  });

  it("renders with extra large size", () => {
    const { container } = render(<Spinner size="xl" />);
    expect(container.firstChild).toHaveClass("w-12", "h-12");
  });

  it("renders with primary variant", () => {
    const { container } = render(<Spinner variant="primary" />);
    expect(container.firstChild).toHaveClass("text-primary");
  });

  it("renders with white variant", () => {
    const { container } = render(<Spinner variant="white" />);
    expect(container.firstChild).toHaveClass("text-white");
  });

  it("has spin animation", () => {
    const { container } = render(<Spinner />);
    expect(container.firstChild).toHaveClass("animate-spin");
  });

  it("applies custom className", () => {
    const { container } = render(<Spinner className="custom-spinner" />);
    expect(container.firstChild).toHaveClass("custom-spinner");
  });
});

describe("PageLoading", () => {
  it("renders with default message", () => {
    render(<PageLoading />);
    expect(screen.getByText("جاري التحميل...")).toBeInTheDocument();
  });

  it("renders with custom message", () => {
    render(<PageLoading message="جاري تحميل البيانات" />);
    expect(screen.getByText("جاري تحميل البيانات")).toBeInTheDocument();
  });

  it("renders spinner component", () => {
    const { container } = render(<PageLoading />);
    expect(container.querySelector(".animate-spin")).toBeInTheDocument();
  });

  it("is fixed positioned", () => {
    const { container } = render(<PageLoading />);
    expect(container.firstChild).toHaveClass("fixed", "inset-0");
  });
});

describe("InlineLoading", () => {
  it("renders spinner without message by default", () => {
    const { container } = render(<InlineLoading />);
    expect(container.querySelector(".animate-spin")).toBeInTheDocument();
  });

  it("renders with message", () => {
    render(<InlineLoading message="Loading..." />);
    expect(screen.getByText("Loading...")).toBeInTheDocument();
  });

  it("uses specified size", () => {
    const { container } = render(<InlineLoading size="xs" />);
    expect(container.querySelector(".w-3")).toBeInTheDocument();
  });
});

describe("LoadingOverlay", () => {
  it("renders when show is true", () => {
    const { container } = render(<LoadingOverlay show={true} />);
    expect(container.firstChild).not.toBeNull();
  });

  it("does not render when show is false", () => {
    const { container } = render(<LoadingOverlay show={false} />);
    expect(container.firstChild).toBeNull();
  });

  it("renders with message", () => {
    render(<LoadingOverlay show={true} message="Saving..." />);
    expect(screen.getByText("Saving...")).toBeInTheDocument();
  });

  it("has backdrop blur by default", () => {
    const { container } = render(<LoadingOverlay show={true} />);
    expect(container.firstChild).toHaveClass("backdrop-blur-sm");
  });

  it("can disable backdrop blur", () => {
    const { container } = render(<LoadingOverlay show={true} blur={false} />);
    expect(container.firstChild).not.toHaveClass("backdrop-blur-sm");
  });
});

describe("ButtonSpinner", () => {
  it("renders children when not loading", () => {
    render(<ButtonSpinner loading={false}>Submit</ButtonSpinner>);
    expect(screen.getByText("Submit")).toBeInTheDocument();
  });

  it("renders spinner when loading", () => {
    const { container } = render(
      <ButtonSpinner loading={true}>Submit</ButtonSpinner>
    );
    expect(container.querySelector(".animate-spin")).toBeInTheDocument();
  });

  it("shows loading text when provided", () => {
    render(
      <ButtonSpinner loading={true} loadingText="Submitting...">
        Submit
      </ButtonSpinner>
    );
    expect(screen.getByText("Submitting...")).toBeInTheDocument();
  });

  it("shows original children text when loading without loadingText", () => {
    render(<ButtonSpinner loading={true}>Submit</ButtonSpinner>);
    expect(screen.getByText("Submit")).toBeInTheDocument();
  });
});
