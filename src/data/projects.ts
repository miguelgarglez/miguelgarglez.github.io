export type ProjectLink = {
  label: string;
  href: string;
  external?: boolean;
};

export type ProjectSubLink = {
  before: string;
  label: string;
  href: string;
  after: string;
};

export type ProjectCategory =
  | "personal-site"
  | "product-platform"
  | "frontend-case-study"
  | "open-source"
  | "native-app";

export type ProjectStage = "active" | "maintained" | "archived";

export type Project = {
  slug: string;
  title: string;
  displayName: string;
  href: string;
  external?: boolean;
  description: string;
  sub?: string | ProjectSubLink;
  links: ProjectLink[];
  stack: string[];
  status: string;
  year: number;
  category: ProjectCategory;
  stage: ProjectStage;
  featured: boolean;
  role: string;
  summary: string;
  capabilities: string[];
  repositoryUrl?: string;
  liveUrl?: string;
  caseStudyUrl?: string;
};

const projectDetailPath = (slug: string) => `/projects/${slug}`;

export const projects: Project[] = [
  {
    slug: "cv-chat",
    title: "cv-chat",
    displayName: "cv-chat",
    href: "/cv-chat",
    description:
      "Digital CV with professional profile, experience, and a grounded chat experience.",
    sub: {
      before: "Includes ",
      label: "profile_chat",
      href: "/cv-chat/#chat",
      after: ", a grounded LLM Q&A on top of my profile data.",
    },
    links: [
      { label: "Open project", href: "/cv-chat" },
      {
        label: "Public URL",
        href: "https://miguelgarglez.github.io/cv-chat",
        external: true,
      },
    ],
    stack: ["Astro", "TypeScript", "GSAP", "Cloudflare Worker"],
    status: "Active",
    year: 2026,
    category: "personal-site",
    stage: "active",
    featured: true,
    role: "Product-minded full-stack builder",
    summary:
      "A personal profile experience that pairs a polished CV with a grounded AI chat over curated profile data.",
    capabilities: [
      "Professional profile and experience overview",
      "Grounded profile Q&A",
      "Animated content-focused CV",
      "Cloudflare Worker chat endpoint",
    ],
    liveUrl: "https://miguelgarglez.github.io/cv-chat",
    caseStudyUrl: projectDetailPath("cv-chat"),
  },
  {
    slug: "wellstudio-platform",
    title: "wellstudio_platform",
    displayName: "WellStudio Platform",
    href: "https://github.com/miguelgarglez/wellstudio-platform",
    external: true,
    description:
      "Modular Next.js platform for a boutique wellness studio, covering members, bookings, plans, payments, and studio operations.",
    sub: "Built as a Vercel-first modular monolith with Supabase Auth, Supabase Postgres, Prisma, and focused testing gates.",
    links: [
      {
        label: "GitHub repository",
        href: "https://github.com/miguelgarglez/wellstudio-platform",
        external: true,
      },
    ],
    stack: ["Next.js", "TypeScript", "Prisma", "Supabase"],
    status: "Active",
    year: 2026,
    category: "product-platform",
    stage: "active",
    featured: true,
    role: "Product and platform engineer",
    summary:
      "A modular product platform for a boutique wellness studio, designed around reservations, memberships, payments, and operational workflows.",
    capabilities: [
      "Member identity and account domain",
      "Class schedules and reservation flows",
      "Plans, credits, eligibility, and cancellation rules",
      "Preview and production delivery workflow",
    ],
    repositoryUrl: "https://github.com/miguelgarglez/wellstudio-platform",
    caseStudyUrl: projectDetailPath("wellstudio-platform"),
  },
  {
    slug: "frontend-dual-layout-showcase",
    title: "frontend_dual_layout_showcase",
    displayName: "Frontend Dual Layout Showcase",
    href: "https://miguelgarglez.github.io/frontend-dual-layout-showcase",
    external: true,
    description:
      "Frontend case study with two UI flows: desktop dashboard and mobile-first request form.",
    links: [
      {
        label: "Live demo",
        href: "https://miguelgarglez.github.io/frontend-dual-layout-showcase",
        external: true,
      },
      {
        label: "GitHub",
        href: "https://github.com/miguelgarglez/frontend-dual-layout-showcase",
        external: true,
      },
    ],
    stack: ["React", "TypeScript", "Tailwind CSS", "Vitest"],
    status: "Active",
    year: 2025,
    category: "frontend-case-study",
    stage: "active",
    featured: false,
    role: "Frontend engineer",
    summary:
      "A compact frontend case study exploring two contrasting interface flows: an information-dense dashboard and a mobile-first request journey.",
    capabilities: [
      "Responsive desktop dashboard",
      "Mobile-first form flow",
      "Reusable UI states",
      "Validation and interaction patterns",
    ],
    repositoryUrl: "https://github.com/miguelgarglez/frontend-dual-layout-showcase",
    liveUrl: "https://miguelgarglez.github.io/frontend-dual-layout-showcase",
    caseStudyUrl: projectDetailPath("frontend-dual-layout-showcase"),
  },
  {
    slug: "kubit-react-charts",
    title: "kubit_react_charts",
    displayName: "Kubit React Charts",
    href: "https://github.com/kubit-ui/kubit-react-charts",
    external: true,
    description:
      "Open-source chart components library where I actively contribute as part of my day-to-day work.",
    links: [
      {
        label: "GitHub repository",
        href: "https://github.com/kubit-ui/kubit-react-charts",
        external: true,
      },
    ],
    stack: ["React", "TypeScript", "Charts", "Open Source"],
    status: "Active",
    year: 2025,
    category: "open-source",
    stage: "active",
    featured: false,
    role: "Open-source contributor",
    summary:
      "A React chart components library contributed to as part of real product work and shared design-system needs.",
    capabilities: [
      "Reusable chart components",
      "Product interface charting patterns",
      "Design-system-aligned composition",
      "Shared component maintenance",
    ],
    repositoryUrl: "https://github.com/kubit-ui/kubit-react-charts",
    caseStudyUrl: projectDetailPath("kubit-react-charts"),
  },
  {
    slug: "momentum",
    title: "momentum",
    displayName: "Momentum",
    href: "https://momentum-macos.vercel.app",
    external: true,
    description:
      "Native macOS productivity app focused on building and keeping momentum in daily work.",
    sub: "Landing is published separately and the full app source is available in its public repository.",
    links: [
      {
        label: "Live landing",
        href: "https://momentum-macos.vercel.app",
        external: true,
      },
      {
        label: "GitHub",
        href: "https://github.com/miguelgarglez/momentum",
        external: true,
      },
    ],
    stack: ["Swift", "SwiftUI", "macOS", "Astro Landing"],
    status: "Active",
    year: 2026,
    category: "native-app",
    stage: "active",
    featured: false,
    role: "Product and native app builder",
    summary:
      "A native macOS productivity app for structuring work around projects, progress, and execution rhythm.",
    capabilities: [
      "Project-oriented work tracking",
      "Native macOS interaction model",
      "Low-friction daily capture",
      "Dedicated product landing page",
    ],
    repositoryUrl: "https://github.com/miguelgarglez/momentum",
    liveUrl: "https://momentum-macos.vercel.app",
    caseStudyUrl: projectDetailPath("momentum"),
  },
];
