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

const PAGE_SIZE = 24;

const app = document.querySelector("#app");
const state = {
  query: "",
  make: "All",
  zip: "",
  radius: "100",
  minYear: "",
  maxPrice: "",
  bodyStyle: "Any",
  alcFilters: [],
  accFilters: [],
  supportFilters: [],
  evOnly: false,
  hybridOnly: false,
  openFilterPanels: [],
  listingText: sampleListings.join("\n"),
  onlyRecommended: false,
  currentPage: 0,
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
        <strong data-filter-count="${h(group)}" aria-live="polite">${h(label)}</strong>
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

function advancedFilterSummary() {
  const count = state.alcFilters.length + state.accFilters.length + state.supportFilters.length;
  return count ? `${count} active` : "Any compatibility";
}

function sourceButton([label, href], className = "") {
  const classes = ["pill-link", className].filter(Boolean).join(" ");
  return `<a class="${h(classes)}" href="${h(href)}" target="_blank" rel="noreferrer">${h(label)}<span class="sr-only"> (opens new tab)</span></a>`;
}

function hasActiveFilters() {
  return (
    state.query !== "" ||
    state.make !== "All" ||
    state.minYear !== "" ||
    state.maxPrice !== "" ||
    state.bodyStyle !== "Any" ||
    state.alcFilters.length > 0 ||
    state.accFilters.length > 0 ||
    state.supportFilters.length > 0 ||
    state.evOnly ||
    state.hybridOnly ||
    state.onlyRecommended
  );
}

function clearFilters() {
  Object.assign(state, {
    query: "",
    make: "All",
    minYear: "",
    maxPrice: "",
    bodyStyle: "Any",
    alcFilters: [],
    accFilters: [],
    supportFilters: [],
    evOnly: false,
    hybridOnly: false,
    onlyRecommended: false,
    openFilterPanels: [],
    currentPage: 0,
  });
  renderShell();
  renderDynamic();
}

function handleListingToggle() {
  const sample = sampleListings.join("\n");
  state.listingText = state.listingText === sample ? "" : sample;
  const textarea = app.querySelector("textarea[data-bind='listingText']");
  if (textarea) textarea.value = state.listingText;
  renderDynamic();
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
    .filter(([label]) => label !== "Turns")
    .map(([label, value]) => `<span class="feature-chip"><strong>${h(label)}</strong>${h(value)}</span>`)
    .join("")}</div>`;
}

function limitedTurnsNotice(vehicle) {
  if (!vehicle.features.some(([label]) => label === "Turns")) return "";
  return `<div class="notice turns-notice">openpilot may not handle tight turns on this vehicle — verify before buying.</div>`;
}

function marketBadges(vehicle) {
  return `
    ${vehicle.isElectric ? '<span class="badge ev-badge">EV</span>' : ""}
    ${vehicle.isHybrid ? '<span class="badge hybrid-badge">Hybrid</span>' : ""}
    ${vehicle.isFavorite ? '<span class="badge">Comma pick</span>' : ""}
  `;
}

function vehicleCard(vehicle, safeState) {
  return `
    <article class="vehicle-card" aria-label="${h(vehicle.make)} ${h(vehicle.model)}">
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
      ${limitedTurnsNotice(vehicle)}
      <div class="card-actions">
        ${actionSection("Listings", marketplaceLinks(vehicle, safeState), "marketplace-section")}
        <details class="card-more">
          <summary>Research and kit</summary>
          ${actionSection("Research", [...reviewLinks(vehicle), ["Comma kit", vehicle.shopUrl, "kit-link"]], "research-section")}
        </details>
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
  if (safeState.hybridOnly) pieces.push("Hybrid / PHEV");
  if (safeState.onlyRecommended) pieces.push("Comma favorites");
  const scope = pieces.length ? pieces.join(" · ") : "all US-market supported vehicles";
  return `Showing ${count} compatible ${count === 1 ? "vehicle" : "vehicles"} for ${scope}.`;
}

