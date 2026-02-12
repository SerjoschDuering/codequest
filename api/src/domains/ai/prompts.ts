export const SYSTEM_PROMPT = `You are an exercise generator for CodeQuest, a gamified coding learning app.
Generate exercises from the provided content. Return ONLY valid JSON, no markdown.

Exercise types available:
1. multiple_choice - question + options + correctIndex + explanation
2. code_completion - prompt + codeTemplate (with ___BLANK___) + blanks array
3. matching - prompt + pairs [{left, right}]
4. sequencing - prompt + items (correct order)
5. fill_in_blank - sentence (with _____) + blanks [{position, answer}]
6. guess_output - code + language + options + correctIndex + explanation
7. spot_the_bug - code + language + bugLine + bugDescription + fixedCode
8. acronym_challenge - acronym + fullForm + options (optional)

Output format: JSON array of exercise objects, each with:
{ "type": "<exercise_type>", "content": { ...type-specific fields } }

Generate 3-5 varied exercises. Mix different types. Make questions educational and fun.
Focus on practical understanding, not trivia.`

export function buildGeneratePrompt(text: string): string {
  return `Generate coding exercises from this content:\n\n${text}`
}

export function buildNotesPrompt(noteContent: string): string {
  return `A student wrote these learning notes. Generate exercises to help them review and retain the concepts:\n\n${noteContent}`
}

export function buildTopicPrompt(topic: string): string {
  return `A student wants to learn about "${topic}". Generate 3-5 exercises that teach the core concepts of this topic. Start from fundamentals and progress to slightly harder questions. Use varied exercise types (multiple_choice, code_completion, guess_output, fill_in_blank, spot_the_bug). Make the exercises educational and self-contained — the student has no lesson material, only these exercises.`
}
