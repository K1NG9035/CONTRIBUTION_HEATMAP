import React, { useState } from "react";
import { Link } from "react-router-dom";
import { Check, ChevronRight, Minus, Plus } from "lucide-react";
import { saveCompletion } from "../api/habits.js";

export function HabitCard({ habit, onCountChange }) {
  const habitId = habit.id || habit._id;
  const [count, setCount] = useState(habit.todayCount ?? 0);
  const [saving, setSaving] = useState(false);

  async function changeCount(next) {
    const nextCount = Math.max(0, next);
    setSaving(true);
    setCount(nextCount);
    if (onCountChange) {
      onCountChange(habitId, nextCount);
    }

    try {
      await saveCompletion(habitId, {
        date: new Date().toISOString(),
        completionCount: nextCount,
      });
    } catch (err) {
      console.error("Failed to update completion count:", err);
      // Revert if error
      setCount(habit.todayCount ?? 0);
    } finally {
      setSaving(false);
    }
  }

  const complete = count >= habit.targetCount;

  return (
    <article
      className={`panel group relative overflow-hidden p-5 transition hover:-translate-y-0.5 ${
        complete ? "ring-2 ring-lime/30" : ""
      }`}
    >
      <div className="absolute inset-y-0 left-0 w-1" style={{ backgroundColor: habit.color }} />
      <div className="flex items-start justify-between gap-4">
        <div className="min-w-0">
          <div className="mb-3 flex items-center gap-2">
            <span className="rounded-full bg-black/[.05] px-2.5 py-1 text-[10px] font-bold uppercase tracking-wider text-muted dark:bg-white/[.08]">
              {habit.category}
            </span>
            {complete && (
              <span className="flex items-center gap-1 text-xs font-bold text-lime">
                <Check size={14} /> Done
              </span>
            )}
          </div>
          <Link
            to={`/habits/${habitId}`}
            className="block truncate font-display text-lg font-bold hover:text-lime"
          >
            {habit.title}
          </Link>
          <p className="mt-1 line-clamp-1 text-sm text-muted">
            {habit.description || `Target ${habit.targetCount} ${habit.targetUnit}`}
          </p>
        </div>
        <Link
          to={`/habits/${habitId}`}
          className="icon-button h-8 w-8 opacity-60 group-hover:opacity-100"
        >
          <ChevronRight size={16} />
        </Link>
      </div>
      <div className="mt-6 flex items-center justify-between">
        <span className="text-xs font-semibold text-muted">
          {count} / {habit.targetCount} {habit.targetUnit}
        </span>
        <div className="flex items-center gap-2">
          <button
            type="button"
            disabled={saving || count === 0}
            aria-label={`Decrease ${habit.title}`}
            className="icon-button h-8 w-8"
            onClick={() => changeCount(count - 1)}
          >
            <Minus size={14} />
          </button>
          <button
            type="button"
            disabled={saving}
            aria-label={`Increase ${habit.title}`}
            className={`icon-button h-8 w-8 ${
              complete ? "bg-lime text-white" : "bg-ink text-paper"
            }`}
            onClick={() => changeCount(count + 1)}
          >
            <Plus size={15} />
          </button>
        </div>
      </div>
    </article>
  );
}
