import { describe, expect, it } from "vitest";
import { render, screen } from "@testing-library/react";
import { RollingNumber } from "./RollingNumber";

describe("RollingNumber", () => {
  it("announces the whole figure once; chars are hidden", () => {
    render(<RollingNumber value="$184.26" />);
    const el = screen.getByLabelText("$184.26");
    expect(el.querySelectorAll('[aria-hidden="true"]').length).toBe(7);
  });

  it("only changed slots re-mount (key = slot+char)", () => {
    const { rerender, container } = render(<RollingNumber value="$184.26" />);
    const before = [...container.querySelectorAll("span[aria-hidden]")];
    rerender(<RollingNumber value="$184.27" />);
    const after = [...container.querySelectorAll("span[aria-hidden]")];
    // all slots except the last keep their identity
    for (let i = 0; i < before.length - 1; i++) expect(after[i]).toBe(before[i]);
    expect(after[after.length - 1]).not.toBe(before[before.length - 1]);
    expect(after[after.length - 1].className).toContain("animate-roll-in");
  });
});
