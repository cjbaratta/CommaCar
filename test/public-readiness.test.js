import assert from "node:assert/strict";
import test from "node:test";

import { marketplaceLinks } from "../src/lib/marketplaces.js";
import { normalizedState } from "../src/lib/state.js";
import { escapeHtml } from "../src/lib/text.js";
import { filterVehicles, topTargets, usVehicles, vehicles } from "../src/lib/vehicles.js";

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
