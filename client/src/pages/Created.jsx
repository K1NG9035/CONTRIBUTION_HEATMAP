import React from "react";
import { Link, useParams } from "react-router-dom";
import { ArrowLeft } from "lucide-react";
import { useHabit } from "../hooks/useHabit.js";
import { TimedStatusScreen } from "../components/TimedStatusScreen.jsx";

export function Created() {
  const { id } = useParams();
  const { habit, loading, error, notFound } = useHabit(id);

  if (loading) {
    return (
      <main className="page-shell flex min-h-screen items-center justify-center">
        <p className="label animate-pulse">Setting up your rhythm...</p>
      </main>
    );
  }

  if (notFound || !habit) {
    return (
      <main className="page-shell flex min-h-screen items-center justify-center">
        <div className="panel p-8 text-center">
          <p className="font-display text-lg font-bold">Habit created</p>
          <Link to="/" className="button-primary mt-5">
            Go to Dashboard
          </Link>
        </div>
      </main>
    );
  }

  const habitId = habit.id || habit._id;

  return (
    <TimedStatusScreen
      type="created"
      title={habit.title}
      destination={`/habits/${habitId}`}
    />
  );
}
