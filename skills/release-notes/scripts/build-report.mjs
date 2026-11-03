#!/usr/bin/env node
// Build one self-contained HTML walkthrough from release-notes/<date>/report.json.
// Screenshots are embedded, so the single .html file can be opened, emailed or published as-is.
// Usage: node build-report.mjs release-notes/<date>/report.json [out.html]
// Format: see ../reference/stakeholder-report.md

import { readFileSync, writeFileSync, existsSync } from "node:fs";
import { dirname, resolve, extname, join } from "node:path";

const [jsonPath, outArg] = process.argv.slice(2);
if (!jsonPath) {
  console.error("usage: node build-report.mjs <report.json> [out.html]");
  process.exit(1);
}

const baseDir = dirname(resolve(jsonPath));
const report = JSON.parse(readFileSync(jsonPath, "utf8"));
const outPath = outArg || join(baseDir, "release-notes.html");
const problems = [];

const esc = (s = "") =>
  String(s).replace(/[&<>"']/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" })[c]);

const MIME = { ".png": "image/png", ".jpg": "image/jpeg", ".jpeg": "image/jpeg", ".webp": "image/webp", ".gif": "image/gif", ".svg": "image/svg+xml" };

function image(file, alt) {
  const path = resolve(baseDir, file);
  if (!existsSync(path)) {
    problems.push(`missing screenshot: ${file}`);
    return `<div class="missing">Screenshot missing: ${esc(file)}</div>`;
  }
  const mime = MIME[extname(path).toLowerCase()];
  if (!mime) {
    problems.push(`unsupported image type: ${file}`);
    return "";
  }
  const data = readFileSync(path).toString("base64");
  return `<img src="data:${mime};base64,${data}" alt="${esc(alt)}" loading="lazy">`;
}

function step(s, i) {
  if (!s.action) problems.push(`a step has no "action"`);
  if (!s.screenshot) problems.push(`step "${s.action}" has no screenshot`);
  return `
    <li class="step">
      <div class="num">${i + 1}</div>
      <div class="body">
        <p class="action">${esc(s.action)}</p>
        ${s.result ? `<p class="result">${esc(s.result)}</p>` : ""}
        ${s.screenshot ? `<figure><button class="zoom" aria-label="Enlarge screenshot">${image(s.screenshot, s.caption || s.action)}</button>
          ${s.caption ? `<figcaption>${esc(s.caption)}</figcaption>` : ""}</figure>` : ""}
      </div>
    </li>`;
}

function change(c, i) {
  if (!c.steps?.length) problems.push(`change "${c.title}" has no steps`);
  return `
  <section class="change" id="change-${i + 1}">
    <h2>${esc(c.title)}</h2>
    <dl class="meta">
      ${c.who ? `<div><dt>Who it affects</dt><dd>${esc(c.who)}</dd></div>` : ""}
      ${c.what ? `<div><dt>What changed</dt><dd>${esc(c.what)}</dd></div>` : ""}
    </dl>
    <h3>Walkthrough</h3>
    <ol class="steps">${(c.steps || []).map(step).join("")}</ol>
  </section>`;
}

const changes = report.changes || [];
const fixed = report.fixed || [];

// Project branding (optional): logo, colours and font found in the project's guidelines or code.
const brand = report.brand || {};
const colors = brand.colors || {};
const cssValue = (v) => String(v).replace(/[;{}<>]/g, "");
const brandVars = Object.entries({ accent: colors.accent, bg: colors.background, text: colors.text })
  .filter(([, v]) => v)
  .map(([k, v]) => `--${k}:${cssValue(v)};`)
  .join(" ");
// A brand background means the brand chose its own light look: don't override it in dark mode.
const darkMode = colors.background ? "" : `@media (prefers-color-scheme: dark) {
    :root { --bg:#161615; --card:#1f1f1e; --text:#ececea; --muted:#a3a39e; --line:#33332f; --accent:${cssValue(colors.accentDark || colors.accent || "#7f9ff0")}; }
  }`;
const font = brand.font ? `${cssValue(brand.font)}, ` : "";
const logo = brand.logo ? image(brand.logo, `${brand.name || "Logo"}`).replace("<img", '<img class="logo"') : "";

