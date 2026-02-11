import { createFileRoute, Link } from '@tanstack/react-router'
import { GlassCard } from '~/design-system'
import { useLessons } from '~/domains/courses/api'

export const Route = createFileRoute('/courses/$courseId')({
  component: CourseDetailPage,
})

function CourseDetailPage() {
  const { courseId } = Route.useParams()
  const { data: lessons, isLoading } = useLessons(courseId)

  return (
    <div className="px-4 pt-12 max-w-lg mx-auto">
      <Link to="/courses" className="text-sm text-[var(--color-primary)] no-underline mb-3 block">
        ← Back to Courses
      </Link>
      <h1 className="text-2xl font-bold mb-5">Lessons</h1>
      {isLoading && <p className="text-[var(--text-secondary)]">Loading...</p>}
      <div className="flex flex-col gap-3">
        {lessons?.map((lesson, i) => (
          <Link
            key={lesson.id}
            to="/lessons/$lessonId"
            params={{ lessonId: lesson.id }}
            className="no-underline"
          >
            <GlassCard className="flex items-center gap-3">
              <span
                className="w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold shrink-0"
                style={{ background: 'var(--color-primary)', color: '#fff' }}
              >
                {i + 1}
              </span>
              <div className="flex-1 min-w-0">
                <h3 className="font-semibold text-[15px]">{lesson.title}</h3>
                {lesson.description && (
                  <p className="text-xs text-[var(--text-secondary)] truncate">{lesson.description}</p>
                )}
              </div>
              <span className="text-xs text-[var(--text-secondary)] shrink-0">
                +{lesson.xpReward} XP
              </span>
            </GlassCard>
          </Link>
        ))}
      </div>
    </div>
  )
}
