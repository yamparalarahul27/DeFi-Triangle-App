import { describe, expect, it } from "vitest";
import { render, screen } from "@testing-library/react";
import { Amount } from "./Amount";

describe("Amount", () => {
  it("≥1 formats to 2dp with thousands separators", () => {
    render(<Amount value={1234.5678} symbol="SOL" />);
    const el = screen.getByTitle("1234.5678 SOL");
    expect(el.textContent).toBe("1,234.57SOL");
  });

  it("<1 keeps 4 significant digits (dust stays readable)", () => {
    render(<Amount value={0.00002314} symbol="BONK" />);
    expect(screen.getByTitle("0.00002314 BONK").textContent).toContain("0.00002314");
  });

  it("sign discipline: − prefix from the signed value, magnitude from abs", () => {
    render(<Amount value={-12.5} symbol="USDC" />);
    const el = screen.getByTitle("-12.5 USDC");
    expect(el.textContent).toBe("−12.50USDC");
  });

  it("explicit decimals override the magnitude default", () => {
    render(<Amount value={184.26} decimals={4} />);
    expect(screen.getByTitle("184.26").textContent).toBe("184.2600");
  });

  it("renders in the financial type ramp", () => {
    render(<Amount value={1} size="lg" />);
    expect(screen.getByTitle("1").className).toContain("data-lg");
  });
});
