import { describe, expect, it } from "vitest";
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { Accordion } from "./Accordion";

const ITEMS = [
  { value: "fees", title: "Fees", content: <p>fee detail</p> },
  { value: "route", title: "Route", content: <p>route detail</p> },
];

describe("Accordion", () => {
  it("starts closed and opens on trigger click (aria-expanded wired)", async () => {
    render(<Accordion items={ITEMS} />);
    const trigger = screen.getByRole("button", { name: "Fees" });
    expect(trigger.getAttribute("aria-expanded")).toBe("false");
    await userEvent.click(trigger);
    expect(trigger.getAttribute("aria-expanded")).toBe("true");
    expect(screen.getByText("fee detail")).toBeTruthy();
  });

  it("single (default): opening one closes the other, and it can fully close", async () => {
    render(<Accordion items={ITEMS} />);
    const fees = screen.getByRole("button", { name: "Fees" });
    const route = screen.getByRole("button", { name: "Route" });
    await userEvent.click(fees);
    await userEvent.click(route);
    expect(fees.getAttribute("aria-expanded")).toBe("false");
    expect(route.getAttribute("aria-expanded")).toBe("true");
    await userEvent.click(route); // collapsible — all closed is legal
    expect(route.getAttribute("aria-expanded")).toBe("false");
  });

  it("multiple: panels stay open independently", async () => {
    render(<Accordion type="multiple" items={ITEMS} />);
    await userEvent.click(screen.getByRole("button", { name: "Fees" }));
    await userEvent.click(screen.getByRole("button", { name: "Route" }));
    expect(screen.getByText("fee detail")).toBeTruthy();
    expect(screen.getByText("route detail")).toBeTruthy();
  });

  it("arrow keys move between triggers (Radix keyboard contract)", async () => {
    render(<Accordion items={ITEMS} />);
    screen.getByRole("button", { name: "Fees" }).focus();
    await userEvent.keyboard("{ArrowDown}");
    expect(document.activeElement).toBe(screen.getByRole("button", { name: "Route" }));
  });
});
