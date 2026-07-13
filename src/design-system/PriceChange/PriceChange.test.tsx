import { describe, expect, it } from "vitest";
import { render, screen } from "@testing-library/react";
import { PriceChange } from "./PriceChange";

describe("PriceChange (sign discipline)", () => {
  it("negative: ▼, −, magnitude via abs, sell tone", () => {
    const { container } = render(<PriceChange value={-4.2} />);
    const el = container.firstElementChild!;
    expect(el.textContent).toContain("▼");
    expect(el.textContent).toContain("−4.20%");
    expect(el.textContent).not.toContain("-4.2"); // never the raw signed string
    expect(el.className).toContain("text-sell");
  });

  it("positive: ▲, +, buy tone", () => {
    const { container } = render(<PriceChange value={9.4} />);
    const el = container.firstElementChild!;
    expect(el.textContent).toContain("▲");
    expect(el.textContent).toContain("+9.40%");
    expect(el.className).toContain("text-buy");
  });

  it("zero counts as up (flat is not a loss)", () => {
    const { container } = render(<PriceChange value={0} />);
    expect(container.firstElementChild!.className).toContain("text-buy");
  });

  it("suffix + precision are configurable", () => {
    render(<PriceChange value={-0.1234} suffix=" bps" precision={1} />);
    expect(screen.getByText(/−0\.1 bps/)).toBeTruthy();
  });
});
