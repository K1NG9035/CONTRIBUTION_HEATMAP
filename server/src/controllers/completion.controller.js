import { Habit } from "../models/Habit.js";
import { HabitCompletion } from "../models/HabitCompletion.js";
import { normalizeDate } from "../utils/date.js";

/**
 * POST /api/habits/:id/completions
 * Upsert or remove a completion for a habit on a normalized date.
 * If completionCount <= 0, deletes the record and returns { deleted: true }.
 */
export async function saveCompletion(req, res, next) {
  try {
    const habit = await Habit.findOne({
      _id: req.params.id,
      userId: req.user._id,
    });

    if (!habit) {
      return res.status(404).json({ error: "Not found" });
    }

    const { date, completionCount, count } = req.body;
    const normalizedDate = normalizeDate(date);
    const rawCount = completionCount !== undefined ? completionCount : count;
    const finalCount = Math.max(0, Number(rawCount) || 0);

    if (finalCount === 0) {
      await HabitCompletion.deleteMany({
        habitId: habit._id,
        date: normalizedDate,
      });
      return res.status(200).json({ deleted: true });
    }

    const completion = await HabitCompletion.findOneAndUpdate(
      {
        habitId: habit._id,
        date: normalizedDate,
      },
      {
        $set: { completionCount: finalCount },
      },
      {
        new: true,
        upsert: true,
        runValidators: true,
        setDefaultsOnInsert: true,
      }
    );

    return res.status(200).json(completion.toJSON());
  } catch (error) {
    next(error);
  }
}
