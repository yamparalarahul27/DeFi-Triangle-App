#!/usr/bin/env node
// CIDS MCP server (Phase 7 — agent adoption; shadcn CLI 3.0 precedent).
// Zero dependencies: MCP is JSON-RPC 2.0 over stdio. Exposes the
// generated registry (public/r) so coding agents can discover and
// fetch CIDS components — docs travel with the code, so an agent gets
// the spec and the source in one call.
//
// Wire into a client:
//   { "mcpServers": { "cids": { "command": "node",
//       "args": ["scripts/cids-mcp.mjs"], "cwd": "<repo>" } } }

import { readFileSync } from "node:fs";
import { join } from "node:path";
import { fileURLToPath } from "node:url";
import { createInterface } from "node:readline";

const ROOT = fileURLToPath(new URL("..", import.meta.url));
const R = join(ROOT, "public/r");

const index = JSON.parse(readFileSync(join(R, "registry.json"), "utf8"));

const TOOLS = [
  {
    name: "list_components",
    description:
      "List every CIDS registry item (37 components + tokens + identity) with name, version, status, and description.",
    inputSchema: { type: "object", properties: {}, additionalProperties: false },
  },
  {
    name: "get_component",
    description:
      "Fetch a CIDS registry item by name (e.g. 'button', 'data-table', 'tokens'): full source files, the .doc.md spec, dependencies, and registryDependencies.",
    inputSchema: {
      type: "object",
      properties: { name: { type: "string", description: "kebab-case item name from list_components" } },
      required: ["name"],
      additionalProperties: false,
    },
  },
  {
    name: "get_quickstart",
    description: "The CIDS adopter quickstart (docs/cids-quickstart.md) — install path, theming, guarantees.",
    inputSchema: { type: "object", properties: {}, additionalProperties: false },
  },
];

function callTool(name, args) {
  if (name === "list_components") {
    return index.items
      .map((i) => `${i.name} — ${i.description}`)
      .join("\n");
  }
  if (name === "get_component") {
    const item = JSON.parse(readFileSync(join(R, `${args.name}.json`), "utf8"));
    return JSON.stringify(item, null, 2);
  }
  if (name === "get_quickstart") {
    return readFileSync(join(ROOT, "docs/cids-quickstart.md"), "utf8");
  }
  throw new Error(`unknown tool: ${name}`);
}

const reply = (id, result) =>
  process.stdout.write(JSON.stringify({ jsonrpc: "2.0", id, result }) + "\n");
const replyError = (id, message) =>
  process.stdout.write(
    JSON.stringify({ jsonrpc: "2.0", id, error: { code: -32000, message } }) + "\n",
  );

createInterface({ input: process.stdin }).on("line", (line) => {
  let msg;
  try {
    msg = JSON.parse(line);
  } catch {
    return;
  }
  const { id, method, params } = msg;
  if (method === "initialize") {
    reply(id, {
      protocolVersion: params?.protocolVersion ?? "2025-06-18",
      capabilities: { tools: {} },
      serverInfo: { name: "cids", version: "1.0.0" },
    });
  } else if (method === "tools/list") {
    reply(id, { tools: TOOLS });
  } else if (method === "tools/call") {
    try {
      const text = callTool(params.name, params.arguments ?? {});
      reply(id, { content: [{ type: "text", text }] });
    } catch (e) {
      replyError(id, String(e.message ?? e));
    }
  } else if (id !== undefined) {
    // Unknown request — answer politely so clients don't hang.
    replyError(id, `method not supported: ${method}`);
  }
  // notifications (no id) are ignored by design
});
