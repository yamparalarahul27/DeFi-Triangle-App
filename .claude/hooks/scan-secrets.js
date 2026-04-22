#!/usr/bin/env node
// PreToolUse hook: block Write/Edit operations that would leak a secret value from .env.local
// into a source file. Reads .env.local at hook time, scans the tool input for any literal match.
// NEXT_PUBLIC_* values are skipped (public by design). Values under 20 chars are skipped (too
// short to be meaningful). Writes/Edits targeting .env* files are skipped (allowed, gitignored).

const fs = require("node:fs");
const path = require("node:path");

function read(stream) {
  return new Promise((resolve, reject) => {
    let buf = "";
    stream.on("data", (chunk) => (buf += chunk));
    stream.on("end", () => resolve(buf));
    stream.on("error", reject);
  });
}

function loadSecrets(projectDir) {
  const envPath = path.join(projectDir, ".env.local");
  if (!fs.existsSync(envPath)) return [];
  const content = fs.readFileSync(envPath, "utf8");
  const secrets = [];
  for (const line of content.split(/\r?\n/)) {
    const trimmed = line.trim();
    if (!trimmed || trimmed.startsWith("#")) continue;
    const eq = trimmed.indexOf("=");
    if (eq === -1) continue;
    const key = trimmed.slice(0, eq).trim();
    let value = trimmed.slice(eq + 1).trim();
    if ((value.startsWith('"') && value.endsWith('"')) || (value.startsWith("'") && value.endsWith("'"))) {
      value = value.slice(1, -1);
    }
    if (key.startsWith("NEXT_PUBLIC_")) continue;
    if (value.length < 20) continue;
    secrets.push({ key, value });
  }
  return secrets;
}

function isEnvFile(filePath) {
  if (!filePath) return false;
  const base = path.basename(filePath);
  return base === ".env" || base.startsWith(".env.");
}

(async function main() {
  try {
    const raw = await read(process.stdin);
    const payload = raw ? JSON.parse(raw) : {};
    const toolName = payload.tool_name || "";
    const toolInput = payload.tool_input || {};
    const projectDir = process.env.CLAUDE_PROJECT_DIR || process.cwd();

    const filePath = toolInput.file_path || "";
    if (isEnvFile(filePath)) process.exit(0);

    let content = "";
    if (toolName === "Write") {
      content = toolInput.content || "";
    } else if (toolName === "Edit") {
      content = toolInput.new_string || "";
    } else {
      process.exit(0);
    }

    if (!content) process.exit(0);

    const secrets = loadSecrets(projectDir);
    if (secrets.length === 0) process.exit(0);

    for (const { key, value } of secrets) {
      if (content.includes(value)) {
        process.stderr.write(
          `BLOCKED by .claude/hooks/scan-secrets.js\n` +
            `Refusing to write secret value of ${key} into ${filePath || "<no path>"}.\n` +
            `Secrets from .env.local must never appear in source files.\n` +
            `If this is a false positive, rotate the credential and update .env.local.\n`
        );
        process.exit(2);
      }
    }

    process.exit(0);
  } catch (err) {
    process.stderr.write(`scan-secrets hook error: ${err && err.message ? err.message : String(err)}\n`);
    process.exit(0);
  }
})();
