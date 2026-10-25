# GreenStreak

GreenStreak is a minimal, high-consistency habit tracker. It combines quick daily logging with a GitHub-style 365-day activity heatmap, streak tracking, and habit consistency analytics.

This project was migrated to an ES Module JavaScript stack powered by **Express.js**, **React (Vite)**, and **MongoDB (Mongoose)**.

---

## Tech Stack

| Layer | Technology | Description |
| :--- | :--- | :--- |
| **Backend** | Node.js (v18+ LTS) | ES Modules (`"type": "module"`) |
| **API Framework** | Express.js | RESTful API with Helmet, CORS, Morgan & express-validator |
| **Database** | MongoDB | Accessed via Mongoose with compound unique indexes & cascading hooks |
| **Frontend** | React 18 & Vite | Pure JSX (no TypeScript), React Router v6 |
| **Styling** | Tailwind CSS | Light/Dark theme with custom hand-written `ThemeContext` |
| **Icons & Utilities** | Lucide React, date-fns | Feather-inspired UI icons & date manipulation |
| **Testing** | Vitest & Jest + Supertest | Vitest for client utilities; Jest & Supertest for server API |

---

## Output Structure

```text
greenstreak/
  server/
    src/
      config/db.js            Mongoose connection using MONGODB_URI
      models/                 User.js, Habit.js, HabitCompletion.js
      controllers/            habit.controller.js, completion.controller.js
      routes/                 habit.routes.js, completion.routes.js
      middleware/             errorHandler.js, validate.js, demoUser.js
      utils/                  date helpers, streak/analytics helpers
      scripts/seed.js         Seed script with demo habits and 45-day completion history
      app.js, server.js       Express app configuration and HTTP server entrypoint
    tests/                    Jest & Supertest API integration tests
    .env.example
    package.json
  client/
    src/
      api/                    REST fetch wrappers (fetchHabits, saveCompletion, etc.)
      components/             ActivityHeatmap, ConsistencyCharts, HabitCard, HabitForm, etc.
      pages/                  Dashboard, NewHabit, HabitDetail, EditHabit, Created, Deleted
      context/                ThemeContext.jsx (persisted light/dark mode)
      hooks/                  useHabits, useHabit
      lib/                    heatmap-utils.js, streak-calculator.js
      App.jsx, main.jsx       React Router v6 routing and app entrypoint
    vite.config.js            Vite bundler with dev proxy (/api -> http://localhost:5000)
    package.json
  package.json                Root scripts to run server and client concurrently
  README.md                   Project documentation
```

---

## Getting Started

