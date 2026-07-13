import { describe, expect, it } from "vitest";
import { render, screen } from "@testing-library/react";
import { StatCell } from "./StatCell";
import { PriceChange } from "../PriceChange";

describe("StatCell", () => {
  it("renders label + value in source order", () => {
    const { container } = render(<StatCell label="Market cap" value="$1.09B" />);
    expect(container.textContent).toMatch(/Market cap\$1\.09B/);
  });

  it("padding rides the density tokens", () => {
    const { container } = render(<StatCell label="Vol" value="$84M" />);
    expect((container.firstElementChild as HTMLElement).style.padding).toContain("var(--space-1)");
  });

  it("hosts a PriceChange delta", () => {
    render(<StatCell label="24h" value="$184.26" change={<PriceChange value={-1.2} />} />);
    expect(screen.getByText(/−1\.20%/)).toBeTruthy();
  });
});
