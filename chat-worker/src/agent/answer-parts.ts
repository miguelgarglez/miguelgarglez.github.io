import { roles } from '../../../cv-chat/src/data/experience';
import {
  projects as directoryProjects,
  type Project,
} from '../../../src/data/projects';
import type {
  BoardPartType,
  ChatSource,
  CvChatDataPart,
  ProjectCard,
} from '../../../shared/chat-parts';
import { profileFacts } from '../knowledge/profile-facts';
import { normalizeText } from './text';
import type { AgentContext, Intent } from './types';

const SITE_URL = 'https://miguelgarglez.com';
const MAX_SOURCES = 4;
const MAX_FOLLOWUPS = 2;

export type RichCardPart = Extract<
  CvChatDataPart,
  { type: `data-${BoardPartType}` }
>;

export type AnswerParts = {
  leading: CvChatDataPart[];
  richCard: RichCardPart | null;
  trailing: CvChatDataPart[];
};

type RichCardBuilder = (context: AgentContext) => RichCardPart | null;

const absolutize = (url: string) =>
  url.startsWith('/') ? `${SITE_URL}${url}` : url;

function toProjectCard(project: Project): ProjectCard {
  const [image] = project.images ?? [];
  const links: ProjectCard['links'] = [
    { kind: 'live' as const, url: project.liveUrl },
    { kind: 'repo' as const, url: project.repositoryUrl },
    { kind: 'case-study' as const, url: project.caseStudyUrl },
  ].flatMap(({ kind, url }) => (url ? [{ kind, url: absolutize(url) }] : []));

  return {
    slug: project.slug,
    name: project.displayName,
    year: project.year,
    status: project.status,
    role: project.role,
    description: project.description,
    summary: project.summary,
    capabilities: project.capabilities,
    stack: project.stack,
    ...(image
      ? {
          image: {
            src: absolutize(image.src),
            alt: image.alt,
            ...(image.position ? { position: image.position } : {}),
          },
        }
      : {}),
    links,
  };
}

function factValue(id: string) {
  const fact = profileFacts.find((item) => item.id === id);
  if (!fact) throw new Error(`Missing profile fact: ${id}`);
  return fact.value;
}

const richCardByIntent: Partial<Record<Intent, RichCardBuilder>> = {
  projects: (context) => {
    const items = context.selectedProjects.flatMap((selected) => {
      const project = directoryProjects.find(
        (entry) => entry.slug === selected.id
      );
      return project ? [toProjectCard(project)] : [];
    });
    return items.length
      ? { type: 'data-projects', id: 'projects', data: { items } }
      : null;
  },
  experience: () => ({
    type: 'data-timeline',
    id: 'timeline',
    data: {
      items: roles.map((role) => ({
        title: role.title,
        company: role.company,
        period: role.period,
        summary: role.summary,
        current: role.status === 'current role',
      })),
    },
  }),
  contact: () => ({
    type: 'data-contact',
    id: 'contact',
    data: {
      name: factValue('name'),
      location: factValue('location'),
      email: factValue('email'),
      linkedin: factValue('linkedin'),
      x: factValue('x'),
    },
  }),
};

export const followupsByIntent: Record<Intent, string[]> = {
  summary: [
    'What kind of engineer is Miguel?',
    'What has Miguel built outside work?',
    'How does this CV chat work?',
  ],
  experience: [
    'What has Miguel built at Santander?',
    'What has Miguel built outside work?',
    "Explain Miguel's design system experience",
  ],
  projects: [
    'How does this CV chat work?',
    'How does Miguel use AI in engineering?',
    'What has Miguel built at Santander?',
  ],
  skills: [
    "Explain Miguel's design system experience",
    'How does Miguel use AI in engineering?',
    'What has Miguel built at Santander?',
  ],
  work_style: [
    'What makes Miguel a strong product-minded frontend engineer?',
    "How did Miguel's early role shape his product mindset?",
    'What kind of engineer is Miguel?',
  ],
  contact: [
    'What kind of engineer is Miguel?',
    'What has Miguel built at Santander?',
    "Summarize Miguel's work style",
  ],
  availability: [
    'What kind of engineer is Miguel?',
    "Summarize Miguel's work style",
    'What has Miguel built at Santander?',
  ],
  education: [
    'What has Miguel been learning recently?',
    "What is Miguel's academic background?",
    'How does Miguel use AI in engineering?',
  ],
  recent_updates: [
    'What has Miguel been learning recently?',
    'How does this CV chat work?',
    'How does Miguel use AI in engineering?',
  ],
  unknown: [
    'What kind of engineer is Miguel?',
    'What has Miguel built at Santander?',
    'How does this CV chat work?',
  ],
};

function buildSources(context: AgentContext): CvChatDataPart[] {
  const blocks = context.selectedProfileBlocks.map((block) => ({
    id: `block:${block.id}`,
    label: block.title,
  }));
  const projects = context.selectedProjects.map((project) => ({
    id: `project:${project.id}`,
    label: project.title,
  }));
  const candidates: ChatSource[] = [
    ...(context.intent === 'projects'
      ? [...projects, ...blocks]
      : [...blocks, ...projects]),
    ...context.selectedMemories.map((memory) => ({
      id: `memory:${memory.id}`,
      label: memory.title,
    })),
  ];
  const seen = new Set<string>();
  const items = candidates
    .filter((item) => {
      const key = normalizeText(item.label);
      if (seen.has(key)) return false;
      seen.add(key);
      return true;
    })
    .slice(0, MAX_SOURCES);
  return items.length
    ? [{ type: 'data-sources', id: 'sources', data: { items } }]
    : [];
}

function buildFollowups(question: string, intent: Intent): CvChatDataPart {
  const asked = normalizeText(question);
  const prompts = followupsByIntent[intent]
    .filter((prompt) => normalizeText(prompt) !== asked)
    .slice(0, MAX_FOLLOWUPS);
  return { type: 'data-followups', id: 'followups', data: { prompts } };
}

export function buildAnswerParts(input: {
  question: string;
  context: AgentContext;
}): AnswerParts {
  const { question, context } = input;
  const richCard = richCardByIntent[context.intent]?.(context) ?? null;
  return {
    leading: buildSources(context),
    richCard,
    trailing: [
      ...(richCard ? [richCard] : []),
      buildFollowups(question, context.intent),
    ],
  };
}