function searchTargetCard(vehicle, safeState) {
  return `
    <article class="target-card" aria-label="${h(vehicle.make)} ${h(vehicle.model)}">
      <div class="target-card-head">
        <div>
          <span class="eyebrow">${h(vehicle.make)}</span>
          <h3>${h(vehicle.model)}</h3>
        </div>
        <div class="inline-badges">
          <div class="year-strip">${h(displayYears(vehicle))}</div>
          ${marketBadges(vehicle)}
        </div>
      </div>
      <p>${h(vehicle.requirement)}</p>
      ${featureChips(vehicle)}
      ${limitedTurnsNotice(vehicle)}
      <div class="link-group target-actions">${marketplaceLinks(vehicle, safeState).slice(0, 4).map(sourceButton).join("")}</div>
      <details class="card-more target-more">
        <summary>Research links</summary>
        <div class="link-group muted-links">${reviewLinks(vehicle).slice(0, 2).map(sourceButton).join("")}</div>
      </details>
    </article>
  `;
}

function analysisRow(result) {
  if (!result.matches.length) {
    return `
      <article class="listing-row miss" aria-label="No match: ${h(result.line)}">
        <p>${h(result.line)}</p>
        <strong class="miss-label">✗ No match found</strong>
        <span>Try adding the model year, trim, or package text from the seller listing.</span>
      </article>
    `;
  }

  const best = result.matches[0].vehicle;
  return `
    <article class="listing-row hit" aria-label="Match found: ${h(result.line)}">
      <p>${h(result.line)}</p>
      <strong>${h(best.make)} ${h(best.model)} ${h(best.yearsLabel)}</strong>
      <span>${h(best.requirement)}</span>
      <div class="link-group">
        ${reviewLinks(best).slice(0, 2).map(sourceButton).join("")}
        ${sourceButton(["Harness", best.shopUrl])}
      </div>
    </article>
  `;
}

