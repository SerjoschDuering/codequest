# CodeQuest — Gamified Learning PWA

## Stack
- **API:** Hono on Cloudflare Workers + D1 (Drizzle ORM) + Better Auth
- **Frontend:** React 19 + Vite + TanStack Router + TanStack Query + Zustand
- **Styling:** Tailwind CSS 4 + custom Liquid Glass CSS vars
- **AI:** Workers AI (Llama 3.1 8B) for exercise generation
- **PWA:** vite-plugin-pwa (Workbox)

## Key Rules
- **Zod 3 only** — v4 breaks drizzle-zod. Manual schemas, no drizzle-zod.
- **nodejs_compat** flag required — Better Auth uses node:async_hooks
- **400 line max** per file — split into modules
- **No drizzle-zod** — write Zod schemas manually
- **Exercise content** stored as JSON text column, typed per exercise type

## Commands
```bash
# API
cd api && npm run dev          # wrangler dev on :8787
cd api && npm run db:generate  # drizzle-kit generate migrations
cd api && npm run db:migrate   # apply migrations locally

# Client
cd client && npm run dev       # vite dev on :5173
cd client && npm run build     # production build
```

## Project Layout
- `api/src/domains/` — domain-driven: auth, courses, lessons, exercises, progress, gamification, notes, ai
- `client/src/app/routes/` — TanStack Router file-based routes
- `client/src/design-system/` — Liquid Glass reusable components
- `client/src/domains/` — domain-specific components + hooks

## Auth Pattern
- `createAuth()` factory called per-request (Workers env is per-request)
- Better Auth handles `/auth/*` routes
- Session middleware extracts user for protected routes

## GitHub
- Repo: `git@github.com:SerjoschDuering/codequest.git`
- Account: SerjoschDuering (personal)
