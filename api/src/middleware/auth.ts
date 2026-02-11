import { Context, Next } from 'hono'
import { createAuth } from '../auth'
import type { AppEnv } from '../index'

export async function authMiddleware(c: Context<AppEnv>, next: Next) {
  const auth = createAuth(c.env)
  const session = await auth.api.getSession({
    headers: c.req.raw.headers,
  })
  if (!session) {
    return c.json({ error: 'Unauthorized' }, 401)
  }
  c.set('user', session.user)
  c.set('session', session.session)
  return next()
}
