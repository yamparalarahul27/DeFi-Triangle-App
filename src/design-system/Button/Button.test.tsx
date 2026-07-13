import { describe, expect, it, vi } from "vitest";
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { Button } from "./Button";

describe("Button", () => {
  it("defaults to type=button (no accidental form submits)", () => {
    render(<Button>Go</Button>);
    expect(screen.getByRole("button", { name: "Go" }).getAttribute("type")).toBe("button");
  });

  it("variants map to token classes", () => {
    const { rerender } = render(<Button variant="primary">A</Button>);
    expect(screen.getByRole("button").className).toContain("bg-brand");
    rerender(<Button variant="destructive">A</Button>);
    expect(screen.getByRole("button").className).toContain("bg-sell-strong");
  });

  it("fires onClick; disabled does not", async () => {
    const onClick = vi.fn();
    const { rerender } = render(<Button onClick={onClick}>Go</Button>);
    await userEvent.click(screen.getByRole("button"));
    expect(onClick).toHaveBeenCalledTimes(1);
    rerender(<Button onClick={onClick} disabled>Go</Button>);
    await userEvent.click(screen.getByRole("button")).catch(() => {});
    expect(onClick).toHaveBeenCalledTimes(1);
  });

  it("cn-merges className (contract)", () => {
    render(<Button className="w-full">Go</Button>);
    expect(screen.getByRole("button").className).toContain("w-full");
  });
});
