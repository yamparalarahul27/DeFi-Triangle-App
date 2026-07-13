import { describe, expect, it } from "vitest";
import { render, screen } from "@testing-library/react";
import { IconButton } from "./IconButton";

describe("IconButton", () => {
  it("is named by its required aria-label", () => {
    render(<IconButton aria-label="Close">×</IconButton>);
    expect(screen.getByRole("button", { name: "Close" })).toBeTruthy();
  });

  it("sizes are square on the shared scale", () => {
    render(<IconButton aria-label="Big" size="lg">⚙</IconButton>);
    const cls = screen.getByRole("button", { name: "Big" }).className;
    expect(cls).toContain("h-11");
    expect(cls).toContain("w-11");
  });
});
