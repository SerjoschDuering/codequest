type Props = {
  currentStreak: number
  longestStreak: number
}

export function StreakDisplay({ currentStreak, longestStreak }: Props) {
  return (
    <div className="flex items-center gap-3">
      <div className="flex items-center gap-1">
        <span className="text-2xl" style={{ filter: currentStreak > 0 ? 'none' : 'grayscale(1)' }}>
          🔥
        </span>
        <div>
          <div className="text-xl font-bold">{currentStreak}</div>
          <div className="text-[11px] text-[var(--text-secondary)]">day streak</div>
        </div>
      </div>
      {longestStreak > 0 && (
        <div className="text-[12px] text-[var(--text-secondary)]">
          Best: {longestStreak}d
        </div>
      )}
    </div>
  )
}
