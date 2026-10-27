import { eachDayOfInterval, endOfDay, format, startOfDay, subDays } from "date-fns";

/**
 * @typedef {Object} HeatmapCompletion
 * @property {Date|string} date
 * @property {number} completionCount
 * @property {string} [habitId]
 * @property {string} [habitTitle]
 */

/**
 * @typedef {Object} HeatmapBreakdown
 * @property {string} name
 * @property {number} count
 */

/**
 * @typedef {Object} HeatmapCell
 * @property {Date} date
 * @property {string} key
 * @property {number} count
 * @property {number} percentage
 * @property {0|1|2|3} intensity
 * @property {string} tooltip
 * @property {HeatmapBreakdown[]} breakdown
 */

/**
 * Returns the intensity bucket index (0..3) based on percentage of target achieved.
 * @param {number} percentage
 * @returns {0|1|2|3}
 */
export function getIntensityBucket(percentage) {
  if (percentage <= 0) return 0;
  if (percentage < 34) return 1;
  if (percentage < 67) return 2;
  return 3;
}

/**
 * Builds an array of HeatmapCell objects covering up to 365 days or a specific month.
 *
 * @param {HeatmapCompletion[]} completions
 * @param {number} [targetCount=1]
 * @param {number} [year=new Date().getFullYear()]
 * @param {number|null} [month]
 * @returns {HeatmapCell[]}
 */
export function buildHeatmap(
  completions = [],
  targetCount = 1,
  year = new Date().getFullYear(),
  month = null
) {
  const today = new Date();
  const selectedMonth = month === null || month === undefined ? null : Math.max(0, Math.min(11, month));
  const monthStart = selectedMonth === null ? new Date(year, 0, 1) : new Date(year, selectedMonth, 1);
  const monthEnd = selectedMonth === null ? new Date(year, 11, 31) : new Date(year, selectedMonth + 1, 0);
  const requestedEnd =
    year === today.getFullYear() && (selectedMonth === null || selectedMonth === today.getMonth())
      ? today
      : monthEnd;
  const end = endOfDay(requestedEnd);
  const start =
    selectedMonth === null
      ? startOfDay(new Date(Math.max(monthStart.getTime(), subDays(end, 364).getTime())))
      : startOfDay(monthStart);

  const totals = new Map();
  const breakdowns = new Map();

  completions.forEach((completion) => {
    const key = format(new Date(completion.date), "yyyy-MM-dd");
    totals.set(key, (totals.get(key) ?? 0) + completion.completionCount);

    const habitsForDay = breakdowns.get(key) ?? new Map();
    const habitName = completion.habitTitle ?? "Habit";
    habitsForDay.set(habitName, (habitsForDay.get(habitName) ?? 0) + completion.completionCount);
    breakdowns.set(key, habitsForDay);
  });

  return eachDayOfInterval({ start, end }).map((date) => {
    const key = format(date, "yyyy-MM-dd");
    const count = totals.get(key) ?? 0;
    const percentage = Math.round((count / Math.max(1, targetCount)) * 100);
    const breakdown = Array.from(breakdowns.get(key) ?? [], ([name, habitCount]) => ({
      name,
      count: habitCount,
    }));

    return {
      date,
      key,
      count,
      percentage,
      intensity: getIntensityBucket(percentage),
      tooltip: `${format(date, "MMM d, yyyy")} · ${count} contribution${
        count === 1 ? "" : "s"
      } · ${percentage}%`,
      breakdown,
    };
  });
}

/**
 * Formats a tooltip label string with optional habit breakdown.
 * @param {HeatmapCell} cell
 * @param {string[]} [habits=[]]
 * @returns {string}
 */
export function getHeatmapTooltip(cell, habits = []) {
  return `${cell.tooltip}${habits.length ? `\n${habits.join(", ")}` : ""}`;
}
