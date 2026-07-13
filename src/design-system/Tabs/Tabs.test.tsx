import { describe, expect, it, vi } from "vitest";
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { Tabs } from "./Tabs";

const TABS = [
  { value: "news", label: "News", content: <p>news panel</p> },
  { value: "kpis", label: "KPIs", content: <p>kpi panel</p> },
];

describe("Tabs", () => {
  it("wires tablist/tab/tabpanel and shows the active panel", () => {
    render(<Tabs tabs={TABS} value="news" onValueChange={() => {}} />);
    expect(screen.getByRole("tablist")).toBeTruthy();
    expect(screen.getByRole("tab", { name: "News" }).getAttribute("aria-selected")).toBe("true");
    expect(screen.getByRole("tabpanel").textContent).toContain("news panel");
  });

  it("clicking a tab fires onValueChange", async () => {
    const onChange = vi.fn();
    render(<Tabs tabs={TABS} value="news" onValueChange={onChange} />);
    await userEvent.click(screen.getByRole("tab", { name: "KPIs" }));
    expect(onChange).toHaveBeenCalledWith("kpis");
  });

  it("arrow keys move selection (Radix roving tabindex)", async () => {
    const onChange = vi.fn();
    render(<Tabs tabs={TABS} value="news" onValueChange={onChange} />);
    screen.getByRole("tab", { name: "News" }).focus();
    await userEvent.keyboard("{ArrowRight}");
    expect(onChange).toHaveBeenCalledWith("kpis");
  });
});
