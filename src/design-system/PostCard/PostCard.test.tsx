import { describe, expect, it } from "vitest";
import { render, screen } from "@testing-library/react";
import { PostCard } from "./PostCard";

const AUTHOR = { name: "Mira", handle: "mira" };

describe("PostCard", () => {
  it("take: renders author row, badge, body", () => {
    render(<PostCard kind="take" author={AUTHOR} time="4m" body="hello" />);
    expect(screen.getByText("@mira")).toBeTruthy();
    expect(screen.getByText("take")).toBeTruthy();
    expect(screen.getByText("hello")).toBeTruthy();
  });

  it("token block renders only when token given", () => {
    const { rerender } = render(
      <PostCard kind="take" author={AUTHOR} time="4m" body="b" />,
    );
    expect(screen.queryByText("JUP")).toBeNull();
    rerender(
      <PostCard
        kind="take"
        author={AUTHOR}
        time="4m"
        body="b"
        token={{ symbol: "JUP", price: "$0.81", change24h: 4.2 }}
      />,
    );
    expect(screen.getByText("JUP")).toBeTruthy();
  });

  it("milestone up: no author, ▲ glyph, buy left border", () => {
    const { container } = render(
      <PostCard kind="milestone" direction="up" time="1h" body="BONK ran" />,
    );
    expect(screen.queryByText(/@/)).toBeNull();
    expect(screen.getByText("▲")).toBeTruthy();
    expect((container.firstChild as HTMLElement).className).toContain("border-l-buy");
  });

  it("milestone down: ▼ glyph, sell left border", () => {
    const { container } = render(
      <PostCard kind="milestone" direction="down" time="1h" body="broke floor" />,
    );
    expect(screen.getByText("▼")).toBeTruthy();
    expect((container.firstChild as HTMLElement).className).toContain("border-l-sell");
  });

  it("reactions render only when both reactions and onReact given", () => {
    render(
      <PostCard
        kind="take"
        author={AUTHOR}
        time="1m"
        body="b"
        reactions={[{ emoji: "♥", count: 3 }]}
        onReact={() => {}}
      />,
    );
    expect(screen.getByText("3")).toBeTruthy();
  });
});
