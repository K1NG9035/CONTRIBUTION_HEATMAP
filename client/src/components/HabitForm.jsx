import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { createHabit, updateHabit } from "../api/habits.js";

export function HabitForm({ initial = {} }) {
  const navigate = useNavigate();
  const habitId = initial.id || initial._id;

  const [form, setForm] = useState({
    title: initial.title ?? initial.name ?? "",
    description: initial.description ?? "",
    category: initial.category ?? "Personal",
    frequency: initial.frequency ?? "DAILY",
    targetCount: initial.targetCount ?? 1,
    targetUnit: initial.targetUnit ?? initial.unit ?? "times",
    color: initial.color ?? "#76B852",
  });
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const update = (key, value) => {
    setForm((current) => ({ ...current, [key]: value }));
  };

  async function submit(event) {
    event.preventDefault();
    setError("");
    setLoading(true);

    try {
      if (habitId) {
        await updateHabit(habitId, form);
        navigate(`/habits/${habitId}`);
      } else {
        const savedHabit = await createHabit(form);
        const newId = savedHabit.id || savedHabit._id;
        navigate(`/habits/${newId}/created`);
      }
    } catch (err) {
      setError(err.message || "Please check your inputs and try again.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <form onSubmit={submit} className="panel max-w-2xl p-6 sm:p-8">
      <div className="grid gap-5 sm:grid-cols-2">
        <label className="sm:col-span-2">
          <span className="label">Habit name</span>
          <input
            required
            className="field"
            value={form.title}
            onChange={(e) => update("title", e.target.value)}
            placeholder="Read 20 pages"
          />
        </label>
        <label className="sm:col-span-2">
          <span className="label">Description</span>
          <textarea
            className="field min-h-24 resize-y"
            value={form.description}
            onChange={(e) => update("description", e.target.value)}
            placeholder="A little context for future you"
          />
        </label>
        <label>
          <span className="label">Category</span>
          <input
            className="field"
            value={form.category}
            onChange={(e) => update("category", e.target.value)}
          />
        </label>
        <label>
          <span className="label">Frequency</span>
          <select
            className="field"
            value={form.frequency}
            onChange={(e) => update("frequency", e.target.value)}
          >
            <option value="DAILY">Daily</option>
            <option value="WEEKLY">Weekly</option>
          </select>
        </label>
        <label>
          <span className="label">Target count</span>
          <input
            min="1"
            type="number"
            className="field"
            value={form.targetCount}
            onChange={(e) => update("targetCount", Number(e.target.value))}
          />
        </label>
        <label>
          <span className="label">Unit</span>
          <input
            className="field"
            value={form.targetUnit}
            onChange={(e) => update("targetUnit", e.target.value)}
            placeholder="times"
          />
        </label>
        <label className="flex items-center gap-3">
          <span className="label">Color</span>
          <input
            type="color"
            className="h-11 w-16 cursor-pointer rounded-lg border bg-transparent p-1"
            value={form.color}
            onChange={(e) => update("color", e.target.value)}
          />
        </label>
      </div>

      {error && <p className="mt-4 text-sm font-semibold text-coral">{error}</p>}

      <button className="button-primary mt-7" type="submit" disabled={loading}>
        {loading ? "Saving..." : habitId ? "Save changes" : "Create habit"}
      </button>
    </form>
  );
}
