export function sanitizeNumeric(value, { min = 0, max = Number.MAX_SAFE_INTEGER, fallback = "" } = {}) {
  const digits = String(value ?? "").replace(/\D+/g, "");
  if (!digits) return fallback;
  const number = Number(digits);
  if (!Number.isSafeInteger(number)) return fallback;
  return String(Math.min(Math.max(number, min), max));
}

export function normalizedState(state) {
  return {
    ...state,
    zip: (() => { const n = sanitizeNumeric(state.zip, { min: 1, max: 99999, fallback: "" }); return n ? n.padStart(5, "0").slice(-5) : ""; })(),
    radius: sanitizeNumeric(state.radius, { min: 10, max: 500, fallback: "100" }),
    minYear: sanitizeNumeric(state.minYear, { min: 1990, max: 2035, fallback: "" }),
    maxPrice: sanitizeNumeric(state.maxPrice, { min: 500, max: 500000, fallback: "" }),
  };
}

export function updateInputValue(state, key, value) {
  if (["zip", "radius", "minYear", "maxPrice"].includes(key)) {
    return { ...state, [key]: String(value ?? "").replace(/\D+/g, "") };
  }

  return { ...state, [key]: value };
}
