import { describe, expect, it } from "vitest";
import { render, screen } from "@testing-library/react";
import { Alert } from "./Alert";

describe("Alert", () => {
  it("info (default) is polite status with the tone word + tint", () => {
    render(<Alert title="Prices may be stale">Feed degraded.</Alert>);
    const el = screen.getByRole("status");
    expect(el.className).toContain("bg-info-surface");
    expect(el.textContent).toContain("note");
    expect(el.textContent).toContain("Prices may be stale");
  });

  it("error escalates to role=alert with error tint", () => {
    render(<Alert tone="error" title="Feed unavailable" />);
    const el = screen.getByRole("alert");
    expect(el.className).toContain("bg-error-surface");
    expect(el.textContent).toContain("error");
  });

  it("each tone carries a non-color word (mono-theme safe)", () => {
    const words: Record<string, string> = {
      info: "note",
      success: "ok",
      warning: "warning",
      error: "error",
    };
    for (const [tone, word] of Object.entries(words)) {
      const { unmount } = render(
        <Alert tone={tone as "info" | "success" | "warning" | "error"} title="t" />,
      );
      expect(screen.getByText(word)).toBeTruthy();
      unmount();
    }
  });

  it("renders the action slot", () => {
    render(
      <Alert tone="warning" title="High impact" action={<button>Retry</button>} />,
    );
    expect(screen.getByRole("button", { name: "Retry" })).toBeTruthy();
  });
});
