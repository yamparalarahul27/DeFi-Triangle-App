import { describe, expect, it } from "vitest";
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { Tooltip } from "./Tooltip";

// jsdom exposes `ontouchstart`, so the component's touch heuristic picks the
// BOTTOM-SHEET (Radix Dialog) branch here — which is exactly the behavior
// worth testing: on touch devices the content must be reachable by tap,
// with dialog semantics. (The pointer branch is plain Radix Tooltip.)
describe("Tooltip (touch adaptation)", () => {
  it("tap opens a dialog sheet with the content + title", async () => {
    render(
      <Tooltip content="Organic-volume estimate." title="Organic score">
        <button type="button">ⓘ</button>
      </Tooltip>,
    );
    const trigger = screen.getByRole("button", { name: "ⓘ" });
    expect(trigger.getAttribute("aria-haspopup")).toBe("dialog");
    await userEvent.click(trigger);
    const dialog = await screen.findByRole("dialog");
    expect(dialog.textContent).toContain("Organic-volume estimate.");
    expect(screen.getByText("Organic score")).toBeTruthy();
  });

  it("Escape dismisses the sheet and focus returns to the trigger", async () => {
    render(
      <Tooltip content="Reachable content.">
        <button type="button">info</button>
      </Tooltip>,
    );
    const trigger = screen.getByRole("button", { name: "info" });
    await userEvent.click(trigger);
    expect(await screen.findByRole("dialog")).toBeTruthy();
    await userEvent.keyboard("{Escape}");
    expect(screen.queryByRole("dialog")).toBeNull();
    expect(document.activeElement).toBe(trigger);
  });
});
