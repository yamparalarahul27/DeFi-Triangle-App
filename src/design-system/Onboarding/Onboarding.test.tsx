import { describe, expect, it, vi } from "vitest";
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { Onboarding } from "./Onboarding";

const base = {
  open: true,
  onOpenChange: () => {},
  handle: "",
  onHandleChange: () => {},
  onJoin: () => {},
};

describe("Onboarding", () => {
  it("shows Connect wallet when not connected; handle step dimmed", () => {
    render(<Onboarding {...base} walletAddress={null} />);
    expect(screen.getByRole("button", { name: "Connect wallet" })).toBeTruthy();
  });

  it("collapses to a checked row with shortened address when connected", () => {
    render(<Onboarding {...base} walletAddress="7xKtPq4rZ9fQ2mNvB1cD" />);
    expect(screen.getByText("wallet connected")).toBeTruthy();
    expect(screen.getByText("7xKt…B1cD")).toBeTruthy();
    expect(screen.queryByRole("button", { name: "Connect wallet" })).toBeNull();
  });

  it("CTA is gated on connected AND available", () => {
    const { rerender } = render(
      <Onboarding {...base} walletAddress={null} availability="available" />,
    );
    const cta = () =>
      screen.getByRole("button", { name: "Join the tide" }) as HTMLButtonElement;
    expect(cta().disabled).toBe(true); // not connected
    rerender(
      <Onboarding {...base} walletAddress="wallet" availability="taken" />,
    );
    expect(cta().disabled).toBe(true); // taken
    rerender(
      <Onboarding {...base} walletAddress="wallet" availability="available" />,
    );
    expect(cta().disabled).toBe(false);
  });

  it("availability states render their copy", () => {
    render(<Onboarding {...base} walletAddress="w" availability="taken" />);
    expect(screen.getByText("taken")).toBeTruthy();
  });

  it("sanitizes the handle input to [a-z0-9_]", async () => {
    const onHandleChange = vi.fn();
    render(
      <Onboarding
        {...base}
        walletAddress="w"
        onHandleChange={onHandleChange}
      />,
    );
    await userEvent.type(screen.getByPlaceholderText("handle"), "Mi-ra!");
    const values = onHandleChange.mock.calls.map((c) => c[0]);
    for (const v of values) expect(v).toMatch(/^[a-z0-9_]*$/);
  });
});
