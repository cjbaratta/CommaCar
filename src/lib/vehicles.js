import { commaVehicles } from "../data/vehicles.js";
import { bodyStyles, favoriteNames, starterTargetNames } from "./config.js";
import { cleanText, normalize, stripModelQualifier } from "./text.js";

const bodyStyleRules = [
  {
    style: "SUV / crossover / van",
    tokens: [
      "ascent",
      "atlas",
      "blazer",
      "bronco",
      "carnival",
      "cherokee",
      "compass",
      "crosstrek",
      "cr-v",
      "cx-5",
      "cx-9",
      "durango",
      "edge",
      "equinox",
      "escape",
      "expedition",
      "explorer",
      "forester",
      "grand cherokee",
      "gv60",
      "gv70",
      "gv80",
      "highlander",
      "kona",
      "mdx",
      "murano",
      "nexo",
      "niro",
      "odyssey",
      "outback",
      "pacifica",
      "palisade",
      "pathfinder",
      "pilot",
      "q2",
      "q3",
      "rav4",
      "rdx",
      "rogue",
      "santa cruz",
      "santa fe",
      "sienna",
      "sorento",
      "sportage",
      "suburban",
      "taos",
      "tahoe",
      "telluride",
      "tiguan",
      "trailblazer",
      "traverse",
      "tucson",
      "venza",
      "wrangler",
      "yukon",
      "bz4x",
      "ioniq 5",
      "model y",
      "r1s",
      "r1t",
      "solterra",
    ],
  },
  {
    style: "Truck",
    tokens: ["1500", "f-150", "maverick", "silverado", "sierra", "ram"],
  },
  {
    style: "Sedan / hatchback",
    tokens: [
      "a3",
      "accord",
      "altima",
      "camry",
      "civic",
      "corolla",
      "ct",
      "es",
      "g80",
      "g90",
      "ilx",
      "impreza",
      "insight",
      "is",
      "leaf",
      "ls",
      "mazda3",
      "model 3",
      "model s",
      "prius",
      "sentra",
      "sonata",
      "tlx",
    ],
  },
];

const electricTokens = [
  "bolt euv",
  "bolt ev",
  "bz4x",
  "electric",
  "e-crafter",
  "e-golf",
  "ev6",
  "ioniq 5",
  "ioniq 6",
  "ioniq electric",
  "kona electric",
  "leaf",
  "mach-e",
  "model 3",
  "model s",
  "model x",
  "model y",
  "niro ev",
  "r1s",
  "r1t",
  "solterra",
];

const nonUsPatterns = [
  "australia",
  "brazil",
  "china",
  "europe",
  "korea",
  "non-us",
  "southeast asia",
  "taiwan",
];

const nonUsVehicleIds = new Set([
  "volkswagen-touran-2016",
]);

export const makes = [...new Set(commaVehicles.map((vehicle) => vehicle.make))].sort();

export function capabilityFeatures(vehicle) {
  const text = vehicle.capability;
  const laneSpeed =
    (
      text.match(/automated lane centering at all speeds/i)?.[0] ??
      text.match(/automated lane centering (?:above|while driving above) \d+ mph/i)?.[0] ??
      "automated lane centering"
    )
      .replace("automated lane centering", "")
      .replace("at all speeds", "all speeds")
      .trim() || "all speeds";
  const cruise =
    text.match(/adaptive cruise control that automatically resumes from a stop/i)?.[0] ??
    text.match(/adaptive cruise control while driving above \d+ mph/i)?.[0] ??
    "adaptive cruise control";
  const features = [
    ["ALC", laneSpeed],
    ["ACC", cruise.includes("resumes") ? "stop & go" : cruise.replace("adaptive cruise control", "").replace("while driving", "").trim() || "supported"],
  ];

  if (text.includes("may not be able to take tight turns")) features.push(["Turns", "limited"]);
  if (text.includes("Traffic light and stop sign handling")) features.push(["Experimental", "lights & signs"]);

  return features;
}

export function displayYears(vehicle) {
  const years = [...vehicle.years].sort((a, b) => a - b);
  if (!years.length) return vehicle.yearsLabel;
  const consecutive = years.every((year, index) => index === 0 || year === years[index - 1] + 1);
  if (consecutive && years.length > 1) return `${years[0]}-${years[years.length - 1]}`;
  return years.join(", ");
}

function classifyBodyStyle(vehicle) {
  const model = normalize(vehicle.marketplaceModel);
  for (const rule of bodyStyleRules) {
    if (rule.tokens.some((token) => model.includes(normalize(token)))) return rule.style;
  }
  return "Other";
}

