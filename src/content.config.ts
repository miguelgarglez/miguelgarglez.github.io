import { glob } from "astro/loaders";
import { defineCollection, z } from "astro:content";

const posts = defineCollection({
  loader: glob({ pattern: "**/[^_]*.md", base: "./src/content/posts" }),
  schema: z
    .object({
      title: z.string(),
      description: z.string(),
      date: z.date(),
      updatedDate: z.date().optional(),
      kind: z.enum(["article", "note"]),
      lang: z.enum(["en", "es"]),
      tags: z.array(z.string()),
      featured: z.boolean().default(false),
      draft: z.boolean().default(false),
      /** Series id from `src/data/post-series.ts` (e.g. `video-digest`). */
      series: z.string().optional(),
      /** 1-based order within the series. Required when `series` is set. */
      seriesOrder: z.number().int().positive().optional(),
      /** Project slug from `src/data/projects.ts`. */
      project: z.string().optional(),
      /** Other post ids (filename without `.md`) to surface in end matter. */
      related: z.array(z.string()).default([]),
    })
    .superRefine((data, ctx) => {
      if (data.series && data.seriesOrder === undefined) {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          message: "seriesOrder is required when series is set",
          path: ["seriesOrder"],
        });
      }

      if (data.seriesOrder !== undefined && !data.series) {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          message: "series is required when seriesOrder is set",
          path: ["series"],
        });
      }
    }),
});

export const collections = { posts };
