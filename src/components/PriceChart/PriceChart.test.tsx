import { describe, expect, it, vi } from "vitest";
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { PriceChart, type PricePoint } from "./PriceChart";

// recharts renders poorly in jsdom (zero layout); these assertions target
// the header + range switcher, which live outside the chart SVG. The chart
// itself is exercised on localhost / the Vercel preview.

const UP: PricePoint[] = [
  { label: "1", price: 100 },
  { label: "2", price: 110 },
  { label: "3", price: 130 },
];
const DOWN: PricePoint[] = [
  { label: "1", price: 130 },
  { label: "2", price: 110 },
  { label: "3", price: 90 },
];

describe("PriceChart", () => {
  it("labels the section and shows symbol + latest formatted value", () => {
    render(
      <PriceChart symbol="SOL / USDC" data={UP} range="1W" ranges={["1D", "1W"]} onRangeChange={() => {}} />,
    );
    expect(screen.getByRole("region", { name: "SOL / USDC price chart" })).toBeTruthy();
    expect(screen.getByText("SOL / USDC")).toBeTruthy();
    expect(screen.getByText("$130")).toBeTruthy(); // last point, default format
  });

  it("derives the change from first→last (up series ⇒ +%)", () => {
    render(
      <PriceChart symbol="X" data={UP} range="1W" ranges={["1D", "1W"]} onRangeChange={() => {}} />,
    );
    // 100 → 130 = +30.00%
    expect(screen.getByText(/30\.00/)).toBeTruthy();
  });

  it("down series renders a negative change", () => {
    render(
      <PriceChart symbol="X" data={DOWN} range="1W" ranges={["1D", "1W"]} onRangeChange={() => {}} />,
    );
    // 130 → 90 = −30.77%
    expect(screen.getByText(/30\.77/)).toBeTruthy();
  });

  it("range switcher renders all ranges and fires onRangeChange", async () => {
    const onRangeChange = vi.fn();
    render(
      <PriceChart
        symbol="X"
        data={UP}
        range="1W"
        ranges={["1D", "1W", "1M", "1Y"]}
        onRangeChange={onRangeChange}
      />,
    );
    const tabs = screen.getAllByRole("tab");
    expect(tabs.map((t) => t.textContent)).toEqual(["1D", "1W", "1M", "1Y"]);
    await userEvent.click(screen.getByRole("tab", { name: "1M" }));
    expect(onRangeChange).toHaveBeenCalledWith("1M");
  });

  it("applies a custom valueFormat to the latest value", () => {
    render(
      <PriceChart
        symbol="X"
        data={UP}
        range="1W"
        ranges={["1W"]}
        onRangeChange={() => {}}
        valueFormat={(v) => `${v.toFixed(2)} USDC`}
      />,
    );
    expect(screen.getByText("130.00 USDC")).toBeTruthy();
  });
});
