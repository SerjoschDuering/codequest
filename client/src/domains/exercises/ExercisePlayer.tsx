import { useState, useEffect, useRef, useMemo } from 'react'
import { XPPopup } from '~/design-system'
import {
  CheckCircle, XCircle, ArrowRight, Lightning, X,
} from '@phosphor-icons/react'
import type { Exercise, SubmitResult } from './api'
import { useSubmitAnswer } from './api'
import { MultipleChoice } from './MultipleChoice'
import { CodeCompletion } from './CodeCompletion'
import { Matching } from './Matching'
import { Sequencing } from './Sequencing'
import { FillInBlank } from './FillInBlank'
import { DiagramQuiz } from './DiagramQuiz'
import { GuessTheOutput } from './GuessTheOutput'
import { SpotTheBug } from './SpotTheBug'
import { AcronymChallenge } from './AcronymChallenge'

type Props = {
  exercises: Exercise[]
  lessonId: string
  onComplete: () => void
  onCancel?: () => void
}

const TYPE_LABELS: Record<string, string> = {
  multiple_choice: 'Multiple Choice',
  code_completion: 'Code Completion',
  matching: 'Matching',
  sequencing: 'Sequencing',
  fill_in_blank: 'Fill in the Blank',
  diagram_quiz: 'Diagram Quiz',
  guess_output: 'Guess the Output',
  spot_the_bug: 'Spot the Bug',
  acronym_challenge: 'Acronym Challenge',
}

