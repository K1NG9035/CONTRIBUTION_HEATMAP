import { useCallback, useEffect, useState } from "react";
import { fetchHabit } from "../api/habits.js";

/**
 * Custom hook to load and manage a single habit by ID.
 * @param {string} id
 */
export function useHabit(id) {
  const [habit, setHabit] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const load = useCallback(async () => {
    if (!id) return;
    setLoading(true);
    setError(null);
    try {
      const data = await fetchHabit(id);
      setHabit(data);
    } catch (err) {
      setError(err);
    } finally {
      setLoading(false);
    }
  }, [id]);

  useEffect(() => {
    load();
  }, [load]);

  const notFound = error?.status === 404;

  return { habit, loading, error, notFound, refetch: load, setHabit };
}