### 1. Prerequisites
- **Node.js**: v18.0.0 or higher
- **npm**: v9.0.0 or higher
- **MongoDB**: Either a local MongoDB instance (`mongodb://localhost:27017/greenstreak`) or a [MongoDB Atlas](https://www.mongodb.com/cloud/atlas) connection string.

---

### 2. Installation
Install dependencies for both the root workspace, server, and client:

```bash
# Install root, server, and client dependencies
npm run install:all
```

Or install individually:
```bash
cd server && npm install
cd ../client && npm install
```

---

### 3. Environment Configuration
Create a `.env` file in `server/.env` (or copy from `.env.example`):

```env
PORT=5000
MONGODB_URI=mongodb://localhost:27017/greenstreak
CLIENT_ORIGIN=http://localhost:5173
NODE_ENV=development
```

#### Connecting to MongoDB Atlas
If using MongoDB Atlas instead of a local MongoDB daemon, set `MONGODB_URI` in `server/.env`:
```env
MONGODB_URI=mongodb+srv://<username>:<password>@<cluster-address>.mongodb.net/greenstreak?retryWrites=true&w=majority
```

---

### 4. Seed Sample Data (Optional)
Populate the database with the default demo user, 4 habits, and 45 days of realistic completion data:

```bash
npm run seed
```

---

### 5. Running the Application

Run both the Express API and the Vite frontend concurrently:

```bash
npm run dev
```

- **Frontend**: [http://localhost:5173](http://localhost:5173)
- **API Server**: [http://localhost:5000](http://localhost:5000)
- **Health Check**: [http://localhost:5000/api/health](http://localhost:5000/api/health)

To run services independently:
```bash
# Run server only (nodemon dev mode)
npm run dev:server

# Run client only (vite dev mode)
npm run dev:client
```

---

## NPM Scripts

| Script | Command | Purpose |
| :--- | :--- | :--- |
| `npm run dev` | `concurrently ...` | Runs both Express backend and Vite frontend together |
| `npm run dev:server` | `npm --prefix server run dev` | Starts Express server with nodemon |
| `npm run dev:client` | `npm --prefix client run dev` | Starts Vite development server |
| `npm run build` | `npm --prefix client run build` | Builds Vite production bundle into `client/dist/` |
| `npm start` | `npm --prefix server run start` | Starts Express production server |
| `npm run seed` | `npm --prefix server run seed` | Seeds demo habits and historical completions |
| `npm test` | Runs both client & server tests | Executes Vitest client tests + Jest server tests |
| `npm run test:client` | `npm --prefix client run test` | Executes Vitest unit tests |
| `npm run test:server` | `npm --prefix server run test` | Executes Jest + Supertest API integration tests |

---

## Data Models (Mongoose)

### `User`
- `email`: String (unique, trimmed, lowercase)
- `createdAt`: Date (default: `Date.now`)

### `Habit`
- `userId`: ObjectId (reference to `User`, indexed)
- `title`: String (required, trimmed)
- `description`: String (default: `""`)
- `category`: String (default: `"Personal"`)
- `frequency`: String (`"DAILY"` or `"WEEKLY"`, default: `"DAILY"`)
- `targetCount`: Number (default: `1`, min: `1`)
- `targetUnit`: String (default: `"times"`)
- `color`: String (default: `"#76B852"`)
- `archived`: Boolean (default: `false`, indexed)
- `createdAt`, `updatedAt`: Timestamps
- *Cascade deletion*: Deleting a habit automatically purges all of its completions via Mongoose hooks and explicit controller deletion.

### `HabitCompletion`
- `habitId`: ObjectId (reference to `Habit`, indexed)
- `date`: Date (normalized to UTC midnight `00:00:00.000Z`)
- `completionCount`: Number (default: `0`, min: `0`)
- `createdAt`, `updatedAt`: Timestamps
- *Index*: Unique compound index on `{ habitId: 1, date: 1 }` preventing duplicate completion records for the same habit on the same day.

---

## API Contract

All endpoints are scoped to the authenticated demo user (`demo@greenstreak.local`) via `demoUser` middleware:

| Method | Endpoint | Description |
| :--- | :--- | :--- |
| `GET` | `/api/health` | Health check endpoint |
| `GET` | `/api/habits` | List all active (non-archived) habits with completions |
| `POST` | `/api/habits` | Create a new habit |
| `GET` | `/api/habits/:id` | Get a single habit by ID with completions |
| `PATCH` | `/api/habits/:id` | Update habit details |
| `DELETE` | `/api/habits/:id` | Permanently delete habit and cascade-delete completions |
| `POST` | `/api/habits/:id` | Archive habit (sets `archived: true`) |
| `POST` | `/api/habits/:id/completions` | Upsert completion (`count > 0`) or remove record (`count: 0`) |

### Date Normalization
All completion dates are parsed and stored at **UTC midnight** (`00:00:00.000Z`). When logging completions, client calendar strings (`YYYY-MM-DD`) or ISO timestamps are normalized consistently on both client and server, preventing timezone shifts and duplicate calendar entries.

---

## Testing

```bash
# Run full test suite (client + server)
npm test
```

- **Client Tests (`client/src/lib/*.test.js`)**:
  Powered by **Vitest**. Tests `streak-calculator.js` (daily streaks, 7-day rolling weekly habits, streak resets, completion rates) and `heatmap-utils.js` (intensity thresholds, 365-day cell generation, and tooltip formats).
- **Server Tests (`server/tests/*.test.js`)**:
  Powered by **Jest** and **Supertest** using Node.js ES modules (`--experimental-vm-modules`). Tests request validation, 404/400 handling, ObjectId verification, habit lifecycle, and completion upsert/remove behaviors.

---

## License

MIT
