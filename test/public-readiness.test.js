import assert from "node:assert/strict";
import fs from "node:fs";
import path from "node:path";
import test from "node:test";
import { fileURLToPath } from "node:url";

import { marketplaceLinks } from "../src/lib/marketplaces.js";
import { normalizedState } from "../src/lib/state.js";
import { escapeHtml } from "../src/lib/text.js";
import { filterVehicles, topTargets, usVehicles, vehicles } from "../src/lib/vehicles.js";

const repoRoot = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const distDir = path.join(repoRoot, "dist");
const blogContentDir = path.join(repoRoot, "src", "content", "blog");

function readText(...segments) {
  return fs.readFileSync(path.join(repoRoot, ...segments), "utf8");
}

function blogSlugs() {
  return fs
    .readdirSync(blogContentDir)
    .filter((file) => file.endsWith(".md"))
    .map((file) => file.replace(/\.md$/, ""))
    .sort();
}

const baseState = normalizedState({
  query: "",
  make: "All",
  zip: "60601",
  radius: "100",
  minYear: "",
  maxPrice: "",
  bodyStyle: "Any",
  alcFilters: [],
  accFilters: [],
  supportFilters: [],
  evOnly: false,
  onlyRecommended: false,
});

test("escapes user and scraped text before HTML insertion", () => {
  assert.equal(escapeHtml(`<img src=x onerror="alert('xss')">`), "&lt;img src=x onerror=&quot;alert(&#39;xss&#39;)&quot;&gt;");
});

test("normalizes numeric search inputs without poisoning filters", () => {
  const state = normalizedState({
    ...baseState,
    zip: "60601<script>",
    radius: "9999",
    minYear: "not a year",
    maxPrice: "$25,000",
  });

  assert.equal(state.zip, "60601");
  assert.equal(state.radius, "500");
  assert.equal(state.minYear, "");
  assert.equal(state.maxPrice, "25000");
  assert.ok(filterVehicles(state).length > 0);
});

test("EV-only filter catches BEVs and excludes hybrids", () => {
  const evResults = filterVehicles({ ...baseState, evOnly: true });
  const names = new Set(evResults.map((vehicle) => `${vehicle.make} ${vehicle.model}`));

  assert.ok(names.has("Hyundai Kona Electric"));
  assert.ok(names.has("Volkswagen e-Golf"));
  assert.ok(!names.has("Hyundai Ioniq Hybrid"));
  assert.ok(!names.has("Hyundai Ioniq Plug-in Hybrid"));
});

test("body-style filter uses enriched metadata instead of brittle sedan tokens", () => {
  const suvResults = filterVehicles({ ...baseState, bodyStyle: "SUV / crossover / van" });
  const sedanResults = filterVehicles({ ...baseState, bodyStyle: "Sedan / hatchback" });
  const suvNames = new Set(suvResults.map((vehicle) => `${vehicle.make} ${vehicle.model}`));
  const sedanNames = new Set(sedanResults.map((vehicle) => `${vehicle.make} ${vehicle.model}`));

  assert.ok(suvNames.has("Audi Q3"));
  assert.ok(suvNames.has("Toyota Corolla Cross (Non-US only)") === false);
  assert.ok(!sedanNames.has("Toyota Corolla Cross (Non-US only)"));
});

test("default vehicle source hides non-US-market rows", () => {
  assert.ok(vehicles.some((vehicle) => vehicle.model.includes("Korea only")));
  assert.ok(!usVehicles.some((vehicle) => vehicle.model.includes("Korea only")));
  assert.ok(!filterVehicles(baseState).some((vehicle) => vehicle.model.includes("Korea only")));
});

test("marketplace URLs use buyer-facing model names without compatibility qualifiers", () => {
  const vehicle = vehicles.find((item) => item.make === "Hyundai" && item.model === "Ioniq 5 (with HDA II)");
  const links = marketplaceLinks(vehicle, baseState);
  const joined = links.map(([, href]) => href).join("\n");

  assert.ok(joined.includes("Ioniq") || joined.includes("ioniq"));
  assert.ok(!joined.includes("HDA"));
  assert.ok(!joined.includes("%28"));
  assert.ok(!joined.includes("%29"));
});

