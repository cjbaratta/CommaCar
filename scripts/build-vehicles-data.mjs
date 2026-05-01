import { readFileSync, writeFileSync, mkdirSync } from "node:fs";

const source = process.argv[2] ?? "/tmp/comma-vehicles.html";
const html = readFileSync(source, "utf8");

const decode = (value) =>
  value
    .replace(/&#39;/g, "'")
    .replace(/&amp;/g, "&")
    .replace(/&quot;/g, '"')
    .replace(/&nbsp;/g, " ")
    .replace(/&ndash;|–|‑|⁠/g, "-")
    .replace(/&mdash;/g, "-")
    .replace(/&lt;/g, "<")
    .replace(/&gt;/g, ">");

const text = (value) =>
  decode(value)
    .replace(/<!-- HTML_TAG_(?:START|END) -->/g, "")
    .replace(/<script[\s\S]*?<\/script>/g, "")
    .replace(/<style[\s\S]*?<\/style>/g, "")
    .replace(/<[^>]*>/g, " ")
    .replace(/\s+/g, " ")
    .trim();

const expandYears = (yearText) => {
  const normalized = text(yearText).replace(/to/g, "-");
  const years = new Set();
  const rangeRe = /\b((?:19|20)\d{2})\s*-\s*(\d{2}|(?:19|20)\d{2})\b/g;
  let match;
  while ((match = rangeRe.exec(normalized))) {
    const start = Number(match[1]);
    const end =
      match[2].length === 2
        ? Number(String(start).slice(0, 2) + match[2])
        : Number(match[2]);
    for (let year = start; year <= end; year += 1) years.add(year);
  }

  for (const year of normalized.match(/\b(?:19|20)\d{2}\b/g) ?? []) {
    years.add(Number(year));
  }

  return [...years].sort((a, b) => a - b);
};

const makeSections = [
  ...html.matchAll(
    /<div id="([^"]+)" class="car-make-header[\s\S]*?<h3>(.*?)\s*<span[\s\S]*?<\/h3><\/div>([\s\S]*?)(?=<div id="[^"]+" class="car-make-header|<section class="dark)/g,
  ),
];

const vehicles = [];

for (const [, , makeHtml, body] of makeSections) {
  const make = text(makeHtml);
  const rows = [...body.matchAll(/<div class="car-row[\s\S]*?(?=<div class="car-row|$)/g)];

  for (const [row] of rows) {
    const model = row.match(/<div class="model"><strong>([\s\S]*?)<\/strong><\/div>/)?.[1];
    const yearsRaw = row.match(/<div class="year">([\s\S]*?)<\/div>/)?.[1];
    if (!model || !yearsRaw) continue;

    const capability = text(row.match(/<div class="car-detail-tier[^"]*">([\s\S]*?)<\/div>/)?.[1] ?? "");
    const requirementMatch = row.match(/<hgroup><span>Support<\/span>\s*<div>([\s\S]*?)<\/div><\/hgroup>/);
    const noteMatch = row.match(/<hgroup><span>Note<\/span>\s*<div>([\s\S]*?)<\/div><\/hgroup>/);
    const harness = text(row.match(/<strong>car harness:\s*([\s\S]*?)<\/strong>/)?.[1] ?? "See comma store");
    const shopPath = decode(row.match(/<a href="([^"]*\/shop\/comma-four[^"]*)"/)?.[1] ?? "/shop/comma-four");
    const years = expandYears(yearsRaw);

    vehicles.push({
      id: `${make}-${text(model)}-${years[0] ?? text(yearsRaw)}`.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, ""),
      make,
      model: text(model),
      years,
      yearsLabel: text(yearsRaw),
      requirement: requirementMatch ? text(requirementMatch[1]) : "Verify trim requirements on comma.ai before purchase.",
      note: noteMatch ? text(noteMatch[1]) : "",
      harness,
      capability,
      shopUrl: `https://comma.ai${shopPath}`,
    });
  }
}

mkdirSync("src/data", { recursive: true });
writeFileSync(
  "src/data/vehicles.js",
  `// Generated from https://comma.ai/vehicles on 2026-05-01.\nexport const commaVehicles = ${JSON.stringify(vehicles, null, 2)};\n`,
);

console.log(`Wrote ${vehicles.length} vehicle compatibility rows.`);
