import {
  accFilterOptions,
  alcFilterOptions,
  bodyStyles,
  sampleListings,
  supportFilterOptions,
} from "./lib/config.js";
import { analyzeListings } from "./lib/listings.js";
import { marketplaceLinks, marketplaceSearchLinks, reviewLinks } from "./lib/marketplaces.js";
import { normalizedState, updateInputValue } from "./lib/state.js";
import { escapeHtml as h } from "./lib/text.js";
import {
  capabilityFeatures,
  displayYears,
  filterVehicles,
  makes,
  topTargets,
  usVehicles,
  vehicles as allCompatibilityRows,
} from "./lib/vehicles.js";

const app = document.querySelector("#app");
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

let renderTimer = null;

function optionList(values, selected) {
  return values
    .map((value) => `<option value="${h(value)}" ${selected === value ? "selected" : ""}>${h(value)}</option>`)
    .join("");
}

function checkboxGroup(title, group, options, helpText) {
  return `
    <fieldset class="filter-group" aria-describedby="${group}-help">
      <legend>${h(title)}</legend>
      <p id="${group}-help" class="field-help">${h(helpText)}</p>
      <div class="check-grid">
        ${options
          .map(
            (option) => `
              <label class="check-pill">
                <input data-filter-group="${h(group)}" type="checkbox" value="${h(option)}" ${state[group].includes(option) ? "checked" : ""} />
                ${h(option)}
              </label>
            `,
          )
          .join("")}
      </div>
    </fieldset>
  `;
}

function multiSelectControl(title, group, options, helpText) {
  const label = state[group].length ? `${state[group].length} selected` : "Any";
  return `
    <details class="multi-select" data-filter-panel="${h(group)}" ${state.openFilterPanels.includes(group) ? "open" : ""}>
      <summary aria-describedby="${group}-help">
        <span>${h(title)}</span>
        <strong data-filter-count="${h(group)}">${h(label)}</strong>
      </summary>
      <p id="${group}-help" class="field-help">${h(helpText)}</p>
      <div class="check-grid">
        ${options
          .map(
            (option) => `
              <label class="check-pill">
                <input data-filter-group="${h(group)}" type="checkbox" value="${h(option)}" ${state[group].includes(option) ? "checked" : ""} />
                ${h(option)}
              </label>
            `,
          )
          .join("")}
      </div>
    </details>
  `;
}

function stat(label, value) {
  return `<div class="stat"><strong>${h(value)}</strong><span>${h(label)}</span></div>`;
}

function sourceButton([label, href], className = "") {
  const classes = ["pill-link", className].filter(Boolean).join(" ");
  return `<a class="${h(classes)}" href="${h(href)}" target="_blank" rel="noreferrer">${h(label)}</a>`;
}

function actionSection(label, links, className = "") {
  return `
    <div class="action-section ${h(className)}">
      <span class="action-label">${h(label)}</span>
      <div class="action-grid">
        ${links.map(([linkLabel, href, linkClass]) => sourceButton([linkLabel, href], linkClass)).join("")}
      </div>
    </div>
  `;
}

function featureChips(vehicle) {
  return `<div class="feature-chips">${capabilityFeatures(vehicle)
    .map(([label, value]) => `<span class="feature-chip"><strong>${h(label)}</strong>${h(value)}</span>`)
    .join("")}</div>`;
}

function marketBadges(vehicle) {
  return `
    ${vehicle.isElectric ? '<span class="badge ev-badge">EV</span>' : ""}
    ${vehicle.isFavorite ? '<span class="badge">Comma pick</span>' : ""}
  `;
}

function vehicleCard(vehicle, safeState) {
  return `
    <article class="vehicle-card">
      <div class="card-head">
        <div>
          <span class="eyebrow">${h(vehicle.make)}</span>
          <h3>${h(vehicle.model)}</h3>
        </div>
        <div class="badge-stack">${marketBadges(vehicle)}</div>
      </div>
      <div class="vehicle-summary">
        <div class="year-strip">${h(displayYears(vehicle))}</div>
        ${featureChips(vehicle)}
      </div>
      <dl class="spec-list">
        <div><dt>Trim check</dt><dd>${h(vehicle.requirement)}</dd></div>
        <div><dt>Harness</dt><dd>${h(vehicle.harness)}</dd></div>
      </dl>
      ${vehicle.note ? `<div class="notice">${h(vehicle.note)}</div>` : ""}
      <div class="card-actions">
        ${actionSection("Listings", marketplaceLinks(vehicle, safeState), "marketplace-section")}
        ${actionSection("Research", [...reviewLinks(vehicle), ["Comma kit", vehicle.shopUrl, "kit-link"]], "research-section")}
      </div>
    </article>
  `;
}

