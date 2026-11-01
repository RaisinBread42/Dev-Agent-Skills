#!/usr/bin/env node
/**
 * Turn Playwright's JSON report into the markdown posted on the PR:
 * one row per click-through step (pass/fail), plus where the screenshots are.
 *
 *   node scripts/e2e-summary.mjs [e2e-results/results.json] [artifact-url]
 *
 * Plain Node, no dependencies. Exit code 0 always: the test step owns pass/fail.
 */
import { readFileSync, existsSync } from "node:fs";

const file = process.argv[2] ?? "e2e-results/results.json";
const artifactUrl = process.argv[3] ?? "";

if (!existsSync(file)) {
  console.log("## Browser click-through\n\n⚠️ No results file: the tests did not run. See the job log.");
  process.exit(0);
}

const report = JSON.parse(readFileSync(file, "utf8"));
const rows = [];
function walk(suite, trail) {
  const here = suite.title && !suite.title.endsWith(".ts") ? [...trail, suite.title] : trail;
  for (const spec of suite.specs ?? []) {
    const results = spec.tests.flatMap((t) => t.results);
    const last = results.at(-1);
    const status = last?.status ?? "skipped";
    const icon = status === "passed" ? "✅" : status === "skipped" ? "⏭️" : "❌";
    const error = last?.error?.message?.split("\n")[0]?.replace(/\|/g, "\\|").slice(0, 160) ?? "";
    rows.push(`| ${icon} | \`${spec.file}\` | ${[...here, spec.title].join(" › ")} | ${error} |`);
  }
  for (const child of suite.suites ?? []) walk(child, here);
}
for (const suite of report.suites ?? []) walk(suite, []);

const failed = rows.filter((r) => r.startsWith("| ❌")).length;
const out = [
  "## Browser click-through",
  "",
  failed === 0
    ? `✅ **${rows.length} step(s) passed** in a real browser against a fresh database.`
    : `❌ **${failed} of ${rows.length} step(s) failed.**`,
  "",
  "| | Spec | Step | Error |",
  "| --- | --- | --- | --- |",
  ...rows,
  "",
  artifactUrl
    ? `Screenshots of every step (and traces for failures): [download the \`e2e-click-through\` artifact](${artifactUrl}).`
    : "Screenshots of every step are in the run's `e2e-click-through` artifact.",
];
console.log(out.join("\n"));
