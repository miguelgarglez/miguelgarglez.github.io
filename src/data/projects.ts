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

export type Project = {
  slug: string;
  title: string;
  href: string;
  external?: boolean;
  description: string;
  sub?: string | ProjectSubLink;
  links: ProjectLink[];
  stack: string[];
  status: string;
};

export const projects: Project[] = [
  {
    slug: "cv-chat",
    title: "cv-chat",
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
  },
  {
    slug: "wellstudio-platform",
    title: "wellstudio_platform",
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
  },
  {
    slug: "frontend-dual-layout-showcase",
    title: "frontend_dual_layout_showcase",
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
  },
  {
    slug: "kubit-react-charts",
    title: "kubit_react_charts",
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
  },
  {
    slug: "momentum",
    title: "momentum",
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
  },
];
