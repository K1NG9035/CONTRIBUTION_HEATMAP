import React from "react";
import { format, subDays } from "date-fns";

export function ConsistencyCharts({ completions = [], targetCount = 1 }) {
  const totals = (length) =>
    Array.from({ length }, (_, index) => {
      const day = subDays(new Date(), length - index - 1);
      const key = format(day, "yyyy-MM-dd");
      return completions
        .filter((completion) => format(new Date(completion.date), "yyyy-MM-dd") === key)
        .reduce((sum, completion) => sum + completion.completionCount, 0);
    });

  const weekly = totals(7);
  const monthly = totals(30);
  const max = Math.max(targetCount, ...monthly);

  return (
    <section className="mt-8 grid gap-8 lg:grid-cols-2">
      <Chart
        title="This week"
        values={weekly}
        target={targetCount}
        labels={weekly.map((_, index) => format(subDays(new Date(), 6 - index), "EEE").slice(0, 1))}
      />
      <Chart
        title="Last 30 days"
        values={monthly}
        target={targetCount}
        labels={monthly.map((_, index) =>
          index % 5 === 0 ? format(subDays(new Date(), 29 - index), "d") : ""
        )}
        max={max}
      />
    </section>
  );
}

function Chart({ title, values, labels, target, max = Math.max(target, ...values) }) {
  return (
    <div className="panel p-6">
      <div className="flex items-end justify-between">
        <div>
          <p className="label">Consistency</p>
          <h2 className="mt-1 font-display text-xl font-bold">{title}</h2>
        </div>
        <span className="text-xs text-muted">Target {target}</span>
      </div>
      <div className="mt-7 flex h-32 items-end gap-1.5 sm:gap-2">
        {values.map((value, index) => (
          <div className="flex h-full flex-1 flex-col justify-end gap-2" key={index}>
            <div
              title={`${value} completion${value === 1 ? "" : "s"}`}
              className="w-full rounded-t-sm bg-lime/80 transition hover:bg-lime"
              style={{
                height: `${Math.max(value ? 8 : 2, (value / Math.max(1, max)) * 100)}%`,
              }}
            />
            <span className="h-3 text-center text-[9px] font-bold text-muted">
              {labels[index]}
            </span>
          </div>
        ))}
      </div>
    </div>
  );
}
