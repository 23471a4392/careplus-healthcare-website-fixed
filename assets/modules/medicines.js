/**
 * Medicines module helpers.
 */
export const moduleKey = "medicines";
export const moduleTitle = "Medicines";

export function dueSoon(list, days = 7) {
  // Demo: return last N entries as "due soon"
  return list.slice(0, Math.min(days, list.length));
}
