export type PersonArea =
  | "design"
  | "engineering"
  | "education"
  | "product"
  | "design-systems";

export type PersonReference = {
  slug: string;
  name: string;
  href: string;
  type: string;
  note: string;
  area: PersonArea;
  summary: string;
  learns: string[];
};

export const people: PersonReference[] = [
  {
    slug: "benji-taylor",
    name: "Benji Taylor",
    href: "https://benji.org",
    type: "Design / Writing",
    area: "design",
    note: "Writing and interface decisions with strong editorial clarity, calm pacing, and intentional visual rhythm.",
    summary:
      "A reference for precise taste, quiet interface direction, and writing that makes product thinking feel intentional.",
    learns: [
      "Editorial clarity in interface work",
      "Calm visual pacing",
      "Design decisions with restraint",
    ],
  },
  {
    slug: "gergely-orosz",
    name: "Gergely Orosz",
    href: "https://www.pragmaticengineer.com",
    type: "Engineering / Writing",
    area: "engineering",
    note: "Practical insights about software engineering, leadership, and how high-performing teams work in real companies.",
    summary:
      "A practical reference for understanding engineering organizations, technical leadership, and the realities behind strong delivery.",
    learns: [
      "How engineering teams operate at scale",
      "Pragmatic technical leadership",
      "Clear writing about industry patterns",
    ],
  },
  {
    slug: "midudev",
    name: "midudev",
    href: "https://www.youtube.com/midudev",
    type: "Developer Education",
    area: "education",
    note: "Hands-on dev content with a clear teaching style, strong community mindset, and real-world frontend focus.",
    summary:
      "A reference for accessible developer education, energetic community building, and practical frontend learning.",
    learns: [
      "Teaching through real examples",
      "Community-first communication",
      "Practical frontend craft",
    ],
  },
  {
    slug: "guillermo-rauch",
    name: "Guillermo Rauch",
    href: "https://x.com/rauchg",
    type: "Product / Engineering",
    area: "product",
    note: "A product-and-platform perspective on developer experience, web infrastructure, and shipping quality software fast.",
    summary:
      "A reference for product-minded engineering, developer experience, infrastructure taste, and fast high-quality shipping.",
    learns: [
      "Developer experience as product",
      "Platform thinking",
      "Shipping speed with craft",
    ],
  },
  {
    slug: "emil-kowalski",
    name: "Emil Kowalski",
    href: "https://emilkowal.ski",
    type: "Interface Design / Animation",
    area: "design",
    note: "High-craft interface work with sharp attention to motion, interaction details, and practical frontend execution.",
    summary:
      "A reference for interaction quality, animation craft, and frontend implementation that makes interfaces feel considered.",
    learns: [
      "Purposeful motion",
      "Interaction detail",
      "High-craft frontend execution",
    ],
  },
  {
    slug: "shadcn",
    name: "shadcn",
    href: "https://x.com/shadcn",
    type: "Design Systems",
    area: "design-systems",
    note: "A practical standard for modern UI building through component primitives, registries, and scalable patterns.",
    summary:
      "A reference for modern component systems, practical primitives, and scalable UI distribution patterns.",
    learns: [
      "Composable UI primitives",
      "Design-system distribution",
      "Practical component APIs",
    ],
  },
];
