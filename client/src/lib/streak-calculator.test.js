import { describe, expect, it } from "vitest";
import { format, subDays } from "date-fns";
import { calculateStreakStats } from "./streak-calculator.js";

describe("calculateStreakStats", () => {
  const today = new Date();

  it("handles empty completions gracefully", () => {
    const stats = calculateStreakStats([], 1, "DAILY", today);
    expect(stats.currentStreak).toBe(0);
    expect(stats.longestStreak).toBe(0);
    expect(stats.totalCompletions).toBe(0);
    expect(stats.completionRate).toBe(0);
  });

  it("calculates current and longest streak for daily habits", () => {
    // 3 consecutive days up to today
    const completions = [
      { date: format(today, "yyyy-MM-dd"), completionCount: 1 },
      { date: format(subDays(today, 1), "yyyy-MM-dd"), completionCount: 1 },
      { date: format(subDays(today, 2), "yyyy-MM-dd"), completionCount: 1 },
    ];

    const stats = calculateStreakStats(completions, 1, "DAILY", today);
    expect(stats.currentStreak).toBe(3);
    expect(stats.longestStreak).toBe(3);
    expect(stats.totalCompletions).toBe(3);
    expect(stats.completionRate).toBeGreaterThan(0);
  });

  it("resets current streak when a day is missed for daily habits", () => {
    // Today done, yesterday missed, 2 and 3 days ago done
    const completions = [
      { date: format(today, "yyyy-MM-dd"), completionCount: 1 },
      { date: format(subDays(today, 2), "yyyy-MM-dd"), completionCount: 1 },
      { date: format(subDays(today, 3), "yyyy-MM-dd"), completionCount: 1 },
    ];

    const stats = calculateStreakStats(completions, 1, "DAILY", today);
    expect(stats.currentStreak).toBe(1);
    expect(stats.longestStreak).toBe(2);
    expect(stats.totalCompletions).toBe(3);
  });

  it("handles weekly habits using a 7-day rolling window", () => {
    // Weekly habit target 1: completed 3 days ago
    const completions = [
      { date: format(subDays(today, 3), "yyyy-MM-dd"), completionCount: 1 },
    ];

    const stats = calculateStreakStats(completions, 1, "WEEKLY", today);
    expect(stats.currentStreak).toBeGreaterThan(0);
    expect(stats.totalCompletions).toBe(1);
  });

  it("respects targetCount threshold", () => {
    // Target is 5, but only 3 logged today
    const completions = [
      { date: format(today, "yyyy-MM-dd"), completionCount: 3 },
    ];

    const stats = calculateStreakStats(completions, 5, "DAILY", today);
    expect(stats.currentStreak).toBe(0);
    expect(stats.totalCompletions).toBe(3);
  });
});
