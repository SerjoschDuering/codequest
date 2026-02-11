import { createFileRoute, Link } from '@tanstack/react-router'
import { GlassCard } from '~/design-system'
import { useUserStats } from '~/domains/gamification/api'
import { StreakDisplay } from '~/domains/gamification/StreakDisplay'
import { XPBar } from '~/domains/gamification/XPBar'
import { useCourses } from '~/domains/courses/api'

export const Route = createFileRoute('/')({
  component: HomePage,
})

function HomePage() {
  const stats = useUserStats()
  const courses = useCourses()
  const firstCourse = courses.data?.[0]

  return (
    <div className="px-4 pt-12 flex flex-col gap-5 max-w-lg mx-auto">
      <h1 className="text-3xl font-bold">CodeQuest</h1>

      {/* Stats */}
      <GlassCard>
        <div className="flex items-center justify-between mb-3">
          <StreakDisplay
            currentStreak={stats.data?.currentStreak ?? 0}
            longestStreak={stats.data?.longestStreak ?? 0}
          />
        </div>
        <XPBar totalXp={stats.data?.totalXp ?? 0} level={stats.data?.level ?? 1} />
      </GlassCard>

      {/* Continue Learning */}
      {firstCourse && (
        <Link to="/courses/$courseId" params={{ courseId: firstCourse.id }} className="no-underline">
          <GlassCard
            style={{
              borderLeft: `4px solid var(--color-primary)`,
              borderRadius: 'var(--glass-radius)',
            }}
          >
            <div className="text-xs text-[var(--text-secondary)] mb-1">Continue Learning</div>
            <div className="flex items-center gap-2">
              <span className="text-xl">{firstCourse.icon || '📘'}</span>
              <span className="font-semibold">{firstCourse.title}</span>
            </div>
          </GlassCard>
        </Link>
      )}

      {/* Quick Stats */}
      <div className="grid grid-cols-3 gap-3">
        <GlassCard className="text-center">
          <div className="text-2xl font-bold" style={{ color: 'var(--color-primary)' }}>
            {stats.data?.totalXp ?? 0}
          </div>
          <div className="text-[11px] text-[var(--text-secondary)]">Total XP</div>
        </GlassCard>
        <GlassCard className="text-center">
          <div className="text-2xl font-bold" style={{ color: 'var(--color-warning)' }}>
            {stats.data?.level ?? 1}
          </div>
          <div className="text-[11px] text-[var(--text-secondary)]">Level</div>
        </GlassCard>
        <GlassCard className="text-center">
          <div className="text-2xl font-bold" style={{ color: 'var(--color-success)' }}>
            {courses.data?.length ?? 0}
          </div>
          <div className="text-[11px] text-[var(--text-secondary)]">Courses</div>
        </GlassCard>
      </div>
    </div>
  )
}
