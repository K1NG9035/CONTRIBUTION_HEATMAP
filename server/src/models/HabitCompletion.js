import mongoose from "mongoose";

const habitCompletionSchema = new mongoose.Schema(
  {
    habitId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Habit",
      required: true,
      index: true,
    },
    date: {
      type: Date,
      required: true,
    },
    completionCount: {
      type: Number,
      default: 0,
      min: 0,
    },
  },
  {
    timestamps: true,
    toJSON: {
      virtuals: true,
      transform: (_doc, ret) => {
        ret.id = ret._id.toString();
        ret.habitId = ret.habitId ? ret.habitId.toString() : ret.habitId;
        delete ret.__v;
        return ret;
      },
    },
    toObject: {
      virtuals: true,
      transform: (_doc, ret) => {
        ret.id = ret._id.toString();
        ret.habitId = ret.habitId ? ret.habitId.toString() : ret.habitId;
        delete ret.__v;
        return ret;
      },
    },
  }
);

// Compound unique index ensuring one completion per habit per normalized calendar date
habitCompletionSchema.index({ habitId: 1, date: 1 }, { unique: true });

// Alias virtuals for flexibility (count <-> completionCount, habit <-> habitId)
habitCompletionSchema.virtual("count")
  .get(function () {
    return this.completionCount;
  })
  .set(function (val) {
    this.completionCount = val;
  });

habitCompletionSchema.virtual("habit")
  .get(function () {
    return this.habitId;
  })
  .set(function (val) {
    this.habitId = val;
  });

export const HabitCompletion = mongoose.model("HabitCompletion", habitCompletionSchema);
