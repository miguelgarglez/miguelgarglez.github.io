import { AUTHOR, SITE_NAME, SITE_URL, absoluteUrl } from "./config";

export function websiteSchema() {
  return {
    "@context": "https://schema.org",
    "@type": "WebSite",
    name: SITE_NAME,
    url: SITE_URL,
    description:
      "Personal directory of projects, notes, readings, and references by Miguel García.",
    author: personSchema(),
    inLanguage: "en",
  };
}

export function personSchema() {
  return {
    "@type": "Person",
    name: AUTHOR.name,
    url: SITE_URL,
    jobTitle: AUTHOR.jobTitle,
    email: `mailto:${AUTHOR.email}`,
    sameAs: AUTHOR.sameAs,
    address: {
      "@type": "PostalAddress",
      addressLocality: "Madrid",
      addressCountry: "ES",
    },
  };
}

export function profilePageSchema(description: string) {
  return {
    "@context": "https://schema.org",
    "@type": "ProfilePage",
    name: `${SITE_NAME} — CV`,
    url: absoluteUrl("/cv-chat/"),
    description,
    mainEntity: personSchema(),
    inLanguage: "en",
  };
}

export function blogPostingSchema(input: {
  title: string;
  description: string;
  slug: string;
  date: Date;
  updatedDate?: Date;
  tags: string[];
}) {
  return {
    "@context": "https://schema.org",
    "@type": "BlogPosting",
    headline: input.title,
    description: input.description,
    url: absoluteUrl(`/posts/${input.slug}/`),
    datePublished: input.date.toISOString(),
    dateModified: (input.updatedDate ?? input.date).toISOString(),
    author: personSchema(),
    publisher: {
      "@type": "Person",
      name: AUTHOR.name,
      url: SITE_URL,
    },
    keywords: input.tags.join(", "),
    inLanguage: "en",
    mainEntityOfPage: absoluteUrl(`/posts/${input.slug}/`),
  };
}

export function creativeWorkSchema(input: {
  name: string;
  description: string;
  slug: string;
  year: string;
  url?: string;
}) {
  return {
    "@context": "https://schema.org",
    "@type": "CreativeWork",
    name: input.name,
    description: input.description,
    url: absoluteUrl(`/projects/${input.slug}/`),
    author: personSchema(),
    dateCreated: input.year,
    ...(input.url ? { sameAs: input.url } : {}),
    inLanguage: "en",
  };
}

export function breadcrumbSchema(items: Array<{ name: string; path: string }>) {
  return {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    itemListElement: items.map((item, index) => ({
      "@type": "ListItem",
      position: index + 1,
      name: item.name,
      item: absoluteUrl(item.path),
    })),
  };
}
