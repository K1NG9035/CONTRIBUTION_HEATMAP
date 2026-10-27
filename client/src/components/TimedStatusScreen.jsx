import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { Check, CircleCheck, Sparkles, Trash2 } from "lucide-react";

export function TimedStatusScreen({ type, title, destination, archiveUrl }) {
  const navigate = useNavigate();
  const [seconds, setSeconds] = useState(10);
  const [error, setError] = useState("");

  useEffect(() => {
    let cancelled = false;

    if (archiveUrl) {
      fetch(archiveUrl, { method: "POST" })
        .then((response) => {
          if (!response.ok && !cancelled) {
            setError("The habit could not be archived.");
          }
        })
        .catch(() => {
          if (!cancelled) {
            setError("The habit could not be archived.");
          }
        });
    }

    const timer = window.setInterval(() => {
      setSeconds((current) => {
        if (current <= 1) {
          window.clearInterval(timer);
          navigate(destination, { replace: true });
          return 0;
        }
        return current - 1;
      });
    }, 1000);

    return () => {
      cancelled = true;
      window.clearInterval(timer);
    };
  }, [archiveUrl, destination, navigate]);

  const deleted = type === "deleted";

  return (
    <main className="page-shell flex min-h-screen items-center justify-center">
      <section className="panel w-full max-w-xl px-6 py-12 text-center sm:px-12">
        <div
          className={`mx-auto flex h-20 w-20 items-center justify-center rounded-full ${
            deleted ? "bg-coral/15 text-coral" : "bg-lime/15 text-lime"
          }`}
        >
          {deleted ? <Trash2 size={34} /> : <Sparkles size={34} />}
        </div>
        <p className="label mt-8">{deleted ? "Habit deleted" : "Habit created"}</p>
        <h1 className="mt-3 font-display text-3xl font-bold tracking-tight sm:text-4xl">
          {deleted ? `${title} was removed.` : `${title} is ready.`}
        </h1>
        <p className="mx-auto mt-4 max-w-sm text-sm leading-6 text-muted">
          {deleted
            ? "Your dashboard will open shortly."
            : "Your new rhythm has been saved. Your habit page will open shortly."}
        </p>
        <div className="mx-auto mt-8 flex h-20 w-20 items-center justify-center rounded-full border-4 border-lime/20 font-display text-3xl font-bold text-lime">
          {seconds}
        </div>
        <button
          type="button"
          aria-label="Continue now"
          className="button-primary mt-8"
          onClick={() => navigate(destination, { replace: true })}
        >
          <Check size={18} /> Continue now
        </button>
        {error && <p className="mt-4 text-sm font-semibold text-coral">{error}</p>}
        <div className="mt-6 flex items-center justify-center gap-2 text-xs text-muted">
          <CircleCheck size={14} /> Automatic navigation in {seconds} seconds
        </div>
      </section>
    </main>
  );
}
