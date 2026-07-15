import { describe, expect, it } from "vitest";
import { render, screen } from "@testing-library/react";
import { Breadcrumbs } from "./Breadcrumbs";

const ITEMS = [
  { label: "Design", href: "/gallery" },
  { label: "Components", href: "/gallery#components" },
  { label: "Accordion" },
];

describe("Breadcrumbs", () => {
  it("is a labelled nav with an ordered list", () => {
    render(<Breadcrumbs items={ITEMS} />);
    const nav = screen.getByRole("navigation", { name: "Breadcrumb" });
    expect(nav.querySelector("ol")).toBeTruthy();
    expect(screen.getAllByRole("listitem")).toHaveLength(3);
  });

  it("ancestors are links; the last item is current-page text", () => {
    render(<Breadcrumbs items={ITEMS} />);
    expect(screen.getByRole("link", { name: "Design" }).getAttribute("href")).toBe("/gallery");
    const current = screen.getByText("Accordion");
    expect(current.tagName).toBe("SPAN");
    expect(current.getAttribute("aria-current")).toBe("page");
  });

  it("separators are aria-hidden", () => {
    const { container } = render(<Breadcrumbs items={ITEMS} />);
    const seps = container.querySelectorAll('[aria-hidden="true"]');
    expect(seps).toHaveLength(2); // n-1 separators
  });
});
