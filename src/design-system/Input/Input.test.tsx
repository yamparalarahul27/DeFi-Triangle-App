import { describe, expect, it } from "vitest";
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { Input } from "./Input";

describe("Input", () => {
  it("types and pastes freely (paste never blocked)", async () => {
    render(<Input aria-label="Handle" />);
    const el = screen.getByRole("textbox", { name: "Handle" });
    await userEvent.click(el);
    await userEvent.paste("mira_01");
    expect((el as HTMLInputElement).value).toBe("mira_01");
  });

  it("invalid sets aria-invalid + sell border", () => {
    render(<Input aria-label="Handle" invalid />);
    const el = screen.getByRole("textbox", { name: "Handle" });
    expect(el.getAttribute("aria-invalid")).toBe("true");
    expect(el.className).toContain("border-sell");
  });

  it("valid state carries no aria-invalid noise", () => {
    render(<Input aria-label="Handle" />);
    expect(
      screen.getByRole("textbox", { name: "Handle" }).hasAttribute("aria-invalid"),
    ).toBe(false);
  });
});
