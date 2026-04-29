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
      'React, TypeScript, Astro, design systems, accessibility, Cloudflare Workers, AI-assisted engineering workflows with Windsurf, Devin, Codex, GitHub Copilot, MCP servers, context engineering, reusable skills, and an MCP server built to support component-library consumers',
    tags: ['skills', 'frontend', 'ai', 'summary'],
    priority: 85,
  },
  {
    id: 'ai-tools-workflow',
    label: 'AI tools and workflow',
    value:
      'Miguel has used Windsurf and Devin in professional work, and Codex and GitHub Copilot personally. He applies MCP/context workflows, structured prompts, and reusable skills to accelerate and standardize recurring development tasks while keeping human review and code ownership. In his current role, he built an MCP server to support consumers of the component library with contextual guidance, integration patterns, troubleshooting, and migration help.',
    tags: ['skills', 'ai', 'experience', 'work_style', 'current-role'],
    priority: 88,
  },
];
