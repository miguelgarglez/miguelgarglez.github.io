export type ReadingArea = "engineering" | "product" | "design";

export type ReadingType = "book" | "article" | "newsletter" | "paper" | "video";

export type Reading = {
  slug: string;
  title: string;
  subtitle?: string;
  author: string;
  href: string;
  type: ReadingType;
  area: ReadingArea;
  note: string;
  tags: string[];
  featured: boolean;
  /** Local cover under /public when available. */
  cover?: string;
  /** ISBN used for Open Library lookups when curating covers. */
  isbn?: string;
};

export const readings: Reading[] = [
  {
    slug: "software-engineers-guidebook",
    title: "The Software Engineer's Guidebook",
    subtitle:
      "Navigating senior, tech lead, and staff engineer positions at tech companies and startups",
    author: "Gergely Orosz",
    href: "https://www.engguidebook.com/",
    type: "book",
    area: "engineering",
    note: "A pragmatic career reference for understanding engineering growth, senior expectations, and the path toward broader technical leadership.",
    tags: ["career", "engineering-leadership", "staff-engineer"],
    featured: true,
    cover: "/readings/software-engineers-guidebook.jpg",
    isbn: "9789083381824",
  },
  {
    slug: "insanely-great",
    title: "Insanely Great",
    subtitle: "The Life and Times of Macintosh, the Computer that Changed Everything",
    author: "Steven Levy",
    href: "https://www.stevenlevy.com/insanely-great",
    type: "book",
    area: "product",
    note: "A technology history reference about the Macintosh, useful for thinking about taste, product conviction, and how strong interface ideas become cultural objects.",
    tags: ["apple", "macintosh", "technology-history"],
    featured: true,
    cover: "/readings/insanely-great.jpg",
    isbn: "9780140291773",
  },
  {
    slug: "creative-selection",
    title: "Creative Selection",
    subtitle: "Inside Apple's Design Process During the Golden Age of Steve Jobs",
    author: "Ken Kocienda",
    href: "https://books.apple.com/us/book/creative-selection/id1356275701",
    type: "book",
    area: "design",
    note: "An inside look at Apple's demo-driven product craft, connecting engineering, taste, iteration, collaboration, and empathy.",
    tags: ["apple", "product-craft", "software-design"],
    featured: true,
    cover: "/readings/creative-selection.jpg",
    isbn: "9781529004731",
  },
];
