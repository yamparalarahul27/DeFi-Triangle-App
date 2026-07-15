import { describe, expect, it, vi } from "vitest";
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { RadioGroup } from "./RadioGroup";

const OPTIONS = [
  { value: "0.1", label: "0.1%", description: "May fail" },
  { value: "0.5", label: "0.5%" },
  { value: "1.0", label: "1.0%", disabled: true },
];

describe("RadioGroup", () => {
  it("wires radiogroup/radio roles and reflects the value", () => {
    render(
      <RadioGroup aria-label="Slippage" options={OPTIONS} value="0.5" onValueChange={() => {}} />,
    );
    expect(screen.getByRole("radiogroup", { name: "Slippage" })).toBeTruthy();
    expect(
      screen.getByRole("radio", { name: /0\.5%/ }).getAttribute("data-state"),
    ).toBe("checked");
  });

  it("clicking a row label selects its option", async () => {
    const onChange = vi.fn();
    render(
      <RadioGroup aria-label="Slippage" options={OPTIONS} value="0.5" onValueChange={onChange} />,
    );
    await userEvent.click(screen.getByText("May fail"));
    expect(onChange).toHaveBeenCalledWith("0.1");
  });

  it("arrow keys move selection (roving tabindex, selection follows focus)", async () => {
    const onChange = vi.fn();
    render(
      <RadioGroup aria-label="Slippage" options={OPTIONS} value="0.1" onValueChange={onChange} />,
    );
    screen.getByRole("radio", { name: /0\.1%/ }).focus();
    // Hold the key across Radix's deferred focus move (roving-focus uses
    // setTimeout(0); selection-follows-focus only fires while an arrow
    // key is down — a synchronous press+release never selects in jsdom).
    await userEvent.keyboard("{ArrowDown>}");
    await new Promise((r) => setTimeout(r, 0));
    await userEvent.keyboard("{/ArrowDown}");
    expect(document.activeElement).toBe(screen.getByRole("radio", { name: /0\.5%/ }));
    expect(onChange).toHaveBeenCalledWith("0.5");
  });

  it("disabled option cannot be selected", async () => {
    const onChange = vi.fn();
    render(
      <RadioGroup aria-label="Slippage" options={OPTIONS} value="0.5" onValueChange={onChange} />,
    );
    await userEvent.click(screen.getByRole("radio", { name: /1\.0%/ }));
    expect(onChange).not.toHaveBeenCalled();
  });
});
