import React from "react";
import { Link, useParams } from "react-router-dom";
import { ArrowLeft } from "lucide-react";
import { useHabit } from "../hooks/useHabit.js";
import { HabitForm } from "../components/HabitForm.jsx";

export function EditHabit() {
  const { id } = useParams();
  const { habit, loading, error, notFound } = useHabit(id);

  if (loading) {
    return (
      <main className="page-shell">
        <Link to="/" className="button-secondary">
          <ArrowLeft size={15} /> Dashboard
        </Link>
        <div className="py-24 text-center">
          <p className="label animate-pulse">Loading habit...</p>
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

  return (
    <main className="page-shell">
      <Link to={`/habits/${id}`} className="button-secondary">
        <ArrowLeft size={15} /> Back to Habit
      </Link>
      <div className="py-12">
        <p className="label">Tune your rhythm</p>
        <h1 className="mt-2 mb-8 font-display text-4xl font-bold">Edit habit</h1>
        <HabitForm initial={habit} />
      </div>
    </main>
  );
}
