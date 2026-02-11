const LEVEL_THRESHOLDS = [0, 100, 300, 600, 1000, 1500, 2200, 3000, 4000, 5200, 6500]

type Props = {
  totalXp: number
  level: number
}

export function XPBar({ totalXp, level }: Props) {
  const currentThreshold = LEVEL_THRESHOLDS[level - 1] || 0
  const nextThreshold = LEVEL_THRESHOLDS[level] || LEVEL_THRESHOLDS[LEVEL_THRESHOLDS.length - 1] + 1500
  const xpInLevel = totalXp - currentThreshold
  const xpNeeded = nextThreshold - currentThreshold
  const progress = Math.min((xpInLevel / xpNeeded) * 100, 100)

  return (
    <div>
      <div className="flex justify-between items-center mb-1">
        <span className="text-sm font-semibold">Level {level}</span>
        <span className="text-xs text-[var(--text-secondary)]">
          {xpInLevel}/{xpNeeded} XP
        </span>
      </div>
      <div className="h-2 rounded-full bg-[var(--glass-border)] overflow-hidden">
        <div
          className="h-full rounded-full"
          style={{
            width: `${progress}%`,
            background: 'var(--color-primary)',
            transition: 'width 0.6s var(--spring-smooth)',
          }}
        />
      </div>
    </div>
  )
}
