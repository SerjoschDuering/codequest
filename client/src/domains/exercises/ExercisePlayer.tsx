import { useState } from 'react'
import { GlassButton, XPPopup } from '~/design-system'
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
}

export function ExercisePlayer({ exercises, lessonId, onComplete }: Props) {
  const [currentIdx, setCurrentIdx] = useState(0)
  const [result, setResult] = useState<SubmitResult | null>(null)
  const [showXP, setShowXP] = useState(false)
  const submit = useSubmitAnswer()

  const exercise = exercises[currentIdx]
  if (!exercise) return null

  const content = JSON.parse(exercise.content)
  const progress = ((currentIdx + 1) / exercises.length) * 100
  const isLast = currentIdx === exercises.length - 1

  async function handleAnswer(answer: unknown, correct: boolean) {
    const res = await submit.mutateAsync({
      exerciseId: exercise.id,
      lessonId,
      answer,
      correct,
    })
    setResult(res)
    if (res.xpEarned > 0) setShowXP(true)
  }

  function handleNext() {
    setResult(null)
    if (isLast) {
      onComplete()
    } else {
      setCurrentIdx(currentIdx + 1)
    }
  }

  function renderExercise() {
    const props = { content, onAnswer: handleAnswer }
    switch (exercise.type) {
      case 'multiple_choice': return <MultipleChoice {...props} />
      case 'code_completion': return <CodeCompletion {...props} />
      case 'matching': return <Matching {...props} />
      case 'sequencing': return <Sequencing {...props} />
      case 'fill_in_blank': return <FillInBlank {...props} />
      case 'diagram_quiz': return <DiagramQuiz {...props} />
      case 'guess_output': return <GuessTheOutput {...props} />
      case 'spot_the_bug': return <SpotTheBug {...props} />
      case 'acronym_challenge': return <AcronymChallenge {...props} />
      default: return <p>Unknown exercise type: {exercise.type}</p>
    }
  }

  return (
    <div className="flex flex-col gap-6 pb-24">
      {/* Progress bar */}
      <div className="h-1.5 rounded-full bg-[var(--glass-border)] overflow-hidden">
        <div
          className="h-full rounded-full bg-[var(--color-primary)]"
          style={{ width: `${progress}%`, transition: 'width 0.3s var(--spring-smooth)' }}
        />
      </div>

      <div className="text-xs text-[var(--text-secondary)]">
        {currentIdx + 1} of {exercises.length}
      </div>

      {renderExercise()}

      {result && (
        <div className="flex flex-col gap-3 mt-2">
          <div
            className="text-center py-3 rounded-xl font-semibold"
            style={{
              background: result.correct ? 'rgba(52,199,89,0.1)' : 'rgba(255,59,48,0.1)',
              color: result.correct ? 'var(--color-success)' : 'var(--color-danger)',
            }}
          >
            {result.correct ? 'Correct!' : 'Not quite'}
          </div>
          <GlassButton onClick={handleNext} fullWidth>
            {isLast ? 'Complete Lesson' : 'Next'}
          </GlassButton>
        </div>
      )}

      <XPPopup xp={result?.xpEarned ?? 0} show={showXP} onDone={() => setShowXP(false)} />
    </div>
  )
}
