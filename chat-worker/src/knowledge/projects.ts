export type ProjectBlock = {
  id: string;
  title: string;
  shortSummary: string;
  problem?: string;
  solution?: string;
  impact?: string;
  technologies: string[];
  links: {
    demo?: string;
    repo?: string;
    article?: string;
  };
  tags: string[];
  visibility: 'public' | 'private' | 'limited';
  priority: number;
};

export const projects: ProjectBlock[] = [
  {
    id: 'cv-chat',
    title: 'cv-chat',
    shortSummary:
      "Miguel's professional profile website with a fast AI chat assistant grounded in curated profile context.",
    problem:
      'A static CV does not let visitors explore experience interactively or ask role-specific questions.',
    solution:
      'Astro site with React AI SDK UI, Cloudflare Worker chat backend, opencode Zen provider, and curated profile context.',
    impact:
      'Acts as both a professional website and a live demo of practical AI and product engineering.',
    technologies: ['Astro', 'React', 'TypeScript', 'AI SDK UI', 'Cloudflare Workers', 'opencode Zen'],
    links: {
      demo: 'https://miguelgarglez.com/cv-chat/',
    },
    tags: ['ai', 'agents', 'portfolio', 'frontend', 'cloudflare', 'personal-site'],
    visibility: 'public',
    priority: 100,
  },
  {
    id: 'video-digest',
    title: 'video-digest',
    shortSummary:
      'Local-first CLI and TUI that turns a YouTube URL into reviewable transcripts and Markdown digests. Published on npm as 1.2.0 for macOS Apple Silicon and Linux x64, with an Artifact Library on disk and agent-friendly JSON contracts. Personal tooling for AI-assisted learning workflows, not a company production system.',
    problem:
      'Saved YouTube videos pile up unused; browser-based transcript automation is fragile, and raw model summaries are hard to inspect or reuse.',
    solution:
      'A Bun/TypeScript CLI with a Python transcript sidecar and a TUI. Writes a local Artifact Library of Markdown and JSON. Supports humans in the terminal and agents via stable JSON. Package 1.2.0 supports macOS on Apple Silicon and Linux x64; macOS Intel and Windows are not supported.',
    impact:
      'A public npm package and GitHub repo Miguel uses as personal CLI tooling in AI workflows. Do not overstate production or company-wide use.',
    technologies: ['Bun', 'TypeScript', 'Python', 'TUI'],
    links: {
      demo: 'https://www.npmjs.com/package/video-digest',
      repo: 'https://github.com/miguelgarglez/video-digest',
      article: 'https://miguelgarglez.com/projects/video-digest/',
    },
    tags: [
      'cli',
      'tui',
      'youtube',
      'transcript',
      'digest',
      'ai',
      'agents',
      'personal-tooling',
      'open-source',
      'bun',
      'linux',
      'macos',
    ],
    visibility: 'public',
    priority: 88,
  },
  {
    id: 'kubit-react-charts',
    title: 'Kubit React Charts',
    shortSummary:
      "Open-source charting work connected to Santander's Kubit UI ecosystem.",
    technologies: ['React', 'TypeScript', 'charts', 'design systems'],
    links: {
      repo: 'https://github.com/kubit-ui/kubit-react-charts',
    },
    tags: ['frontend', 'design-systems', 'charts', 'open-source', 'professional'],
    visibility: 'public',
    priority: 90,
  },
  {
    id: 'wellstudio-platform',
    title: 'wellstudio_platform',
    shortSummary:
      'One product for a boutique gym: public schedule, member bookings, staff desk, and online packs on the same rules.',
    problem:
      'Studios often run a marketing site, a booking tool, and payments as separate pieces, so staff patch gaps instead of coaching.',
    solution:
      'Modular Next.js monolith with Supabase Auth, Prisma, Postgres, and Stripe Checkout. Public, member, and staff journeys share eligibility and capacity. Sales decks live on Preview only.',
    impact:
      'A working Preview demo plus a commercial showcase and a plain-language hybrid operating model for gym owners.',
    technologies: ['Next.js', 'TypeScript', 'Prisma', 'Supabase', 'Stripe'],
    links: {
      demo: 'https://preview-wellstudio.miguelgarglez.com',
      repo: 'https://github.com/miguelgarglez/wellstudio-platform',
      article: 'https://miguelgarglez.com/projects/wellstudio-platform/',
    },
    tags: ['frontend', 'full-stack', 'nextjs', 'product', 'saas', 'professional'],
    visibility: 'public',
    priority: 85,
  },
  {
    id: 'frontend-dual-layout-showcase',
    title: 'frontend_dual_layout_showcase',
    shortSummary:
      'Frontend case study with two UI flows: desktop dashboard and mobile-first request form.',
    technologies: ['React', 'TypeScript', 'Tailwind CSS', 'Vitest'],
    links: {
      demo: 'https://miguelgarglez.com/frontend-dual-layout-showcase',
      repo: 'https://github.com/miguelgarglez/frontend-dual-layout-showcase',
    },
    tags: ['frontend', 'react', 'testing', 'case-study', 'ui'],
    visibility: 'public',
    priority: 78,
  },
  {
    id: 'momentum',
    title: 'momentum',
    shortSummary:
      'Archived native macOS menu-bar app for project time tracking. Miguel stopped using it; the source stays public as a case study.',
    problem:
      'Side projects needed visible progress, but automatic app/domain tracking was fragile and the daily loop did not stick.',
    solution:
      'Swift/SwiftUI, local-first, menu-bar first. The product landing was taken down; the repository remains as reference.',
    technologies: ['Swift', 'SwiftUI', 'macOS'],
    links: {
      article: 'https://miguelgarglez.com/projects/momentum/',
      repo: 'https://github.com/miguelgarglez/momentum',
    },
    tags: ['macos', 'swiftui', 'archived', 'native-app'],
    visibility: 'public',
    priority: 28,
  },
  {
    id: 'genai-intensive-capstone',
    title: 'Google GenAI Intensive capstone',
    shortSummary:
      'Lightweight practical exposure to RAG and GenAI concepts during Google GenAI Intensive, a five-day program that ended with a capstone project.',
    problem:
      'The goal was learning and applying GenAI patterns in a focused course setting, not building a production RAG system.',
    solution:
      'Capstone-style work applying course concepts such as LLMs, retrieval-augmented generation, embeddings, and grounded answers.',
    impact:
      'Gave Miguel light hands-on familiarity with RAG concepts and helped connect GenAI theory with practical implementation tradeoffs.',
    technologies: ['LLM', 'RAG', 'embeddings', 'Google GenAI Intensive'],
    links: {},
    tags: ['ai', 'rag', 'genai', 'capstone', 'learning', 'course'],
    visibility: 'limited',
    priority: 80,
  },
];
