import { describe, expect, it } from "vitest";
import { render, screen } from "@testing-library/react";
import { Progress } from "./Progress";

describe("Progress", () => {
  it("determinate: progressbar with aria-valuenow and matching width", () => {
    render(<Progress aria-label="Upload progress" value={64} />);
    const bar = screen.getByRole("progressbar", { name: "Upload progress" });
    expect(bar.getAttribute("aria-valuenow")).toBe("64");
    const indicator = bar.firstElementChild as HTMLElement;
    expect(indicator.style.width).toBe("64%");
  });

  it("clamps out-of-range values into 0–100", () => {
    render(<Progress aria-label="p" value={140} />);
    const indicator = screen.getByRole("progressbar").firstElementChild as HTMLElement;
    expect(indicator.style.width).toBe("100%");
  });

  it("indeterminate: no aria-valuenow, shimmer loop class", () => {
    render(<Progress aria-label="Syncing" />);
    const bar = screen.getByRole("progressbar", { name: "Syncing" });
    expect(bar.getAttribute("aria-valuenow")).toBeNull();
    const indicator = bar.firstElementChild as HTMLElement;
    expect(indicator.className).toContain("animate-progress-slide");
  });
});
