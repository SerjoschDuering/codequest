// Barrel export all schemas for Drizzle
export { user, session, account, verification } from '../domains/auth/auth.schema'
export { courses } from '../domains/courses/schema'
export { lessons } from '../domains/lessons/schema'
export { exercises } from '../domains/exercises/schema'
export { userProgress } from '../domains/progress/schema'
export { userXp, userStreaks } from '../domains/gamification/schema'
export { userNotes } from '../domains/notes/schema'
