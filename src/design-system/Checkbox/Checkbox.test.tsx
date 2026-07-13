import { describe, expect, it, vi } from "vitest";
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { Checkbox } from "./Checkbox";

describe("Checkbox", () => {
  it("has checkbox semantics and toggles with Space", async () => {
    const onChange = vi.fn();
    render(<Checkbox checked={false} onCheckedChange={onChange} aria-label="Agree" />);
    const el = screen.getByRole("checkbox", { name: "Agree" });
    el.focus();
    await userEvent.keyboard(" ");
    expect(onChange).toHaveBeenLastCalledWith(true);
  });

  it("normalizes Radix 'indeterminate' to boolean", async () => {
    const onChange = vi.fn();
    render(<Checkbox checked onCheckedChange={onChange} aria-label="Agree" />);
    await userEvent.click(screen.getByRole("checkbox"));
    expect(onChange).toHaveBeenLastCalledWith(false);
  });
});