function renderShell() {
  app.innerHTML = `
    <a href="#vehicle-grid" class="skip-link">Skip to results</a>
    <section class="hero">
      <div class="hero-copy">
        <span class="eyebrow">PilotCompatible</span>
        <h1>Find openpilot-ready cars near you.</h1>
        <p>Browse compatible US-market models, compare trim requirements, and launch marketplace searches.</p>
        <p class="hero-explainer">openpilot is an open-source driver assistance system by <a href="https://comma.ai" target="_blank" rel="noreferrer" class="hero-link">comma.ai</a> — like Autopilot, but for non-Tesla vehicles.</p>
        <nav class="hero-blog-nav" aria-label="Site sections">
          <a href="/blog/" class="hero-blog-link">Guides &amp; blog &#8594;</a>
        </nav>
      </div>
      <div class="control-panel" aria-label="Search filters">
        <label class="search main-search">Model, trim, or capability<input data-bind="query" value="${h(state.query)}" placeholder="Corolla, EV6, stop & go, 2021..." /></label>
        <label>ZIP code<input data-bind="zip" value="${h(state.zip)}" inputmode="numeric" pattern="[0-9]*" maxlength="5" placeholder="e.g. 90210" aria-describedby="zip-help" /></label>
        <label>Radius<input data-bind="radius" value="${h(state.radius)}" inputmode="numeric" pattern="[0-9]*" aria-describedby="radius-help" /></label>
        <label>Make<select data-bind="make">${optionList(["All", ...makes], state.make)}</select></label>
        <label>Body style<select data-bind="bodyStyle">${optionList(bodyStyles, state.bodyStyle)}</select></label>
        <label>Min year<input data-bind="minYear" value="${h(state.minYear)}" inputmode="numeric" pattern="[0-9]*" placeholder="2020" aria-describedby="year-help" /></label>
        <label>Max price<input data-bind="maxPrice" value="${h(state.maxPrice)}" inputmode="numeric" pattern="[0-9]*" placeholder="25000" aria-describedby="price-help" /></label>
        <p id="zip-help" class="sr-only">Five digit US ZIP code used for marketplace searches.</p>
        <p id="radius-help" class="sr-only">Search radius between ten and five hundred miles.</p>
        <p id="year-help" class="sr-only">Optional minimum model year.</p>
        <p id="price-help" class="sr-only">Optional maximum listing price in US dollars.</p>
        <fieldset class="toggle-row">
          <legend class="sr-only">Quick filters</legend>
          <label class="toggle ev-toggle"><input data-bind="evOnly" type="checkbox" ${state.evOnly ? "checked" : ""} /> Battery EV only</label>
          <label class="toggle hybrid-toggle"><input data-bind="hybridOnly" type="checkbox" ${state.hybridOnly ? "checked" : ""} /> Hybrid / PHEV only</label>
          <label class="toggle"><input data-bind="onlyRecommended" type="checkbox" ${state.onlyRecommended ? "checked" : ""} /> Comma favorites</label>
        </fieldset>
        <details class="advanced-filters" data-filter-panel="advanced" ${state.openFilterPanels.includes("advanced") ? "open" : ""}>
          <summary>
            <span>Advanced compatibility filters</span>
            <strong data-advanced-filter-count aria-live="polite">${h(advancedFilterSummary())}</strong>
          </summary>
          <div class="advanced-filter-body">
            ${multiSelectControl("Lane centering", "alcFilters", alcFilterOptions, "Minimum speed where lane centering is available.")}
            ${multiSelectControl("Adaptive cruise", "accFilters", accFilterOptions, "Cruise behavior, including stop-and-go support.")}
            ${checkboxGroup("Support notes", "supportFilters", supportFilterOptions, "Experimental features and known support limitations.")}
          </div>
        </details>
        <button class="clear-filters-btn" data-action="clear-filters" style="display:none">Clear filters</button>
      </div>
    </section>

    <section id="stats" class="stats" aria-label="Compatibility statistics"></section>

    <section class="search-board">
      <div class="search-header">
        <div>
          <span class="eyebrow">Market scan</span>
          <h2>Recommended searches</h2>
          <p>Results update as you filter. Open a search to browse listings, then confirm trim and package before buying.</p>
        </div>
      </div>
      <div id="result-summary" class="result-summary"></div>
      <div id="marketplace-actions" class="marketplace-actions"></div>
      <details class="source-details">
        <summary>About these links</summary>
        <p>Links are simplified for search and may omit region-specific notes. Non-US models are hidden since searches are location-based.</p>
      </details>
      <div id="target-grid" class="target-grid"></div>
    </section>

    <section class="workspace">
      <section class="results">
        <div class="section-title">
          <span class="eyebrow">Compatibility database</span>
          <h2>Supported models</h2>
        </div>
        <div class="source-note">
          Data sourced from <a href="https://comma.ai/vehicles" target="_blank" rel="noreferrer">comma.ai/vehicles</a>, last updated May 1, 2026. Always confirm trim and package before buying.
        </div>
        <div id="vehicle-grid" class="vehicle-grid"></div>
        <div id="pagination"></div>
      </section>
    </section>

    <section class="paste-fallback">
      <details>
        <summary>
          <span>
            <span class="eyebrow">Listing checker</span>
            Can't find it? Paste a listing to check compatibility.
          </span>
          <strong id="listing-count"></strong>
        </summary>
        <div class="listing-controls">
          <button class="listing-toggle-btn" data-action="listing-toggle">Clear sample</button>
        </div>
        <label for="listing-textarea" class="sr-only">Paste vehicle listings to check compatibility</label>
        <textarea id="listing-textarea" data-bind="listingText" spellcheck="false" aria-describedby="listing-count">${h(state.listingText)}</textarea>
        <div id="listing-results" class="listing-results"></div>
      </details>
    </section>

    <footer class="site-footer">
      <div class="site-footer-inner">
        <div class="footer-brand">
          <span class="eyebrow">PilotCompatible</span>
          <p>Find openpilot-compatible cars near you. Browse supported models, compare trim requirements, and launch marketplace searches.</p>
          <p class="footer-copyright">&copy; ${new Date().getFullYear()} Skyward Design. All rights reserved.</p>
        </div>
        <nav class="footer-nav" aria-label="Site map">
          <div class="footer-nav-group">
            <strong>Tool</strong>
            <a href="/">Vehicle finder</a>
            <a href="/#vehicle-grid">Supported models</a>
            <a href="https://comma.ai/vehicles" target="_blank" rel="noreferrer">comma.ai vehicles</a>
          </div>
          <div class="footer-nav-group">
            <strong>Blog</strong>
            <a href="/blog/">All posts</a>
            <a href="/blog/install-openpilot-toyota-corolla.html">Install guide: Toyota Corolla</a>
            <a href="/blog/openpilot-vs-tesla-autopilot-vs-gm-super-cruise.html">openpilot vs. Autopilot vs. Super Cruise</a>
            <a href="/blog/best-evs-under-30000-openpilot-2025.html">Best EVs under $30k (2025)</a>
          </div>
        </nav>
      </div>
    </footer>
  `;
}

