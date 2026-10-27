import { Habit } from "../models/Habit.js";
import { HabitCompletion } from "../models/HabitCompletion.js";

/**
 * GET /api/habits
 * List all active (non-archived) habits for the current user, including their completions.
 */
export async function getHabits(req, res, next) {
  try {
    const habits = await Habit.find({
      userId: req.user._id,
      archived: false,
    })
      .sort({ createdAt: 1 })
      .populate({
        path: "completions",
        options: { sort: { date: 1 } },
      });

    // Ensure every habit returns a completions array (even if empty)
    const formatted = habits.map((h) => {
      const obj = h.toJSON();
      obj.completions = obj.completions || [];
      return obj;
    });

    return res.status(200).json(formatted);
  } catch (error) {
    next(error);
  }
}

/**
 * POST /api/habits
 * Create a new habit for the current user.
 */
export async function createHabit(req, res, next) {
  try {
    const { title, name, description, category, frequency, targetCount, targetUnit, unit, color } =
      req.body;

    const habitTitle = (title || name || "").trim();
    if (!habitTitle) {
      return res.status(400).json({ error: "Title is required" });
    }

    const normFreq = String(frequency || "DAILY").toUpperCase() === "WEEKLY" ? "WEEKLY" : "DAILY";
    const count = Math.max(1, Number(targetCount) || 1);

    const habit = await Habit.create({
      userId: req.user._id,
      title: habitTitle,
      description: (description ?? "").trim(),
      category: (category ?? "Personal").trim(),
      frequency: normFreq,
      targetCount: count,
      targetUnit: (targetUnit ?? unit ?? "times").trim(),
      color: (color ?? "#76B852").trim(),
      archived: false,
    });

    const result = habit.toJSON();
    result.completions = [];

    return res.status(201).json(result);
  } catch (error) {
    next(error);
  }
}

/**
 * GET /api/habits/:id
 * Retrieve a single habit by ID with all its completions.
 */
export async function getHabit(req, res, next) {
  try {
    const habit = await Habit.findOne({
      _id: req.params.id,
      userId: req.user._id,
    }).populate({
      path: "completions",
      options: { sort: { date: 1 } },
    });

    if (!habit) {
      return res.status(404).json({ error: "Not found" });
    }

    const result = habit.toJSON();
    result.completions = result.completions || [];
    return res.status(200).json(result);
  } catch (error) {
    next(error);
  }
}

/**
 * PATCH /api/habits/:id
 * Update an existing habit's details.
 */
export async function updateHabit(req, res, next) {
  try {
    const habit = await Habit.findOne({
      _id: req.params.id,
      userId: req.user._id,
    });

    if (!habit) {
      return res.status(404).json({ error: "Not found" });
    }

    const { title, name, description, category, frequency, targetCount, targetUnit, unit, color } =
      req.body;

    if (title !== undefined || name !== undefined) {
      const newTitle = (title ?? name ?? "").trim();
      if (!newTitle) {
        return res.status(400).json({ error: "Title is required" });
      }
      habit.title = newTitle;
    }

    if (description !== undefined) habit.description = description.trim();
    if (category !== undefined) habit.category = category.trim();
    if (frequency !== undefined) {
      habit.frequency = String(frequency).toUpperCase() === "WEEKLY" ? "WEEKLY" : "DAILY";
    }
    if (targetCount !== undefined) {
      habit.targetCount = Math.max(1, Number(targetCount) || 1);
    }
    if (targetUnit !== undefined || unit !== undefined) {
      habit.targetUnit = (targetUnit ?? unit ?? "times").trim();
    }
    if (color !== undefined) habit.color = color.trim();

    await habit.save();
    return res.status(200).json(habit.toJSON());
  } catch (error) {
    next(error);
  }
}

/**
 * DELETE /api/habits/:id
 * Permanently delete a habit and its completions.
 */
export async function deleteHabit(req, res, next) {
  try {
    const habit = await Habit.findOne({
      _id: req.params.id,
      userId: req.user._id,
    });

    if (!habit) {
      return res.status(404).json({ error: "Not found" });
    }

    await HabitCompletion.deleteMany({ habitId: habit._id });
    await Habit.deleteOne({ _id: habit._id });

    return res.status(200).json({ ok: true });
  } catch (error) {
    next(error);
  }
}

/**
 * POST /api/habits/:id
 * Archive a habit (sets archived: true).
 * Note: A dedicated PATCH /api/habits/:id or POST /api/habits/:id/archive route is cleaner REST design,
 * but this preserves exact parity with the original Next.js route handler.
 */
export async function archiveHabit(req, res, next) {
  try {
    const habit = await Habit.findOne({
      _id: req.params.id,
      userId: req.user._id,
    });

    if (!habit) {
      return res.status(404).json({ error: "Not found" });
    }

    habit.archived = true;
    await habit.save();

    return res.status(200).json({ ok: true });
  } catch (error) {
    next(error);
  }
}
