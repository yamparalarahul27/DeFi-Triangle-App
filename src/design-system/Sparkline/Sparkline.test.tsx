import { describe, expect, it } from "vitest";
import { render, screen } from "@testing-library/react";
import { Sparkline } from "./Sparkline";

describe("Sparkline", () => {
  it("is decorative by default, named with a label", () => {
    const { container, rerender } = render(<Sparkline data={[1, 2, 3]} />);
    expect(container.querySelector("svg")!.getAttribute("aria-hidden")).toBe("true");
    rerender(<Sparkline data={[1, 2, 3]} label="7-day trend" />);
    expect(screen.getByRole("img", { name: "7-day trend" })).toBeTruthy();
  });

  it("tone follows direction (sign discipline)", () => {
    const { container, rerender } = render(<Sparkline data={[1, 2, 3]} />);
    expect(container.querySelector("polyline")!.getAttribute("stroke")).toBe("var(--buy)");
    rerender(<Sparkline data={[3, 2, 1]} />);
    expect(container.querySelector("polyline")!.getAttribute("stroke")).toBe("var(--sell)");
  });

  it("renders nothing below 2 points", () => {
    const { container } = render(<Sparkline data={[1]} />);
    expect(container.firstElementChild).toBeNull();
  });
});
