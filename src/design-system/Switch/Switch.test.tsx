import { describe, expect, it, vi } from "vitest";
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { Switch } from "./Switch";

describe("Switch", () => {
  it("has switch semantics and toggles via click + keyboard", async () => {
    const onChange = vi.fn();
    render(<Switch checked={false} onCheckedChange={onChange} aria-label="Public" />);
    const el = screen.getByRole("switch", { name: "Public" });
    expect(el.getAttribute("aria-checked")).toBe("false");
    await userEvent.click(el);
    expect(onChange).toHaveBeenLastCalledWith(true);
    el.focus();
    await userEvent.keyboard(" ");
    expect(onChange).toHaveBeenCalledTimes(2);
  });

  it("checked state styles the brand track", () => {
    render(<Switch checked onCheckedChange={() => {}} aria-label="On" />);
    expect(screen.getByRole("switch").className).toContain("data-[state=checked]:bg-brand");
    expect(screen.getByRole("switch").getAttribute("data-state")).toBe("checked");
  });
});
