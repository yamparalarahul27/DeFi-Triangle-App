import { describe, expect, it } from "vitest";
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { Popover } from "./Popover";

describe("Popover", () => {
  it("opens on trigger click and renders content", async () => {
    render(
      <Popover trigger={<button>Filters</button>}>
        <p>panel content</p>
      </Popover>,
    );
    const trigger = screen.getByRole("button", { name: "Filters" });
    expect(trigger.getAttribute("aria-expanded")).toBe("false");
    await userEvent.click(trigger);
    expect(trigger.getAttribute("aria-expanded")).toBe("true");
    expect(screen.getByText("panel content")).toBeTruthy();
  });

  it("Escape closes and returns focus to the trigger", async () => {
    render(
      <Popover trigger={<button>Filters</button>}>
        <p>panel content</p>
      </Popover>,
    );
    const trigger = screen.getByRole("button", { name: "Filters" });
    await userEvent.click(trigger);
    await userEvent.keyboard("{Escape}");
    expect(screen.queryByText("panel content")).toBeNull();
    expect(document.activeElement).toBe(trigger);
  });
});
