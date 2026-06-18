export const SITE_URL = "https://miguelgarglez.github.io";

export const SITE_NAME = "Miguel García";

export const SITE_HANDLE = "@miguel_garglez";

export const DEFAULT_DESCRIPTION =
  "Software engineer in Madrid. Projects, notes, and references on technical quality, product clarity, and the craft of building software.";

export const CV_CHAT_DESCRIPTION =
  "Miguel García's digital CV. Frontend platform engineer focused on accessible interfaces, scalable design systems, and practical AI workflows.";

export const AUTHOR = {
  name: SITE_NAME,
  url: SITE_URL,
  jobTitle: "Software Engineer",
  location: "Madrid, Spain",
  email: "miguel@garciag.me",
  sameAs: [
    "https://github.com/miguelgarglez",
    "https://www.linkedin.com/in/miguel-garciag",
    "https://x.com/miguel_garglez",
  ],
} as const;

export const DEFAULT_OG_IMAGE = "/og/default.png";

export const CV_CHAT_OG_IMAGE = "/og/cv-chat.png";

export function absoluteUrl(path: string): string {
  const normalized = path.startsWith("/") ? path : `/${path}`;
  return new URL(normalized, SITE_URL).href;
}

export function ogImageUrl(path: string): string {
  return absoluteUrl(path);
}

export function pageTitle(title: string, options?: { suffix?: boolean }): string {
  const suffix = options?.suffix ?? true;
  if (!suffix) return title;
  if (title.includes(SITE_NAME)) return title;
  return `${title} · ${SITE_NAME}`;
}
