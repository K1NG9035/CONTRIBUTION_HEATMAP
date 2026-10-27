import React from "react";
import { Link } from "react-router-dom";
import { ArrowLeft } from "lucide-react";
import { HabitForm } from "../components/HabitForm.jsx";

export function NewHabit() {
  return (
    <main className="page-shell">
      <Link to="/" className="button-secondary">
        <ArrowLeft size={15} /> Dashboard
      </Link>
      <div className="py-12">
        <p className="label">Add to your rhythm</p>
        <h1 className="mt-2 font-display text-4xl font-bold">Create a habit</h1>
        <p className="mt-3 mb-8 text-muted">Make the next good choice easier to see.</p>
        <HabitForm />
      </div>
    </main>
  );
}
