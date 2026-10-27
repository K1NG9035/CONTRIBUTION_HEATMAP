/**
 * Central API client wrapper for GreenStreak REST endpoints.
 */

async function handleResponse(response) {
  if (!response.ok) {
    let errorMessage = `HTTP error ${response.status}`;
    try {
      const data = await response.json();
      if (data && data.error) errorMessage = data.error;
    } catch {
      // ignore JSON parse error
    }
    const error = new Error(errorMessage);
    error.status = response.status;
    throw error;
  }
  return response.json();
}

/**
 * List all active habits with their completions.
 * @returns {Promise<Array>}
 */
export async function fetchHabits() {
  const response = await fetch("/api/habits");
  return handleResponse(response);
}

/**
 * Fetch a single habit by ID with completions.
 * @param {string} id
 * @returns {Promise<Object>}
 */
export async function fetchHabit(id) {
  const response = await fetch(`/api/habits/${id}`);
  return handleResponse(response);
}

/**
 * Create a new habit.
 * @param {Object} habitData
 * @returns {Promise<Object>}
 */
export async function createHabit(habitData) {
  const response = await fetch("/api/habits", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(habitData),
  });
  return handleResponse(response);
}

/**
 * Update an existing habit.
 * @param {string} id
 * @param {Object} habitData
 * @returns {Promise<Object>}
 */
export async function updateHabit(id, habitData) {
  const response = await fetch(`/api/habits/${id}`, {
    method: "PATCH",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(habitData),
  });
  return handleResponse(response);
}

/**
 * Permanently delete a habit.
 * @param {string} id
 * @returns {Promise<Object>}
 */
export async function deleteHabit(id) {
  const response = await fetch(`/api/habits/${id}`, {
    method: "DELETE",
  });
  return handleResponse(response);
}

/**
 * Archive a habit.
 * @param {string} id
 * @returns {Promise<Object>}
 */
export async function archiveHabit(id) {
  const response = await fetch(`/api/habits/${id}`, {
    method: "POST",
  });
  return handleResponse(response);
}

/**
 * Upsert or remove a completion for a habit on a given date.
 * If completionCount is 0, the record is removed.
 * @param {string} id
 * @param {{ date: string|Date, completionCount: number }} payload
 * @returns {Promise<Object>}
 */
export async function saveCompletion(id, payload) {
  const response = await fetch(`/api/habits/${id}/completions`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(payload),
  });
  return handleResponse(response);
}