export function ExercisePlayer({ exercises, lessonId, onComplete, onCancel }: Props) {
  const [currentIdx, setCurrentIdx] = useState(0)
  const [result, setResult] = useState<SubmitResult | null>(null)
  const [showXP, setShowXP] = useState(false)
  const submit = useSubmitAnswer()
  const autoAdvanceTimer = useRef<ReturnType<typeof setTimeout>>(undefined)

  const exercise = exercises[currentIdx] ?? null
  const isLast = currentIdx === exercises.length - 1

  // Memoize parsed content to avoid new object identity on every render
  const content = useMemo(() => {
    if (!exercise) return null
    try { return JSON.parse(exercise.content) }
    catch { return null }
  }, [exercise?.content])

  // Auto-advance on correct answer (use refs to avoid stale closures)
  const isLastRef = useRef(isLast)
  isLastRef.current = isLast
  const onCompleteRef = useRef(onComplete)
  onCompleteRef.current = onComplete

  useEffect(() => {
    if (result?.correct) {
      autoAdvanceTimer.current = setTimeout(() => {
        setResult(null)
        if (isLastRef.current) onCompleteRef.current()
        else setCurrentIdx(prev => prev + 1)
      }, 1500)
    }
    return () => { if (autoAdvanceTimer.current) clearTimeout(autoAdvanceTimer.current) }
  }, [result])

  function handleNext() {
    if (autoAdvanceTimer.current) clearTimeout(autoAdvanceTimer.current)
    setResult(null)
    if (isLast) onComplete()
    else setCurrentIdx(prev => prev + 1)
  }

  if (!exercise) return null
  if (!content) return (
    <div className="text-center py-8">
      <p className="text-[var(--text-secondary)]">Could not load this exercise.</p>
      <button onClick={handleNext} className="mt-4 text-[var(--color-primary)] font-medium">
        Skip to next
      </button>
    </div>
  )

  const progress = ((currentIdx + 1) / exercises.length) * 100

  async function handleAnswer(answer: unknown, correct: boolean) {
    try {
      const res = await submit.mutateAsync({
        exerciseId: exercise!.id, lessonId, answer, correct,
      })
      setResult(res)
      if (res.xpEarned > 0) setShowXP(true)
    } catch {
      // Network error — still show feedback so user can proceed
      setResult({ correct, xpEarned: 0, totalXp: 0, level: 0, leveledUp: false, currentStreak: 0, longestStreak: 0 })
    }
  }

  function renderExercise() {
    const props = { content, onAnswer: handleAnswer }
    switch (exercise!.type) {
      case 'multiple_choice': return <MultipleChoice key={exercise!.id} {...props} />
      case 'code_completion': return <CodeCompletion key={exercise!.id} {...props} />
      case 'matching': return <Matching key={exercise!.id} {...props} />
      case 'sequencing': return <Sequencing key={exercise!.id} {...props} />
      case 'fill_in_blank': return <FillInBlank key={exercise!.id} {...props} />
      case 'diagram_quiz': return <DiagramQuiz key={exercise!.id} {...props} />
      case 'guess_output': return <GuessTheOutput key={exercise!.id} {...props} />
      case 'spot_the_bug': return <SpotTheBug key={exercise!.id} {...props} />
      case 'acronym_challenge': return <AcronymChallenge key={exercise!.id} {...props} />
      default: return <p>Unknown type: {exercise!.type}</p>
    }
  }

  return (
    <div className="flex flex-col gap-4 pb-32">
      {/* Top utility strip */}
      <div className="flex items-center gap-3">
        {onCancel && (
          <button
            onClick={onCancel}
            className="w-8 h-8 rounded-full flex items-center justify-center shrink-0 active:scale-90 transition-transform"
            style={{ background: 'var(--glass-bg)', border: '1px solid var(--glass-border)' }}
            aria-label="Exit quiz"
          >
            <X size={16} weight="bold" color="var(--text-secondary)" />
          </button>
        )}
        <div className="flex-1 h-2 rounded-full bg-[var(--glass-border)] overflow-hidden">
          <div
            className="h-full rounded-full transition-all duration-500"
            style={{
              width: `${progress}%`,
              background: 'linear-gradient(90deg, var(--color-primary), var(--color-teal))',
            }}
          />
        </div>
        <span className="text-xs font-medium text-[var(--text-secondary)] tabular-nums shrink-0">
          {currentIdx + 1}/{exercises.length}
        </span>
      </div>

      {/* Type badge */}
      <span className="text-[11px] font-semibold uppercase tracking-wider text-[var(--text-secondary)]">
        {TYPE_LABELS[exercise.type] || exercise.type}
      </span>

      {/* Exercise content */}
      {renderExercise()}

      {/* Feedback drawer */}
      {result && (
        <div
          className="fixed bottom-0 left-0 right-0 z-50 px-4 pb-6 pt-5"
          style={{
            background: 'var(--surface-primary)',
            borderTop: '1px solid var(--glass-border)',
            animation: 'slideUp 0.25s ease-out',
          }}
        >
          <div className="max-w-lg mx-auto flex flex-col gap-3">
            <div className="flex items-center gap-3">
              {result.correct ? (
                <CheckCircle size={28} weight="fill" color="var(--color-success)" />
              ) : (
                <XCircle size={28} weight="fill" color="var(--color-danger)" />
              )}
              <div className="flex-1">
                <p className="font-semibold text-[15px]" style={{
                  color: result.correct ? 'var(--color-success)' : 'var(--color-danger)',
                }}>
                  {result.correct ? 'Correct!' : 'Not quite'}
                </p>
                {result.xpEarned > 0 && (
                  <p className="text-xs text-[var(--text-secondary)] flex items-center gap-1">
                    <Lightning size={12} weight="fill" color="var(--color-warning)" />
                    +{result.xpEarned} XP
                  </p>
                )}
              </div>
            </div>

            <button
              onClick={handleNext}
              className="w-full py-3 rounded-xl font-semibold text-[15px] text-white flex items-center justify-center gap-2 active:scale-[0.97] transition-transform"
              style={{
                background: result.correct ? 'var(--color-success)' : 'var(--color-primary)',
              }}
            >
              {isLast ? 'Complete Lesson' : 'Continue'}
              <ArrowRight size={18} weight="bold" />
            </button>
          </div>
        </div>
      )}

      <XPPopup xp={result?.xpEarned ?? 0} show={showXP} onDone={() => setShowXP(false)} />

      <style>{`
        @keyframes slideUp {
          from { transform: translateY(100%); opacity: 0; }
          to { transform: translateY(0); opacity: 1; }
        }
      `}</style>
    </div>
  )
}
