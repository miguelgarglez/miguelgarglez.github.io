export type ChatSource = { id: string; label: string };

export type ProjectLinkKind = 'live' | 'repo' | 'case-study';

export type ProjectCard = {
  slug: string;
  name: string;
  year: number;
  status: string;
  role: string;
  description: string;
  summary: string;
  capabilities: string[];
  stack: string[];
  image?: { src: string; alt: string; position?: string };
  links: { kind: ProjectLinkKind; url: string }[];
};

export type RoleEntry = {
  title: string;
  company: string;
  period: string;
  summary: string;
  current: boolean;
};

export type ContactCard = {
  name: string;
  location: string;
  email: string;
  linkedin: string;
  x: string;
};

export type CvChatDataParts = {
  sources: { items: ChatSource[] };
  projects: { items: ProjectCard[] };
  timeline: { items: RoleEntry[] };
  contact: ContactCard;
  followups: { prompts: string[] };
};

export type CvChatDataPartType = keyof CvChatDataParts;

export type CvChatDataPart = {
  [K in CvChatDataPartType]: {
    type: `data-${K}`;
    id: string;
    data: CvChatDataParts[K];
  };
}[CvChatDataPartType];

export const BOARD_PART_TYPES = [
  'projects',
  'timeline',
  'contact',
] as const satisfies readonly CvChatDataPartType[];

export type BoardPartType = (typeof BOARD_PART_TYPES)[number];
