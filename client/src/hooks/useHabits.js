import { useCallback, useEffect, useState } from "react";
import { fetchHabits } from "../api/habits.js";

/**
 * Custom hook to load and manage list of habits.
 */
export function useHabits() {
  const [habits, setHabits] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const load = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const data = await fetchHabits();
      setHabits(data || []);
    } catch (err) {
      setError(err.message || "Failed to load habits");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    load();
  }, [load]);

  return { habits, loading, error, refetch: load, setHabits };
}