const html = `<!doctype html>
<html lang="en">
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width, initial-scale=1">
<title>${esc(report.title || "Release notes")}</title>
<style>
  :root { --bg:#f7f7f5; --card:#fff; --text:#1d1d1b; --muted:#5f5f5a; --line:#e3e3df; --accent:#2f5bd3; ${brandVars} }
  ${darkMode}
  * { box-sizing: border-box; }
  body { margin:0; background:var(--bg); color:var(--text); font:16px/1.6 ${font}system-ui, -apple-system, "Segoe UI", sans-serif; }
  .logo { display:block; max-height: 48px; max-width: 220px; margin-bottom: 24px; }
  main { max-width: 860px; margin: 0 auto; padding: 40px 16px 80px; }
  header h1 { font-size: 2rem; line-height:1.2; margin: 0 0 4px; }
  .date { color: var(--muted); margin: 0 0 16px; }
  .summary { font-size: 1.1rem; }
  nav { background: var(--card); border:1px solid var(--line); border-radius: 10px; padding: 12px 20px; margin: 24px 0 40px; }
  nav p { margin: 0 0 4px; font-weight: 600; }
  nav ol { margin: 0; padding-left: 20px; }
  a { color: var(--accent); }
  .change { margin-bottom: 56px; }
  h2 { font-size: 1.5rem; border-top: 1px solid var(--line); padding-top: 32px; margin: 0 0 12px; }
  h3 { font-size: 1rem; text-transform: uppercase; letter-spacing: .05em; color: var(--muted); margin: 24px 0 12px; }
  .meta div { margin-bottom: 8px; }
  .meta dt { font-weight: 600; display: inline; }
  .meta dt::after { content: ": "; }
  .meta dd { display: inline; margin: 0; }
  .steps { list-style: none; padding: 0; margin: 0; }
  .step { display: flex; gap: 16px; padding-bottom: 28px; position: relative; }
  .step:not(:last-child)::before { content:""; position:absolute; left:15px; top:36px; bottom:4px; width:2px; background:var(--line); }
  .num { flex: 0 0 32px; height: 32px; border-radius: 50%; background: var(--accent); color: #fff; font-weight: 700; display: grid; place-items: center; }
  .body { flex: 1; min-width: 0; }
  .action { margin: 4px 0 4px; font-weight: 600; }
  .result { margin: 0 0 12px; color: var(--muted); }
  figure { margin: 8px 0 0; }
  .zoom { all: unset; cursor: zoom-in; display: block; }
  figure img { display: block; width: 100%; border: 1px solid var(--line); border-radius: 8px; background: var(--card); }
  figcaption { font-size: .9rem; color: var(--muted); margin-top: 6px; }
  .missing { padding: 24px; border: 2px dashed #c0392b; border-radius: 8px; color: #c0392b; }
  .fixed li { margin-bottom: 6px; }
  dialog { border: 0; padding: 0; background: transparent; max-width: 96vw; max-height: 96vh; }
  dialog::backdrop { background: rgba(0,0,0,.8); }
  dialog img { max-width: 96vw; max-height: 96vh; display: block; cursor: zoom-out; border-radius: 6px; }
</style>
</head>
<body>
<main>
  <header>
    ${logo}
    <h1>${esc(report.title || "Release notes")}</h1>
    ${report.date ? `<p class="date">${esc(report.date)}</p>` : ""}
    ${report.summary ? `<p class="summary">${esc(report.summary)}</p>` : ""}
  </header>
  ${changes.length > 1 ? `<nav><p>In this release</p><ol>${changes.map((c, i) => `<li><a href="#change-${i + 1}">${esc(c.title)}</a></li>`).join("")}</ol></nav>` : ""}
  ${changes.map(change).join("")}
  ${fixed.length ? `<section><h2>Fixed</h2><ul class="fixed">${fixed.map((f) => `<li>${esc(f)}</li>`).join("")}</ul></section>` : ""}
  ${report.actionNeeded ? `<section><h2>Anything you need to do</h2><p>${esc(report.actionNeeded)}</p></section>` : ""}
</main>
<dialog id="viewer"><img alt=""></dialog>
<script>
  const viewer = document.getElementById("viewer");
  document.querySelectorAll(".zoom").forEach((b) => b.addEventListener("click", () => {
    const img = b.querySelector("img");
    viewer.querySelector("img").src = img.src;
    viewer.querySelector("img").alt = img.alt;
    viewer.showModal();
  }));
  viewer.addEventListener("click", () => viewer.close());
</script>
</body>
</html>
`;

writeFileSync(outPath, html);
const mb = (Buffer.byteLength(html) / 1048576).toFixed(1);
console.log(`release-notes: wrote ${outPath} (${mb} MB, ${changes.length} changes)`);
if (problems.length) {
  console.error("release-notes: fix these and rebuild:\n- " + problems.join("\n- "));
  process.exit(1);
}
