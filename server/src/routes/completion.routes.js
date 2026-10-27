import { Router } from "express";
import { body } from "express-validator";
import { saveCompletion } from "../controllers/completion.controller.js";
import { validate, validateObjectId } from "../middleware/validate.js";

const router = Router({ mergeParams: true });

router.post(
  "/",
  validateObjectId("id"),
  validate([
    body("completionCount")
      .optional()
      .isInt({ min: 0 })
      .withMessage("completionCount must be a non-negative integer"),
    body("count")
      .optional()
      .isInt({ min: 0 })
      .withMessage("count must be a non-negative integer"),
  ]),
  saveCompletion
);

export default router;
