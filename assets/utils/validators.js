/**
 * Form and clinical demo validators for CarePlus.
 */
export function required(v) {
  return v != null && String(v).trim().length > 0;
}

export function isEmail(v) {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(String(v || "").trim());
}

export function isPhone(v) {
  const d = String(v || "").replace(/\D/g, "");
  return d.length >= 10 && d.length <= 15;
}

export function isDate(v) {
  return /^\d{4}-\d{2}-\d{2}$/.test(String(v || ""));
}

export function validateAppointment(payload) {
  const errors = {};
  if (!required(payload.doctor)) errors.doctor = "Doctor is required";
  if (!required(payload.date)) errors.date = "Date is required";
  if (!required(payload.time)) errors.time = "Time is required";
  return errors;
}

export function validateProfile(payload) {
  const errors = {};
  if (!required(payload.name)) errors.name = "Name is required";
  if (payload.email && !isEmail(payload.email)) errors.email = "Invalid email";
  if (payload.phone && !isPhone(payload.phone)) errors.phone = "Invalid phone";
  return errors;
}
