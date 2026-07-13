import { describe, expect, it } from "vitest";
import { render } from "@testing-library/react";
import { PegBadge } from "./PegBadge";

const badge = (bps: number) =>
  render(<PegBadge deviationBps={bps} />).container.firstElementChild!;

describe("PegBadge (magnitude tone + signed readout)", () => {
  it("|bps| < 25 → on peg, buy tint", () => {
    const el = badge(4);
    expect(el.textContent).toContain("on peg");
    expect(el.textContent).toContain("+4bps");
    expect(el.className).toContain("text-buy");
  });

  it("negative drift keeps the − sign but tones by magnitude", () => {
    const el = badge(-38);
    expect(el.textContent).toContain("drifting");
    expect(el.textContent).toContain("−38bps");
    expect(el.className).toContain("text-warning");
  });

  it("≥200bps → depegged, sell tint", () => {
    const el = badge(-230);
    expect(el.textContent).toContain("depegged");
    expect(el.className).toContain("text-sell");
  });
});
