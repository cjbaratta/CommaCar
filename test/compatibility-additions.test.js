import test from "node:test";
import assert from "node:assert/strict";
import { mkdtempSync, readFileSync, writeFileSync, rmSync } from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { execFileSync } from "node:child_process";
import { usVehicles } from "../src/lib/vehicles.js";
import { marketplaceLinks } from "../src/lib/marketplaces.js";

const byId = (id) => usVehicles.find((v) => v.id === id);

test("new variants retain distinct hardware and capability restrictions", () => {
  assert.match(byId("acura-adx-2025").note, /disable all CMBS/);
  assert.match(byId("honda-prelude-2026").note, /AEB and FCW/);
  assert.equal(byId("tesla-model-3-with-hw2-5-2019").harness, "Tesla A");
  assert.equal(byId("tesla-model-y-with-hw4-2023").harness, "Tesla B");
  assert.match(byId("tesla-model-y-with-hw3-2024").note, /2023 and 2024 can have HW3 or HW4/);
  assert.deepEqual(byId("honda-ridgeline-2026").years, [2026]);
  assert.ok(!byId("honda-ridgeline-2026").capability.includes("Traffic light"));
  assert.ok(byId("honda-ridgeline-2017").capability.includes("Traffic light"));
  assert.deepEqual(byId("honda-pilot-2026").years, [2026]);
  assert.ok(!usVehicles.some((v) => v.make === "CUPRA" && v.model === "Born"));
  assert.ok(!usVehicles.some((v) => v.model === "Ceed Plug-in Hybrid"));
});

test("new vehicles have the correct fuel and body filters", () => {
  assert.equal(byId("volkswagen-id-4-2021").isElectric, true);
  assert.equal(byId("volkswagen-id-4-2024").bodyStyle, "SUV / crossover / van");
  assert.equal(byId("acura-adx-2025").bodyStyle, "SUV / crossover / van");
  assert.equal(byId("honda-hr-v-2023").bodyStyle, "SUV / crossover / van");
  assert.equal(byId("honda-ridgeline-2026").bodyStyle, "Truck");
  assert.equal(byId("honda-prelude-2026").isHybrid, true);
  assert.equal(byId("kia-sportage-plug-in-hybrid-2023").isHybrid, true);
});

test("Sportage PHEV searches use the base marketplace model and hybrid fuel", () => {
  const links = new Map(marketplaceLinks(byId("kia-sportage-plug-in-hybrid-2023"), {
    minYear: "", maxPrice: "", zip: "", radius: "100", bodyStyle: "Any",
  }));
  const truecar = new URL(links.get("TrueCar"));
  assert.equal(truecar.searchParams.get("mmt[]"), "kia_sportage");
  assert.equal(truecar.searchParams.get("fuelType[]"), "Hybrid");
  const cars = new URL(links.get("CarsForSale"));
  assert.equal(cars.searchParams.get("models"), "Sportage");
  assert.equal(cars.searchParams.get("fueltypes"), "Gas/Electric Hybrid");
});

test("importer retains requirements and notes when source labels have CSS classes", () => {
  const temporary = mkdtempSync(join(tmpdir(), "comma-import-"));
  try {
    const html = `<div id="acura" class="car-make-header"><h3>Acura <span>(1)</span></h3></div>
      <div class="car-row"><div class="model"><strong>ADX</strong></div><div class="year">2025, 2026</div>
      <div class="car-detail-tier">Automated lane centering at all speeds.</div>
      <hgroup><span class="svelte-example">Support</span><div>Requires <b>specific trim</b>.</div></hgroup>
      <hgroup><span class="svelte-example">Note</span><div>AEB is disabled in alpha.</div></hgroup>
      <strong>car harness: Honda Bosch B</strong><a href="/shop/comma-four?harness=Acura ADX 2025-26">Buy</a></div>
      <section class="dark">`;
    writeFileSync(join(temporary, "source.html"), html);
    execFileSync(process.execPath, [new URL("../scripts/build-vehicles-data.mjs", import.meta.url).pathname, join(temporary, "source.html")], { cwd: temporary });
    const output = readFileSync(join(temporary, "src/data/vehicles.js"), "utf8");
    const vehicles = JSON.parse(output.split("export const commaVehicles = ")[1].replace(/;\s*$/, ""));
    assert.equal(vehicles.length, 1);
    assert.equal(vehicles[0].requirement, "Requires specific trim .");
    assert.equal(vehicles[0].note, "AEB is disabled in alpha.");
  } finally {
    rmSync(temporary, { recursive: true, force: true });
  }
});
