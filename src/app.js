import { commaVehicles } from "./data/vehicles.js";

const makes = [...new Set(commaVehicles.map((vehicle) => vehicle.make))].sort();
const marketplaceTemplates = [
  ["Cars.com direct", "cars"],
  ["Autotrader", "autotrader"],
  ["AutoNation USA", "autonation"],
  ["Autolist", "autolist"],
  ["Craigslist web", "craigslist"],
  ["Facebook Marketplace", "facebook"],
];
const hiddenMarketplaceTemplates = [["CarsDirect", "carsdirect"]];

const sampleListings = [
  "2021 Toyota Corolla LE - 42k miles - $18,900 - TSS 2.0, adaptive cruise, lane tracing",
  "2020 Hyundai Sonata SEL Plus - $19,500 - highway drive assist, smart cruise",
  "2018 Honda Accord Touring 2.0T - $23,000 - adaptive cruise, lane keep assist",
  "2017 Subaru Outback Premium - $14,600 - EyeSight package",
  "2023 Mazda CX-5 Carbon Edition - $27,200 - adaptive cruise, lane keep",
  "2022 Ford F-150 Lariat - $43,900 - Co-Pilot360",
];

const state = {
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
  openFilterPanels: [],
  listingText: sampleListings.join("\n"),
  onlyRecommended: false,
};

const favoriteNames = new Set([
  "Kia EV6",
  "Hyundai Ioniq 5",
  "Toyota Prius",
  "Toyota Highlander",
  "Hyundai Palisade",
  "Toyota Corolla",
  "Hyundai Sonata",
  "Ram 1500",
  "Chevrolet Silverado 1500",
]);

const app = document.querySelector("#app");
const bodyStyles = ["Any", "SUV", "Sedan", "Truck"];
const bodyStyleModels = {
  SUV: ["Highlander", "Palisade", "Telluride", "RAV4", "CR-V", "CX-5", "Outback", "Forester", "Pilot", "Santa Fe", "Tucson", "Sorento", "Sportage", "Grand Cherokee", "Tahoe", "Yukon", "Explorer", "Escape", "RDX", "MDX"],
  Sedan: ["Corolla", "Camry", "Sonata", "Accord", "Civic", "TLX", "ILX", "A3", "Mazda3", "Altima", "Sentra", "ES", "IS"],
  Truck: ["1500", "F-150", "Silverado", "Sierra", "Ram"],
};
const evModelTokens = ["EV", "Ioniq", "Bolt", "Leaf", "e-tron", "ID.", "R1", "Model 3", "Model S", "Model X", "Model Y", "Mach-E", "bZ4X", "Solterra"];
const alcFilterOptions = ["all speeds", "above 2 mph", "above 3 mph", "above 6 mph", "above 9 mph", "above 11 mph", "above 12 mph", "above 14 mph", "above 15 mph", "above 28 mph", "above 31 mph", "above 32 mph", "above 37 mph", "above 39 mph", "above 43 mph"];
const accFilterOptions = ["stop & go", "supported", "above 3 mph", "above 5 mph", "above 6 mph", "above 10 mph", "above 17 mph", "above 19 mph", "above 26 mph"];
const supportFilterOptions = ["Limited turns", "Experimental lights & signs"];

function normalize(value) {
  return value.toLowerCase().replace(/[^a-z0-9]+/g, " ").trim();
}

function canonical(vehicle) {
  return normalize(`${vehicle.make} ${vehicle.model}`);
}

function reviewLinks(vehicle) {
  const name = encodeURIComponent(`${vehicle.make} ${vehicle.model} ${vehicle.yearsLabel}`);
  const simple = encodeURIComponent(`${vehicle.make} ${vehicle.model}`);
  return [
    ["openpilot", `https://www.google.com/search?q=${name}+openpilot+review+comma.ai`],
    ["Reddit", `https://www.google.com/search?q=site%3Areddit.com%2Fr%2FComma_ai+${simple}`],
    ["Consumer reviews", `https://www.edmunds.com/${vehicle.make.toLowerCase()}/${vehicle.model.toLowerCase().replaceAll(" ", "-")}/consumer-reviews/`],
    ["General reviews", `https://www.google.com/search?q=${simple}+review+Car+and+Driver+Edmunds+MotorTrend`],
  ];
}

function searchTextFor(vehicle) {
  const yearText = state.minYear ? ` ${state.minYear}+` : ` ${vehicle.yearsLabel}`;
  const priceText = state.maxPrice ? ` under ${state.maxPrice}` : "";
  return `${vehicle.make} ${vehicle.model}${yearText}${priceText}`;
}

