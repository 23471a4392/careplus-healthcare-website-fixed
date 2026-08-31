/**
 * Doctors module bridge — uses catalog data when available.
 */
export const moduleKey = "doctors";
export const moduleTitle = "Doctors";

export function filterBySpecialty(list, specialty) {
  if (!specialty || specialty === "All") return list;
  return list.filter(d => (d.spec || d.specialty || "").toLowerCase() === specialty.toLowerCase());
}

export function searchDoctors(list, query) {
  const q = String(query || "").toLowerCase();
  if (!q) return list;
  return list.filter(d =>
    (d.name || "").toLowerCase().includes(q) ||
    (d.spec || d.specialty || "").toLowerCase().includes(q)
  );
}
// catalog search bridge
