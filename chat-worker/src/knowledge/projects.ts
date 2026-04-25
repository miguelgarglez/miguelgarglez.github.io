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
      demo: 'https://miguelgarglez.github.io/cv-chat/',
    },
    tags: ['ai', 'agents', 'portfolio', 'frontend', 'cloudflare', 'personal-site'],
    visibility: 'public',
    priority: 100,
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
      'Modular Next.js platform for a boutique wellness studio, covering members, bookings, plans, payments, and studio operations.',
    solution:
      'Built as a Vercel-first modular monolith with Supabase Auth, Supabase Postgres, Prisma, and focused testing gates.',
    technologies: ['Next.js', 'TypeScript', 'Prisma', 'Supabase'],
    links: {
      repo: 'https://github.com/miguelgarglez/wellstudio-platform',
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
      demo: 'https://miguelgarglez.github.io/frontend-dual-layout-showcase',
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
      'Native macOS productivity app focused on building and keeping momentum in daily work.',
    solution:
      'Published with a separate landing page and a public app repository.',
    technologies: ['Swift', 'SwiftUI', 'macOS', 'Astro Landing'],
    links: {
      demo: 'https://momentum-macos.vercel.app',
      repo: 'https://github.com/miguelgarglez/momentum',
    },
    tags: ['macos', 'swiftui', 'productivity', 'product', 'frontend'],
    visibility: 'public',
    priority: 72,
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
