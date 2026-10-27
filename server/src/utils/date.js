import { format, isValid } from "date-fns";

/**
 * Normalizes any date representation (string, timestamp, Date) to the start of day (00:00:00.000).
 * Handles YYYY-MM-DD calendar strings by creating UTC midnight, or uses local midnight for general dates.
 * To ensure consistency across client and server environments, normalized dates are anchored to UTC midnight.
 *
 * @param {string|number|Date} [dateInput]
 * @returns {Date} Normalized Date instance at UTC midnight
 */
export function normalizeDate(dateInput) {
  if (!dateInput) {
    const now = new Date();
    return new Date(Date.UTC(now.getFullYear(), now.getMonth(), now.getDate(), 0, 0, 0, 0));
  }

  if (typeof dateInput === "string") {
    const trimmed = dateInput.trim();
    // YYYY-MM-DD string
    if (/^\d{4}-\d{2}-\d{2}$/.test(trimmed)) {
      const [year, month, day] = trimmed.split("-").map(Number);
      return new Date(Date.UTC(year, month - 1, day, 0, 0, 0, 0));
    }
  }

  const d = new Date(dateInput);
  if (!isValid(d)) {
    throw new Error("Invalid date parameter");
  }

  return new Date(Date.UTC(d.getUTCFullYear(), d.getUTCMonth(), d.getUTCDate(), 0, 0, 0, 0));
}

/**
 * Returns a YYYY-MM-DD key for a given date.
 * @param {Date|string|number} date
 * @returns {string}
 */
export function dateKey(date) {
  const d = new Date(date);
  return format(d, "yyyy-MM-dd");
}
