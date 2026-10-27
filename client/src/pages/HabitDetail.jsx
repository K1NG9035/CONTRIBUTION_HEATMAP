import React from "react";
import { Link, useParams } from "react-router-dom";
import { ArrowLeft, Edit3, Flame, Target, Trash2 } from "lucide-react";
import { format } from "date-fns";
import { useHabit } from "../hooks/useHabit.js";
import { calculateStreakStats } from "../lib/streak-calculator.js";
import { ActivityHeatmap } from "../components/ActivityHeatmap.jsx";
import { ConsistencyCharts } from "../components/ConsistencyCharts.jsx";

export function HabitDetail() {
  const { id } = useParams();
  const { habit, loading, error, notFound } = useHabit(id);

  if (loading) {
    return (
      <main className="page-shell">
        <Link to="/" className="button-secondary">
          <ArrowLeft size={15} /> Dashboard
        </Link>
        <div className="py-24 text-center">
          <p className="label animate-pulse">Loading habit details...</p>
        </div>
      </main>
    );
  }

  if (notFound || !habit) {
    return (
      <main className="page-shell">
        <Link to="/" className="button-secondary">
          <ArrowLeft size={15} /> Dashboard
        </Link>
        <div className="panel my-12 p-8 text-center sm:col-span-2">
          <p className="font-display text-xl font-bold">Habit not found</p>
          <p className="mt-2 text-sm text-muted">This habit may have been removed or does not exist.</p>
          <Link to="/" className="button-primary mt-5">
            Back to Dashboard
          </Link>
        </div>
      </main>
    );
  }

  if (error) {
    return (
      <main className="page-shell">
        <Link to="/" className="button-secondary">
          <ArrowLeft size={15} /> Dashboard
        </Link>
        <div className="panel my-12 p-8 text-center">
          <p className="font-display text-lg font-bold text-coral">Failed to load habit</p>
          <p className="mt-2 text-sm text-muted">{error.message || String(error)}</p>
        </div>
      </main>
    );
  }

  const habitId = habit.id || habit._id;
  const completions = habit.completions || [];
  const stats = calculateStreakStats(completions, habit.targetCount, habit.frequency);

  return (
    <main className="page-shell">
      <header className="flex items-center justify-between">
        <Link to="/" className="button-secondary">
          <ArrowLeft size={15} /> Dashboard
        </Link>
        <div className="flex gap-2">
          <Link
            to={`/habits/${habitId}/edit`}
            className="icon-button"
            aria-label="Edit habit"
          >
            <Edit3 size={16} />
          </Link>
          <Link
            to={`/habits/${habitId}/delete`}
            className="icon-button text-coral"
            aria-label="Delete habit"
          >
            <Trash2 size={16} />
          </Link>
        </div>
      </header>

      <section className="py-12">
        <div className="mb-5 flex items-center gap-3">
          <span className="h-4 w-4 rounded-full" style={{ backgroundColor: habit.color }} />
          <span className="label">
            {habit.category} · {habit.frequency === "WEEKLY" ? "Weekly" : "Daily"}
          </span>
        </div>
        <h1 className="font-display text-4xl font-bold sm:text-6xl">{habit.title}</h1>
        <p className="mt-4 max-w-xl text-muted">
          {habit.description || `A ${habit.targetCount} ${habit.targetUnit} practice.`}
        </p>
      </section>

      <div className="mb-8 grid gap-4 sm:grid-cols-4">
        <Stat
          icon={<Flame size={17} />}
          value={String(stats.currentStreak)}
          label="Current streak"
        />
        <Stat
          icon={<Flame size={17} />}
          value={String(stats.longestStreak)}
          label="Longest streak"
        />
        <Stat
          icon={<Target size={17} />}
          value={String(stats.totalCompletions)}
          label="Completions"
        />
        <Stat
          icon={<Target size={17} />}
          value={`${stats.completionRate}%`}
          label="Completion rate"
        />
      </div>

      <ActivityHeatmap
        completions={completions}
        targetCount={habit.targetCount}
        title={`${habit.title} activity`}
      />

      <ConsistencyCharts completions={completions} targetCount={habit.targetCount} />

      <section className="mt-8 panel p-6">
        <p className="label">Habit details</p>
        <div className="mt-4 grid gap-4 text-sm sm:grid-cols-3">
          <div>
            <span className="text-muted">Target</span>
            <p className="mt-1 font-bold">
              {habit.targetCount} {habit.targetUnit}
            </p>
          </div>
          <div>
            <span className="text-muted">Started</span>
            <p className="mt-1 font-bold">
              {habit.createdAt ? format(new Date(habit.createdAt), "MMM d, yyyy") : "Recently"}
            </p>
          </div>
          <div>
            <span className="text-muted">Tracked days</span>
            <p className="mt-1 font-bold">{completions.length}</p>
          </div>
        </div>
      </section>
    </main>
  );
}

function Stat({ icon, value, label }) {
  return (
    <div className="panel p-5">
      <span className="text-lime">{icon}</span>
      <p className="mt-3 font-display text-2xl font-bold">{value}</p>
      <p className="text-xs font-bold uppercase tracking-wider text-muted">{label}</p>
    </div>
  );
}
