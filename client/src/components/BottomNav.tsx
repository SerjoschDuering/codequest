import { Link, useLocation } from '@tanstack/react-router'

const tabs = [
  { path: '/', label: 'Home', icon: '🏠' },
  { path: '/courses', label: 'Learn', icon: '📚' },
  { path: '/leaderboard', label: 'Rank', icon: '🏆' },
  { path: '/notes', label: 'Notes', icon: '📝' },
  { path: '/profile', label: 'Profile', icon: '👤' },
] as const

export function BottomNav() {
  const location = useLocation()

  return (
    <nav
      className="fixed bottom-0 left-0 right-0 glass border-t border-[var(--glass-border)]"
      style={{
        borderRadius: 0,
        paddingBottom: 'var(--safe-bottom)',
      }}
    >
      <div className="flex justify-around items-center h-14 max-w-lg mx-auto">
        {tabs.map((tab) => {
          const active = location.pathname === tab.path ||
            (tab.path !== '/' && location.pathname.startsWith(tab.path))
          return (
            <Link
              key={tab.path}
              to={tab.path}
              className="flex flex-col items-center gap-0.5 py-1 px-3 no-underline"
            >
              <span className="text-xl">{tab.icon}</span>
              <span
                className="text-[10px] font-medium"
                style={{ color: active ? 'var(--color-primary)' : 'var(--text-secondary)' }}
              >
                {tab.label}
              </span>
            </Link>
          )
        })}
      </div>
    </nav>
  )
}
