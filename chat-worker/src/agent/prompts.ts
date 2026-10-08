import { profileFacts } from '../knowledge/profile-facts';
import type { RichCardPart } from './answer-parts';
import type { AgentContext } from './types';

const DEFLECTION_FACT_IDS = ['linkedin', 'x'];

export const profileAssistantPolicy = `
You are Miguel Garcia's professional profile assistant.
You help visitors understand Miguel's experience, projects, strengths, work style, and contact options.

Rules:
- Answer using only the provided context: critical profile facts, profile context, relevant projects, and recent public updates.
- Suggested prompts on the site are entry points into this same context. Answer them directly.
- If the provided context includes relevant facts or profile sections, you MUST answer from them. Do not say you lack information, do not know, or have no data when the selected context already covers the question.
- Only say you do not have a specific detail when that detail is truly absent from the provided context (for example unpublished salary, a phone number, or a company not listed). Then invite the user to reach Miguel on LinkedIn or X.
- Do not invent experience, companies, projects, metrics, links, technologies, or availability.
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

export const RICH_CARD_POLICY_HEADING =
  'Answer format for this request (overrides the formatting rules above):';

const richCardPolicyByType: Record<RichCardPart['type'], string[]> = {
  'data-projects': [
    'Write 2-4 plain sentences. No lists, no headings, no URLs.',
    'The interface already shows every relevant project with its summary, stack, and links right below your reply, so do not repeat them.',
    'Say what the projects show about Miguel and which one best answers the question.',
  ],
  'data-timeline': [
    'Write 2-4 plain sentences. No lists, no headings, no URLs.',
    'The interface already shows a career timeline with every role, company, and period right below your reply, so do not walk through each role.',
    'Highlight what matters for the question.',
  ],
  // The email and LinkedIn are the answer itself, so they stay in the text.
  'data-contact': [
    'Write 1-3 plain sentences. No lists, no headings.',
    'The interface already shows the email, LinkedIn, X, and location right below your reply.',
    'Still give the email and the LinkedIn link once, and say which channel suits what.',
  ],
};

export function buildRichCardPolicy(card: RichCardPart) {
  return [
    RICH_CARD_POLICY_HEADING,
    ...richCardPolicyByType[card.type].map((line) => `- ${line}`),
  ].join('\n');
}

export function buildContextText(context: AgentContext) {
  const selectedFactIds = new Set(context.selectedFacts.map((fact) => fact.id));
  const deflectionFacts = profileFacts.filter(
    (fact) => DEFLECTION_FACT_IDS.includes(fact.id) && !selectedFactIds.has(fact.id)
  );
  const sections = [
    `Detected audience: ${context.audience}`,
    `Detected intent: ${context.intent}`,
    `Critical profile facts:`,
    ...[...context.selectedFacts, ...deflectionFacts].map((fact) => `${fact.label}: ${fact.value}`),
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
