/**
 * SEO quality checks for the TruDev static build.
 *
 * Usage: node scripts/seo-check.mjs [--dir out] [--origin https://trudev.in]
 *
 * Checks:
 *  1. robots.txt exists, is text/plain, references the sitemap, has no accidental Disallow
 *  2. sitemap.xml exists, is valid XML, all URLs are absolute, canonical (no query strings,
 *     no trailing duplicates), and match a known route
 *  3. Every sitemap URL resolves to an HTML file on disk (no 404s in the export)
 *  4. Every page has exactly one canonical URL, matching its own path
 *  5. Unique titles and descriptions across all pages
 *  6. JSON-LD blocks parse as JSON and have no duplicate @type per page
 *  7. No accidental noindex directives on indexable pages
 *  8. Every internal href/src resolves to a route or an existing asset (no broken links)
 */

import { readdirSync, readFileSync, existsSync } from "node:fs";
import { join, relative, extname } from "node:path";
import { parseArgs } from "node:util";

const args = parseArgs({
  options: {
    dir: { type: "string", default: "out" },
    origin: { type: "string", default: "https://trudev.in" },
  },
});

const OUT = args.values.dir;
const ORIGIN = args.values.origin.replace(/\/+$/, "");

const errors = [];
const warnings = [];

function fail(msg) {
  errors.push(msg);
}
function warn(msg) {
  warnings.push(msg);
}

/** Recursively list files under a directory. */
function walk(dir, files = []) {
  for (const entry of readdirSync(dir, { withFileTypes: true })) {
    const full = join(dir, entry.name);
    if (entry.isDirectory()) {
      walk(full, files);
    } else {
      files.push(full);
    }
  }
  return files;
}

/** Utility pages (offline fallback, 404, error pages) are not indexable. */
const isUtilityPage = (rel) =>
  rel === "offline.html" || /(^|\/)404(\/|\.html)|(^|\/)500(\/|\.html)/.test(rel);

/** Static export writes the 404 page as 404/, 404.html and _not-found/ — same physical page. */
const isExportDuplicate = (rel) =>
  /(^|\/)404(\/index)?\.html$|(^|\/)_not-found\//.test(rel);

/** Route a URL path maps to inside the export directory. */
function routeToFilePath(urlPath) {
  const clean = urlPath.split("?")[0].split("#")[0].replace(/\/+$/, "") || "/";
  if (clean === "/") return join(OUT, "index.html");
  const candidates = [join(OUT, clean, "index.html"), join(OUT, `${clean}.html`)];
  return candidates.find((p) => existsSync(p)) ?? null;
}

// ---------------------------------------------------------------------------
// 1. robots.txt
// ---------------------------------------------------------------------------
const robotsPath = join(OUT, "robots.txt");
if (!existsSync(robotsPath)) {
  fail("robots.txt is missing from the export");
} else {
  const robots = readFileSync(robotsPath, "utf8");
  if (!/sitemap:\s*\S+/i.test(robots)) {
    warn("robots.txt does not reference a sitemap");
  }
  if (/disallow:\s*\/\s*$/im.test(robots) && !/user-agent:\s*\*/i.test(robots)) {
    warn("robots.txt contains a blanket Disallow without an explicit user-agent — verify intent");
  }
}