function updateFilterCounts() {
  app.querySelectorAll("[data-filter-count]").forEach((element) => {
    const group = element.dataset.filterCount;
    element.textContent = state[group].length ? `${state[group].length} selected` : "Any";
  });
  const advancedCount = app.querySelector("[data-advanced-filter-count]");
  if (advancedCount) advancedCount.textContent = advancedFilterSummary();
}

function renderPagination(currentPage, totalPages) {
  const prev = currentPage > 0;
  const next = currentPage < totalPages - 1;
  const pageButtons = Array.from({ length: totalPages }, (_, i) => {
    const isCurrent = i === currentPage;
    return `<button
      class="page-btn${isCurrent ? " page-btn--current" : ""}"
      data-action="goto-page"
      data-page="${i}"
      aria-label="Page ${i + 1}"
      ${isCurrent ? 'aria-current="page"' : ""}
    >${i + 1}</button>`;
  }).join("");
  return `
    <nav class="pagination" aria-label="Vehicle results pages">
      <button class="page-btn page-nav" data-action="goto-page" data-page="${currentPage - 1}"
        ${!prev ? "disabled" : ""} aria-label="Previous page">&#8592; Prev</button>
      <div class="page-numbers" role="list">${pageButtons}</div>
      <button class="page-btn page-nav" data-action="goto-page" data-page="${currentPage + 1}"
        ${!next ? "disabled" : ""} aria-label="Next page">Next &#8594;</button>
    </nav>`;
}

