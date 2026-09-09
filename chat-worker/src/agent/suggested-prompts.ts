import type { Intent } from './types';
import { normalizeText } from './text';

export type SuggestedPromptContract = {
  prompt: string;
  intent: Intent;
  factIds?: string[];
  blockIds: string[];
  projectIds?: string[];
  memoryIds?: string[];
};

/**
 * Exact visible CV Chat suggested prompts. Retrieval must pin this context
 * so a button click never produces an empty or "no information" answer.
 */
export const suggestedPromptContracts: SuggestedPromptContract[] = [
  {
    prompt: "Explain Miguel's design system experience",
    intent: 'skills',
    factIds: ['primary-stack'],
    blockIds: ['skills-frontend', 'experience-ods'],
    projectIds: ['kubit-react-charts'],
  },
  {
    prompt: 'How does Miguel use AI in engineering?',
    intent: 'skills',
    factIds: ['ai-tools-workflow'],
    blockIds: ['skills-devops', 'experience-ods'],
  },
  {
    prompt: "Summarize Miguel's work style",
    intent: 'work_style',
    blockIds: ['work-style', 'preferred-environments'],
  },
  {
    prompt: 'What makes Miguel a strong product-minded frontend engineer?',
    intent: 'skills',
    factIds: ['primary-stack'],
    blockIds: ['skills-frontend', 'experience-ods', 'recruiter-value-proposition'],
  },
  {
    prompt: 'What makes Miguel a strong frontend platform engineer?',
    intent: 'skills',
    factIds: ['primary-stack'],
    blockIds: ['skills-frontend', 'experience-ods'],
  },
  {
    prompt: 'What has Miguel built at Santander?',
    intent: 'experience',
    factIds: ['current-role'],
    blockIds: ['experience-ods', 'leadership-and-ownership'],
    memoryIds: ['santander-product-onboarding-team'],
  },
  {
    prompt: "Summarize Miguel's QA background",
    intent: 'experience',
    factIds: ['qa-experience'],
    blockIds: ['experience-jember', 'problem-solving-example'],
  },
  {
    prompt: "How did Miguel's early role shape his product mindset?",
    intent: 'experience',
    blockIds: ['experience-electric-save', 'about', 'work-style'],
  },
  {
    prompt: "What is Miguel's academic background?",
    intent: 'education',
    blockIds: ['education'],
  },
  {
    prompt: 'What has Miguel been learning recently?',
    intent: 'education',
    factIds: ['exponential-community'],
    blockIds: ['education-certifications'],
    memoryIds: ['exponential-community-joined', 'google-genai-intensive-capstone'],
  },
  {
    prompt: 'How does this CV chat work?',
    intent: 'summary',
    factIds: ['agent-context'],
    blockIds: ['cv-chat-agent'],
    projectIds: ['cv-chat'],
  },
  {
    prompt: 'What kind of engineer is Miguel?',
    intent: 'skills',
    factIds: ['current-role', 'primary-stack'],
    blockIds: ['about', 'recruiter-value-proposition', 'role-fit', 'skills-frontend'],
  },
];

export function matchSuggestedPrompt(question: string) {
  const normalized = normalizeText(question);
  return suggestedPromptContracts.find(
    (entry) => normalizeText(entry.prompt) === normalized
  );
}
