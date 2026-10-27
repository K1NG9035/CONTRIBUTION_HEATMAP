import { differenceInCalendarDays, format, startOfDay, subDays } from "date-fns";

/**
 * @typedef {Object} CompletionLike
 * @property {Date|string} date
 * @property {number} completionCount
 */

/**
 * @typedef {Object} StreakStats
 * @property {number} currentStreak
 * @property {number} longestStreak
 * @property {number} totalCompletions
 * @property {number} completionRate
 */

function dateKey(date) {
  return format(new Date(date), "yyyy-MM-dd");
}

/**
 * Calculates current streak, longest streak, total completions, and completion rate.
 * Weekly habits stay active through a seven-day rolling window, while daily habits require every day.
 *
 * @param {CompletionLike[]} completions
 * @param {number} targetCount
 * @param {"DAILY"|"WEEKLY"|"daily"|"weekly"} frequency
 * @param {Date} [fromDate=new Date()]
 * @returns {StreakStats}
 */
export function calculateStreakStats(
  completions = [],
  targetCount = 1,
  frequency = "DAILY",
  fromDate = new Date()
) {
  const normFreq = String(frequency).toUpperCase();
  const byDate = new Map(completions.map((item) => [dateKey(item.date), item.completionCount]));
  const totalCompletions = completions.reduce((sum, item) => sum + item.completionCount, 0);
  const end = startOfDay(fromDate);

  const timestamps = completions.map((item) => new Date(item.date).getTime());
  const earliestDate = timestamps.length > 0 ? new Date(Math.min(...timestamps)) : end;
  const daysTracked = Math.max(1, differenceInCalendarDays(end, startOfDay(earliestDate))) + 1;

  const qualifies = (day) => {
    if (normFreq === "DAILY") {
      return (byDate.get(format(day, "yyyy-MM-dd")) ?? 0) >= targetCount;
    }
    return (
      Array.from({ length: 7 }, (_, index) => byDate.get(format(subDays(day, index), "yyyy-MM-dd")) ?? 0).reduce(
        (sum, count) => sum + count,
        0
      ) >= targetCount
    );
  };

  let currentStreak = 0;
  for (let cursor = end; qualifies(cursor); cursor = subDays(cursor, 1)) {
    currentStreak += 1;
    if (currentStreak > 366) break;
  }

  let longestStreak = 0;
  let run = 0;
  for (let index = daysTracked - 1; index >= 0; index -= 1) {
    const day = subDays(end, index);
    if (qualifies(day)) {
      run += 1;
      longestStreak = Math.max(longestStreak, run);
    } else {
      run = 0;
    }
  }

  const requiredUnits =
    normFreq === "DAILY" ? daysTracked * targetCount : Math.ceil(daysTracked / 7) * targetCount;

  return {
    currentStreak,
    longestStreak,
    totalCompletions,
    completionRate: Math.min(100, Math.round((totalCompletions / Math.max(1, requiredUnits)) * 100)),
  };
}
