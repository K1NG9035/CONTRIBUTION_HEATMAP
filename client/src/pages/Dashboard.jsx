import React, { useMemo } from "react";
import { Link } from "react-router-dom";
import { ArrowUpRight, CalendarDays, Flame, Plus, Target } from "lucide-react";
import { format } from "date-fns";
import { useHabits } from "../hooks/useHabits.js";
import { ActivityHeatmap } from "../components/ActivityHeatmap.jsx";
import { HabitCard } from "../components/HabitCard.jsx";
import { ThemeToggle } from "../components/ThemeToggle.jsx";

export function Dashboard() {
  const { habits, loading, error, refetch, setHabits } = useHabits();

  const today = format(new Date(), "yyyy-MM-dd");

  const handleCountChange = (habitId, newCount) => {
    setHabits((prevHabits) =>
      prevHabits.map((habit) => {
        const id = habit.id || habit._id;
        if (id !== habitId) return habit;

        const completions = [...(habit.completions || [])];
        const existingIndex = completions.findIndex(
          (c) => format(new Date(c.date), "yyyy-MM-dd") === today
        );

        if (newCount === 0) {
          if (existingIndex >= 0) completions.splice(existingIndex, 1);
        } else if (existingIndex >= 0) {
          completions[existingIndex] = {
            ...completions[existingIndex],
            completionCount: newCount,
          };
        } else {
          completions.push({
            date: new Date().toISOString(),
            completionCount: newCount,
            habitId,
          });
        }

        return { ...habit, completions };
      })
    );
  };

  const { todayDone, allCompletions, total, targetTotal } = useMemo(() => {
    let done = 0;
    const comps = [];
    let tot = 0;
    let targetSum = 0;

    habits.forEach((habit) => {
      targetSum += habit.targetCount || 1;
      const habitComps = habit.completions || [];
      const todayComp = habitComps.find(
        (item) => format(new Date(item.date), "yyyy-MM-dd") === today
      );
      if ((todayComp?.completionCount ?? 0) >= habit.targetCount) {
        done += 1;
      }

      habitComps.forEach((comp) => {
        tot += comp.completionCount;
        comps.push({
          ...comp,
          habitId: habit.id || habit._id,
          habitTitle: habit.title,
        });
      });
    });

    return {
      todayDone: done,
      allCompletions: comps,
      total: tot,
      targetTotal: Math.max(1, targetSum),
    };
  }, [habits, today]);

  if (loading) {
    return (
      <main className="page-shell">
        <header className="flex items-center justify-between border-b pb-5">
          <Link to="/" className="flex items-center gap-2 font-display text-xl font-bold">
            <span className="flex h-8 w-8 items-center justify-center rounded-lg bg-lime text-white">
              G
            </span>
            GreenStreak
          </Link>
          <div className="flex items-center gap-3">
            <ThemeToggle />
          </div>
        </header>
        <div className="py-24 text-center">
          <p className="label animate-pulse">Loading habits...</p>
        </div>
      </main>
    );
  }

  if (error) {
    return (
      <main className="page-shell">
        <header className="flex items-center justify-between border-b pb-5">
          <Link to="/" className="flex items-center gap-2 font-display text-xl font-bold">
            <span className="flex h-8 w-8 items-center justify-center rounded-lg bg-lime text-white">
              G
            </span>
            GreenStreak
          </Link>
          <div className="flex items-center gap-3">
            <ThemeToggle />
          </div>
        </header>
        <div className="panel my-12 p-8 text-center sm:col-span-2">
          <p className="font-display text-lg font-bold text-coral">Failed to load habits</p>
          <p className="mt-2 text-sm text-muted">{error}</p>
          <button className="button-secondary mt-5" onClick={refetch}>
            Try again
          </button>
        </div>
      </main>
    );
  }

  return (
    <main className="page-shell">
      <header className="flex items-center justify-between border-b pb-5">
        <Link to="/" className="flex items-center gap-2 font-display text-xl font-bold">
          <span className="flex h-8 w-8 items-center justify-center rounded-lg bg-lime text-white">
            G
          </span>
          GreenStreak
        </Link>
        <div className="flex items-center gap-3">
          <ThemeToggle />
          <Link to="/habits/new" className="button-primary">
            <Plus size={17} /> <span className="hidden sm:inline">New habit</span>
          </Link>
        </div>
      </header>

      <section className="relative overflow-hidden py-12 sm:py-16">
        <div className="absolute -right-20 -top-20 h-64 w-64 rounded-full bg-lime/10 blur-3xl" />
        <p className="label">{format(new Date(), "EEEE, MMMM d")}</p>
        <h1 className="mt-3 max-w-2xl font-display text-4xl font-bold tracking-tight sm:text-6xl">
          Small actions.
          <br />
          <span className="text-lime">Visible progress.</span>
        </h1>
        <p className="mt-5 max-w-lg text-base leading-7 text-muted">
          A calm place to keep promises to yourself, one checked box at a time.
        </p>
      </section>

      <section className="mb-10 grid gap-4 sm:grid-cols-3">
        <Stat
          icon={<Target size={18} />}
          value={`${todayDone}/${habits.length}`}
          label="Today complete"
        />
        <Stat icon={<Flame size={18} />} value={String(total)} label="Total completions" />
        <Stat
          icon={<CalendarDays size={18} />}
          value={habits.length ? `${Math.round((todayDone / habits.length) * 100)}%` : "0%"}
          label="Daily rhythm"
        />
      </section>

      <section className="mb-10">
        <ActivityHeatmap completions={allCompletions} targetCount={targetTotal} />
      </section>

      <section>
        <div className="mb-4 flex items-end justify-between">
          <div>
            <p className="label">Today’s focus</p>
            <h2 className="mt-1 font-display text-2xl font-bold">Your habits</h2>
          </div>
          <span className="text-sm text-muted">{habits.length} active</span>
        </div>

        <div className="grid gap-4 sm:grid-cols-2">
          {habits.length ? (
            habits.map((habit) => {
              const habitId = habit.id || habit._id;
              const todayCount =
                (habit.completions || []).find(
                  (item) => format(new Date(item.date), "yyyy-MM-dd") === today
                )?.completionCount ?? 0;

              return (
                <HabitCard
                  key={habitId}
                  habit={{
                    ...habit,
                    todayCount,
                  }}
                  onCountChange={handleCountChange}
                />
              );
            })
          ) : (
            <div className="panel p-8 text-center sm:col-span-2">
              <p className="font-display text-lg font-bold">Your first streak starts here.</p>
              <Link to="/habits/new" className="button-primary mt-5">
                <Plus size={16} /> Create a habit
              </Link>
            </div>
          )}
        </div>
      </section>

      <footer className="mt-12 flex justify-between border-t pt-5 text-xs text-muted">
        <span>Built for the long game.</span>
        <span>
          {habits.length ? (
            <Link
              className="inline-flex items-center gap-1 hover:text-ink"
              to={`/habits/${habits[0].id || habits[0]._id}`}
            >
              Explore analytics <ArrowUpRight size={13} />
            </Link>
          ) : (
            "Start your rhythm"
          )}
        </span>
      </footer>
    </main>
  );
}

function Stat({ icon, value, label }) {
  return (
    <div className="panel flex items-center gap-4 p-5">
      <span className="flex h-10 w-10 items-center justify-center rounded-full bg-lime/15 text-lime">
        {icon}
      </span>
      <div>
        <p className="font-display text-2xl font-bold">{value}</p>
        <p className="text-xs font-semibold uppercase tracking-wider text-muted">{label}</p>
      </div>
    </div>
  );
}
