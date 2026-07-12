import { describe, expect, it } from "vitest";
import { render, screen } from "@testing-library/react";
import { AvatarGroup } from "./AvatarGroup";

const FIVE = ["mira", "kip", "nova", "sol", "ali"].map((n) => ({ name: n }));

describe("AvatarGroup", () => {
  it("shows max avatars and a +N overflow disc", () => {
    render(<AvatarGroup members={FIVE} max={3} />);
    expect(screen.getAllByRole("img")).toHaveLength(3);
    expect(screen.getByText("+2")).toBeTruthy();
  });

  it("no overflow disc when members fit", () => {
    render(<AvatarGroup members={FIVE.slice(0, 2)} max={3} />);
    expect(screen.queryByText(/^\+/)).toBeNull();
  });

  it("carries an aria-label count, pluralized", () => {
    render(<AvatarGroup members={FIVE} />);
    expect(screen.getByLabelText("5 people")).toBeTruthy();
  });

  it("singular label for one member", () => {
    render(<AvatarGroup members={FIVE.slice(0, 1)} />);
    expect(screen.getByLabelText("1 person")).toBeTruthy();
  });
});
