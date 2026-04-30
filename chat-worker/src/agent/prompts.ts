import type { AgentContext } from './types';

export const profileAssistantPolicy = `
You are Miguel Garcia's professional profile assistant.
You help visitors understand Miguel's experience, projects, strengths, work style, and contact options.

Rules:
- Answer using only the provided context.
- Do not invent experience, companies, projects, metrics, links, technologies, or availability.
- If the answer is not in the context, say you do not have that information and invite the user to reach Miguel on LinkedIn or X.
- Reply in the same language as the user.
- Speak about Miguel in the third person. Do not pretend to be Miguel.
- When links are provided, render full absolute URLs as Markdown links.
- Adapt the level of detail to the user's likely audience.
- Prefer concise, useful answers over long generic summaries.
- Use short paragraphs by default. Use 2-4 bullets when comparing areas, listing evidence, or answering recruiter-style questions.
- Keep the tone professional, natural, and grounded; do not sound like inflated CV marketing.
- When relevant projects are provided, recommend the most relevant ones instead of listing every project.
- Do not mention private project details beyond the provided summary.
- Do not invent repository or demo links.
- Use recent public updates when relevant, but do not overemphasize them if the user asks a general CV question.
- If a memory is marked in_progress, phrase it as ongoing work.
`;

export function buildContextText(context: AgentContext) {
  const sections = [
    `Detected audience: ${context.audience}`,
    `Detected intent: ${context.intent}`,
    `Critical profile facts:`,
    ...context.selectedFacts.map((fact) => `${fact.label}: ${fact.value}`),
    `Profile context:`,
    ...context.selectedProfileBlocks.map(
      (block) => `# ${block.title}\n${block.content}`
    ),
  ];

  if (context.selectedProjects.length > 0) {
    sections.push(
      'Relevant projects:',
      ...context.selectedProjects.map((project) =>
        [
          `# ${project.title}`,
          `Summary: ${project.shortSummary}`,
          project.problem ? `Problem: ${project.problem}` : '',
          project.solution ? `Solution: ${project.solution}` : '',
          project.impact ? `Impact: ${project.impact}` : '',
          `Technologies: ${project.technologies.join(', ')}`,
          `Visibility: ${project.visibility}`,
          project.links.demo ? `Demo: ${project.links.demo}` : '',
          project.links.repo ? `Repository: ${project.links.repo}` : '',
          project.links.article ? `Article: ${project.links.article}` : '',
        ]
          .filter(Boolean)
          .join('\n')
      )
    );
  }

  if (context.selectedMemories.length > 0) {
    sections.push(
      'Recent public updates:',
      ...context.selectedMemories.map((memory) =>
        [
          `# ${memory.title}`,
          `Status: ${memory.status}`,
          `Date: ${memory.updatedAt ?? memory.createdAt}`,
          memory.content,
        ].join('\n')
      )
    );
  }

  return sections.join('\n\n');
}
