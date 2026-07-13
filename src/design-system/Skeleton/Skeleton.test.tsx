import { describe, expect, it } from "vitest";
import { render, screen } from "@testing-library/react";
import { Skeleton, SectionSkeleton } from "./Skeleton";

describe("Skeleton", () => {
  it("is aria-hidden decorative shimmer", () => {
    const { container } = render(<Skeleton className="h-4 w-10" />);
    const el = container.firstElementChild!;
    expect(el.getAttribute("aria-hidden")).toBe("true");
    expect(el.className).toContain("animate-pulse");
  });

  it("accepts className (cn-merged, API contract)", () => {
    const { container } = render(<Skeleton className="rounded-full h-8" />);
    const cls = container.firstElementChild!.className;
    expect(cls).toContain("rounded-full");
    expect(cls).toContain("h-8");
  });

  it("SectionSkeleton announces a labelled busy region with min height", () => {
    render(<SectionSkeleton height={160} label="Stats" />);
    const region = screen.getByLabelText("Stats loading");
    expect(region.getAttribute("aria-busy")).toBe("true");
    expect((region as HTMLElement).style.minHeight).toBe("160px");
  });
});
