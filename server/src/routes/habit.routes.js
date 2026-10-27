import { Router } from "express";
import { body } from "express-validator";
import {
  archiveHabit,
  createHabit,
  deleteHabit,
  getHabit,
  getHabits,
  updateHabit,
} from "../controllers/habit.controller.js";
import { validate, validateObjectId } from "../middleware/validate.js";
import completionRoutes from "./completion.routes.js";

const router = Router();

// Sub-router for completion operations
router.use("/:id/completions", completionRoutes);

// List active habits
router.get("/", getHabits);

// Create habit
router.post(
  "/",
  validate([
    body().custom((val) => {
      const title = (val.title || val.name || "").trim();
      if (!title) {
        throw new Error("Title is required");
      }
      return true;
    }),
    body("frequency")
      .optional()
      .isIn(["DAILY", "WEEKLY", "daily", "weekly"])
      .withMessage("Frequency must be DAILY or WEEKLY"),
    body("targetCount")
      .optional()
      .isInt({ min: 1 })
      .withMessage("Target count must be at least 1"),
  ]),
  createHabit
);

// Get single habit
router.get("/:id", validateObjectId("id"), getHabit);

// Update habit
router.patch(
  "/:id",
  validateObjectId("id"),
  validate([
    body("frequency")
      .optional()
      .isIn(["DAILY", "WEEKLY", "daily", "weekly"])
      .withMessage("Frequency must be DAILY or WEEKLY"),
    body("targetCount")
      .optional()
      .isInt({ min: 1 })
      .withMessage("Target count must be at least 1"),
  ]),
  updateHabit
);

// Permanently delete habit
router.delete("/:id", validateObjectId("id"), deleteHabit);

// Archive habit (original API contract uses POST /api/habits/:id)
router.post("/:id", validateObjectId("id"), archiveHabit);

// Optional clean alias: POST /api/habits/:id/archive
router.post("/:id/archive", validateObjectId("id"), archiveHabit);

export default router;
