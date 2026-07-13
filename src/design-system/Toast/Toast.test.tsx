import { describe, expect, it } from "vitest";
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { ToastProvider, useToast } from "./Toast";

function Trigger() {
  const toast = useToast();
  return (
    <button
      type="button"
      onClick={() => toast({ title: "Watchlist updated", description: "JUP added", tone: "buy" })}
    >
      fire
    </button>
  );
}

describe("Toast", () => {
  it("useToast pushes a toast with title + description", async () => {
    render(
      <ToastProvider>
        <Trigger />
      </ToastProvider>,
    );
    await userEvent.click(screen.getByRole("button", { name: "fire" }));
    expect(await screen.findByText("Watchlist updated")).toBeTruthy();
    expect(screen.getByText("JUP added")).toBeTruthy();
  });

  it("the × dismisses the toast", async () => {
    render(
      <ToastProvider>
        <Trigger />
      </ToastProvider>,
    );
    await userEvent.click(screen.getByRole("button", { name: "fire" }));
    await screen.findByText("Watchlist updated");
    await userEvent.click(screen.getByRole("button", { name: "Dismiss" }));
    expect(screen.queryByText("Watchlist updated")).toBeNull();
  });

  it("useToast outside the provider throws (guard rail)", () => {
    const Naked = () => {
      useToast();
      return null;
    };
    expect(() => render(<Naked />)).toThrow(/within <ToastProvider>/);
  });
});
