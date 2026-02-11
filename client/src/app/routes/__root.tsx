import { createRootRoute, Outlet } from '@tanstack/react-router'
import { ProtectedRoute } from '~/components/ProtectedRoute'
import { BottomNav } from '~/components/BottomNav'

export const Route = createRootRoute({
  component: RootLayout,
})

function RootLayout() {
  return (
    <ProtectedRoute>
      <div className="min-h-screen pb-20" style={{ background: 'var(--surface-primary)' }}>
        <Outlet />
        <BottomNav />
      </div>
    </ProtectedRoute>
  )
}
