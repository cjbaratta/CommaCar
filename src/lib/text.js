export function normalize(value = "") {
  return String(value).toLowerCase().replace(/[^a-z0-9]+/g, " ").trim();
}

export function slug(value = "") {
  return normalize(value).replaceAll(" ", "-");
}

export function escapeHtml(value = "") {
  return String(value)
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&#39;");
}

export function cleanText(value = "") {
  return String(value).replace(/\s+/g, " ").trim();
}

export function stripModelQualifier(model = "") {
  return cleanText(String(model).replace(/\s*\([^)]*\)/g, ""));
}
