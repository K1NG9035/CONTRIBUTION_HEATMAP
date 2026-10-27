import "dotenv/config";
import { subDays } from "date-fns";
import { connectDB, disconnectDB } from "../config/db.js";
import { Habit } from "../models/Habit.js";
import { HabitCompletion } from "../models/HabitCompletion.js";
import { User } from "../models/User.js";
import { DEMO_USER_EMAIL } from "../utils/constants.js";
import { normalizeDate } from "../utils/date.js";

const MONGODB_URI = process.env.MONGODB_URI || "mongodb://localhost:27017/greenstreak";

async function seed() {
  console.log("Starting database seed...");
  await connectDB(MONGODB_URI);

  try {
    // 1. Ensure demo user exists
    let user = await User.findOne({ email: DEMO_USER_EMAIL });
    if (!user) {
      user = await User.create({ email: DEMO_USER_EMAIL });
      console.log(`Created demo user: ${user.email} (${user._id})`);
    } else {
      console.log(`Found existing demo user: ${user.email} (${user._id})`);
    }

    // 2. Clear existing habits & completions for demo user
    const existingHabits = await Habit.find({ userId: user._id });
    const habitIds = existingHabits.map((h) => h._id);
    await HabitCompletion.deleteMany({ habitId: { $in: habitIds } });
    await Habit.deleteMany({ userId: user._id });
    console.log("Cleared prior habits and completions for demo user.");

    // 3. Define sample habits
    const sampleHabits = [
      {
        userId: user._id,
        title: "Morning Meditation",
        description: "10 minutes of silent mindfulness before opening any screens.",
        category: "Mindfulness",
        frequency: "DAILY",
        targetCount: 1,
        targetUnit: "session",
        color: "#76B852",
        archived: false,
      },
      {
        userId: user._id,
        title: "Read 20 pages",
        description: "Non-fiction reading to expand perspective and focus.",
        category: "Learning",
        frequency: "DAILY",
        targetCount: 20,
        targetUnit: "pages",
        color: "#4A90E2",
        archived: false,
      },
      {
        userId: user._id,
        title: "Cold Shower",
        description: "A two-minute blast of cold water to build mental resilience.",
        category: "Health",
        frequency: "DAILY",
        targetCount: 1,
        targetUnit: "session",
        color: "#50E3C2",
        archived: false,
      },
      {
        userId: user._id,
        title: "Weekly Long Run",
        description: "Aerobic base building through steady conversational pace.",
        category: "Fitness",
        frequency: "WEEKLY",
        targetCount: 1,
        targetUnit: "run",
        color: "#F5A623",
        archived: false,
      },
    ];

    const createdHabits = await Habit.insertMany(sampleHabits);
    console.log(`Created ${createdHabits.length} habits.`);

    // 4. Generate completions over the past 45 days
    const completionsToInsert = [];
    const now = new Date();

    for (let dayOffset = 0; dayOffset <= 45; dayOffset += 1) {
      const pastDate = subDays(now, dayOffset);
      const normalized = normalizeDate(pastDate);

      // Morning meditation: high consistency (80% of days)
      if (dayOffset % 5 !== 0) {
        completionsToInsert.push({
          habitId: createdHabits[0]._id,
          date: normalized,
          completionCount: 1,
        });
      }

      // Read 20 pages: current streak of 7 days, mixed history
      if (dayOffset <= 7 || (dayOffset % 2 === 0 && dayOffset < 35)) {
        completionsToInsert.push({
          habitId: createdHabits[1]._id,
          date: normalized,
          completionCount: 20,
        });
      }

      // Cold shower: alternating days
      if (dayOffset % 2 === 1 && dayOffset < 30) {
        completionsToInsert.push({
          habitId: createdHabits[2]._id,
          date: normalized,
          completionCount: 1,
        });
      }

      // Weekly long run: once per week
      if (dayOffset % 7 === 0) {
        completionsToInsert.push({
          habitId: createdHabits[3]._id,
          date: normalized,
          completionCount: 1,
        });
      }
    }

    await HabitCompletion.insertMany(completionsToInsert);
    console.log(`Created ${completionsToInsert.length} completion entries across the last 45 days.`);
    console.log("Seed completed successfully!");
  } catch (error) {
    console.error("Seed failed:", error);
  } finally {
    await disconnectDB();
  }
}

seed();
