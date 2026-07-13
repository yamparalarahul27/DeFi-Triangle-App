import { describe, expect, it, vi } from "vitest";
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { AddressChip } from "./AddressChip";

const ADDR = "7xKtF3aB9cD2eF4gH6jK8mN1pQ5rS7tU9vW2xY4z9fQ2";

describe("AddressChip", () => {
  it("truncates visually but keeps the full address accessible", () => {
    render(<AddressChip address={ADDR} />);
    expect(screen.getByLabelText(ADDR).textContent).toBe("7xKt…9fQ2");
  });

  it("copies the FULL address and confirms with a label change", async () => {
    const writeText = vi.fn().mockResolvedValue(undefined);
    Object.assign(navigator, { clipboard: { writeText } });
    render(<AddressChip address={ADDR} />);
    await userEvent.click(screen.getByRole("button", { name: `Copy address ${ADDR}` }));
    expect(writeText).toHaveBeenCalledWith(ADDR);
    expect(await screen.findByRole("button", { name: "Copied" })).toBeTruthy();
  });

  it("renders the explorer link only when href is given", () => {
    const { rerender } = render(<AddressChip address={ADDR} />);
    expect(screen.queryByRole("link")).toBeNull();
    rerender(<AddressChip address={ADDR} href="https://solscan.io/x" />);
    expect(screen.getByRole("link", { name: "View on explorer" }).getAttribute("rel")).toContain("noreferrer");
  });
});
