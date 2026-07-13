import { describe, expect, it } from "vitest";
import { render, screen } from "@testing-library/react";
import { Badge } from "./Badge";

describe("Badge", () => {
  it("renders its text as the accessible name (no ARIA needed)", () => {
    render(<Badge tone="warning">pending</Badge>);
    expect(screen.getByText("pending")).toBeTruthy();
  });

  it("tone maps to the tinted-surface pair", () => {
    render(<Badge tone="buy">on peg</Badge>);
    const cls = screen.getByText("on peg").className;
    expect(cls).toContain("bg-buy-surface");
    expect(cls).toContain("text-buy");
  });
});
