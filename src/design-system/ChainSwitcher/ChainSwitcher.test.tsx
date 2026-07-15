import { describe, expect, it, vi } from "vitest";
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { ChainSwitcher } from "./ChainSwitcher";

const NETWORKS = [
  { id: "solana", label: "Solana" },
  { id: "eclipse", label: "Eclipse" },
  { id: "sonic", label: "Sonic" },
];

describe("ChainSwitcher", () => {
  it("trigger always names the active network", () => {
    render(<ChainSwitcher networks={NETWORKS} value="solana" onValueChange={() => {}} />);
    expect(
      screen.getByRole("button", { name: "Network: Solana — switch" }),
    ).toBeTruthy();
  });

  it("opens a radio menu with the active item checked", async () => {
    render(<ChainSwitcher networks={NETWORKS} value="eclipse" onValueChange={() => {}} />);
    await userEvent.click(screen.getByRole("button"));
    const items = screen.getAllByRole("menuitemradio");
    expect(items).toHaveLength(3);
    expect(
      items.find((i) => i.textContent?.includes("Eclipse"))?.getAttribute("aria-checked"),
    ).toBe("true");
  });

  it("selecting a network fires onValueChange with its id", async () => {
    const onChange = vi.fn();
    render(<ChainSwitcher networks={NETWORKS} value="solana" onValueChange={onChange} />);
    await userEvent.click(screen.getByRole("button"));
    await userEvent.click(screen.getByRole("menuitemradio", { name: /Sonic/ }));
    expect(onChange).toHaveBeenCalledWith("sonic");
  });

  it("disabled trigger cannot open (pending-transaction guard)", async () => {
    render(<ChainSwitcher networks={NETWORKS} value="solana" onValueChange={() => {}} disabled />);
    expect((screen.getByRole("button") as HTMLButtonElement).disabled).toBe(true);
  });
});
