import { describe, expect, it, vi } from "vitest";
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { Menu } from "./Menu";
import { IconButton } from "../IconButton";

const items = (onCopy = () => {}, onDel = () => {}) => [
  { label: "Copy link", onSelect: onCopy },
  { kind: "separator" as const },
  { label: "Delete", onSelect: onDel, destructive: true },
];

function renderMenu(onCopy?: () => void, onDel?: () => void) {
  return render(
    <Menu
      trigger={<IconButton aria-label="Actions">⋯</IconButton>}
      items={items(onCopy, onDel)}
    />,
  );
}

describe("Menu", () => {
  it("opens on trigger click and lists menu items", async () => {
    renderMenu();
    await userEvent.click(screen.getByRole("button", { name: "Actions" }));
    expect(await screen.findByRole("menu")).toBeTruthy();
    expect(screen.getByRole("menuitem", { name: "Copy link" })).toBeTruthy();
    expect(screen.getByRole("menuitem", { name: "Delete" }).className).toContain("text-sell");
  });

  it("selecting an item fires onSelect and closes", async () => {
    const onCopy = vi.fn();
    renderMenu(onCopy);
    await userEvent.click(screen.getByRole("button", { name: "Actions" }));
    await userEvent.click(await screen.findByRole("menuitem", { name: "Copy link" }));
    expect(onCopy).toHaveBeenCalledTimes(1);
    expect(screen.queryByRole("menu")).toBeNull();
  });

  it("Escape closes and returns focus to the trigger", async () => {
    renderMenu();
    const trigger = screen.getByRole("button", { name: "Actions" });
    await userEvent.click(trigger);
    expect(await screen.findByRole("menu")).toBeTruthy();
    await userEvent.keyboard("{Escape}");
    expect(screen.queryByRole("menu")).toBeNull();
    expect(document.activeElement).toBe(trigger);
  });
});
