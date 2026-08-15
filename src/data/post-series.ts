export type PostSeriesId = "video-digest";

export type PostSeries = {
  id: PostSeriesId;
  title: string;
  description: string;
};

export const postSeriesCatalog: Record<PostSeriesId, PostSeries> = {
  "video-digest": {
    id: "video-digest",
    title: "Video Digest",
    description:
      "From a personal YouTube backlog workflow to a published local-first CLI.",
  },
};

export function getPostSeries(id: string | undefined): PostSeries | undefined {
  if (!id) return undefined;
  return postSeriesCatalog[id as PostSeriesId];
}
