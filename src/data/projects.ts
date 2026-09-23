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
  | "native-app"
  | "hackathon";

export type ProjectStage = "active" | "maintained" | "archived";

export type ProjectSection = {
  title: string;
  body?: string;
  items?: string[];
};

export type ProjectImage = {
  src: string;
  alt: string;
  /** Optional higher-res source for the lightbox. Falls back to `src`. */
  fullSrc?: string;
};

export type Project = {
  slug: string;
  title: string;
  displayName: string;
  href: string;
  external?: boolean;
  description: string;
  sub?: string | ProjectSubLink;
  links?: ProjectLink[];
  stack: string[];
  status: string;
  year: number;
  category: ProjectCategory;
  stage: ProjectStage;
  featured: boolean;
  role: string;
  summary: string;
  capabilities: string[];
  sections?: ProjectSection[];
  images?: ProjectImage[];
  showcaseUrl?: string;
  repositoryUrl?: string;
  liveUrl?: string;
  caseStudyUrl?: string;
  /** Optional visual theme for the project detail page. */
  theme?: "hackspain";
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
    stack: ["Astro", "TypeScript", "GSAP", "Cloudflare Worker"],
    status: "Active",
    year: 2026,
    category: "personal-site",
    stage: "active",
    featured: true,
    role: "Full-stack engineer",
    summary:
      "A personal profile experience that pairs a polished CV with a grounded AI chat over curated profile data.",
    capabilities: [
      "Professional profile and experience overview",
      "Grounded profile Q&A",
      "Animated content-focused CV",
      "Cloudflare Worker chat endpoint",
    ],
    images: [
      {
        src: "/projects/cv-chat/hero.webp",
        alt: "cv-chat hero with ASCII portrait and profile intro",
      },
      {
        src: "/projects/cv-chat/chat-drawer.webp",
        alt: "Chat drawer freshly opened with suggested CV questions",
      },
      {
        src: "/projects/cv-chat/chat-reply.webp",
        alt: "Chat reply answering what kind of engineer Miguel is",
      },
    ],
    liveUrl: "/cv-chat",
    caseStudyUrl: projectDetailPath("cv-chat"),
  },
  {
    slug: "video-digest",
    title: "video-digest",
    displayName: "Video Digest",
    href: "https://github.com/miguelgarglez/video-digest",
    external: true,
    description:
      "Local-first CLI and TUI for turning YouTube videos into transcripts and structured digests. npm 1.2.0 supports macOS Apple Silicon and Linux x64.",
    sub: "Published on npm as a small local-first tool with agent-friendly JSON contracts and an Artifact Library on disk.",
    stack: ["Bun", "TypeScript", "Python", "TUI"],
    status: "Active",
    year: 2026,
    category: "open-source",
    stage: "active",
    featured: true,
    role: "Full-stack engineer",
    summary:
      "A local-first CLI that turns a YouTube URL into reviewable transcripts and Markdown digests, with a TUI for humans and stable JSON for agents. Package 1.2.0 supports macOS Apple Silicon and Linux x64.",
    capabilities: [
      "YouTube transcript extraction with quality checks",
      "Structured digest generation via OpenCode",
      "Terminal UI and scriptable commands",
      "Local Artifact Library with Markdown and JSON outputs",
      "macOS Apple Silicon and Linux x64 support",
    ],
    images: [
      {
        src: "/projects/video-digest/help.webp",
        alt: "Installing video-digest and viewing CLI help",
      },
      {
        src: "/projects/video-digest/transcript.webp",
        alt: "Transcript command writing Artifact Library files, then listing entries",
      },
      {
        src: "/projects/video-digest/digest.webp",
        alt: "Opening a structured Markdown digest from the Artifact Library",
      },
    ],
    repositoryUrl: "https://github.com/miguelgarglez/video-digest",
    liveUrl: "https://www.npmjs.com/package/video-digest",
    caseStudyUrl: projectDetailPath("video-digest"),
  },
  {
    slug: "xfold",
    title: "xfold",
    displayName: "XFOLD",
    href: "/projects/xfold/",
    description:
      "HackSpain '26 project for the THEKER Robotics track: a simulated industrial line that presses, folds and bags shirts, with a live control-room dashboard.",
    sub: {
      before: "Built in 36 hours with three teammates. ",
      label: "Read the writeup",
      href: "/posts/folding-shirts-at-hackspain-2026/",
      after: ", with the demo video.",
    },
    stack: ["Python", "MuJoCo", "Isaac Sim", "Next.js", "TypeScript"],
    status: "Hackathon",
    year: 2026,
    category: "hackathon",
    stage: "archived",
    featured: true,
    role: "Dashboard and sim-to-UI bridge",
    summary:
      "A team project from HackSpain 2026 in Madrid. A shirt rides a belt through a press, a flap folder, a bagger and a seal station, all in simulated physics, and every run streams to a control room you can watch live or replay.",
    capabilities: [
      "Deformable cloth simulation on MuJoCo and Isaac Sim / PhysX",
      "Control-room dashboard with live view, replay and measurements",
      "Run journal over REST and SSE, with per-run video",
      "Camera-based fold-quality score for every cycle",
    ],
    sections: [
      {
        title: "My part",
        body: "I built the Next.js control room and the Python bridge between it and the simulation: an append-only run journal, REST for commands, SSE for live events, and the integration contract that let the physics and UI sides work in parallel. Also experiment persistence in SQLite, the live console and the XFOLD branding.",
      },
    ],
    images: [
      {
        src: "/projects/xfold/team.webp",
        alt: "The XFOLD team at HackSpain '26, in front of the event's mosaic wall",
      },
      {
        src: "/projects/xfold/brand.webp",
        alt: "XFOLD brand sheet with the folded-sleeve shirt mark and wordmark",
      },
    ],
    repositoryUrl: "https://github.com/rogarmu8/hackspain_2026_xfold",
    liveUrl: "https://www.youtube.com/watch?v=arIuPMPokuY",
    caseStudyUrl: projectDetailPath("xfold"),
    theme: "hackspain",
  },
  {
    slug: "wellstudio-platform",
    title: "wellstudio_platform",
    displayName: "WellStudio Platform",
    href: "https://preview-wellstudio.miguelgarglez.com",
    external: true,
    description:
      "A full-stack demo for a boutique fitness studio, with a public schedule, member bookings, and tools for staff. All data is synthetic.",
    sub: "Next.js and PostgreSQL, with Supabase Auth and Stripe test payments.",
    stack: ["Next.js", "TypeScript", "Prisma", "Supabase", "Stripe"],
    status: "Portfolio demo",
    year: 2026,
    category: "product-platform",
    stage: "active",
    featured: true,
    role: "Full-stack engineer",
    summary:
      "I built WellStudio to work through booking capacity, credit accounting, and payment retries in one application. It covers the public site, member accounts, and staff tools. The demo uses synthetic data and has no live studio users.",
    capabilities: [
      "Public schedule, plans, and demo lead capture",
      "Member portal with bookings, cancellations, and credit balances",
      "Staff tools for assisted bookings under the same capacity rules",
      "Credit-pack checkout using either the application simulator or Stripe test mode",
    ],
    sections: [
      {
        title: "Using the demo",
        items: [
          "Visitors can browse sample classes and plans, or leave an enquiry.",
          "Members can book or cancel a class and check their entitlements and credit balance.",
          "Staff can manage the day's classes, open sessions, and book for members within the same capacity limits.",
        ],
      },
      {
        title: "How it's built",
        body: "WellStudio is a modular Next.js monolith. Routes call domain services; PostgreSQL and Prisma store bookings, entitlements, and the credit ledger. Supabase Auth handles identity. Before granting credits, the payment service checks provider events against the purchase recorded locally.",
      },
      {
        title: "Engineering decisions",
        items: [
          "Bookings check capacity and spend credits in a serializable transaction, including when members compete for the last place.",
          "Database migrations keep active bookings unique while preserving repeated cancellations and waitlist history.",
          "Payment, provider-event, and notification keys identify work already processed, so a repeated confirmation does not grant credits again.",
        ],
      },
    ],
    repositoryUrl: "https://github.com/miguelgarglez/wellstudio-platform/tree/preview",
    liveUrl: "https://preview-wellstudio.miguelgarglez.com",
    showcaseUrl: "https://preview-wellstudio.miguelgarglez.com/showcase",
    images: [
      {
        src: "/projects/wellstudio-platform/public-classes.webp",
        alt: "Public class schedule on WellStudio",
      },
      {
        src: "/projects/wellstudio-platform/member-home.webp",
        alt: "Member home with upcoming bookings",
      },
      {
        src: "/projects/wellstudio-platform/staff-overview.webp",
        alt: "Staff desk overview for the day",
      },
    ],
    caseStudyUrl: projectDetailPath("wellstudio-platform"),
  },
  {
    slug: "frontend-dual-layout-showcase",
    title: "frontend_dual_layout_showcase",
    displayName: "Frontend Dual Layout Showcase",
    href: "https://miguelgarglez.com/frontend-dual-layout-showcase",
    external: true,
    description:
      "Frontend case study with two UI flows: desktop dashboard and mobile-first request form.",
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
    liveUrl: "https://miguelgarglez.com/frontend-dual-layout-showcase",
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
    stack: ["React", "TypeScript", "Charts", "Open Source"],
    status: "Active",
    year: 2025,
    category: "open-source",
    stage: "active",
    featured: false,
    role: "Contributor",
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
    href: "/projects/momentum/",
    description:
      "Native macOS menu-bar app for tracking time on personal projects. Archived after personal use didn't stick.",
    sub: "Source remains public as a case study. The product landing is down.",
    stack: ["Swift", "SwiftUI", "macOS"],
    status: "Archived",
    year: 2026,
    category: "native-app",
    stage: "archived",
    featured: false,
    role: "Native app engineer",
    summary:
      "A local-first macOS app that turned project time into visible progress. Archived after dogfooding: the daily loop did not earn a place in my week.",
    capabilities: [
      "Menu-bar first native macOS UI",
      "Local-first project time tracking",
      "SwiftUI and SwiftData",
      "macOS release packaging",
    ],
    sections: [
      {
        title: "Status",
        body: "Paused. I built this to use it, then stopped. The screenshots below are from the last product landing. The repository stays public as a reference, not as something I am shipping.",
      },
    ],
    images: [
      {
        src: "/projects/momentum/dashboard.webp",
        alt: "Momentum dashboard with project sidebar, summary cards, and monthly chart",
      },
      {
        src: "/projects/momentum/project-detail.webp",
        alt: "Project detail with cumulative stats, streak, and monthly bar chart",
      },
      {
        src: "/projects/momentum/project-editor.webp",
        alt: "Project editor modal for identity, apps, and domains",
      },
      {
        src: "/projects/momentum/status-menu.webp",
        alt: "macOS menu bar status menu for Momentum",
      },
    ],
    repositoryUrl: "https://github.com/miguelgarglez/momentum",
    caseStudyUrl: projectDetailPath("momentum"),
  },
];
