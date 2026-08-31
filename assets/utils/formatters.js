/**
 * Display formatters for CarePlus UI.
 */
export function formatCurrency(n, currency = "INR") {
  const num = Number(n);
  if (Number.isNaN(num)) return String(n);
  return new Intl.NumberFormat("en-IN", { style: "currency", currency, maximumFractionDigits: 0 }).format(num);
}

export function formatDate(iso) {
  if (!iso) return "";
  try {
    return new Date(iso).toLocaleDateString("en-IN", { year: "numeric", month: "short", day: "numeric" });
  } catch {
    return String(iso);
  }
}

export function formatStatus(status) {
  const map = {
    Confirmed: "success",
    Pending: "warning",
    Cancelled: "danger",
    Completed: "success"
  };
  return map[status] || "default";
}

export function truncate(s, max = 48) {
  const t = String(s || "");
  return t.length <= max ? t : t.slice(0, max - 1) + "…";
}
