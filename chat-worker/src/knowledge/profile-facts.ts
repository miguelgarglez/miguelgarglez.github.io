export type ProfileFact = {
  id: string;
  label: string;
  value: string;
  tags: string[];
  priority: number;
};

export const profileFacts: ProfileFact[] = [
  {
    id: 'name',
    label: 'Name',
    value: 'Miguel Garcia',
    tags: ['identity', 'summary', 'recruiting'],
    priority: 100,
  },
  {
    id: 'location',
    label: 'Location',
    value: 'Madrid, Spain',
    tags: ['identity', 'location', 'availability'],
    priority: 95,
  },
  {
    id: 'current-role',
    label: 'Current role',
    value: 'Frontend UI Platform Engineer at Open Digital Services, Santander Group',
    tags: ['experience', 'current-role', 'recruiting', 'frontend'],
    priority: 100,
  },
  {
    id: 'current-role-dates',
    label: 'Current role dates',
    value: 'Sep 2024 - Current',
    tags: ['experience', 'current-role'],
    priority: 90,
  },
  {
    id: 'linkedin',
    label: 'LinkedIn',
    value: 'https://www.linkedin.com/in/miguel-garciag',
    tags: ['contact', 'identity'],
    priority: 100,
  },
  {
    id: 'x',
    label: 'X',
    value: 'https://x.com/miguel_garglez',
    tags: ['contact', 'identity'],
    priority: 90,
  },
  {
    id: 'site',
    label: 'Personal site',
    value: 'https://miguelgarglez.github.io',
    tags: ['contact', 'portfolio', 'projects'],
    priority: 85,
  },
  {
    id: 'primary-stack',
    label: 'Primary stack',
    value:
      'React, TypeScript, Astro, design systems, accessibility, Cloudflare Workers, AI-assisted engineering workflows',
    tags: ['skills', 'frontend', 'ai', 'summary'],
    priority: 85,
  },
];
