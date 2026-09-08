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
  /** ISBN used when curating a cover into src/assets/readings/<slug>.webp. */
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
    isbn: "9781529004731",
  },
  {
    slug: "same-as-ever",
    title: "Same as Ever",
    subtitle: "A Guide to What Never Changes",
    author: "Morgan Housel",
    href: "https://www.penguinrandomhouse.com/books/672339/same-as-ever-by-morgan-housel/",
    type: "book",
    area: "product",
    note: "Timeless lessons on risk, opportunity, and human behavior—useful for judging what stays constant when products, markets, and careers keep shifting.",
    tags: ["judgment", "human-nature", "risk"],
    featured: true,
    isbn: "9780593332702",
  },
];