function slug(value) {
  return normalize(value).replaceAll(" ", "-");
}

function siteSearchUrl(site, query) {
  const scopedQuery = encodeURIComponent(`${site} ${query} ${state.zip}`);
  return `https://www.google.com/search?q=${scopedQuery}`;
}

function autotraderUrl(vehicle) {
  if (!vehicle) return null;
  const pricePath = state.maxPrice ? `/cars-under-${encodeURIComponent(state.maxPrice)}` : "";
  const locationPath = state.zip ? `/${encodeURIComponent(state.zip)}` : "";
  const params = new URLSearchParams({
    searchRadius: state.radius,
    startYear: state.minYear || String(Math.min(...vehicle.years)),
    endYear: String(Math.max(...vehicle.years)),
    zip: state.zip,
  });

  return `https://www.autotrader.com/cars-for-sale/all-cars${pricePath}/${slug(vehicle.make)}/${slug(vehicle.model)}${locationPath}?${params.toString()}`;
}

function autonationUrl(vehicle) {
  if (!vehicle) return null;
  const params = new URLSearchParams({
    mk: normalize(vehicle.make),
    md: `${normalize(vehicle.make)}^^^${normalize(vehicle.model)}`,
    yr: `${state.minYear || Math.min(...vehicle.years)}|${Math.max(...vehicle.years)}`,
    pmn: "0",
    dst: state.radius,
    zip: state.zip,
  });

  if (state.maxPrice) params.set("pmx", state.maxPrice);
  if (["SUV", "Sedan", "Truck"].includes(state.bodyStyle)) params.set("bd", state.bodyStyle.toLowerCase());

  return `https://www.autonationusa.com/cars-for-sale?${params.toString()}`;
}

function carsdirectUrl(vehicle) {
  if (!vehicle) return null;
  const params = new URLSearchParams({
    distance: state.radius,
  });

  return `https://www.carsdirect.com/used_cars/listings/${slug(vehicle.make)}/${slug(vehicle.model)}?${params.toString()}`;
}

function autolistUrl(vehicle) {
  if (!vehicle) return null;
  const params = new URLSearchParams({
    "makes[]": vehicle.make,
    "models[]": vehicle.model,
    page: "1",
    radius: state.radius,
    zip: state.zip,
    year_min: state.minYear || String(Math.min(...vehicle.years)),
    year_max: String(Math.max(...vehicle.years)),
  });

  params.append(`make_models[${vehicle.make}][]`, vehicle.model);
  if (state.maxPrice) params.set("price_max", state.maxPrice);
  if (["SUV", "Sedan", "Truck"].includes(state.bodyStyle)) params.append("body_style[]", state.bodyStyle.toLowerCase());

  return `https://www.autolist.com/listings#${params.toString()}`;
}

function marketplaceUrl(kind, query, vehicle = null) {
  const encodedQuery = encodeURIComponent(query);
  if (kind === "cars") return carsComUrl(vehicle, query);
  if (kind === "autotrader") return autotraderUrl(vehicle) ?? siteSearchUrl("site:autotrader.com/cars-for-sale", query);
  if (kind === "autonation") return autonationUrl(vehicle) ?? siteSearchUrl("site:autonationusa.com/cars-for-sale", query);
  if (kind === "carsdirect") return carsdirectUrl(vehicle) ?? siteSearchUrl("site:carsdirect.com/used_cars/listings", query);
  if (kind === "autolist") return autolistUrl(vehicle) ?? siteSearchUrl("site:autolist.com/listings", query);
  if (kind === "craigslist") return siteSearchUrl("site:craigslist.org/search/cta", query);
  return `https://www.facebook.com/marketplace/search/?query=${encodedQuery}`;
}

function carsComUrl(vehicle, query) {
  const params = new URLSearchParams({
    maximum_distance: state.radius,
    zip: state.zip,
    sort: "listed_at_desc",
  });

  if (vehicle) {
    params.set("year_min", state.minYear || String(Math.min(...vehicle.years)));
    params.set("year_max", String(Math.max(...vehicle.years)));
    params.append("makes[]", normalize(vehicle.make));
    params.append("models[]", `${normalize(vehicle.make)}-${slug(vehicle.model)}`);
  } else {
    params.set("keyword", query);
    if (state.minYear) params.set("year_min", state.minYear);
  }

  if (state.maxPrice) params.set("list_price_max", state.maxPrice);
  return `https://www.cars.com/shopping/results/?${params.toString()}`;
}