function filterSummary(count, safeState) {
  const pieces = [];
  if (safeState.make !== "All") pieces.push(safeState.make);
  if (safeState.query.trim()) pieces.push(`"${safeState.query.trim()}"`);
  if (safeState.minYear) pieces.push(`${safeState.minYear}+`);
  if (safeState.bodyStyle !== "Any") pieces.push(safeState.bodyStyle);
  if (safeState.alcFilters.length) pieces.push(`ALC: ${safeState.alcFilters.join(", ")}`);
  if (safeState.accFilters.length) pieces.push(`ACC: ${safeState.accFilters.join(", ")}`);
  if (safeState.supportFilters.length) pieces.push(safeState.supportFilters.join(", "));
  if (safeState.evOnly) pieces.push("EV");
  if (safeState.onlyRecommended) pieces.push("Comma favorites");
  const scope = pieces.length ? pieces.join(" + ") : "all US-market supported vehicles";
  return `Showing ${count} compatibility ${count === 1 ? "row" : "rows"} for ${scope}.`;
}

function searchTargetCard(vehicle, safeState) {
  return `
    <article class="target-card">
      <div>
        <span class="eyebrow">${h(vehicle.make)}</span>
        <h3>${h(vehicle.model)}</h3>
      </div>
      <div class="inline-badges">
        <div class="year-strip">${h(displayYears(vehicle))}</div>
        ${marketBadges(vehicle)}
      </div>
      <p>${h(vehicle.requirement)}</p>
      ${featureChips(vehicle)}
      <div class="link-group">${marketplaceLinks(vehicle, safeState).slice(0, 3).map(sourceButton).join("")}</div>
      <div class="link-group muted-links">${reviewLinks(vehicle).slice(0, 2).map(sourceButton).join("")}</div>
    </article>
  `;
}

function analysisRow(result) {
  if (!result.matches.length) {
    return `
      <article class="listing-row miss">
        <p>${h(result.line)}</p>
        <strong>No explicit Comma match found</strong>
        <span>Try adding the model year, trim, or package text from the seller listing.</span>
      </article>
    `;
  }

  const best = result.matches[0].vehicle;
  return `
    <article class="listing-row hit">
      <p>${h(result.line)}</p>
      <strong>${h(best.make)} ${h(best.model)} ${h(best.yearsLabel)}</strong>
      <span>${h(best.requirement)}</span>
      <div class="link-group">
        ${reviewLinks(best).slice(0, 2).map(sourceButton).join("")}
        <a class="pill-link" href="${h(best.shopUrl)}" target="_blank" rel="noreferrer">Harness</a>
      </div>
    </article>
  `;
}

function renderShell() {
  app.innerHTML = `
    <section class="hero">
      <div class="hero-copy">
        <span class="eyebrow">Comma Car Finder</span>
        <h1>Find openpilot-ready cars near you.</h1>
        <p>Filter US-market compatible models, then jump into pre-built marketplace searches.</p>
      </div>
      <div class="control-panel" aria-label="Search filters">
        <label>ZIP code<input data-bind="zip" value="${h(state.zip)}" inputmode="numeric" maxlength="5" aria-describedby="zip-help" /></label>
        <label>Radius<input data-bind="radius" value="${h(state.radius)}" inputmode="numeric" aria-describedby="radius-help" /></label>
        <label>Make<select data-bind="make">${optionList(["All", ...makes], state.make)}</select></label>
        <label>Minimum year<input data-bind="minYear" value="${h(state.minYear)}" inputmode="numeric" placeholder="2020" aria-describedby="year-help" /></label>
        <label>Max price<input data-bind="maxPrice" value="${h(state.maxPrice)}" inputmode="numeric" placeholder="25000" aria-describedby="price-help" /></label>
        <label>Body style<select data-bind="bodyStyle">${optionList(bodyStyles, state.bodyStyle)}</select></label>
        <p id="zip-help" class="sr-only">Five digit US ZIP code used for marketplace searches.</p>
        <p id="radius-help" class="sr-only">Search radius between ten and five hundred miles.</p>
        <p id="year-help" class="sr-only">Optional minimum model year.</p>
        <p id="price-help" class="sr-only">Optional maximum listing price in US dollars.</p>
        <label class="toggle ev-toggle"><input data-bind="evOnly" type="checkbox" ${state.evOnly ? "checked" : ""} /> Battery EV only</label>
        ${multiSelectControl("Automated lane centering", "alcFilters", alcFilterOptions, "Filter by the minimum speed where lane centering is available.")}
        ${multiSelectControl("Adaptive cruise", "accFilters", accFilterOptions, "Filter by adaptive cruise behavior, including stop-and-go support.")}
        ${checkboxGroup("Support notes", "supportFilters", supportFilterOptions, "Filter for support limitations and experimental traffic-light or stop-sign handling.")}
      </div>
    </section>

    <section id="stats" class="stats" aria-label="Compatibility statistics"></section>

    <section class="search-board">
      <div class="search-header">
        <div>
          <span class="eyebrow">Market scan</span>
          <h2>Start with these searches</h2>
        </div>
        <label class="toggle"><input data-bind="onlyRecommended" type="checkbox" ${state.onlyRecommended ? "checked" : ""} /> Comma favorites</label>
      </div>
      <label class="search main-search">Model, trim, or requirement<input data-bind="query" value="${h(state.query)}" placeholder="Corolla, EV6, ACC, 2021..." /></label>
      <div id="result-summary" class="result-summary"></div>
      <div id="marketplace-actions" class="marketplace-actions"></div>
      <div class="source-note">
        Direct marketplace links use normalized model names without compatibility-only notes like regional availability or HDA variants. Non-US rows are hidden by default because these searches are ZIP-based.
      </div>
      <div id="target-grid" class="target-grid"></div>
    </section>

    <section class="workspace">
      <section class="results">
        <div class="section-title">
          <span class="eyebrow">Compatibility database</span>
          <h2>Supported model details</h2>
        </div>
        <div class="source-note">
          Compatibility data is generated from <a href="https://comma.ai/vehicles" target="_blank" rel="noreferrer">comma.ai/vehicles</a>. Source page last updated February 20, 2026; local data generated May 1, 2026. Always confirm trim/package details before buying.
        </div>
        <div id="vehicle-grid" class="vehicle-grid"></div>
      </section>
    </section>

    <section class="paste-fallback">
      <details>
        <summary>
          <span>
            <span class="eyebrow">Fallback checker</span>
            Paste listings if marketplace search misses
          </span>
          <strong id="listing-count"></strong>
        </summary>
        <textarea data-bind="listingText" spellcheck="false">${h(state.listingText)}</textarea>
        <div id="listing-results" class="listing-results"></div>
      </details>
    </section>
  `;
}

