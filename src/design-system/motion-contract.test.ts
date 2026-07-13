// Motion / reduced-motion contract (cids-roadmap Phase 2): jsdom can't
// execute CSS, so the *contract* is asserted at the source level — the
// tokens exist and the global prefers-reduced-motion reset that every
// component's motion relies on is present in globals.css.
import { readFileSync } from "node:fs";
import { join } from "node:path";
import { describe, expect, it } from "vitest";

const globals = readFileSync(
  join(__dirname, "../app/globals.css"),
  "utf8",
);

describe("motion contract (globals.css)", () => {
  it("defines the duration/easing/composite motion tokens", () => {
    for (const token of [
      "--duration-fast",
      "--duration-settle",
      "--duration-spring",
      "--ease-settle",
      "--ease-spring",
      "--motion-fast",
      "--motion-settle",
      "--motion-spring",
    ]) {
      expect(globals).toContain(token);
    }
  });

  it("has the global prefers-reduced-motion reset every component relies on", () => {
    expect(globals).toMatch(/@media \(prefers-reduced-motion: reduce\)/);
    expect(globals).toMatch(/animation-duration:\s*0\.01ms\s*!important/);
    expect(globals).toMatch(/transition-duration:\s*0\.01ms\s*!important/);
  });
});
