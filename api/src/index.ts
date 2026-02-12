import { Hono } from 'hono'
import { cors } from 'hono/cors'
import { createAuth } from './auth'
import { coursesRoutes } from './domains/courses/routes'
import { lessonsRoutes } from './domains/lessons/routes'
import { exercisesRoutes } from './domains/exercises/routes'
import { progressRoutes } from './domains/progress/routes'
import { gamificationRoutes } from './domains/gamification/routes'
import { notesRoutes } from './domains/notes/routes'
import { aiRoutes } from './domains/ai/routes'
import { contentRoutes } from './domains/content/routes'

export type Bindings = {
  DB: D1Database
  AI: Ai
  BETTER_AUTH_SECRET: string
  BETTER_AUTH_URL: string
  GITHUB_CLIENT_ID?: string
  GITHUB_CLIENT_SECRET?: string
  GOOGLE_CLIENT_ID?: string
  GOOGLE_CLIENT_SECRET?: string
}

export type AppEnv = {
  Bindings: Bindings
  Variables: {
    user: { id: string; name: string; email: string }
    session: { id: string; userId: string }
  }
}

const app = new Hono<AppEnv>()

app.use('*', cors({
  origin: ['http://localhost:5173'],
  credentials: true,
}))

// Health check
app.get('/', (c) => c.json({ service: 'codequest-api', status: 'ok' }))

// Auth routes
app.on(['GET', 'POST'], '/auth/*', (c) => {
  const auth = createAuth(c.env)
  return auth.handler(c.req.raw)
})

// API routes
app.route('/api/courses', coursesRoutes)
app.route('/api/lessons', lessonsRoutes)
app.route('/api/exercises', exercisesRoutes)
app.route('/api/progress', progressRoutes)
app.route('/api/gamification', gamificationRoutes)
app.route('/api/notes', notesRoutes)
app.route('/api/ai', aiRoutes)
app.route('/api/content', contentRoutes)

export default app
