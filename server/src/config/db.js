import mongoose from "mongoose";

/**
 * Connect to MongoDB using the MONGODB_URI environment variable.
 * @param {string} [uri]
 * @returns {Promise<typeof mongoose>}
 */
export async function connectDB(uri = process.env.MONGODB_URI) {
  if (!uri) {
    throw new Error("MONGODB_URI environment variable is not defined");
  }

  try {
    const conn = await mongoose.connect(uri);
    return conn;
  } catch (error) {
    console.error("MongoDB connection error:", error.message);
    throw error;
  }
}

/**
 * Disconnect from MongoDB (useful for tests and graceful shutdown).
 * @returns {Promise<void>}
 */
export async function disconnectDB() {
  await mongoose.disconnect();
}
