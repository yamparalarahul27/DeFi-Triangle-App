import { describe, expect, it, vi } from "vitest";
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { ReactionBar, type Reaction } from "./ReactionBar";

const RS: Reaction[] = [
  { emoji: "♥", count: 12, mine: true },
  { emoji: "🔥", count: 8 },
];

describe("ReactionBar", () => {
  it("renders pills with counts", () => {
    render(<ReactionBar reactions={RS} onReact={() => {}} />);
    expect(screen.getByText("12")).toBeTruthy();
    expect(screen.getByText("8")).toBeTruthy();
  });

  it("own reaction is marked aria-pressed + brand tint", () => {
    render(<ReactionBar reactions={RS} onReact={() => {}} />);
    const mine = screen.getByRole("button", { pressed: true });
    expect(mine.textContent).toContain("♥");
    expect(mine.className).toContain("bg-brand/10");
  });

  it("tapping a pill fires onReact with its emoji", async () => {
    const onReact = vi.fn();
    render(<ReactionBar reactions={RS} onReact={onReact} />);
    await userEvent.click(screen.getByText("🔥"));
    expect(onReact).toHaveBeenCalledWith("🔥");
  });

  it("+ opens the picker (Radix Popover); picking fires onReact and closes it", async () => {
    const onReact = vi.fn();
    render(<ReactionBar reactions={RS} onReact={onReact} />);
    await userEvent.click(screen.getByRole("button", { name: "Add reaction" }));
    const pick = await screen.findByRole("button", { name: "React 🧠" });
    await userEvent.click(pick);
    expect(onReact).toHaveBeenCalledWith("🧠");
    expect(screen.queryByRole("button", { name: "React 🧠" })).toBeNull();
  });

  it("picker dismisses on Escape and returns focus to the trigger", async () => {
    render(<ReactionBar reactions={RS} onReact={() => {}} />);
    const trigger = screen.getByRole("button", { name: "Add reaction" });
    await userEvent.click(trigger);
    expect(await screen.findByRole("button", { name: "React ♥" })).toBeTruthy();
    await userEvent.keyboard("{Escape}");
    expect(screen.queryByRole("button", { name: "React ♥" })).toBeNull();
    expect(document.activeElement).toBe(trigger);
  });
});
