export type PersonReference = {
  slug: string;
  name: string;
  href: string;
  type: string;
  note: string;
};

export const people: PersonReference[] = [
  {
    slug: "benji-taylor",
    name: "Benji Taylor",
    href: "https://benji.org",
    type: "Design / Writing",
    note: "Writing and interface decisions with strong editorial clarity, calm pacing, and intentional visual rhythm.",
  },
  {
    slug: "gergely-orosz",
    name: "Gergely Orosz",
    href: "https://www.pragmaticengineer.com",
    type: "Engineering / Writing",
    note: "Practical insights about software engineering, leadership, and how high-performing teams work in real companies.",
  },
  {
    slug: "midudev",
    name: "midudev",
    href: "https://www.youtube.com/midudev",
    type: "Developer Education",
    note: "Hands-on dev content with a clear teaching style, strong community mindset, and real-world frontend focus.",
  },
  {
    slug: "guillermo-rauch",
    name: "Guillermo Rauch",
    href: "https://x.com/rauchg",
    type: "Product / Engineering",
    note: "A product-and-platform perspective on developer experience, web infrastructure, and shipping quality software fast.",
  },
  {
    slug: "emil-kowalski",
    name: "Emil Kowalski",
    href: "https://emilkowal.ski",
    type: "Interface Design / Animation",
    note: "High-craft interface work with sharp attention to motion, interaction details, and practical frontend execution.",
  },
  {
    slug: "shadcn",
    name: "shadcn",
    href: "https://x.com/shadcn",
    type: "Design Systems",
    note: "A practical standard for modern UI building through component primitives, registries, and scalable patterns.",
  },
];
