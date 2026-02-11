import { z } from 'zod'

// --- Exercise content schemas (stored as JSON text in DB) ---

export const multipleChoiceSchema = z.object({
  question: z.string(),
  options: z.array(z.string()).min(2).max(6),
  correctIndex: z.number().int().min(0),
  explanation: z.string().optional(),
})

export const codeCompletionSchema = z.object({
  prompt: z.string(),
  codeTemplate: z.string(), // code with ___BLANK___ placeholders
  blanks: z.array(z.object({
    placeholder: z.string(),
    answer: z.string(),
    hints: z.array(z.string()).optional(),
  })),
  language: z.string().optional(),
})

export const matchingSchema = z.object({
  prompt: z.string(),
  pairs: z.array(z.object({
    left: z.string(),
    right: z.string(),
  })).min(2).max(8),
})

export const sequencingSchema = z.object({
  prompt: z.string(),
  items: z.array(z.string()).min(2).max(10), // correct order
  explanation: z.string().optional(),
})

export const fillInBlankSchema = z.object({
  sentence: z.string(), // "_____ stands for Application Programming Interface"
  blanks: z.array(z.object({
    position: z.number(),
    answer: z.string(),
    acceptAlternatives: z.array(z.string()).optional(),
  })),
})

export const diagramQuizSchema = z.object({
  diagram: z.string(), // SVG string or ASCII art
  diagramType: z.enum(['architecture', 'flowchart', 'sequence', 'component']),
  questions: z.array(z.object({
    question: z.string(),
    options: z.array(z.string()).optional(),
    answer: z.string(),
  })),
})

export const guessOutputSchema = z.object({
  code: z.string(),
  language: z.string(),
  options: z.array(z.string()).min(2).max(6),
  correctIndex: z.number().int().min(0),
  explanation: z.string().optional(),
})

export const spotTheBugSchema = z.object({
  code: z.string(),
  language: z.string(),
  bugLine: z.number().int(),
  bugDescription: z.string(),
  fixedCode: z.string(),
  hints: z.array(z.string()).optional(),
})

export const acronymChallengeSchema = z.object({
  acronym: z.string(),
  fullForm: z.string(),
  options: z.array(z.string()).min(2).max(6).optional(),
  category: z.string().optional(),
  timeLimitSeconds: z.number().int().optional(),
})

export const exerciseContentSchema = z.discriminatedUnion('type', [
  z.object({ type: z.literal('multiple_choice'), data: multipleChoiceSchema }),
  z.object({ type: z.literal('code_completion'), data: codeCompletionSchema }),
  z.object({ type: z.literal('matching'), data: matchingSchema }),
  z.object({ type: z.literal('sequencing'), data: sequencingSchema }),
  z.object({ type: z.literal('fill_in_blank'), data: fillInBlankSchema }),
  z.object({ type: z.literal('diagram_quiz'), data: diagramQuizSchema }),
  z.object({ type: z.literal('guess_output'), data: guessOutputSchema }),
  z.object({ type: z.literal('spot_the_bug'), data: spotTheBugSchema }),
  z.object({ type: z.literal('acronym_challenge'), data: acronymChallengeSchema }),
])

export type ExerciseContent = z.infer<typeof exerciseContentSchema>
export type ExerciseType = ExerciseContent['type']