function updateFilterCounts() {
  app.querySelectorAll("[data-filter-count]").forEach((element) => {
    const group = element.dataset.filterCount;
    element.textContent = state[group].length ? `${state[group].length} selected` : "Any";
  });
}

function renderDynamic() {
  const safeState = normalizedState(state);
  const filtered = filterVehicles(safeState);
  const targetVehicles = topTargets(filtered);
  const analyzed = analyzeListings(state.listingText);
  const matchedListings = analyzed.filter((row) => row.matches.length).length;

  updateFilterCounts();
  app.querySelector("#stats").innerHTML = [
    stat("US-market compatibility rows", usVehicles.length),
    stat("hidden non-US rows", allCompatibilityRows.length - usVehicles.length),
    stat("current search targets", targetVehicles.length),
  ].join("");
  app.querySelector("#result-summary").textContent = filterSummary(filtered.length, safeState);
  app.querySelector("#marketplace-actions").innerHTML = targetVehicles.length
    ? marketplaceSearchLinks(targetVehicles, safeState).map(sourceButton).join("")
    : `<span>No marketplace searches until filters match at least one supported model.</span>`;
  app.querySelector("#target-grid").innerHTML = targetVehicles.length
    ? targetVehicles.map((vehicle) => searchTargetCard(vehicle, safeState)).join("")
    : `<div class="empty-state">
        <strong>No supported targets match those filters.</strong>
        <span>Try clearing search text or broadening make, year, body style, or favorites.</span>
      </div>`;
  app.querySelector("#vehicle-grid").innerHTML = filtered.length
    ? filtered.map((vehicle) => vehicleCard(vehicle, safeState)).join("")
    : `<div class="empty-state">
        <strong>No US-market supported rows match those filters.</strong>
        <span>Try clearing the search text, changing make, or turning off Comma favorites.</span>
      </div>`;
  app.querySelector("#listing-count").textContent = `${matchedListings}/${analyzed.length}`;
  app.querySelector("#listing-results").innerHTML = analyzed.map(analysisRow).join("");
}

function scheduleRender() {
  window.clearTimeout(renderTimer);
  renderTimer = window.setTimeout(renderDynamic, 120);
}

function syncInputValue(element, key) {
  if (element.type === "checkbox") {
    state[key] = element.checked;
    renderDynamic();
    return;
  }

  Object.assign(state, updateInputValue(state, key, element.value));
  if (["query", "listingText"].includes(key)) {
    scheduleRender();
  } else {
    renderDynamic();
  }
}

renderShell();
renderDynamic();

app.addEventListener("input", (event) => {
  const element = event.target.closest("[data-bind]");
  if (!element) return;
  if (element.tagName === "SELECT" || element.type === "checkbox") return;
  syncInputValue(element, element.dataset.bind);
});

app.addEventListener("change", (event) => {
  const boundElement = event.target.closest("[data-bind]");
  if (boundElement) {
    syncInputValue(boundElement, boundElement.dataset.bind);
    return;
  }

  const filterElement = event.target.closest("[data-filter-group]");
  if (!filterElement) return;
  const group = filterElement.dataset.filterGroup;
  const value = filterElement.value;
  if (!state.openFilterPanels.includes(group)) state.openFilterPanels = [...state.openFilterPanels, group];
  state[group] = filterElement.checked ? [...state[group], value] : state[group].filter((item) => item !== value);
  renderDynamic();
});

app.addEventListener("toggle", (event) => {
  const panel = event.target.closest("[data-filter-panel]");
  if (!panel) return;
  const group = panel.dataset.filterPanel;
  state.openFilterPanels = panel.open
    ? [...new Set([...state.openFilterPanels, group])]
    : state.openFilterPanels.filter((item) => item !== group);
}, true);
