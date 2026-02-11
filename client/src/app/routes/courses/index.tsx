import { createFileRoute, useNavigate } from '@tanstack/react-router'
import { useCourses } from '~/domains/courses/api'
import { CourseCard } from '~/domains/courses/CourseCard'

export const Route = createFileRoute('/courses/')({
  component: CoursesPage,
})

function CoursesPage() {
  const { data: courses, isLoading } = useCourses()
  const navigate = useNavigate()

  return (
    <div className="px-4 pt-12 max-w-lg mx-auto">
      <h1 className="text-2xl font-bold mb-5">Courses</h1>
      {isLoading && <p className="text-[var(--text-secondary)]">Loading...</p>}
      <div className="flex flex-col gap-3">
        {courses?.map((course) => (
          <CourseCard
            key={course.id}
            course={course}
            onClick={() => navigate({ to: '/courses/$courseId', params: { courseId: course.id } })}
          />
        ))}
        {courses?.length === 0 && (
          <p className="text-[var(--text-secondary)] text-center mt-8">
            No courses yet. Seed content via the API.
          </p>
        )}
      </div>
    </div>
  )
}
