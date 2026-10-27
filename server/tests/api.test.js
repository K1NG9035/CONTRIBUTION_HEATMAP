import { jest } from "@jest/globals";
import request from "supertest";

const fakeUserId = "507f1f77bcf86cd799439011";
const fakeHabitId = "507f1f77bcf86cd799439012";
const fakeCompletionId = "507f1f77bcf86cd799439013";

const mockDemoUser = {
  _id: fakeUserId,
  id: fakeUserId,
  email: "demo@greenstreak.local",
};

const mockHabitDoc = {
  _id: fakeHabitId,
  id: fakeHabitId,
  userId: fakeUserId,
  title: "Read 20 pages",
  description: "Daily reading",
  category: "Learning",
  frequency: "DAILY",
  targetCount: 20,
  targetUnit: "pages",
  color: "#76B852",
  archived: false,
  completions: [],
  toJSON() {
    return {
      id: this.id,
      userId: this.userId,
      title: this.title,
      description: this.description,
      category: this.category,
      frequency: this.frequency,
      targetCount: this.targetCount,
      targetUnit: this.targetUnit,
      color: this.color,
      archived: this.archived,
      completions: this.completions,
    };
  },
  save: jest.fn().mockImplementation(async function () {
    return this;
  }),
};

const mockCompletionDoc = {
  _id: fakeCompletionId,
  id: fakeCompletionId,
  habitId: fakeHabitId,
  date: new Date("2026-10-25T00:00:00.000Z"),
  completionCount: 2,
  toJSON() {
    return {
      id: this.id,
      habitId: this.habitId,
      date: this.date,
      completionCount: this.completionCount,
    };
  },
};

// Mock User model
jest.unstable_mockModule("../src/models/User.js", () => ({
  User: {
    findOne: jest.fn().mockResolvedValue(mockDemoUser),
    create: jest.fn().mockResolvedValue(mockDemoUser),
  },
}));

// Mock HabitCompletion model
const mockCompletionDeleteMany = jest.fn().mockResolvedValue({ deletedCount: 1 });
const mockCompletionFindOneAndUpdate = jest.fn().mockResolvedValue(mockCompletionDoc);
jest.unstable_mockModule("../src/models/HabitCompletion.js", () => ({
  HabitCompletion: {
    deleteMany: mockCompletionDeleteMany,
    findOneAndUpdate: mockCompletionFindOneAndUpdate,
    insertMany: jest.fn().mockResolvedValue([]),
  },
}));

// Mock Habit model
const mockHabitFind = jest.fn().mockReturnValue({
  sort: jest.fn().mockReturnValue({
    populate: jest.fn().mockResolvedValue([mockHabitDoc]),
  }),
});
const mockHabitFindOne = jest.fn().mockReturnValue({
  populate: jest.fn().mockResolvedValue(mockHabitDoc),
  save: mockHabitDoc.save,
  ...mockHabitDoc,
});
const mockHabitCreate = jest.fn().mockResolvedValue(mockHabitDoc);
const mockHabitDeleteOne = jest.fn().mockResolvedValue({ deletedCount: 1 });

jest.unstable_mockModule("../src/models/Habit.js", () => ({
  Habit: {
    find: mockHabitFind,
    findOne: jest.fn().mockImplementation((query) => ({
      populate: jest.fn().mockResolvedValue(query._id === fakeHabitId ? mockHabitDoc : null),
      save: mockHabitDoc.save,
      ...(query._id === fakeHabitId ? mockHabitDoc : {}),
    })),
    create: mockHabitCreate,
    deleteOne: mockHabitDeleteOne,
    insertMany: jest.fn().mockResolvedValue([]),
  },
}));

// Import app after mocks are configured
const { default: app } = await import("../src/app.js");

describe("GreenStreak Server API", () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe("GET /api/health", () => {
    it("returns status 200 with ok status", async () => {
      const res = await request(app).get("/api/health");
      expect(res.status).toBe(200);
      expect(res.body.status).toBe("ok");
    });
  });

  describe("GET /api/habits", () => {
    it("returns list of active habits", async () => {
      const res = await request(app).get("/api/habits");
      expect(res.status).toBe(200);
      expect(Array.isArray(res.body)).toBe(true);
      expect(res.body[0].title).toBe("Read 20 pages");
    });
  });

  describe("POST /api/habits", () => {
    it("validates required title", async () => {
      const res = await request(app).post("/api/habits").send({
        description: "Missing title",
      });
      expect(res.status).toBe(400);
      expect(res.body.error).toContain("Title is required");
    });

    it("creates a habit and returns status 201", async () => {
      const res = await request(app).post("/api/habits").send({
        title: "Morning Run",
        targetCount: 1,
        frequency: "DAILY",
      });
      expect(res.status).toBe(201);
      expect(res.body.title).toBe("Read 20 pages");
    });
  });

  describe("GET /api/habits/:id", () => {
    it("rejects invalid ObjectId parameters with status 400", async () => {
      const res = await request(app).get("/api/habits/invalid-id-123");
      expect(res.status).toBe(400);
      expect(res.body.error).toContain("Invalid id");
    });

    it("returns habit by ID", async () => {
      const res = await request(app).get(`/api/habits/${fakeHabitId}`);
      expect(res.status).toBe(200);
      expect(res.body.id).toBe(fakeHabitId);
    });

    it("returns 404 when habit is not found", async () => {
      const res = await request(app).get("/api/habits/507f1f77bcf86cd799439099");
      expect(res.status).toBe(404);
      expect(res.body.error).toBe("Not found");
    });
  });

  describe("POST /api/habits/:id (archive)", () => {
    it("archives habit and returns ok: true", async () => {
      const res = await request(app).post(`/api/habits/${fakeHabitId}`);
      expect(res.status).toBe(200);
      expect(res.body).toEqual({ ok: true });
    });
  });

  describe("DELETE /api/habits/:id", () => {
    it("permanently deletes habit and completions", async () => {
      const res = await request(app).delete(`/api/habits/${fakeHabitId}`);
      expect(res.status).toBe(200);
      expect(res.body).toEqual({ ok: true });
      expect(mockCompletionDeleteMany).toHaveBeenCalledWith({ habitId: fakeHabitId });
    });
  });

  describe("POST /api/habits/:id/completions", () => {
    it("upserts completion record when completionCount > 0", async () => {
      const res = await request(app)
        .post(`/api/habits/${fakeHabitId}/completions`)
        .send({
          date: "2026-10-25",
          completionCount: 2,
        });

      expect(res.status).toBe(200);
      expect(res.body.completionCount).toBe(2);
      expect(mockCompletionFindOneAndUpdate).toHaveBeenCalled();
    });

    it("removes completion record when completionCount is 0", async () => {
      const res = await request(app)
        .post(`/api/habits/${fakeHabitId}/completions`)
        .send({
          date: "2026-10-25",
          completionCount: 0,
        });

      expect(res.status).toBe(200);
      expect(res.body).toEqual({ deleted: true });
      expect(mockCompletionDeleteMany).toHaveBeenCalled();
    });
  });
});
