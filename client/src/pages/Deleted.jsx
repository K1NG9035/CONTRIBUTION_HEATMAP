import React from "react";
import { Link, useParams } from "react-router-dom";
import { useHabit } from "../hooks/useHabit.js";
import { TimedStatusScreen } from "../components/TimedStatusScreen.jsx";

export function Deleted() {
  const { id } = useParams();
  const { habit, loading, error, notFound } = useHabit(id);

  if (loading) {
    return (
      <main className="page-shell flex min-h-screen items-center justify-center">
        <p className="label animate-pulse">Archiving habit...</p>
      </main>
    );
  }

  const title = habit ? habit.title : "Habit";
  const habitId = habit ? (habit.id || habit._id) : id;

  return (
    <TimedStatusScreen
      type="deleted"
      title={title}
      destination="/"
      archiveUrl={`/api/habits/${habitId}`}
    />
  );
}
