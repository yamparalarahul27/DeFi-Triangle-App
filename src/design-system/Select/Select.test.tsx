import { describe, expect, it, vi } from "vitest";
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { Select } from "./Select";

const OPTS = [
  { value: "sol", label: "Solana" },
  { value: "eth", label: "Ethereum" },
];

describe("Select", () => {
  it("shows the placeholder until a value is chosen", () => {
    render(
      <Select aria-label="Network" options={OPTS} value={undefined} onValueChange={() => {}} placeholder="Network…" />,
    );
    expect(screen.getByText("Network…")).toBeTruthy();
  });

  it("opens as a listbox and selecting fires onValueChange", async () => {
    const onChange = vi.fn();
    render(<Select aria-label="Network" options={OPTS} value={undefined} onValueChange={onChange} />);
    await userEvent.click(screen.getByRole("combobox", { name: "Network" }));
    const opt = await screen.findByRole("option", { name: "Ethereum" });
    await userEvent.click(opt);
    expect(onChange).toHaveBeenCalledWith("eth");
  });
});
