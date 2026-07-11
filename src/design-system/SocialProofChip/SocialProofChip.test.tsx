import { describe, expect, it } from "vitest";
import { render, screen } from "@testing-library/react";
import { SocialProofChip } from "./SocialProofChip";

describe("SocialProofChip", () => {
  it("reads as one phrase to AT", () => {
    render(<SocialProofChip count={41} />);
    expect(screen.getByLabelText("41 watching")).toBeTruthy();
  });

  it("compact drops the label text but keeps the aria phrase", () => {
    render(<SocialProofChip count={41} compact />);
    const chip = screen.getByLabelText("41 watching");
    expect(chip.textContent).not.toContain("watching");
    expect(chip.textContent).toContain("41");
  });

  it("custom label", () => {
    render(<SocialProofChip count={7} label="holding" />);
    expect(screen.getByLabelText("7 holding").textContent).toContain("holding");
  });
});
