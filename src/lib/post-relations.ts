import type { CollectionEntry } from "astro:content";
import { projects, type Project } from "../data/projects";
import { getPostSeries, type PostSeries } from "../data/post-series";

export type PostEntry = CollectionEntry<"posts">;

export type SeriesContext = {
  series: PostSeries;
  order: number;
  total: number;
  previous: PostEntry | undefined;
  next: PostEntry | undefined;
  members: PostEntry[];
};

// A post is live once it is not a draft and its date has arrived. Future-dated
// posts stay hidden in production builds (a daily scheduled deploy publishes
// them on their date) and show up in `npm run dev` so they can be reviewed.
export function isPublished(data: { draft: boolean; date: Date }): boolean {
  if (data.draft) return false;
  return import.meta.env.DEV || data.date.valueOf() <= Date.now();
}

export function getPublishedPosts(posts: PostEntry[]): PostEntry[] {
  return posts
    .filter((post) => isPublished(post.data))
    .sort((a, b) => b.data.date.valueOf() - a.data.date.valueOf());
}

export function getSeriesContext(
  post: PostEntry,
  allPosts: PostEntry[],
): SeriesContext | undefined {
  const seriesId = post.data.series;
  const order = post.data.seriesOrder;
  const series = getPostSeries(seriesId);

  if (!seriesId || order === undefined || !series) {
    return undefined;
  }

  const members = getPublishedPosts(allPosts)
    .filter((entry) => entry.data.series === seriesId)
    .sort((a, b) => (a.data.seriesOrder ?? 0) - (b.data.seriesOrder ?? 0));

  if (members.length === 0) {
    return undefined;
  }

  const index = members.findIndex((entry) => entry.id === post.id);

  return {
    series,
    order,
    total: members.length,
    previous: index > 0 ? members[index - 1] : undefined,
    next: index >= 0 && index < members.length - 1 ? members[index + 1] : undefined,
    members,
  };
}

export function getLinkedProject(post: PostEntry): Project | undefined {
  const slug = post.data.project;
  if (!slug) return undefined;
  return projects.find((project) => project.slug === slug);
}

export function getRelatedPosts(
  post: PostEntry,
  allPosts: PostEntry[],
): PostEntry[] {
  const relatedIds = post.data.related ?? [];
  if (relatedIds.length === 0) return [];

  const byId = new Map(
    getPublishedPosts(allPosts).map((entry) => [entry.id, entry]),
  );

  return relatedIds
    .filter((id) => id !== post.id)
    .map((id) => byId.get(id))
    .filter((entry): entry is PostEntry => Boolean(entry));
}

export function getPostsForProject(
  projectSlug: string,
  allPosts: PostEntry[],
): PostEntry[] {
  return getPublishedPosts(allPosts)
    .filter((post) => post.data.project === projectSlug)
    .sort((a, b) => {
      const aOrder = a.data.seriesOrder ?? Number.POSITIVE_INFINITY;
      const bOrder = b.data.seriesOrder ?? Number.POSITIVE_INFINITY;
      if (aOrder !== bOrder) return aOrder - bOrder;
      return a.data.date.valueOf() - b.data.date.valueOf();
    });
}

export function hasPostEndMatter(
  series: SeriesContext | undefined,
  project: Project | undefined,
  related: PostEntry[],
): boolean {
  return Boolean(series || project || related.length > 0);
}