function marketplaceLinks(vehicle) {
  const query = searchTextFor(vehicle);
  return marketplaceTemplates.map(([label, kind]) => [label, marketplaceUrl(kind, query, vehicle)]);
}

function marketplaceSearchLinks(vehicles) {
  const grouped = [...new Map(vehicles.slice(0, 8).map((vehicle) => [`${vehicle.make} ${vehicle.model}`, vehicle])).values()];
  const terms = grouped.map((vehicle) => `${vehicle.make} ${vehicle.model}`).join(" OR ");
  const yearText = state.minYear ? ` ${state.minYear}+` : "";
  const priceText = state.maxPrice ? ` under ${state.maxPrice}` : "";
  const query = `${terms}${yearText}${priceText}`;

  return marketplaceTemplates.map(([label, kind]) => {
    if (kind === "cars") return ["Cars.com top target", marketplaceUrl(kind, searchTextFor(grouped[0]), grouped[0])];
    if (kind === "autotrader") return ["Autotrader top target", marketplaceUrl(kind, searchTextFor(grouped[0]), grouped[0])];
    if (kind === "autonation") return ["AutoNation top target", marketplaceUrl(kind, searchTextFor(grouped[0]), grouped[0])];
    if (kind === "carsdirect") return ["CarsDirect top target", marketplaceUrl(kind, searchTextFor(grouped[0]), grouped[0])];
    if (kind === "autolist") return ["Autolist top target", marketplaceUrl(kind, searchTextFor(grouped[0]), grouped[0])];
    return [label, marketplaceUrl(kind, query)];
  });
}

function scoreVehicle(vehicle, line) {
  const haystack = normalize(line);
  const name = canonical(vehicle);
  const hasMake = haystack.includes(normalize(vehicle.make));
  const modelTokens = normalize(vehicle.model).split(" ").filter(Boolean);
  const modelHit = modelTokens.every((token) => haystack.includes(token));
  const listingYears = [...line.matchAll(/\b(19|20)\d{2}\b/g)].map((match) => Number(match[0]));
  const yearHit = listingYears.length > 0 && vehicle.years.some((year) => listingYears.includes(year));
  const trimHint =
    /adaptive cruise|acc|lane assist|lane keep|lane centering|eyesight|smart cruise|tss|hda|co-pilot|safety sense/i.test(line);

  if (!hasMake || !modelHit) return 0;
  if (listingYears.length > 0 && !yearHit) return 0;
  return 40 + (yearHit ? 40 : 0) + (trimHint ? 15 : 0) + Math.min(name.length, 12);
}

function analyzeListings() {
  return state.listingText
    .split(/\n+/)
    .map((line) => line.trim())
    .filter(Boolean)
    .map((line) => {
      const matches = commaVehicles
        .map((vehicle) => ({ vehicle, score: scoreVehicle(vehicle, line) }))
        .filter((match) => match.score > 0)
        .sort((a, b) => b.score - a.score);
      return { line, matches: matches.slice(0, 3) };
    });
}

function filteredVehicles() {
  const needle = normalize(state.query);
  return commaVehicles
    .filter((vehicle) => state.make === "All" || vehicle.make === state.make)
    .filter((vehicle) => !state.onlyRecommended || favoriteNames.has(`${vehicle.make} ${vehicle.model}`))
    .filter((vehicle) => !state.minYear || vehicle.years.some((year) => year >= Number(state.minYear)))
    .filter((vehicle) => {
      if (state.bodyStyle === "Any") return true;
      return bodyStyleModels[state.bodyStyle].some((token) => vehicle.model.includes(token));
    })
    .filter((vehicle) => !state.evOnly || isEv(vehicle))
    .filter(matchesPageCapabilities)
    .filter((vehicle) => !needle || normalize(`${vehicle.make} ${vehicle.model} ${vehicle.yearsLabel} ${vehicle.requirement}`).includes(needle));
}

function optionList() {
  return ["All", ...makes]
    .map((make) => `<option value="${make}" ${state.make === make ? "selected" : ""}>${make}</option>`)
    .join("");
}

function bodyStyleOptions() {
  return bodyStyles
    .map((style) => `<option value="${style}" ${state.bodyStyle === style ? "selected" : ""}>${style}</option>`)
    .join("");
}

