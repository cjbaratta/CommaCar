import { normalize } from "./text.js";
import { usVehicles } from "./vehicles.js";

function scoreVehicle(vehicle, line) {
  const haystack = normalize(line);
  const name = normalize(vehicle.canonicalName);
  const hasMake = haystack.includes(normalize(vehicle.make));
  const modelTokens = normalize(vehicle.marketplaceModel).split(" ").filter(Boolean);
  const modelHit = modelTokens.every((token) => haystack.includes(token));
  const listingYears = [...line.matchAll(/\b(19|20)\d{2}\b/g)].map((match) => Number(match[0]));
  const yearHit = listingYears.length > 0 && vehicle.years.some((year) => listingYears.includes(year));
  const trimHint =
    /adaptive cruise|acc|lane assist|lane keep|lane centering|eyesight|smart cruise|tss|hda|co-pilot|safety sense/i.test(line);

  if (!hasMake || !modelHit) return 0;
  if (listingYears.length > 0 && !yearHit) return 0;
  return 40 + (yearHit ? 40 : 0) + (trimHint ? 15 : 0) + Math.min(name.length, 12);
}

export function analyzeListings(listingText, sourceVehicles = usVehicles) {
  return String(listingText)
    .split(/\n+/)
    .map((line) => line.trim())
    .filter(Boolean)
    .map((line) => {
      const matches = sourceVehicles
        .map((vehicle) => ({ vehicle, score: scoreVehicle(vehicle, line) }))
        .filter((match) => match.score > 0)
        .sort((a, b) => b.score - a.score);
      return { line, matches: matches.slice(0, 3) };
    });
}
