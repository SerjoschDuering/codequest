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

IMPORTANT rules for choosing exercise types:
- Prefer simpler types: multiple_choice, fill_in_blank, matching, acronym_challenge
- Only use code_completion, guess_output, spot_the_bug when the content is specifically about programming code
- For conceptual/theory notes, stick to multiple_choice, fill_in_blank, matching, sequencing
- Always include at least one multiple_choice exercise
- Mix 2-3 different types per quiz

Generate 3-5 varied exercises. Make questions educational and fun.
Focus on practical understanding, not trivia.`

export function buildGeneratePrompt(text: string): string {
  return `Generate coding exercises from this content:\n\n${text}`
}

export function buildNotesPrompt(noteContent: string): string {
  return `A student wrote these learning notes. Generate exercises to help them review and retain the concepts:\n\n${noteContent}`
}

export function buildEnhancePrompt(noteContent: string): string {
  return `A student wrote these learning notes. Enhance them by adding:
- Clearer explanations of the concepts mentioned
- Practical examples or code snippets where relevant
- Common pitfalls or misconceptions
- Key takeaways

Keep it concise (2-3 short paragraphs max). Write in a friendly, educational tone.
Do NOT repeat the original notes — only add NEW information that complements them.
Return ONLY the enhanced content as plain text (no JSON, no markdown headers).

Student's notes:
${noteContent}`
}

export function buildMultiNotesPrompt(notes: Array<{ title: string; content: string }>): string {
  const count = Math.min(notes.length * 2 + 1, 8)
  const notesBlock = notes
    .map((n) => `--- Note: ${n.title} ---\n${n.content}`)
    .join('\n\n')
  return `A student took these study notes. Generate exercises to help them review and retain ALL the concepts across these notes. Reference specific details from the notes.

Pick exercise types that match the content:
- For concepts/theory: multiple_choice, fill_in_blank, matching, sequencing
- For code topics: also use code_completion or guess_output
- Always start with a multiple_choice question

${notesBlock}

Generate ${count} exercises covering key concepts from all notes above.`
}

export function buildTopicPrompt(topic: string): string {
  return `A student wants to learn about "${topic}". Generate 3-5 exercises that teach the core concepts of this topic. Start from fundamentals and progress to slightly harder questions. Use varied exercise types (multiple_choice, code_completion, guess_output, fill_in_blank, spot_the_bug). Make the exercises educational and self-contained — the student has no lesson material, only these exercises.`
}
