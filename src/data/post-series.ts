export type PostSeriesId = "video-digest" | "agent-lab";

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
  "agent-lab": {
    id: "agent-lab",
    title: "Agent Lab",
    description:
      "Eleven days of coding agents scouting, building, reviewing, and shipping small open-source products from my Mac.",
  },
};

export function getPostSeries(id: string | undefined): PostSeries | undefined {
  if (!id) return undefined;
  return postSeriesCatalog[id as PostSeriesId];
}
