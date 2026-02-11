import { createFileRoute } from '@tanstack/react-router'
import { GlassCard } from '~/design-system'
import { useLeaderboard } from '~/domains/gamification/leaderboard-api'

export const Route = createFileRoute('/leaderboard')({
  component: LeaderboardPage,
})

const podiumEmoji = ['🥇', '🥈', '🥉']

function LeaderboardPage() {
  const { data, isLoading } = useLeaderboard()

  const top3 = data?.entries.slice(0, 3) ?? []
  const rest = data?.entries.slice(3) ?? []
  const myRank = data?.myRank
  const myId = data?.userId

  return (
    <div className="px-4 pt-12 max-w-lg mx-auto flex flex-col gap-5">
      <h1 className="text-2xl font-bold">Leaderboard</h1>

      {isLoading && <p className="text-[var(--text-secondary)]">Loading...</p>}

      {/* Podium */}
      {top3.length > 0 && (
        <div className="flex items-end justify-center gap-3 pt-4 pb-2">
          {[1, 0, 2].map((podiumIdx) => {
            const entry = top3[podiumIdx]
            if (!entry) return <div key={podiumIdx} className="w-24" />
            const isMe = entry.userId === myId
            const height = podiumIdx === 0 ? 'h-28' : podiumIdx === 1 ? 'h-24' : 'h-20'
            return (
              <div key={entry.userId} className="flex flex-col items-center gap-1 w-24">
                <span className="text-2xl">{podiumEmoji[entry.rank - 1]}</span>
                <div
                  className="w-11 h-11 rounded-full flex items-center justify-center text-lg font-bold"
                  style={{
                    background: isMe ? 'var(--color-primary)' : 'var(--glass-bg)',
                    color: isMe ? '#fff' : 'var(--text-primary)',
                    border: `2px solid ${isMe ? 'var(--color-primary)' : 'var(--glass-border)'}`,
                  }}
                >
                  {entry.name.charAt(0).toUpperCase()}
                </div>
                <span className="text-xs font-semibold truncate max-w-full text-center">
                  {entry.name}
                </span>
                <div
                  className={`w-full ${height} rounded-t-xl flex flex-col items-center justify-center`}
                  style={{
                    background: isMe
                      ? 'linear-gradient(180deg, var(--color-primary), rgba(0,122,255,0.4))'
                      : 'var(--glass-bg)',
                    backdropFilter: 'blur(var(--glass-blur))',
                    border: '1px solid var(--glass-border)',
                  }}
                >
                  <span className="text-lg font-bold" style={{ color: isMe ? '#fff' : 'var(--text-primary)' }}>
                    {entry.totalXp}
                  </span>
                  <span className="text-[10px]" style={{ color: isMe ? 'rgba(255,255,255,0.7)' : 'var(--text-secondary)' }}>
                    XP
                  </span>
                </div>
              </div>
            )
          })}
        </div>
      )}

      {/* Your rank banner */}
      {myRank && myRank > 3 && (
        <GlassCard
          style={{ borderLeft: '4px solid var(--color-primary)', borderRadius: 'var(--glass-radius)' }}
        >
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <span className="text-lg font-bold text-[var(--color-primary)]">#{myRank}</span>
              <span className="font-medium">Your Rank</span>
            </div>
            <span className="text-sm text-[var(--text-secondary)]">Keep going!</span>
          </div>
        </GlassCard>
      )}

      {/* Rest of leaderboard */}
      <div className="flex flex-col gap-2">
        {rest.map((entry) => {
          const isMe = entry.userId === myId
          return (
            <GlassCard
              key={entry.userId}
              className="!py-3"
              style={isMe ? { borderColor: 'var(--color-primary)', borderWidth: '2px' } : undefined}
            >
              <div className="flex items-center gap-3">
                {/* Rank */}
                <span
                  className="w-8 text-center font-bold text-sm"
                  style={{ color: isMe ? 'var(--color-primary)' : 'var(--text-secondary)' }}
                >
                  {entry.rank}
                </span>

                {/* Avatar */}
                <div
                  className="w-9 h-9 rounded-full flex items-center justify-center text-sm font-bold shrink-0"
                  style={{
                    background: isMe ? 'var(--color-primary)' : 'var(--surface-primary)',
                    color: isMe ? '#fff' : 'var(--text-secondary)',
                  }}
                >
                  {entry.name.charAt(0).toUpperCase()}
                </div>

                {/* Name + level */}
                <div className="flex-1 min-w-0">
                  <div className="font-medium text-[14px] truncate">
                    {entry.name} {isMe && <span className="text-[var(--color-primary)]">(you)</span>}
                  </div>
                  <div className="text-[11px] text-[var(--text-secondary)]">
                    Level {entry.level}
                    {entry.currentStreak > 0 && ` · 🔥 ${entry.currentStreak}d`}
                  </div>
                </div>

                {/* XP */}
                <div className="text-right shrink-0">
                  <div className="font-bold text-sm">{entry.totalXp.toLocaleString()}</div>
                  <div className="text-[10px] text-[var(--text-secondary)]">XP</div>
                </div>
              </div>
            </GlassCard>
          )
        })}
      </div>

      {data?.entries.length === 0 && (
        <p className="text-center text-[var(--text-secondary)] mt-8">
          No players yet. Be the first!
        </p>
      )}
    </div>
  )
}
