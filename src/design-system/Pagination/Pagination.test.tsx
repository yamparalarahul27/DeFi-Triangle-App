import { describe, expect, it, vi } from "vitest";
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { Pagination } from "./Pagination";

describe("Pagination", () => {
  it("windows pages with ellipses; current carries aria-current", () => {
    render(<Pagination page={7} count={24} onPageChange={() => {}} />);
    const labels = screen
      .getAllByRole("button")
      .map((b) => b.getAttribute("aria-label") ?? b.textContent);
    expect(labels).toEqual(["Previous page", "1", "6", "7", "8", "24", "Next page"]);
    expect(screen.getByRole("button", { name: "7" }).getAttribute("aria-current")).toBe("page");
  });

  it("prev disabled on first page, next disabled on last", () => {
    const { rerender } = render(<Pagination page={1} count={5} onPageChange={() => {}} />);
    expect((screen.getByRole("button", { name: "Previous page" }) as HTMLButtonElement).disabled).toBe(true);
    rerender(<Pagination page={5} count={5} onPageChange={() => {}} />);
    expect((screen.getByRole("button", { name: "Next page" }) as HTMLButtonElement).disabled).toBe(true);
  });

  it("clicks fire onPageChange with the target page", async () => {
    const onChange = vi.fn();
    render(<Pagination page={7} count={24} onPageChange={onChange} />);
    await userEvent.click(screen.getByRole("button", { name: "8" }));
    expect(onChange).toHaveBeenCalledWith(8);
    await userEvent.click(screen.getByRole("button", { name: "Previous page" }));
    expect(onChange).toHaveBeenCalledWith(6);
  });

  it("small counts render all pages, no ellipses", () => {
    render(<Pagination page={2} count={3} onPageChange={() => {}} />);
    const nums = screen.getAllByRole("button").map((b) => b.textContent);
    expect(nums.join("")).toContain("123");
    expect(screen.queryByText("…")).toBeNull();
  });
});
