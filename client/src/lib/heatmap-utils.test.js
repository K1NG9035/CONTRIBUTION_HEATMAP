import { describe, expect, it } from "vitest";
import { format } from "date-fns";
import { buildHeatmap, getHeatmapTooltip, getIntensityBucket } from "./heatmap-utils.js";

describe("heatmap-utils", () => {
  describe("getIntensityBucket", () => {
    it("returns 0 for zero or negative percentages", () => {
      expect(getIntensityBucket(0)).toBe(0);
      expect(getIntensityBucket(-5)).toBe(0);
    });

    it("returns 1 for percentages between 1 and 33", () => {
      expect(getIntensityBucket(1)).toBe(1);
      expect(getIntensityBucket(25)).toBe(1);
      expect(getIntensityBucket(33)).toBe(1);
    });

    it("returns 2 for percentages between 34 and 66", () => {
      expect(getIntensityBucket(34)).toBe(2);
      expect(getIntensityBucket(50)).toBe(2);
      expect(getIntensityBucket(66)).toBe(2);
    });

    it("returns 3 for percentages 67 and above", () => {
      expect(getIntensityBucket(67)).toBe(3);
      expect(getIntensityBucket(100)).toBe(3);
      expect(getIntensityBucket(150)).toBe(3);
    });
  });

  describe("buildHeatmap", () => {
    const today = new Date();
    const todayKey = format(today, "yyyy-MM-dd");

    it("generates an array of cells up to 365 days", () => {
      const cells = buildHeatmap([], 1, today.getFullYear(), null);
      expect(Array.isArray(cells)).toBe(true);
      expect(cells.length).toBeGreaterThan(0);
      expect(cells.length).toBeLessThanOrEqual(366);
    });

    it("maps completions and habit breakdowns to the correct cell", () => {
      const completions = [
        {
          date: todayKey,
          completionCount: 2,
          habitTitle: "Reading",
        },
        {
          date: todayKey,
          completionCount: 1,
          habitTitle: "Running",
        },
      ];

      const cells = buildHeatmap(completions, 3, today.getFullYear(), null);
      const todayCell = cells.find((c) => c.key === todayKey);

      expect(todayCell).toBeDefined();
      expect(todayCell.count).toBe(3);
      expect(todayCell.percentage).toBe(100);
      expect(todayCell.intensity).toBe(3);
      expect(todayCell.breakdown).toHaveLength(2);
      expect(todayCell.breakdown).toEqual([
        { name: "Reading", count: 2 },
        { name: "Running", count: 1 },
      ]);
    });

    it("formats tooltip string accurately", () => {
      const cell = {
        date: new Date(2026, 9, 25),
        key: "2026-10-25",
        count: 4,
        percentage: 100,
        intensity: 3,
        tooltip: "Oct 25, 2026 · 4 contributions · 100%",
        breakdown: [{ name: "Meditation", count: 4 }],
      };

      const tip = getHeatmapTooltip(cell, ["Meditation"]);
      expect(tip).toContain("Oct 25, 2026");
      expect(tip).toContain("4 contributions");
      expect(tip).toContain("Meditation");
    });
  });
});
