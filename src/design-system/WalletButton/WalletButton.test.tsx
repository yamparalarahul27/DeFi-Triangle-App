import { describe, expect, it, vi } from "vitest";
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { WalletButton } from "./WalletButton";

const ADDR = "7xKtF2mPqR8vN3wLbJd5cYhT6gAeS4uZ1oXnE9fQ2rM";

describe("WalletButton", () => {
  it("disconnected: primary CTA fires onClick", async () => {
    const onClick = vi.fn();
    render(<WalletButton status="disconnected" onClick={onClick} />);
    const btn = screen.getByRole("button", { name: "Connect wallet" });
    expect(btn.className).toContain("bg-brand");
    await userEvent.click(btn);
    expect(onClick).toHaveBeenCalled();
  });

  it("connecting: disabled with pulsing status dot", () => {
    render(<WalletButton status="connecting" />);
    const btn = screen.getByRole("button", { name: "Connecting…" }) as HTMLButtonElement;
    expect(btn.disabled).toBe(true);
    expect(btn.querySelector(".animate-pulse")).toBeTruthy();
  });

  it("connected: truncated address visually, FULL address in the accessible name", () => {
    render(<WalletButton status="connected" address={ADDR} onClick={() => {}} />);
    const btn = screen.getByRole("button", { name: `Wallet ${ADDR} — open account` });
    expect(btn.textContent).toContain("7xKt…Q2rM");
    expect(btn.textContent).not.toContain(ADDR);
  });
});
