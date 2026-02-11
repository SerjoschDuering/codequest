# CodeQuest Architecture

## Overview
Duolingo-style gamified learning app for coding/AI/software concepts.
Built on Cloudflare edge stack (Workers + D1).

## Data Layers
1. **Shared content** — courses, lessons, exercises (instructor-uploaded via API)
2. **User data** — progress, streaks, XP, personal notes

## API (Hono on Workers)
```
POST/GET /auth/*           → Better Auth (signup/signin/signout)
GET      /api/courses      → list courses
GET      /api/courses/:id  → course detail + lessons
GET      /api/lessons/:id  → lesson detail + exercises
POST     /api/progress     → submit exercise attempt
GET      /api/gamification → user XP/level/streak
CRUD     /api/notes        → personal notes
POST     /api/ai/generate  → AI exercise generation
POST     /api/ai/notes-to-exercises → convert note to exercises
```

## Exercise Types
1. Multiple Choice
2. Code Completion (fill-in-blank)
3. Matching (concept ↔ definition)
4. Sequencing (order steps)
5. Fill-in-the-Blank
6. Diagram Quiz (labeled SVG + questions)
7. Guess the Output
8. Spot the Bug
9. Acronym Challenge

## Gamification
- XP awarded per correct answer (10 base + streak bonus)
- Levels: XP thresholds (100, 300, 600, 1000, ...)
- Streaks: consecutive days with >= 1 exercise completed
- Daily goal tracking

## Database (D1 / SQLite)
Tables: user, session, account, verification (Better Auth),
courses, lessons, exercises, user_progress, user_xp, user_streaks, user_notes
