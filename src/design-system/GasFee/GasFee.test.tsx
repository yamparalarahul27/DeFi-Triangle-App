import { describe, expect, it } from "vitest";
import { render, screen } from "@testing-library/react";
import { GasFee } from "./GasFee";

describe("GasFee", () => {
  it("renders label, amount, and fiat", () => {
    render(<GasFee amount="0.000005 SOL" usd="≈ $0.0009" />);
    expect(screen.getByText("Network fee")).toBeTruthy();
    expect(screen.getByText("0.000005 SOL")).toBeTruthy();
    expect(screen.getByText("≈ $0.0009")).toBeTruthy();
  });

  it("each level carries a word + its tone ink (mono-safe)", () => {
    const cases = [
      ["low", "text-success"],
      ["normal", "text-fg-muted"],
      ["elevated", "text-warning"],
      ["high", "text-error"],
    ] as const;
    for (const [level, cls] of cases) {
      const { unmount } = render(<GasFee amount="0.001 SOL" level={level} />);
      const word = screen.getByText(level);
      expect(word.className).toContain(cls);
      unmount();
    }
  });

  it("no level → no severity word (flat-fee chains)", () => {
    render(<GasFee amount="0.000005 SOL" />);
    expect(screen.queryByText("low")).toBeNull();
    expect(screen.queryByText("normal")).toBeNull();
  });

  it("custom label for priority/bridge fees", () => {
    render(<GasFee amount="0.0021 SOL" label="Priority fee" />);
    expect(screen.getByText("Priority fee")).toBeTruthy();
  });
});
