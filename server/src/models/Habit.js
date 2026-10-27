import mongoose from "mongoose";
import { HabitCompletion } from "./HabitCompletion.js";

const habitSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
      index: true,
    },
    title: {
      type: String,
      required: [true, "Title is required"],
      trim: true,
    },
    description: {
      type: String,
      default: "",
      trim: true,
    },
    category: {
      type: String,
      default: "Personal",
      trim: true,
    },
    frequency: {
      type: String,
      enum: ["DAILY", "WEEKLY"],
      default: "DAILY",
      uppercase: true,
    },
    targetCount: {
      type: Number,
      default: 1,
      min: [1, "Target count must be at least 1"],
    },
    targetUnit: {
      type: String,
      default: "times",
      trim: true,
    },
    color: {
      type: String,
      default: "#76B852",
      trim: true,
    },
    archived: {
      type: Boolean,
      default: false,
      index: true,
    },
  },
  {
    timestamps: true,
    toJSON: {
      virtuals: true,
      transform: (_doc, ret) => {
        ret.id = ret._id.toString();
        ret.userId = ret.userId ? ret.userId.toString() : ret.userId;
        delete ret.__v;
        return ret;
      },
    },
    toObject: {
      virtuals: true,
      transform: (_doc, ret) => {
        ret.id = ret._id.toString();
        ret.userId = ret.userId ? ret.userId.toString() : ret.userId;
        delete ret.__v;
        return ret;
      },
    },
  }
);

// Compound index for user habit listings
habitSchema.index({ userId: 1, archived: 1, createdAt: 1 });

// Virtual population of completions
habitSchema.virtual("completions", {
  ref: "HabitCompletion",
  localField: "_id",
  foreignField: "habitId",
});

// Alias virtuals for contract flexibility
habitSchema.virtual("name")
  .get(function () {
    return this.title;
  })
  .set(function (val) {
    this.title = val;
  });

habitSchema.virtual("unit")
  .get(function () {
    return this.targetUnit;
  })
  .set(function (val) {
    this.targetUnit = val;
  });

habitSchema.virtual("user")
  .get(function () {
    return this.userId;
  })
  .set(function (val) {
    this.userId = val;
  });

// Cascade delete completions when a habit is removed
habitSchema.pre("findOneAndDelete", async function () {
  const query = this.getQuery();
  if (query._id) {
    await HabitCompletion.deleteMany({ habitId: query._id });
  }
});

habitSchema.pre("deleteOne", { document: true, query: false }, async function () {
  await HabitCompletion.deleteMany({ habitId: this._id });
});

export const Habit = mongoose.model("Habit", habitSchema);
