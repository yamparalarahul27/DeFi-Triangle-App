import { describe, expect, it } from "vitest";
import { render, screen } from "@testing-library/react";
import { SocialProofChip } from "./SocialProofChip";

describe("SocialProofChip", () => {
  it("reads as one phrase to AT", () => {
    render(<SocialProofChip count={41} />);
    expect(screen.getByText("41").closest("span")!.parentElement!).toBeTruthy();
  });

  it("compact hides the label visually but keeps it for screen readers (sr-only)", () => {
    render(<SocialProofChip count={41} compact />);
    const label = screen.getByText("watching");
    expect(label.className).toContain("sr-only");
    expect(screen.getByText("41")).toBeTruthy();
  });

  it("custom label", () => {
    render(<SocialProofChip count={7} label="holding" />);
    expect(screen.getByText("7").parentElement!.textContent).toContain("holding");
  });
});
