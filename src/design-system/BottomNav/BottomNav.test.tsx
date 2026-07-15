import { describe, expect, it, vi } from "vitest";
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { BottomNav } from "./BottomNav";

const ITEMS = [
  { value: "feed", label: "Feed", icon: "≋" },
  { value: "markets", label: "Markets", icon: "▤" },
  { value: "portfolio", label: "Portfolio", icon: "◎" },
];

describe("BottomNav", () => {
  it("is a nav of real buttons with aria-current on the active tab", () => {
    render(<BottomNav items={ITEMS} value="markets" onValueChange={() => {}} />);
    expect(screen.getByRole("navigation")).toBeTruthy();
    expect(
      screen.getByRole("button", { name: "Markets" }).getAttribute("aria-current"),
    ).toBe("page");
    expect(
      screen.getByRole("button", { name: "Feed" }).getAttribute("aria-current"),
    ).toBeNull();
  });

  it("clicking a tab fires onValueChange", async () => {
    const onChange = vi.fn();
    render(<BottomNav items={ITEMS} value="feed" onValueChange={onChange} />);
    await userEvent.click(screen.getByRole("button", { name: "Portfolio" }));
    expect(onChange).toHaveBeenCalledWith("portfolio");
  });

  it("icons are decorative — the label names the tab", () => {
    render(<BottomNav items={ITEMS} value="feed" onValueChange={() => {}} />);
    const btn = screen.getByRole("button", { name: "Feed" });
    const icon = btn.querySelector('[aria-hidden="true"]');
    expect(icon?.textContent).toBe("≋");
  });
});
