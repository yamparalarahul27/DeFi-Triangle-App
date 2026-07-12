import { describe, expect, it, vi } from "vitest";
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { Lane } from "./Lane";

const OPTIONS = [
  { value: "following", label: "Following" },
  { value: "everyone", label: "Everyone" },
];

describe("Lane", () => {
  it("renders a tablist with aria-selected on the active segment", () => {
    render(<Lane options={OPTIONS} value="following" onChange={() => {}} />);
    expect(screen.getByRole("tablist")).toBeTruthy();
    expect(
      screen.getByRole("tab", { name: "Following" }).getAttribute("aria-selected"),
    ).toBe("true");
    expect(
      screen.getByRole("tab", { name: "Everyone" }).getAttribute("aria-selected"),
    ).toBe("false");
  });

  it("active segment gets the brand fill", () => {
    render(<Lane options={OPTIONS} value="everyone" onChange={() => {}} />);
    expect(screen.getByRole("tab", { name: "Everyone" }).className).toContain(
      "bg-brand",
    );
  });

  it("fires onChange with the tapped value", async () => {
    const onChange = vi.fn();
    render(<Lane options={OPTIONS} value="following" onChange={onChange} />);
    await userEvent.click(screen.getByRole("tab", { name: "Everyone" }));
    expect(onChange).toHaveBeenCalledWith("everyone");
  });
});
