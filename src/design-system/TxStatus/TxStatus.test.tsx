import { describe, expect, it } from "vitest";
import { render, screen } from "@testing-library/react";
import { TxStatus } from "./TxStatus";

describe("TxStatus", () => {
  it("is a polite live region", () => {
    render(<TxStatus state="pending" />);
    const el = screen.getByRole("status");
    expect(el.getAttribute("aria-live")).toBe("polite");
    expect(el.textContent).toContain("Pending confirmation…");
  });

  it("terminal states carry glyph + word, not color alone", () => {
    const { rerender } = render(<TxStatus state="confirmed" />);
    expect(screen.getByRole("status").textContent).toContain("✓ Confirmed");
    rerender(<TxStatus state="failed" />);
    expect(screen.getByRole("status").textContent).toContain("✕ Failed");
  });

  it("in-flight states pulse; terminal states are still", () => {
    const { container, rerender } = render(<TxStatus state="pending" />);
    expect(container.querySelector(".animate-pulse")).toBeTruthy();
    rerender(<TxStatus state="confirmed" />);
    expect(container.querySelector(".animate-pulse")).toBeNull();
  });

  it("renders the mono detail line", () => {
    render(<TxStatus state="signing" detail="5D3k…Wq" />);
    expect(screen.getByText("5D3k…Wq").className).toContain("font-mono");
  });
});
