import { GlassCard } from '~/design-system'
import type { Course } from './api'

const difficultyColors = {
  beginner: 'var(--color-success)',
  intermediate: 'var(--color-warning)',
  advanced: 'var(--color-danger)',
}

type Props = {
  course: Course
  onClick: () => void
}

export function CourseCard({ course, onClick }: Props) {
  return (
    <GlassCard onClick={onClick} className="flex flex-col gap-2">
      <div className="flex items-center gap-3">
        <span className="text-3xl">{course.icon || '📘'}</span>
        <div className="flex-1 min-w-0">
          <h3 className="font-semibold text-[15px] truncate">{course.title}</h3>
          <span
            className="text-[11px] font-medium px-2 py-0.5 rounded-full"
            style={{
              background: `${difficultyColors[course.difficulty]}20`,
              color: difficultyColors[course.difficulty],
            }}
          >
            {course.difficulty}
          </span>
        </div>
      </div>
      <p className="text-[13px] text-[var(--text-secondary)] line-clamp-2">
        {course.description}
      </p>
    </GlassCard>
  )
}
