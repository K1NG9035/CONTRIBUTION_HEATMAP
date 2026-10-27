/**
 * Global centralized Express error handling middleware.
 */
export function errorHandler(err, req, res, _next) {
  // Mongoose CastError (e.g. invalid ObjectId)
  if (err.name === "CastError") {
    return res.status(400).json({
      error: `Invalid ${err.path}: ${err.value}`,
    });
  }

  // Mongoose ValidationError
  if (err.name === "ValidationError") {
    const messages = Object.values(err.errors).map((val) => val.message);
    return res.status(400).json({
      error: messages[0] || "Validation failed",
      details: messages,
    });
  }

  // Duplicate key error (E11000)
  if (err.code === 11000) {
    return res.status(409).json({
      error: "Duplicate field value entered",
      fields: err.keyValue,
    });
  }

  const statusCode = err.statusCode || res.statusCode === 200 ? 500 : res.statusCode;
  const message = err.message || "Internal server error";

  if (process.env.NODE_ENV !== "test") {
    console.error("Unhandled error:", err);
  }

  return res.status(statusCode).json({
    error: message,
    ...(process.env.NODE_ENV === "development" ? { stack: err.stack } : {}),
  });
}
