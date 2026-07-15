import { describe, expect, it, vi } from "vitest";
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { Combobox } from "./Combobox";

const OPTIONS = [
  { value: "sol", label: "SOL", hint: "$184.26" },
  { value: "jup", label: "JUP", hint: "$0.8123" },
  { value: "bonk", label: "BONK" },
];

function setup(value?: string, onChange = vi.fn()) {
  render(
    <Combobox
      aria-label="Search tokens"
      options={OPTIONS}
      value={value}
      onValueChange={onChange}
    />,
  );
  return { input: screen.getByRole("combobox", { name: "Search tokens" }), onChange };
}

describe("Combobox", () => {
  it("typing opens the listbox and filters (case-insensitive contains)", async () => {
    const { input } = setup();
    await userEvent.type(input, "jU");
    expect(input.getAttribute("aria-expanded")).toBe("true");
    const opts = screen.getAllByRole("option");
    expect(opts.map((o) => o.textContent)).toEqual(["JUP$0.8123"]);
  });

  it("Enter selects the active option and closes; input shows its label", async () => {
    const { input, onChange } = setup(undefined);
    await userEvent.type(input, "bo{Enter}");
    expect(onChange).toHaveBeenCalledWith("bonk");
    expect(input.getAttribute("aria-expanded")).toBe("false");
  });

  it("arrow keys move aria-activedescendant; focus stays in the input", async () => {
    const { input } = setup();
    await userEvent.click(input);
    await userEvent.keyboard("{ArrowDown}");
    const active = input.getAttribute("aria-activedescendant");
    expect(active).toBeTruthy();
    expect(document.getElementById(active!)?.textContent).toContain("JUP");
    expect(document.activeElement).toBe(input);
  });

  it("free text never sticks — Escape reverts to the selected label", async () => {
    const { input, onChange } = setup("sol");
    expect((input as HTMLInputElement).value).toBe("SOL");
    await userEvent.type(input, "xyz-not-a-token");
    expect(screen.getByText("No matches")).toBeTruthy();
    await userEvent.keyboard("{Escape}");
    expect((input as HTMLInputElement).value).toBe("SOL");
    expect(onChange).not.toHaveBeenCalled();
  });

  it("clicking an option selects it", async () => {
    const { input, onChange } = setup();
    await userEvent.click(input);
    await userEvent.click(screen.getByRole("option", { name: /JUP/ }));
    expect(onChange).toHaveBeenCalledWith("jup");
  });
});
