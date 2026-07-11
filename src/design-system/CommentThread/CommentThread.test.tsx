import { describe, expect, it, vi } from "vitest";
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { CommentThread, type Comment } from "./CommentThread";

const COMMENTS: Comment[] = [
  {
    author: { name: "Kip", handle: "kip" },
    time: "6m",
    body: "top-level",
    likes: 3,
    liked: true,
    replies: [
      { author: { name: "Mira", handle: "mira" }, time: "2m", body: "a reply", likes: 1 },
    ],
  },
  { author: { name: "Nova", handle: "nova" }, time: "1m", body: "second", likes: 0 },
];

describe("CommentThread", () => {
  it("pluralizes the title and renders rows + indented reply", () => {
    render(
      <CommentThread open onOpenChange={() => {}} comments={COMMENTS} />,
    );
    expect(screen.getByText("2 comments")).toBeTruthy();
    expect(screen.getByText("a reply")).toBeTruthy();
  });

  it("liking a reply reports (index, replyIndex)", async () => {
    const onLike = vi.fn();
    render(
      <CommentThread open onOpenChange={() => {}} comments={COMMENTS} onLike={onLike} />,
    );
    // reply's like shows count 1
    await userEvent.click(screen.getByRole("button", { name: /♥ 1/ }));
    expect(onLike).toHaveBeenCalledWith(0, 0);
  });

  it("submit trims, fires onSubmit, clears; empty input disabled", async () => {
    const onSubmit = vi.fn();
    render(
      <CommentThread open onOpenChange={() => {}} comments={COMMENTS} onSubmit={onSubmit} />,
    );
    const send = screen.getByRole("button", { name: "Send comment" });
    expect((send as HTMLButtonElement).disabled).toBe(true);
    const box = screen.getByPlaceholderText("Add a comment…");
    await userEvent.type(box, "  hello there  ");
    await userEvent.click(send);
    expect(onSubmit).toHaveBeenCalledWith("hello there");
    expect((box as HTMLTextAreaElement).value).toBe("");
  });

  it("char counter appears within 40 of the limit and never exceeds 280", async () => {
    render(<CommentThread open onOpenChange={() => {}} comments={[]} />);
    const box = screen.getByPlaceholderText("Add a comment…") as HTMLTextAreaElement;
    const long = "x".repeat(250);
    await userEvent.click(box);
    await userEvent.paste(long);
    expect(screen.getByText("30")).toBeTruthy(); // 280 - 250
    await userEvent.paste("y".repeat(100)); // would exceed → hard-capped
    expect(box.value.length).toBe(280);
  });
});
