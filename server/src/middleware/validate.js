import { validationResult } from "express-validator";
import mongoose from "mongoose";

/**
 * Validates request schema and returns formatted 400 error response if validation fails.
 * @param {import('express-validator').ValidationChain[]} validations
 */
export function validate(validations) {
  return async (req, res, next) => {
    for (const validation of validations) {
      const result = await validation.run(req);
      if (result.errors.length) break;
    }

    const errors = validationResult(req);
    if (errors.isEmpty()) {
      return next();
    }

    return res.status(400).json({
      error: errors.array()[0].msg || "Validation error",
      details: errors.array(),
    });
  };
}

/**
 * Validates whether a request parameter is a valid MongoDB ObjectId.
 * @param {string} [paramName="id"]
 */
export function validateObjectId(paramName = "id") {
  return (req, res, next) => {
    const val = req.params[paramName];
    if (!val || !mongoose.Types.ObjectId.isValid(val)) {
      return res.status(400).json({
        error: `Invalid ${paramName}: must be a 24-character hexadecimal ObjectId`,
      });
    }
    next();
  };
}
