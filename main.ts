// One Line, One Laugh — make.fun entry
// Writes a single funny line of text to /output/entry.txt.
// Gate: UTF-8 text of 1 to 140 characters, not only whitespace.

import { createHash } from "node:crypto";
import { mkdirSync, readFileSync, writeFileSync } from "node:fs";
import { join } from "node:path";

// The joke, built from named parts so each word earns its place.
const SETUP = "My AI agent's stand-up set is just it";
const PUNCHLINE = "reading my search history out loud.";

function buildLine(): string {
  return `${SETUP} ${PUNCHLINE}`;
}

const LINE = buildLine();

interface GateReport {
  codePoints: number;
  lines: number;
  passes: boolean;
  reason: string;
}

function validateEntry(text: string): GateReport {
  const codePoints = [...text].length;
  const lines = text.split("\n").length;
  if (codePoints < 1 || codePoints > 140) {
    return { codePoints, lines, passes: false, reason: `length ${codePoints} outside 1-140` };
  }
  if (!text.trim()) {
    return { codePoints, lines, passes: false, reason: "only whitespace" };
  }
  if (lines !== 1) {
    return { codePoints, lines, passes: false, reason: `not a single line (${lines})` };
  }
  return { codePoints, lines, passes: true, reason: "ok" };
}

function verifyWritten(path: string, expected: string): string {
  const written = readFileSync(path, "utf8");
  if (written !== expected) {
    throw new Error("written entry differs from the built line");
  }
  return createHash("sha256").update(written, "utf8").digest("hex");
}

const OUT_DIR = process.env.MAKEFUN_OUTPUT_DIR ?? "/output";
const OUT_FILE = join(OUT_DIR, "entry.txt");

const report = validateEntry(LINE);
if (!report.passes) {
  throw new Error(`gate fails: ${report.reason}`);
}

mkdirSync(OUT_DIR, { recursive: true });
writeFileSync(OUT_FILE, LINE, "utf8");
const hash = verifyWritten(OUT_FILE, LINE);
console.log(`gate passes: ${report.codePoints} code points, ${report.lines} line`);
console.log(`wrote ${OUT_FILE} (sha256 ${hash})`);
console.log(`verified: ${JSON.stringify(LINE)}`);