function renderDynamic() {
  const safeState = normalizedState(state);
  const filtered = filterVehicles(safeState);
  const targetVehicles = topTargets(filtered);
  const analyzed = analyzeListings(state.listingText);
  const matchedListings = analyzed.filter((row) => row.matches.length).length;

  const rerenderZones = ["#vehicle-grid", "#target-grid", "#listing-results", "#marketplace-actions"];
  const lostFocusZone = rerenderZones.find((sel) => app.querySelector(sel)?.contains(document.activeElement));

  updateFilterCounts();
  app.querySelector("#stats").innerHTML = [
    stat("compatible vehicles", filtered.length),
    stat("in database", usVehicles.length),
  ].join("");

  const clearBtn = app.querySelector("[data-action='clear-filters']");
  if (clearBtn) clearBtn.style.display = hasActiveFilters() ? "" : "none";

  const listingToggleBtn = app.querySelector("[data-action='listing-toggle']");
  if (listingToggleBtn) {
    listingToggleBtn.textContent = state.listingText === sampleListings.join("\n") ? "Clear sample" : "Load sample";
  }
  app.querySelector("#result-summary").textContent = filterSummary(filtered.length, safeState);
  app.querySelector("#marketplace-actions").innerHTML = targetVehicles.length
    ? marketplaceSearchLinks(targetVehicles, safeState).map(sourceButton).join("")
    : `<span>Adjust your filters to find compatible vehicles and unlock marketplace searches.</span>`;
  app.querySelector("#target-grid").innerHTML = targetVehicles.length
    ? targetVehicles.map((vehicle) => searchTargetCard(vehicle, safeState)).join("")
    : `<div class="empty-state">
        <strong>No matching vehicles found.</strong>
        <span>Try adjusting your make, year, or body style, or <button class="empty-state-clear" data-action="clear-filters">clear all filters</button>.</span>
      </div>`;
  if (filtered.length !== state._lastFilteredCount) {
    state.currentPage = 0;
    state._lastFilteredCount = filtered.length;
  }

  const totalPages = Math.ceil(filtered.length / PAGE_SIZE);
  const pageStart = state.currentPage * PAGE_SIZE;
  const pageVehicles = filtered.slice(pageStart, pageStart + PAGE_SIZE);

  app.querySelector("#vehicle-grid").innerHTML = filtered.length
    ? pageVehicles.map((vehicle) => vehicleCard(vehicle, safeState)).join("")
    : `<div class="empty-state">
        <strong>No compatible vehicles match your filters.</strong>
        <span>Try adjusting the make, year, or body style, or <button class="empty-state-clear" data-action="clear-filters">clear all filters</button>.</span>
      </div>`;

  app.querySelector("#pagination").innerHTML = totalPages > 1
    ? renderPagination(state.currentPage, totalPages)
    : "";
  app.querySelector("#listing-count").textContent = `${matchedListings}/${analyzed.length}`;
  app.querySelector("#listing-results").innerHTML = analyzed.map(analysisRow).join("");

  if (lostFocusZone) {
    const zone = app.querySelector(lostFocusZone);
    zone?.querySelector('a, button, [tabindex="0"]')?.focus();
  }

  const qs = stateToParams().toString();
  history.replaceState(null, "", qs ? `?${qs}` : location.pathname);
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

function stateToParams() {
  const p = new URLSearchParams();
  if (state.query)                   p.set("q",        state.query);
  if (state.make !== "All")          p.set("make",     state.make);
  if (state.zip)                     p.set("zip",      state.zip);
  if (state.radius !== "100")        p.set("r",        state.radius);
  if (state.minYear)                 p.set("minYear",  state.minYear);
  if (state.maxPrice)                p.set("maxPrice", state.maxPrice);
  if (state.bodyStyle !== "Any")     p.set("body",     state.bodyStyle);
  if (state.alcFilters.length)       p.set("alc",      state.alcFilters.join(","));
  if (state.accFilters.length)       p.set("acc",      state.accFilters.join(","));
  if (state.supportFilters.length)   p.set("sup",      state.supportFilters.join(","));
  if (state.evOnly)                  p.set("ev",       "1");
  if (state.hybridOnly)              p.set("hybrid",   "1");
  if (state.onlyRecommended)         p.set("fav",      "1");
  return p;
}

function paramsToState() {
  const p = new URLSearchParams(window.location.search);
  if (p.has("q"))        state.query           = p.get("q");
  if (p.has("make"))     state.make            = p.get("make");
  if (p.has("zip"))      state.zip             = p.get("zip");
  if (p.has("r"))        state.radius          = p.get("r");
  if (p.has("minYear"))  state.minYear         = p.get("minYear");
  if (p.has("maxPrice")) state.maxPrice        = p.get("maxPrice");
  if (p.has("body"))     state.bodyStyle       = p.get("body");
  if (p.has("alc"))      state.alcFilters      = p.get("alc").split(",");
  if (p.has("acc"))      state.accFilters      = p.get("acc").split(",");
  if (p.has("sup"))      state.supportFilters  = p.get("sup").split(",");
  if (p.has("ev"))       state.evOnly          = true;
  if (p.has("hybrid"))   state.hybridOnly      = true;
  if (p.has("fav"))      state.onlyRecommended = true;
}

paramsToState();
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
  if (!state.openFilterPanels.includes("advanced")) state.openFilterPanels = [...state.openFilterPanels, "advanced"];
  if (!state.openFilterPanels.includes(group)) state.openFilterPanels = [...state.openFilterPanels, group];
  state[group] = filterElement.checked ? [...state[group], value] : state[group].filter((item) => item !== value);
  renderDynamic();
});

app.addEventListener("click", (event) => {
  const action = event.target.closest("[data-action]")?.dataset.action;
  if (action === "clear-filters") clearFilters();
  if (action === "listing-toggle") handleListingToggle();
  if (action === "goto-page") {
    const page = Number(event.target.closest("[data-page]").dataset.page);
    state.currentPage = page;
    renderDynamic();
    app.querySelector("#vehicle-grid").scrollIntoView({ behavior: "instant", block: "start" });
  }
});

app.addEventListener("toggle", (event) => {
  const panel = event.target.closest("[data-filter-panel]");
  if (!panel) return;
  const group = panel.dataset.filterPanel;
  state.openFilterPanels = panel.open
    ? [...new Set([...state.openFilterPanels, group])]
    : state.openFilterPanels.filter((item) => item !== group);
}, true);