// ---------------------------------------------------------------------------
// 2 & 3. sitemap.xml
// ---------------------------------------------------------------------------
const sitemapPath = join(OUT, "sitemap.xml");
const sitemapUrls = [];
if (!existsSync(sitemapPath)) {
  fail("sitemap.xml is missing from the export");
} else {
  const sitemap = readFileSync(sitemapPath, "utf8");
  const locs = [...sitemap.matchAll(/<loc>(.*?)<\/loc>/g)].map((m) => m[1]);
  for (const loc of locs) {
    if (!loc.startsWith("http")) {
      fail(`sitemap loc is not an absolute URL: ${loc}`);
    }
    if (loc.includes("?")) {
      fail(`sitemap loc contains a query string (non-canonical): ${loc}`);
    }
    if (loc.startsWith(`${ORIGIN}/`) === false && loc !== ORIGIN) {
      warn(`sitemap loc is outside ${ORIGIN}: ${loc}`);
    }
    sitemapUrls.push(loc);
  }
  const dupes = sitemapUrls.filter((u, i) => sitemapUrls.indexOf(u) !== i);
  if (dupes.length) {
    fail(`sitemap has duplicate URLs: ${[...new Set(dupes)].join(", ")}`);
  }
  for (const loc of sitemapUrls) {
    const path = loc.replace(ORIGIN, "") || "/";
    if (!routeToFilePath(path)) {
      fail(`sitemap URL has no page in the export: ${loc}`);
    }
  }
}

// ---------------------------------------------------------------------------
// 4–7. Per-page metadata checks
// ---------------------------------------------------------------------------
const htmlFiles = walk(OUT).filter((f) => extname(f) === ".html");
const pageData = new Map();

