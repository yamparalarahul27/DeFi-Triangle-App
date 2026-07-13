import { describe, expect, it } from "vitest";
import { render, screen } from "@testing-library/react";
import { Divider } from "./Divider";

describe("Divider", () => {
  it("is a horizontal separator by default", () => {
    render(<Divider />);
    const el = screen.getByRole("separator");
    expect(el.getAttribute("aria-orientation")).toBe("horizontal");
    expect(el.className).toContain("h-px");
  });

  it("vertical flips orientation + axis", () => {
    render(<Divider orientation="vertical" />);
    const el = screen.getByRole("separator");
    expect(el.getAttribute("aria-orientation")).toBe("vertical");
    expect(el.className).toContain("w-px");
  });
});