function displayYears(vehicle) {
  const years = [...vehicle.years].sort((a, b) => a - b);
  if (!years.length) return vehicle.yearsLabel;
  const consecutive = years.every((year, index) => index === 0 || year === years[index - 1] + 1);
  if (consecutive && years.length > 1) return `${years[0]}-${years[years.length - 1]}`;
  return years.join(", ");
}

function topTargets(vehicles) {
  const grouped = [...new Map(vehicles.map((vehicle) => [`${vehicle.make} ${vehicle.model}`, vehicle])).values()];
  return grouped.slice(0, 6);
}

function isEv(vehicle) {
  return evModelTokens.some((token) => vehicle.model.includes(token));
}

function matchesPageCapabilities(vehicle) {
  const features = capabilityFeatures(vehicle);
  const hasAlc = !state.alcFilters.length || state.alcFilters.some((value) => features.some(([label, featureValue]) => label === "ALC" && featureValue === value));
  const hasAcc = !state.accFilters.length || state.accFilters.some((value) => features.some(([label, featureValue]) => label === "ACC" && featureValue === value));
  const hasSupport =
    !state.supportFilters.length ||
    state.supportFilters.some((value) => {
      if (value === "Limited turns") return features.some(([label]) => label === "Turns");
      if (value === "Experimental lights & signs") return features.some(([label]) => label === "Experimental");
      return false;
    });

  return hasAlc && hasAcc && hasSupport;
}

function stat(label, value) {
  return `<div class="stat"><strong>${value}</strong><span>${label}</span></div>`;
}

function sourceButton([label, href], className = "") {
  const classes = ["pill-link", className].filter(Boolean).join(" ");
  return `<a class="${classes}" href="${href}" target="_blank" rel="noreferrer">${label}</a>`;
}

function actionSection(label, links, className = "") {
  return `
    <div class="action-section ${className}">
      <span class="action-label">${label}</span>
      <div class="action-grid">
        ${links.map(([linkLabel, href, linkClass]) => sourceButton([linkLabel, href], linkClass)).join("")}
      </div>
    </div>
  `;
}

