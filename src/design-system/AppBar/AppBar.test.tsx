import { describe, expect, it } from "vitest";
import { render, screen } from "@testing-library/react";
import { AppBar } from "./AppBar";

describe("AppBar", () => {
  it("renders a header landmark with the title as h1", () => {
    render(<AppBar title="Markets" />);
    expect(screen.getByRole("banner")).toBeTruthy();
    expect(screen.getByRole("heading", { level: 1, name: "Markets" })).toBeTruthy();
  });

  it("renders leading and actions slots", () => {
    render(
      <AppBar
        title="Markets"
        leading={<button aria-label="Back">‹</button>}
        actions={<button aria-label="Settings">⚙</button>}
      />,
    );
    expect(screen.getByRole("button", { name: "Back" })).toBeTruthy();
    expect(screen.getByRole("button", { name: "Settings" })).toBeTruthy();
  });

  it("sticky pins on the z-sticky rung; default does not", () => {
    const { rerender } = render(<AppBar title="Markets" />);
    expect(screen.getByRole("banner").className).not.toContain("sticky");
    rerender(<AppBar title="Markets" sticky />);
    const el = screen.getByRole("banner");
    expect(el.className).toContain("sticky");
    expect(el.className).toContain("z-[var(--z-sticky)]");
  });
});