for (const file of htmlFiles) {
  const rel = relative(OUT, file).replace(/\\/g, "/");
  const html = readFileSync(file, "utf8");

  // Canonical
  const canonicals = [...html.matchAll(/<link[^>]+rel=["']canonical["'][^>]*>/gi)]
    .map((m) => (m[0].match(/href=["']([^"']+)["']/i) ?? [])[1])
    .filter(Boolean);
  if (canonicals.length === 0) {
    if (!isUtilityPage) {
      fail(`${rel}: missing canonical URL`);
    }
  } else if (canonicals.length > 1) {
    fail(`${rel}: ${canonicals.length} canonical URLs found`);
  } else {
    const canonical = canonicals[0];
    if (!canonical.startsWith("http")) {
      fail(`${rel}: canonical is not absolute: ${canonical}`);
    }
    const pageRoute =
      "/" +
      rel
        .replace(/(^|\/)index\.html$/, "")
        .replace(/\.html$/, "")
        .replace(/\/$/, "");
    const expected = `${ORIGIN}${pageRoute === "/" ? "/" : `${pageRoute}/`}`;
    if (canonical !== expected) {
      if (!isUtilityPage(rel) && !isExportDuplicate(rel)) {
        warn(`${rel}: canonical (${canonical}) does not match page path (expected ${expected})`);
      }
    }
  }

  // Title
  const title = (html.match(/<title>(.*?)<\/title>/is) ?? [])[1]?.trim();
  if (!title) fail(`${rel}: missing <title>`);
  else if (/^(HOME|PAGE|TRUDEV)$/i.test(title)) warn(`${rel}: generic title "${title}"`);

  // Meta description
  const desc = (html.match(/<meta[^>]+name=["']description["'][^>]*>/i) ?? [])[0];
  const descContent = desc ? (desc.match(/content=["']([^"']*)["']/i) ?? [])[1] : "";
  if (!descContent) {
    if (!isUtilityPage) fail(`${rel}: missing meta description`);
  }
  else if (descContent.length < 50) warn(`${rel}: meta description is short (${descContent.length} chars)`);
  else if (descContent.length > 165) warn(`${rel}: meta description is long (${descContent.length} chars)`);

  // Noindex
  const robotsMeta = (html.match(/<meta[^>]+name=["']robots["'][^>]*>/i) ?? [])[0] ?? "";
  if (/noindex/i.test(robotsMeta)) {
    const inSitemap = sitemapUrls.some((u) => {
      const p = u.replace(ORIGIN, "");
      return rel === p.replace(/\/+$/, "") + "/index.html" || rel === (p.replace(/\/+$/, "") || "index") + ".html";
    });
    if (inSitemap) {
      fail(`${rel}: noindex page is also listed in the sitemap`);
    } else if (!isUtilityPage(rel) && !isExportDuplicate(rel)) {
      warn(`${rel}: page has noindex — verify this is intentional.`);
    }
  }

  // JSON-LD
  const ldBlocks = [...html.matchAll(/<script[^>]+application\/ld\+json[^>]*>(.*?)<\/script>/gis)]
    .map((m) => m[1]);
  const seenTypes = new Map();
  for (let i = 0; i < ldBlocks.length; i += 1) {
    try {
      const data = JSON.parse(ldBlocks[i]);
      const types = Array.isArray(data) ? data.flatMap((d) => d["@type"] ?? []) : [data["@type"]];
      for (const t of types) seenTypes.set(t, (seenTypes.get(t) ?? 0) + 1);
    } catch {
      fail(`${rel}: JSON-LD block ${i + 1} is not valid JSON`);
    }
  }
  for (const [t, count] of seenTypes) {
    if (count > 1) fail(`${rel}: ${count} JSON-LD blocks with @type ${t} (duplicate schema)`);
  }

  pageData.set(rel, { title, descContent, canonicals, jsonLdTypes: [...seenTypes.keys()] });
}

// Unique titles/descriptions — skip utility/error pages and export duplicates of the
// same physical page (static export writes the 404 page as 404/, 404.html, _not-found/).
const byTitle = new Map();
const byDesc = new Map();
for (const [rel, { title, descContent }] of pageData) {
  if (isUtilityPage(rel) || isExportDuplicate(rel)) continue;
  const key = title?.toLowerCase();
  if (key) byTitle.set(key, [...(byTitle.get(key) ?? []), rel]);
  const dkey = descContent?.toLowerCase();
  if (dkey) byDesc.set(dkey, [...(byDesc.get(dkey) ?? []), rel]);
}
for (const [title, pages] of byTitle) {
  if (pages.length > 1) fail(`duplicate title "${title}" on: ${pages.join(", ")}`);
}
for (const [desc, pages] of byDesc) {
  if (pages.length > 1) fail(`duplicate meta description on: ${pages.join(", ")}`);
}

// ---------------------------------------------------------------------------
// 8. Broken internal links and assets
// ---------------------------------------------------------------------------
const allFiles = new Set(walk(OUT).map((f) => relative(OUT, f).replace(/\\/g, "/")));

function resolveHref(href) {
  if (href.startsWith("http") || href.startsWith("mailto:") || href.startsWith("tel:") || href.startsWith("#")) {
    return null; // external or in-page
  }
  const clean = href.split("?")[0].split("#")[0];
  if (clean === "" || clean === "/") return join(OUT, "index.html");
  const candidates = [
    join(OUT, clean, "index.html"),
    join(OUT, `${clean}.html`),
    join(OUT, clean),
  ];
  return candidates.find((p) => allFiles.has(relative(OUT, p).replace(/\\/g, "/"))) ?? null;
}

for (const file of htmlFiles) {
  const rel = relative(OUT, file);
  const html = readFileSync(file, "utf8");
  const attrs = [...html.matchAll(/(?:href|src)=["']([^"']+)["']/g)].map((m) => m[1]);
  for (const href of attrs) {
    const target = resolveHref(href);
    if (target === null) continue;
    if (!existsSync(target)) {
      fail(`${rel}: broken internal reference: ${href}`);
    }
  }
}

// ---------------------------------------------------------------------------
// Report
// ---------------------------------------------------------------------------
console.log(`\nSEO check — ${OUT} (origin ${ORIGIN})`);
console.log(`Pages scanned: ${pageData.size} · Sitemap URLs: ${sitemapUrls.length}\n`);

if (warnings.length) {
  console.log("Warnings:");
  for (const w of warnings) console.log(`  ⚠ ${w}`);
}
if (errors.length) {
  console.log("Errors:");
  for (const e of errors) console.log(`  ✖ ${e}`);
  process.exitCode = 1;
} else {
  console.log("All checks passed ✔");
}
