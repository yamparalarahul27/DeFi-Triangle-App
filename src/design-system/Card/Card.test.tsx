import { describe, expect, it } from "vitest";
import { render } from "@testing-library/react";
import { Card } from "./Card";

describe("Card", () => {
  it("renders the container recipe (card radius, outline, surface)", () => {
    const { container } = render(<Card>content</Card>);
    const el = container.firstElementChild as HTMLElement;
    expect(el.className).toContain("rounded-card");
    expect(el.className).toContain("bg-surface-container");
    expect(el.className).not.toContain("active:scale");
  });

  it("interactive adds card-grade press (0.98) + hover lift", () => {
    const { container } = render(<Card interactive>content</Card>);
    const el = container.firstElementChild as HTMLElement;
    expect(el.className).toContain("active:scale-[0.98]");
    expect(el.className).toContain("hover:bg-surface-container-high");
  });

  it("merges className and passes through div attributes", () => {
    const { container } = render(
      <Card className="p-0" role="group" aria-label="tile" />,
    );
    const el = container.firstElementChild as HTMLElement;
    expect(el.className).toContain("p-0");
    expect(el.getAttribute("role")).toBe("group");
  });
});
