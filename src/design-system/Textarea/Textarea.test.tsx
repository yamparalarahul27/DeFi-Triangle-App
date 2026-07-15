import { describe, expect, it } from "vitest";
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { Textarea } from "./Textarea";

describe("Textarea", () => {
  it("is a real textarea, defaults to 3 rows, vertical resize only", () => {
    render(<Textarea aria-label="Note" />);
    const el = screen.getByRole("textbox", { name: "Note" }) as HTMLTextAreaElement;
    expect(el.tagName).toBe("TEXTAREA");
    expect(el.rows).toBe(3);
    expect(el.className).toContain("resize-y");
  });

  it("accepts typed input", async () => {
    render(<Textarea aria-label="Note" defaultValue="" />);
    const el = screen.getByRole("textbox", { name: "Note" }) as HTMLTextAreaElement;
    await userEvent.type(el, "gm");
    expect(el.value).toBe("gm");
  });

  it("invalid sets aria-invalid + sell border (Input's grammar)", () => {
    render(<Textarea aria-label="Note" invalid />);
    const el = screen.getByRole("textbox", { name: "Note" });
    expect(el.getAttribute("aria-invalid")).toBe("true");
    expect(el.className).toContain("border-sell");
  });
});
