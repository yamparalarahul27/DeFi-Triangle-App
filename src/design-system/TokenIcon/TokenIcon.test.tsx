import { describe, expect, it } from "vitest";
import { fireEvent, render, screen } from "@testing-library/react";
import { TokenIcon } from "./TokenIcon";

describe("TokenIcon", () => {
  it("renders an img when src is given", () => {
    render(<TokenIcon src="https://x/y.png" symbol="JUP" />);
    expect(screen.getByAltText("JUP").tagName).toBe("IMG");
  });

  it("falls back to initials when no src", () => {
    render(<TokenIcon symbol="SOL" />);
    const disc = screen.getByLabelText("SOL");
    expect(disc.tagName).toBe("DIV");
    expect(disc.textContent).toBe("SO");
  });

  it("falls back to initials when the image errors", () => {
    render(<TokenIcon src="https://x/broken.png" symbol="JUP" />);
    fireEvent.error(screen.getByAltText("JUP"));
    expect(screen.getByLabelText("JUP").textContent).toBe("JU");
  });

  it("a new src clears a previous error (no stale fallback)", () => {
    const { rerender } = render(<TokenIcon src="https://x/a.png" symbol="JUP" />);
    fireEvent.error(screen.getByAltText("JUP"));
    expect(screen.getByLabelText("JUP").textContent).toBe("JU"); // fallback
    rerender(<TokenIcon src="https://x/b.png" symbol="JUP" />);
    expect(screen.getByAltText("JUP").tagName).toBe("IMG"); // tries again
  });
});
