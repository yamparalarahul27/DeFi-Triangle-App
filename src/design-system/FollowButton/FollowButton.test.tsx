import { describe, expect, it, vi } from "vitest";
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { FollowButton } from "./FollowButton";

describe("FollowButton", () => {
  it("shows Follow (filled) when not following", () => {
    render(<FollowButton following={false} onToggle={() => {}} />);
    const btn = screen.getByRole("button", { name: "Follow" });
    expect(btn.getAttribute("aria-pressed")).toBe("false");
    expect(btn.className).toContain("bg-brand");
  });

  it("shows Following (outline) when following", () => {
    render(<FollowButton following onToggle={() => {}} />);
    const btn = screen.getByRole("button", { name: "Following" });
    expect(btn.getAttribute("aria-pressed")).toBe("true");
    expect(btn.className).toContain("border-outline");
  });

  it("fires onToggle on click", async () => {
    const onToggle = vi.fn();
    render(<FollowButton following={false} onToggle={onToggle} />);
    await userEvent.click(screen.getByRole("button"));
    expect(onToggle).toHaveBeenCalledTimes(1);
  });
});
