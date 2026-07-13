import { describe, expect, it } from "vitest";
import { render, screen, within } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { DataTable, type Column } from "./DataTable";

type Row = { sym: string; px: number };
const ROWS: Row[] = [
  { sym: "JUP", px: 0.81 },
  { sym: "SOL", px: 184.26 },
  { sym: "BONK", px: 0.00002 },
];
const COLS: Column<Row>[] = [
  { key: "sym", header: "Token", cell: (r) => r.sym, sortable: true, sortValue: (r) => r.sym },
  { key: "px", header: "Price", align: "right", sortable: true, cell: (r) => `$${r.px}`, sortValue: (r) => r.px },
];

const bodySyms = () =>
  screen
    .getAllByRole("row")
    .slice(1)
    .map((r) => within(r).getAllByRole("cell")[0].textContent);

describe("DataTable", () => {
  it("real table semantics with a hidden caption", () => {
    render(<DataTable columns={COLS} rows={ROWS} rowKey={(r) => r.sym} caption="Markets" />);
    expect(screen.getByRole("table", { name: "Markets" })).toBeTruthy();
    expect(screen.getAllByRole("columnheader").length).toBe(2);
  });

  it("sort cycles none → desc → asc → none with aria-sort", async () => {
    render(<DataTable columns={COLS} rows={ROWS} rowKey={(r) => r.sym} caption="Markets" />);
    const price = screen.getByRole("columnheader", { name: /Price/ });
    expect(price.getAttribute("aria-sort")).toBe("none");
    await userEvent.click(within(price).getByRole("button"));
    expect(price.getAttribute("aria-sort")).toBe("descending");
    expect(bodySyms()).toEqual(["SOL", "JUP", "BONK"]);
    await userEvent.click(within(price).getByRole("button"));
    expect(price.getAttribute("aria-sort")).toBe("ascending");
    expect(bodySyms()).toEqual(["BONK", "JUP", "SOL"]);
    await userEvent.click(within(price).getByRole("button"));
    expect(price.getAttribute("aria-sort")).toBe("none");
    expect(bodySyms()).toEqual(["JUP", "SOL", "BONK"]);
  });

  it("numeric columns are right-aligned tabular; rows ride density tokens", () => {
    render(<DataTable columns={COLS} rows={ROWS} rowKey={(r) => r.sym} caption="Markets" />);
    const firstDataRow = screen.getAllByRole("row")[1];
    const priceCell = within(firstDataRow).getAllByRole("cell")[1];
    expect(priceCell.className).toContain("text-right");
    expect(priceCell.className).toContain("tabular-nums");
    expect((priceCell as HTMLElement).style.height).toBe("var(--row-h)");
  });
});
