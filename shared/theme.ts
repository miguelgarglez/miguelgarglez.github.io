/** Shared across the directory (root Astro) and cv-chat. */
export const THEME_STORAGE_KEY = "theme";

/** Previous cv-chat-only key; still read for migration. */
export const THEME_STORAGE_KEY_LEGACY = "miguel-theme";

export type StoredTheme = "light" | "dark";

export function isStoredTheme(value: string | null | undefined): value is StoredTheme {
  return value === "light" || value === "dark";
}