function isBatteryElectric(vehicle) {
  const model = normalize(vehicle.marketplaceModel);
  if (model.includes("hybrid") || model.includes("plug in")) return false;
  return electricTokens.some((token) => model.includes(normalize(token)));
}

function isHybrid(vehicle) {
  if (vehicle.isElectric) return false;
  const model = normalize(vehicle.marketplaceModel);
  return model.includes("hybrid") || model.includes("prius");
}

function isUsMarket(vehicle) {
  if (nonUsVehicleIds.has(vehicle.id)) return false;
  const marketText = normalize(`${vehicle.model} ${vehicle.requirement} ${vehicle.note}`);
  return !nonUsPatterns.some((pattern) => marketText.includes(normalize(pattern)));
}

export function enrichVehicle(vehicle) {
  const marketplaceModel = stripModelQualifier(vehicle.model);
  const canonicalName = `${vehicle.make} ${marketplaceModel}`;
  const features = capabilityFeatures(vehicle);
  return {
    ...vehicle,
    bodyStyle: "",
    canonicalName,
    features,
    isElectric: false,
    isHybrid: false,
    isFavorite: favoriteNames.has(canonicalName),
    isUsMarket: false,
    marketplaceModel,
    searchIndex: cleanText(`${vehicle.make} ${vehicle.model} ${marketplaceModel} ${vehicle.yearsLabel} ${vehicle.requirement} ${vehicle.note} ${vehicle.harness}`),
  };
}

export const vehicles = commaVehicles.map((vehicle) => {
  const enriched = enrichVehicle(vehicle);
  enriched.bodyStyle = classifyBodyStyle(enriched);
  enriched.isElectric = isBatteryElectric(enriched);
  enriched.isHybrid = isHybrid(enriched);
  enriched.isUsMarket = isUsMarket(enriched);
  return enriched;
});

export const usVehicles = vehicles.filter((vehicle) => vehicle.isUsMarket);

export function filterVehicles(state, sourceVehicles = usVehicles) {
  const needle = normalize(state.query);
  const minYear = Number(state.minYear);

  return sourceVehicles
    .filter((vehicle) => state.make === "All" || vehicle.make === state.make)
    .filter((vehicle) => !state.onlyRecommended || vehicle.isFavorite)
    .filter((vehicle) => !state.minYear || (Number.isFinite(minYear) && vehicle.years.some((year) => year >= minYear)))
    .filter((vehicle) => state.bodyStyle === "Any" || vehicle.bodyStyle === state.bodyStyle)
    .filter((vehicle) => !state.evOnly || vehicle.isElectric)
    .filter((vehicle) => !state.hybridOnly || vehicle.isHybrid)
    .filter((vehicle) => matchesCapabilities(vehicle, state))
    .filter((vehicle) => !needle || normalize(vehicle.searchIndex).includes(needle));
}

export function matchesCapabilities(vehicle, state) {
  const hasAlc =
    !state.alcFilters.length ||
    state.alcFilters.some((value) => vehicle.features.some(([label, featureValue]) => label === "ALC" && featureValue === value));
  const hasAcc =
    !state.accFilters.length ||
    state.accFilters.some((value) => vehicle.features.some(([label, featureValue]) => label === "ACC" && featureValue === value));
  const hasSupport =
    !state.supportFilters.length ||
    state.supportFilters.some((value) => {
      if (value === "Experimental lights & signs") return vehicle.features.some(([label]) => label === "Experimental");
      return false;
    });

  return hasAlc && hasAcc && hasSupport;
}

const starterRank = new Map(starterTargetNames.map((name, index) => [name, index]));

function targetScore(vehicle) {
  const years = vehicle.years.length ? vehicle.years : [0];
  const latestYear = Math.max(...years);
  const hasStopAndGo = vehicle.features.some(([label, value]) => label === "ACC" && value === "stop & go");
  const hasAllSpeedLaneCentering = vehicle.features.some(([label, value]) => label === "ALC" && value === "all speeds");
  const starterPosition = starterRank.get(vehicle.canonicalName);

  let score = latestYear / 100;
  if (starterPosition !== undefined) score += 100 - starterPosition;
  if (vehicle.isFavorite) score += 20;
  if (hasStopAndGo) score += 6;
  if (hasAllSpeedLaneCentering) score += 4;
  if (vehicle.isElectric) score += 2;
  return score;
}

export function topTargets(sourceVehicles) {
  const grouped = [...new Map(sourceVehicles.map((vehicle) => [vehicle.canonicalName, vehicle])).values()];
  return grouped
    .sort((a, b) => targetScore(b) - targetScore(a) || a.canonicalName.localeCompare(b.canonicalName))
    .slice(0, 6);
}

export { bodyStyles };
