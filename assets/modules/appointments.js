/**
 * Appointments module helpers.
 */
export const moduleKey = "appointments";
export const moduleTitle = "Appointments";

export function sortByDate(rows) {
  return [...rows].sort((a, b) => String(a[2] || a.date || "").localeCompare(String(b[2] || b.date || "")));
}

export function statusCounts(rows) {
  const counts = { Confirmed: 0, Pending: 0, Cancelled: 0, Completed: 0 };
  rows.forEach(r => {
    const s = Array.isArray(r) ? r[4] : r.status;
    if (counts[s] != null) counts[s]++;
    else counts[s] = 1;
  });
  return counts;
}
