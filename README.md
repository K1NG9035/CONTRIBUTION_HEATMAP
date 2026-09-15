# GreenStreak

GreenStreak is a habit tracker built with Next.js, TypeScript, Prisma, and Tailwind CSS. It combines quick daily logging with a GitHub-style activity heatmap and habit consistency analytics.

## Features

- Create, edit, archive, and permanently delete habits.
- Set a daily or weekly frequency, target count, unit, category, description, and color.
- Log completion counts for today or any past date.
- View a 365-day activity heatmap with intensity levels and tooltips.
- View per-habit streak, completion-rate, weekly, and monthly analytics.
- Switch between light and dark themes.
- Use the responsive web dashboard or package the app as a Windows desktop application.

## Tech Stack

| Area | Technology |
| --- | --- |
| Framework | Next.js 14 App Router |
| Language | TypeScript |
| Styling | Tailwind CSS |
| UI icons | Lucide React |
| Database | SQLite |
| ORM | Prisma 5 |
| Date utilities | date-fns |
| Theming | next-themes |
| Desktop shell | Electron and electron-builder |

## Project Structure

```text
app/
  page.tsx                         Dashboard
  habits/new/page.tsx              Create a habit
  habits/[id]/page.tsx             Habit detail and analytics
  habits/[id]/edit/page.tsx        Edit a habit
  habits/[id]/created/page.tsx     Timed creation confirmation
  habits/[id]/delete/page.tsx      Timed deletion confirmation
  api/habits/route.ts              List and create habits
  api/habits/[id]/route.ts         Read, update, archive, or delete a habit
  api/habits/[id]/completions/     Create, update, or remove a completion
components/                        React UI components
electron/                          Electron main and preload scripts
lib/                               Prisma, user, heatmap, and streak helpers
prisma/schema.prisma               SQLite schema
prisma/migrations/                 Database migrations
generated/prisma/                  Generated Prisma client
```

## Getting Started

### Prerequisites

- Node.js 18 or newer
- npm

### Install and configure

```bash
npm install
```

Create a `.env` file in the project root:

```env
DATABASE_URL="file:./dev.db"
```

The Prisma schema uses SQLite. Apply the existing migration and generate the client:

```bash
npm run db:migrate
npm run db:generate
```

### Run the web app

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000).

## NPM Scripts

| Command | Purpose |
| --- | --- |
| `npm run dev` | Start the Next.js development server |
| `npm run build` | Generate Prisma Client and build Next.js |
| `npm start` | Start the production Next.js server |
| `npm run lint` | Run the Next.js lint command |
| `npm run db:migrate` | Apply or create Prisma development migrations |
| `npm run db:generate` | Generate the Prisma Client |
| `npm run db:studio` | Open Prisma Studio |
| `npm run desktop:dev` | Run Next.js and Electron together during development |
| `npm run desktop:build` | Build the unpacked Windows desktop application |
| `npm run desktop:installer` | Build the Windows NSIS installer |
| `npm run desktop` | Launch Electron |

## Desktop App

The packaged Windows app runs the production Next.js server inside Electron. Its SQLite database is stored in the Windows application data directory, so data persists independently of the source folder.

```bash
npm run desktop:build
```

The unpacked executable is written to `dist/win-unpacked/GreenStreak.exe`. To create an installer instead:

```bash
npm run desktop:installer
```

The desktop development command expects the Next.js server on port `3000`; the packaged app serves on port `3210`.

## Data Model

- `User` stores the demo user's email and creation time.
- `Habit` stores habit details, frequency, target, color, timestamps, and the `archived` flag.
- `HabitCompletion` stores one completion count per habit and calendar date.

The application currently uses `getDemoUser()` to create or retrieve one demo user. Habit and completion records are scoped to that user. Habit completions have a unique `(habitId, date)` constraint, and deleting a habit cascades to its completions.

## API Routes

| Method | Route | Purpose |
| --- | --- | --- |
| `GET` | `/api/habits` | List active habits with completions |
| `POST` | `/api/habits` | Create a habit |
| `GET` | `/api/habits/:id` | Get one habit and its completions |
| `PATCH` | `/api/habits/:id` | Update a habit |
| `DELETE` | `/api/habits/:id` | Permanently delete a habit |
| `POST` | `/api/habits/:id` | Archive a habit |
| `POST` | `/api/habits/:id/completions` | Upsert or remove a dated completion count |

Completion dates are normalized to the start of the day. Sending `completionCount: 0` removes that day's completion record.

## License

MIT