function capabilityFeatures(vehicle) {
  const text = vehicle.capability;
  const laneSpeed = (
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

function featureChips(vehicle) {
  return `<div class="feature-chips">${capabilityFeatures(vehicle)
    .map(([label, value]) => `<span class="feature-chip"><strong>${label}</strong>${value}</span>`)
    .join("")}</div>`;
}

function vehicleCard(vehicle) {
  const favorite = favoriteNames.has(`${vehicle.make} ${vehicle.model}`);
  return `
    <article class="vehicle-card">
      <div class="card-head">
        <div>
          <span class="eyebrow">${vehicle.make}</span>
          <h3>${vehicle.model}</h3>
        </div>
        <div class="badge-stack">
          ${isEv(vehicle) ? '<span class="badge ev-badge">EV</span>' : ""}
          ${favorite ? '<span class="badge">Comma pick</span>' : ""}
        </div>
      </div>
      <div class="vehicle-summary">
        <div class="year-strip">${displayYears(vehicle)}</div>
        ${featureChips(vehicle)}
      </div>
      <dl class="spec-list">
        <div><dt>Trim check</dt><dd>${vehicle.requirement}</dd></div>
        <div><dt>Harness</dt><dd>${vehicle.harness}</dd></div>
      </dl>
      ${vehicle.note ? `<div class="notice">${vehicle.note}</div>` : ""}
      <div class="card-actions">
        ${actionSection("Listings", marketplaceLinks(vehicle), "marketplace-section")}
        ${actionSection("Research", [...reviewLinks(vehicle), ["Comma kit", vehicle.shopUrl, "kit-link"]], "research-section")}
      </div>
    </article>
  `;
}

function filterSummary(count) {
  const pieces = [];
  if (state.make !== "All") pieces.push(state.make);
  if (state.query.trim()) pieces.push(`"${state.query.trim()}"`);
  if (state.minYear) pieces.push(`${state.minYear}+`);
  if (state.bodyStyle !== "Any") pieces.push(state.bodyStyle);
  if (state.alcFilters.length) pieces.push(`ALC: ${state.alcFilters.join(", ")}`);
  if (state.accFilters.length) pieces.push(`ACC: ${state.accFilters.join(", ")}`);
  if (state.supportFilters.length) pieces.push(state.supportFilters.join(", "));
  if (state.evOnly) pieces.push("EV");
  if (state.onlyRecommended) pieces.push("Comma favorites");
  const scope = pieces.length ? pieces.join(" + ") : "all supported vehicles";
  return `Showing ${count} compatibility ${count === 1 ? "row" : "rows"} for ${scope}.`;
}

function checkboxGroup(title, group, options) {
  return `
    <fieldset class="filter-group">
      <legend>${title}</legend>
      <div class="check-grid">
        ${options
          .map(
            (option) => `
              <label class="check-pill">
                <input data-filter-group="${group}" type="checkbox" value="${option}" ${state[group].includes(option) ? "checked" : ""} />
                ${option}
              </label>
            `,
          )
          .join("")}
      </div>
    </fieldset>
  `;
}

function multiSelectControl(title, group, options) {
  const label = state[group].length ? `${state[group].length} selected` : "Any";
  return `
    <details class="multi-select" data-filter-panel="${group}" ${state.openFilterPanels.includes(group) ? "open" : ""}>
      <summary>
        <span>${title}</span>
        <strong>${label}</strong>
      </summary>
      <div class="check-grid">
        ${options
          .map(
            (option) => `
              <label class="check-pill">
                <input data-filter-group="${group}" type="checkbox" value="${option}" ${state[group].includes(option) ? "checked" : ""} />
                ${option}
              </label>
            `,
          )
          .join("")}
      </div>
    </details>
  `;
}

function searchTargetCard(vehicle) {
  return `
    <article class="target-card">
      <div>
        <span class="eyebrow">${vehicle.make}</span>
        <h3>${vehicle.model}</h3>
      </div>
      <div class="inline-badges">
        <div class="year-strip">${displayYears(vehicle)}</div>
        ${isEv(vehicle) ? '<span class="badge ev-badge">EV</span>' : ""}
      </div>
      <p>${vehicle.requirement}</p>
      ${featureChips(vehicle)}
      <div class="link-group">${marketplaceLinks(vehicle).slice(0, 3).map(sourceButton).join("")}</div>
      <div class="link-group muted-links">${reviewLinks(vehicle).slice(0, 2).map(sourceButton).join("")}</div>
    </article>
  `;
}

function analysisRow(result) {
  if (!result.matches.length) {
    return `
      <article class="listing-row miss">
        <p>${result.line}</p>
        <strong>No explicit Comma match found</strong>
        <span>Try adding the model year, trim, or package text from the seller listing.</span>
      </article>
    `;
  }

  const best = result.matches[0].vehicle;
  return `
    <article class="listing-row hit">
      <p>${result.line}</p>
      <strong>${best.make} ${best.model} ${best.yearsLabel}</strong>
      <span>${best.requirement}</span>
      <div class="link-group">
        ${reviewLinks(best).slice(0, 2).map(sourceButton).join("")}
        <a class="pill-link" href="${best.shopUrl}" target="_blank" rel="noreferrer">Harness</a>
      </div>
    </article>
  `;
}

function render() {
  const activeElement = document.activeElement;
  const activeState = activeElement?.dataset?.bind
    ? {
        key: activeElement.dataset.bind,
        start: activeElement.selectionStart,
        end: activeElement.selectionEnd,
      }
    : null;
  const vehicles = filteredVehicles();
  const targetVehicles = topTargets(vehicles);
  const analyzed = analyzeListings();
  const supportedMakes = makes.length;
  const matchedListings = analyzed.filter((row) => row.matches.length).length;

  app.innerHTML = `
    <section class="hero">
      <div class="hero-copy">
        <span class="eyebrow">Comma Car Finder</span>
        <h1>Search local listings for openpilot-ready cars.</h1>
        <p>Pick your market and preferences, then jump into pre-built searches for models Comma explicitly supports.</p>
      </div>
      <div class="control-panel">
        <label>ZIP code<input data-bind="zip" value="${state.zip}" inputmode="numeric" /></label>
        <label>Radius<input data-bind="radius" value="${state.radius}" inputmode="numeric" /></label>
        <label>Make<select data-bind="make">${optionList()}</select></label>
        <label>Minimum year<input data-bind="minYear" value="${state.minYear}" inputmode="numeric" placeholder="2020" /></label>
        <label>Max price<input data-bind="maxPrice" value="${state.maxPrice}" inputmode="numeric" placeholder="25000" /></label>
        <label>Body style<select data-bind="bodyStyle">${bodyStyleOptions()}</select></label>
        <label class="toggle ev-toggle"><input data-bind="evOnly" type="checkbox" ${state.evOnly ? "checked" : ""} /> EV only</label>
        ${multiSelectControl("ALC", "alcFilters", alcFilterOptions)}
        ${multiSelectControl("ACC", "accFilters", accFilterOptions)}
        ${checkboxGroup("Support notes", "supportFilters", supportFilterOptions)}
      </div>
    </section>

    <section class="stats">
      ${stat("compatibility rows from comma.ai", commaVehicles.length)}
      ${stat("supported makes", supportedMakes)}
      ${stat("current search targets", targetVehicles.length)}
    </section>

    <section class="search-board">
      <div class="search-header">
        <div>
          <span class="eyebrow">Market scan</span>
          <h2>Start with these searches</h2>
        </div>
        <label class="toggle"><input data-bind="onlyRecommended" type="checkbox" ${state.onlyRecommended ? "checked" : ""} /> Comma favorites</label>
      </div>
      <label class="search main-search">Model, trim, or requirement<input data-bind="query" value="${state.query}" placeholder="Corolla, EV6, ACC, 2021..." /></label>
      <div class="result-summary">${filterSummary(vehicles.length)}</div>
      <div class="marketplace-actions">
        ${
          targetVehicles.length
            ? marketplaceSearchLinks(targetVehicles).map(sourceButton).join("")
            : `<span>No marketplace searches until filters match at least one supported model.</span>`
        }
      </div>
      <div class="source-note">
        Cars.com, Autotrader, AutoNation USA, and Autolist use direct filtered URLs. Autolist location is ZIP-based here; adding city coordinates later would make it even closer to Autolist's own URLs. Craigslist uses scoped web search.
      </div>
      <div class="target-grid">
        ${
          targetVehicles.length
            ? targetVehicles.map(searchTargetCard).join("")
            : `<div class="empty-state">
                <strong>No supported targets match those filters.</strong>
                <span>Try clearing search text or broadening make, year, body style, or favorites.</span>
              </div>`
        }
      </div>
    </section>

    <section class="workspace">
      <section class="results">
        <div class="section-title">
          <span class="eyebrow">Compatibility database</span>
          <h2>Supported model details</h2>
        </div>
        <div class="source-note">
          Compatibility data is generated from <a href="https://comma.ai/vehicles" target="_blank" rel="noreferrer">comma.ai/vehicles</a>, last updated there on February 20, 2026. Always confirm trim/package details before buying.
        </div>
        <div class="vehicle-grid">
          ${
            vehicles.length
              ? vehicles.map(vehicleCard).join("")
              : `<div class="empty-state">
                  <strong>No supported rows match those filters.</strong>
                  <span>Try clearing the search text, changing make, or turning off Comma favorites.</span>
                </div>`
          }
        </div>
      </section>
    </section>

    <section class="paste-fallback">
      <details>
        <summary>
          <span>
            <span class="eyebrow">Fallback checker</span>
            Paste listings if marketplace search misses
          </span>
          <strong>${matchedListings}/${analyzed.length}</strong>
        </summary>
        <textarea data-bind="listingText" spellcheck="false">${state.listingText}</textarea>
        <div class="listing-results">${analyzed.map(analysisRow).join("")}</div>
      </details>
    </section>
  `;

  app.querySelectorAll("[data-bind]").forEach((element) => {
    const key = element.dataset.bind;
    const eventName = element.tagName === "SELECT" || element.type === "checkbox" ? "change" : "input";
    element.addEventListener(eventName, (event) => {
      state[key] = element.type === "checkbox" ? event.target.checked : event.target.value;
      render();
    });
  });

  app.querySelectorAll("[data-filter-group]").forEach((element) => {
    element.addEventListener("change", (event) => {
      const group = event.target.dataset.filterGroup;
      const value = event.target.value;
      if (!state.openFilterPanels.includes(group)) state.openFilterPanels = [...state.openFilterPanels, group];
      state[group] = event.target.checked ? [...state[group], value] : state[group].filter((item) => item !== value);
      render();
    });
  });

  app.querySelectorAll("[data-filter-panel]").forEach((element) => {
    element.addEventListener("toggle", (event) => {
      const group = event.currentTarget.dataset.filterPanel;
      state.openFilterPanels = event.currentTarget.open
        ? [...new Set([...state.openFilterPanels, group])]
        : state.openFilterPanels.filter((item) => item !== group);
    });
  });

  if (activeState) {
    const nextActive = app.querySelector(`[data-bind="${activeState.key}"]`);
    nextActive?.focus();
    if (typeof nextActive?.setSelectionRange === "function" && activeState.start !== null) {
      nextActive.setSelectionRange(activeState.start, activeState.end);
    }
  }
}

render();
