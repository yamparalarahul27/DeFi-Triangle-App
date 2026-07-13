import { describe, expect, it } from "vitest";
import { render, screen } from "@testing-library/react";
import { EmptyState } from "./EmptyState";
import { Button } from "../Button";

describe("EmptyState", () => {
  it("renders title + hint as real text, glyph hidden", () => {
    const { container } = render(
      <EmptyState title="No watchers yet" hint="Quiet tide." />,
    );
    expect(screen.getByText("No watchers yet")).toBeTruthy();
    expect(screen.getByText("Quiet tide.")).toBeTruthy();
    expect(container.querySelector('[aria-hidden="true"]')).toBeTruthy();
  });

  it("renders the action slot", () => {
    render(<EmptyState title="Empty" action={<Button>Watch</Button>} />);
    expect(screen.getByRole("button", { name: "Watch" })).toBeTruthy();
  });
});
