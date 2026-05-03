import { marketplaceTemplates } from "./config.js";
import { normalize, slug } from "./text.js";

export function searchTextFor(vehicle, state) {
  const yearText = state.minYear ? ` ${state.minYear}+` : ` ${vehicle.yearsLabel}`;
  const priceText = state.maxPrice ? ` under ${state.maxPrice}` : "";
  return `${vehicle.make} ${vehicle.marketplaceModel}${yearText}${priceText}`;
}

function siteSearchUrl(site, query, state) {
  const scopedQuery = encodeURIComponent(`${site} ${query} ${state.zip}`);
  return `https://www.google.com/search?q=${scopedQuery}`;
}

function autotraderUrl(vehicle, state) {
  if (!vehicle) return null;
  const pricePath = state.maxPrice ? `/cars-under-${encodeURIComponent(state.maxPrice)}` : "";
  const locationPath = state.zip ? `/${encodeURIComponent(state.zip)}` : "";
  const params = new URLSearchParams({
    searchRadius: state.radius,
    startYear: state.minYear || String(Math.min(...vehicle.years)),
    endYear: String(Math.max(...vehicle.years)),
    zip: state.zip,
  });

  return `https://www.autotrader.com/cars-for-sale/all-cars${pricePath}/${slug(vehicle.make)}/${slug(vehicle.marketplaceModel)}${locationPath}?${params.toString()}`;
}

function autonationUrl(vehicle, state) {
  if (!vehicle) return null;
  const params = new URLSearchParams({
    mk: normalize(vehicle.make),
    md: `${normalize(vehicle.make)}^^^${normalize(vehicle.marketplaceModel)}`,
    yr: `${state.minYear || Math.min(...vehicle.years)}|${Math.max(...vehicle.years)}`,
    pmn: "0",
    dst: state.radius,
    zip: state.zip,
  });

  if (state.maxPrice) params.set("pmx", state.maxPrice);
  if (["SUV / crossover / van", "Sedan / hatchback", "Truck"].includes(state.bodyStyle)) {
    params.set("bd", state.bodyStyle.split(" ")[0].toLowerCase());
  }

  return `https://www.autonationusa.com/cars-for-sale?${params.toString()}`;
}

function autolistUrl(vehicle, state) {
  if (!vehicle) return null;
  const params = new URLSearchParams({
    "makes[]": vehicle.make,
    "models[]": vehicle.marketplaceModel,
    page: "1",
    radius: state.radius,
    zip: state.zip,
    year_min: state.minYear || String(Math.min(...vehicle.years)),
    year_max: String(Math.max(...vehicle.years)),
  });

  params.append(`make_models[${vehicle.make}][]`, vehicle.marketplaceModel);
  if (state.maxPrice) params.set("price_max", state.maxPrice);
  if (["SUV / crossover / van", "Sedan / hatchback", "Truck"].includes(state.bodyStyle)) {
    params.append("body_style[]", state.bodyStyle.split(" ")[0].toLowerCase());
  }

  return `https://www.autolist.com/listings#${params.toString()}`;
}

function carsComUrl(vehicle, query, state) {
  const params = new URLSearchParams({
    maximum_distance: state.radius,
    zip: state.zip,
    sort: "listed_at_desc",
  });

  if (vehicle) {
    params.set("year_min", state.minYear || String(Math.min(...vehicle.years)));
    params.set("year_max", String(Math.max(...vehicle.years)));
    params.append("makes[]", normalize(vehicle.make));
    params.append("models[]", `${normalize(vehicle.make)}-${normalize(vehicle.marketplaceModel).replaceAll(" ", "_")}`);
  } else {
    params.set("keyword", query);
    if (state.minYear) params.set("year_min", state.minYear);
  }

  if (state.maxPrice) params.set("list_price_max", state.maxPrice);
  return `https://www.cars.com/shopping/results/?${params.toString()}`;
}

export function marketplaceUrl(kind, query, state, vehicle = null) {
  const encodedQuery = encodeURIComponent(query);
  if (kind === "cars") return carsComUrl(vehicle, query, state);
  if (kind === "autotrader") return autotraderUrl(vehicle, state) ?? siteSearchUrl("site:autotrader.com/cars-for-sale", query, state);
  if (kind === "autonation") return autonationUrl(vehicle, state) ?? siteSearchUrl("site:autonationusa.com/cars-for-sale", query, state);
  if (kind === "autolist") return autolistUrl(vehicle, state) ?? siteSearchUrl("site:autolist.com/listings", query, state);
  if (kind === "craigslist") return siteSearchUrl("site:craigslist.org/search/cta", query, state);
  return `https://www.facebook.com/marketplace/search/?query=${encodedQuery}`;
}

export function marketplaceLinks(vehicle, state) {
  const query = searchTextFor(vehicle, state);
  return marketplaceTemplates.map(([label, kind]) => [label, marketplaceUrl(kind, query, state, vehicle)]);
}

const scanSites = {
  cars: "site:cars.com/vehicledetail",
  autotrader: "site:autotrader.com/cars-for-sale",
  autonation: "site:autonationusa.com/cars-for-sale",
  autolist: "site:autolist.com/listings",
  craigslist: "site:craigslist.org/search/cta",
};

const scanLabels = {
  cars: "Scan Cars.com",
  autotrader: "Scan Autotrader",
  autonation: "Scan AutoNation",
  autolist: "Scan Autolist",
  craigslist: "Scan Craigslist",
  facebook: "Scan Facebook",
};

export function marketplaceSearchLinks(sourceVehicles, state) {
  const grouped = [...new Map(sourceVehicles.slice(0, 8).map((vehicle) => [vehicle.canonicalName, vehicle])).values()];
  if (!grouped.length) return [];

  const terms = grouped.map((vehicle) => `${vehicle.make} ${vehicle.marketplaceModel}`).join(" OR ");
  const yearText = state.minYear ? ` ${state.minYear}+` : "";
  const priceText = state.maxPrice ? ` under ${state.maxPrice}` : "";
  const query = `${terms}${yearText}${priceText}`;

  return marketplaceTemplates.map(([, kind]) => {
    const label = scanLabels[kind] ?? kind;
    if (kind === "facebook") return [label, marketplaceUrl(kind, query, state)];
    return [label, siteSearchUrl(scanSites[kind], query, state)];
  });
}

export function reviewLinks(vehicle) {
  const name = encodeURIComponent(`${vehicle.make} ${vehicle.marketplaceModel} ${vehicle.yearsLabel}`);
  const simple = encodeURIComponent(`${vehicle.make} ${vehicle.marketplaceModel}`);
  return [
    ["openpilot", `https://www.google.com/search?q=${name}+openpilot+review+comma.ai`],
    ["Reddit", `https://www.google.com/search?q=site%3Areddit.com%2Fr%2FComma_ai+${simple}`],
    ["Consumer reviews", `https://www.edmunds.com/${vehicle.make.toLowerCase()}/${slug(vehicle.marketplaceModel)}/consumer-reviews/`],
    ["General reviews", `https://www.google.com/search?q=${simple}+review+Car+and+Driver+Edmunds+MotorTrend`],
  ];
}
