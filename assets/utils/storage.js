/**
 * CarePlus local persistence helpers (demo only — not for real PHI).
 */
const PREFIX = "careplus_";

export function load(key, fallback) {
  try {
    const raw = localStorage.getItem(PREFIX + key);
    if (raw == null) return fallback;
    return JSON.parse(raw);
  } catch {
    return fallback;
  }
}

export function save(key, value) {
  try {
    localStorage.setItem(PREFIX + key, JSON.stringify(value));
    return true;
  } catch {
    return false;
  }
}

export function remove(key) {
  localStorage.removeItem(PREFIX + key);
}

export function exportAll(keys) {
  const out = {};
  keys.forEach(k => { out[k] = load(k, null); });
  return out;
}
