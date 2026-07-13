import { describe, expect, it, vi } from "vitest";
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { Dialog } from "./Dialog";

describe("Dialog", () => {
  it("open renders a named dialog with description wired", () => {
    render(
      <Dialog open onOpenChange={() => {}} title="Remove wallet?" description="This disconnects the device.">
        body
      </Dialog>,
    );
    const dialog = screen.getByRole("dialog", { name: "Remove wallet?" });
    expect(dialog.getAttribute("aria-describedby")).toBeTruthy();
  });

  it("Escape requests close", async () => {
    const onOpenChange = vi.fn();
    render(<Dialog open onOpenChange={onOpenChange} title="T" />);
    await userEvent.keyboard("{Escape}");
    expect(onOpenChange).toHaveBeenCalledWith(false);
  });

  it("the × close button requests close", async () => {
    const onOpenChange = vi.fn();
    render(<Dialog open onOpenChange={onOpenChange} title="T" />);
    await userEvent.click(screen.getByRole("button", { name: "Close" }));
    expect(onOpenChange).toHaveBeenCalledWith(false);
  });
});
