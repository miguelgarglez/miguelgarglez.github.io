import type { ImageMetadata } from "astro";

type EagerImageModule = { default: ImageMetadata };

const personPortraits = import.meta.glob<EagerImageModule>(
  "../assets/people/*.{webp,avif,png}",
  { eager: true },
);

const personMarks = import.meta.glob<EagerImageModule>(
  "../assets/people/*.svg",
  { eager: true },
);

const readingCovers = import.meta.glob<EagerImageModule>(
  "../assets/readings/*.{webp,avif,png}",
  { eager: true },
);

function assetBySlug(
  modules: Record<string, EagerImageModule>,
  slug: string,
): ImageMetadata | undefined {
  const match = Object.entries(modules).find(([path]) => {
    const filename = path.split("/").pop() ?? "";
    return filename.replace(/\.[^.]+$/, "") === slug;
  });

  return match?.[1].default;
}

/** Raster portrait for a person slug, if a source exists under src/assets/people. */
export function getPersonPortrait(slug: string): ImageMetadata | undefined {
  return assetBySlug(personPortraits, slug);
}

/** Vector mark (flat brand plate) for a person slug. Prefer over raster when present. */
export function getPersonMark(slug: string): ImageMetadata | undefined {
  return assetBySlug(personMarks, slug);
}

/** Book/cover art for a reading slug under src/assets/readings. */
export function getReadingCover(slug: string): ImageMetadata | undefined {
  return assetBySlug(readingCovers, slug);
}
