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
    value:
      'Frontend Engineer at Open Digital Services, Santander Group, working on business-account onboarding flows for Santander Spain, Mexico, and the UK',
    tags: ['experience', 'current-role', 'recruiting', 'frontend', 'product', 'onboarding'],
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
      'React, TypeScript, product frontend, financial onboarding flows, Astro, design systems, accessibility, Cloudflare Workers, AI-assisted engineering workflows with Windsurf, Devin, Codex, GitHub Copilot, MCP servers, context engineering, reusable skills, and an MCP server built to support component-library consumers',
    tags: ['skills', 'frontend', 'product', 'onboarding', 'ai', 'summary'],
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
  {
    id: 'qa-experience',
    label: 'QA experience',
    value:
      'Miguel worked as a QA Software Engineer at Jember Engineering Solutions from Sep 2023 to Jul 2024. He coordinated with app frontend teams, reported hundreds of bugs that improved performance and UX, and co-led the recovery of an abandoned test automation project, reducing regression testing cost by about 50% in person days.',
    tags: ['experience', 'qa', 'quality', 'testing', 'jember', 'impact'],
    priority: 82,
  },
  {
    id: 'agent-context',
    label: 'CV chat agent context',
    value:
      'The cv-chat agent answers from curated profile context aligned with the visible CV: experience, work signals, technical skills, education, certifications, projects, and selected recent AI-related memories.',
    tags: ['portfolio', 'projects', 'ai', 'summary'],
    priority: 80,
  },
  {
    id: 'exponential-community',
    label: 'Exponential Community',
    value:
      'Miguel joined Exponential Community, part of Exponential Fellowship in Spain, to get closer to current technology and startup thinking, learn from builders, and meet young people with similar curiosity. He is not framing it as founder intent.',
    tags: ['learning', 'startup', 'community', 'technology', 'summary'],
    priority: 72,
  },
];
