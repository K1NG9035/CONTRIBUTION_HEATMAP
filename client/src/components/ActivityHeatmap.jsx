import React from "react";
import { format, getDay, startOfMonth } from "date-fns";
import { buildHeatmap } from "../lib/heatmap-utils.js";

const intensityClasses = [
  "bg-black/[.06] dark:bg-white/[.08]",
  "bg-lime/35",
  "bg-lime/65",
  "bg-lime",
];

export function ActivityHeatmap({
  completions = [],
  targetCount = 1,
  year = new Date().getFullYear(),
  title = "Overall activity",
}) {
  const cells = buildHeatmap(completions, targetCount, year, null);
  const months = Array.from({ length: 12 }, (_, index) => format(new Date(2020, index, 1), "MMMM"));

  const monthSections = months.map((monthName, monthIndex) => {
    const monthCells = cells.filter((cell) => cell.date.getMonth() === monthIndex);
    const offset = getDay(startOfMonth(new Date(year, monthIndex, 1)));
    const paddedCells = [...Array(offset).fill(null), ...monthCells];
    const weeks = [];
    paddedCells.forEach((cell, index) => {
      const week = Math.floor(index / 7);
      (weeks[week] ??= []).push(cell);
    });
    return { monthName, monthIndex, weeks };
  });

  return (
    <section className="panel p-5 sm:p-7">
      <div className="mb-6 flex items-end justify-between gap-4">
        <div>
          <p className="label">Consistency map</p>
          <h2 className="mt-1 font-display text-2xl font-bold tracking-tight">{title}</h2>
          <p className="mt-1 text-sm text-muted">Monthly sections across {year}</p>
        </div>
        <span className="text-sm font-bold text-muted">{year}</span>
      </div>

      <div className="heatmap-scroll overflow-x-auto pb-2">
        <div className="min-w-[680px]">
          <div className="flex gap-2">
            <div className="heat-months">
              {monthSections.map(({ monthName, monthIndex, weeks }) => (
                <div className="heat-month" key={monthName}>
                  <span className="heat-month-label">{monthName.slice(0, 3)}</span>
                  <div className="heat-month-columns">
                    {weeks.map((week, weekIndex) => (
                      <div className="flex flex-col gap-1" key={`${monthIndex}-${weekIndex}`}>
                        {Array.from({ length: 7 }, (_, dayIndex) => {
                          const cell = week[dayIndex];
                          const tooltipPosition =
                            monthIndex === 0 && weekIndex < 2
                              ? "heat-tooltip-right"
                              : monthIndex === 11 && weekIndex > weeks.length - 3
                              ? "heat-tooltip-left"
                              : dayIndex < 2
                              ? "heat-tooltip-below"
                              : "heat-tooltip-above";

                          return cell ? (
                            <div className="group relative" key={cell.key}>
                              <div
                                aria-label={cell.tooltip}
                                title={cell.tooltip}
                                className={`heat-cell ${intensityClasses[cell.intensity]}`}
                              />
                              <span role="tooltip" className={`heat-tooltip ${tooltipPosition}`}>
                                <strong>{format(cell.date, "MMM d, yyyy")}</strong>
                                <span className="block">
                                  {cell.count} total contribution{cell.count === 1 ? "" : "s"}
                                </span>
                                {cell.breakdown.map((habit) => (
                                  <span className="block" key={habit.name}>
                                    {habit.name}: {habit.count}
                                  </span>
                                ))}
                              </span>
                            </div>
                          ) : (
                            <div className="heat-cell" key={`empty-${dayIndex}`} />
                          );
                        })}
                      </div>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      <div className="mt-5 flex items-center justify-end gap-2 text-[10px] font-bold uppercase tracking-wider text-muted">
        <span>Less</span>
        {intensityClasses.map((className, index) => (
          <span className={`heat-cell ${className}`} key={index} />
        ))}
        <span>More</span>
      </div>
    </section>
  );
}
