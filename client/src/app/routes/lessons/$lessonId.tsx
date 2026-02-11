import { createFileRoute, useNavigate } from '@tanstack/react-router'
import { useExercises } from '~/domains/exercises/api'
import { ExercisePlayer } from '~/domains/exercises/ExercisePlayer'

export const Route = createFileRoute('/lessons/$lessonId')({
  component: LessonPage,
})

function LessonPage() {
  const { lessonId } = Route.useParams()
  const { data: exercises, isLoading } = useExercises(lessonId)
  const navigate = useNavigate()

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <p className="text-[var(--text-secondary)]">Loading exercises...</p>
      </div>
    )
  }

  if (!exercises || exercises.length === 0) {
    return (
      <div className="px-4 pt-12 max-w-lg mx-auto text-center">
        <p className="text-[var(--text-secondary)]">No exercises in this lesson yet.</p>
      </div>
    )
  }

  return (
    <div className="px-4 pt-8 max-w-lg mx-auto">
      <ExercisePlayer
        exercises={exercises}
        lessonId={lessonId}
        onComplete={() => navigate({ to: '/courses' })}
      />
    </div>
  )
}