test("capability filters still work with precomputed features", () => {
  const results = filterVehicles({ ...baseState, accFilters: ["stop & go"], alcFilters: ["all speeds"] });

  assert.ok(results.length > 0);
  assert.ok(results.every((vehicle) => vehicle.features.some(([label, value]) => label === "ACC" && value === "stop & go")));
  assert.ok(results.every((vehicle) => vehicle.features.some(([label, value]) => label === "ALC" && value === "all speeds")));
});

test("default search targets prioritize practical recommendations over data order", () => {
  const targets = topTargets(filterVehicles(baseState)).map((vehicle) => vehicle.canonicalName);

  assert.deepEqual(targets.slice(0, 3), ["Hyundai Ioniq 5", "Kia EV6", "Toyota Prius"]);
  assert.ok(!targets[0].startsWith("Acura "));
});

test("Astro build emits static blog pages for every markdown post", () => {
  assert.ok(fs.existsSync(path.join(distDir, "blog", "index.html")), "run npm run build before npm test");

  for (const slug of blogSlugs()) {
    assert.ok(fs.existsSync(path.join(distDir, "blog", slug, "index.html")), `missing static page for ${slug}`);
  }
});

test("blog post HTML contains rendered content and article metadata", () => {
  const html = readText("dist", "blog", "install-openpilot-toyota-corolla", "index.html");

  assert.match(html, /<meta property="og:type" content="article">/);
  assert.match(html, /<link rel="canonical" href="https:\/\/www\.pilotcompatible\.com\/blog\/install-openpilot-toyota-corolla\/">/);
  assert.match(html, /<h1>How to Install openpilot on a Toyota Corolla<\/h1>/);
  assert.match(html, /<h2 id="what-youll-need">What You.ll Need<\/h2>/);
  assert.match(html, /<strong>comma 3X<\/strong>/);
});

test("blog routes do not ship the finder bundle or client-side markdown renderer", () => {
  const forbidden = [/src\/app\.js/, /data\/vehicles/, /marked/i, /post-[\w-]+\.js/, /install-openpilot-toyota-corolla-[\w-]+\.js/];

  for (const slug of ["index", ...blogSlugs()]) {
    const htmlPath =
      slug === "index"
        ? path.join(distDir, "blog", "index.html")
        : path.join(distDir, "blog", slug, "index.html");
    const html = fs.readFileSync(htmlPath, "utf8");

    assert.doesNotMatch(html, /<script type="module" src="\/_astro\/[^"]+\.js"/);
    for (const pattern of forbidden) {
      assert.doesNotMatch(html, pattern, `${slug} includes ${pattern}`);
    }
  }

  const astroAssets = fs.readdirSync(path.join(distDir, "_astro"));
  assert.ok(!astroAssets.some((file) => /post-|install-openpilot|openpilot-vs|best-evs|why-your-car/.test(file)));
});

test("Tina admin and Astro sitemap are present in the built site", () => {
  assert.ok(fs.existsSync(path.join(distDir, "admin", "index.html")));
  assert.ok(fs.existsSync(path.join(distDir, "sitemap-index.xml")));
  assert.ok(fs.existsSync(path.join(distDir, "sitemap-0.xml")));

  const robots = readText("dist", "robots.txt");
  const sitemap = readText("dist", "sitemap-0.xml");
  assert.match(robots, /Sitemap: https:\/\/www\.pilotcompatible\.com\/sitemap-index\.xml/);
  assert.match(sitemap, /https:\/\/www\.pilotcompatible\.com\/blog\/install-openpilot-toyota-corolla\//);
});

test("Netlify keeps legacy redirects without SPA or dynamic blog rewrites", () => {
  const config = readText("netlify.toml");

  assert.match(config, /from = "\/blog\/install-openpilot-toyota-corolla\.html"\s+to = "\/blog\/install-openpilot-toyota-corolla\/"\s+status = 301/s);
  assert.match(config, /from = "\/sitemap\.xml"\s+to = "\/sitemap-index\.xml"\s+status = 301/s);
  assert.doesNotMatch(config, /\/blog\/:slug/);
  assert.doesNotMatch(config, /from = "\/\*"\s+to = "\/index\.html"\s+status = 200/s);
});
