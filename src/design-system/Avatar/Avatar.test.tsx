import { describe, expect, it } from "vitest";
import { render, screen, within } from "@testing-library/react";
import { Avatar } from "./Avatar";

const bg = (el: HTMLElement) => el.style.backgroundImage;

describe("Avatar", () => {
  it("renders the first letter of name as glyph, uppercased", () => {
    render(<Avatar name="mira" />);
    expect(screen.getByRole("img", { name: "mira" }).textContent).toBe("M");
  });

  it("is deterministic: same seed → same hue gradient", () => {
    const ra = render(<Avatar name="A" seed="wallet-x" />);
    const rb = render(<Avatar name="B" seed="wallet-x" />);
    const a = within(ra.container).getByRole("img");
    const b = within(rb.container).getByRole("img");
    expect(bg(a)).toBe(bg(b));
    expect(bg(a)).toContain("radial-gradient");
  });

  it("`you` forces the reserved tide hue regardless of seed", () => {
    const you = render(<Avatar name="Y" you seed="whatever" />).getByRole("img");
    expect(bg(you)).toContain("var(--id-tide)");
  });

  it("explicit hue overrides hashing", () => {
    const el = render(<Avatar name="R" hue="rose" seed="x" />).getByRole("img");
    expect(bg(el)).toContain("var(--id-rose)");
  });

  it("sizes map to their diameter classes", () => {
    const el = render(<Avatar name="M" size={64} />).getByRole("img");
    expect(el.className).toContain("w-16");
  });

  it("merges className", () => {
    const el = render(<Avatar name="M" className="ring-2" />).getByRole("img");
    expect(el.className).toContain("ring-2");
  });
});
