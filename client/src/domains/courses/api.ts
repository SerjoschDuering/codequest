import { useQuery } from '@tanstack/react-query'

export type Course = {
  id: string
  title: string
  description: string
  difficulty: 'beginner' | 'intermediate' | 'advanced'
  icon: string | null
  color: string | null
  published: boolean
}

export type Lesson = {
  id: string
  courseId: string
  title: string
  description: string | null
  sortOrder: number
  xpReward: number
  published: boolean
}

async function fetchCourses(): Promise<Course[]> {
  const res = await fetch('/api/courses', { credentials: 'include' })
  const data = await res.json()
  return (data as { courses: Course[] }).courses
}

async function fetchLessons(courseId: string): Promise<Lesson[]> {
  const res = await fetch(`/api/lessons?courseId=${courseId}`, { credentials: 'include' })
  const data = await res.json()
  return (data as { lessons: Lesson[] }).lessons
}

export function useCourses() {
  return useQuery({ queryKey: ['courses'], queryFn: fetchCourses })
}

export function useLessons(courseId: string) {
  return useQuery({
    queryKey: ['lessons', courseId],
    queryFn: () => fetchLessons(courseId),
    enabled: !!courseId,
  })
}
