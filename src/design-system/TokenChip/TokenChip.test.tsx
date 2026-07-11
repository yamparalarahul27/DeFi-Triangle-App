import { describe, expect, it } from "vitest";
import { render, screen } from "@testing-library/react";
import { TokenChip } from "./TokenChip";

describe("TokenChip", () => {
  it("renders symbol and price", () => {
    render(<TokenChip symbol="JUP" price="$0.8123" change24h={4.2} />);
    expect(screen.getByText("JUP")).toBeTruthy();
    expect(screen.getByText("$0.8123")).toBeTruthy();
  });

  it("positive change → ▲, +, buy color", () => {
    const { container } = render(
      <TokenChip symbol="JUP" price="$0.8123" change24h={4.2} />,
    );
    const dir = container.querySelector(".text-buy");
    expect(dir?.textContent).toContain("▲");
    expect(dir?.textContent).toContain("+4.20%");
    expect(container.querySelector(".text-sell")).toBeNull();
  });

  it("negative change → ▼, −, sell color, magnitude via abs", () => {
    const { container } = render(
      <TokenChip symbol="BONK" price="$0.0000213" change24h={-1.31} />,
    );
    const dir = container.querySelector(".text-sell");
    expect(dir?.textContent).toContain("▼");
    expect(dir?.textContent).toContain("−1.31%"); // U+2212, number from Math.abs
    expect(dir?.textContent).not.toContain("-1.31"); // no ascii minus double-sign
    expect(container.querySelector(".text-buy")).toBeNull();
  });

  it("zero change → up-style (▲ +0.00%)", () => {
    const { container } = render(
      <TokenChip symbol="SOL" price="$182.40" change24h={0} />,
    );
    expect(container.querySelector(".text-buy")?.textContent).toContain("+0.00%");
  });

  it("merges className", () => {
    const { container } = render(
      <TokenChip symbol="JUP" price="$1" change24h={1} className="mt-3" />,
    );
    expect((container.firstChild as HTMLElement).className).toContain("mt-3");
  });
});
