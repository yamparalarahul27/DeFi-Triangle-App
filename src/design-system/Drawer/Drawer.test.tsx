import { describe, expect, it, vi } from "vitest";
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { Drawer } from "./Drawer";

describe("Drawer", () => {
  it("open renders a named dialog with description wired", () => {
    render(
      <Drawer open onOpenChange={() => {}} title="Order details" description="Filled 2m ago">
        <p>body</p>
      </Drawer>,
    );
    const dialog = screen.getByRole("dialog", { name: "Order details" });
    expect(dialog.getAttribute("aria-describedby")).toBeTruthy();
    expect(screen.getByText("Filled 2m ago")).toBeTruthy();
  });

  it("Escape requests close", async () => {
    const onOpenChange = vi.fn();
    render(<Drawer open onOpenChange={onOpenChange} title="Order details" />);
    await userEvent.keyboard("{Escape}");
    expect(onOpenChange).toHaveBeenCalledWith(false);
  });

  it("side=right (default) and side=left pick their edge + slide", () => {
    const { rerender } = render(<Drawer open onOpenChange={() => {}} title="T" />);
    expect(screen.getByRole("dialog").className).toContain("slide-in-from-right");
    rerender(<Drawer open onOpenChange={() => {}} title="T" side="left" />);
    expect(screen.getByRole("dialog").className).toContain("slide-in-from-left");
  });

  it("closed renders nothing", () => {
    render(<Drawer open={false} onOpenChange={() => {}} title="T" />);
    expect(screen.queryByRole("dialog")).toBeNull();
  });
});
