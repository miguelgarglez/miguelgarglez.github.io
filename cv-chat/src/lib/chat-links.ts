const SITE_ORIGIN = "https://miguelgarglez.github.io";
const KNOWN_LINK_HOSTS = ["miguelgarglez.github.io", "linkedin.com", "x.com"];
const INLINE_CODE_OR_FENCE_PATTERN = /```[\s\S]*?```|`[^`\n]+`/g;
const MARKDOWN_LINK_PATTERN = /\[([^\]]+)\]\(([^)\s]+)\)/g;
const URL_PLACEHOLDER_PREFIX = "__chat_url_placeholder__";
const CODE_PLACEHOLDER_PREFIX = "__chat_code_placeholder__";

function escapeForRegex(value: string) {
  return value.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
}

const knownHostPattern = KNOWN_LINK_HOSTS.map(escapeForRegex).join("|");
const knownBareUrlPattern = new RegExp(
  `(^|[\\s(>])((?:https?:\\/\\/)?(?:www\\.)?(?:${knownHostPattern})(?:\\/[^\\s<]*)?)`,
  "gi"
);
const knownHostStartPattern = new RegExp(
  `^(?:www\\.)?(?:${knownHostPattern})(?:\\/|$)`,
  "i"
);

function trimTrailingUrlPunctuation(value: string) {
  let url = value;
  let trailing = "";

  while (/[.,!?;:)]$/.test(url)) {
    trailing = `${url.slice(-1)}${trailing}`;
    url = url.slice(0, -1);
  }

  return { url, trailing };
}

function preserveSegments(
  source: string,
  pattern: RegExp,
  prefix: string,
  store: string[]
) {
  return source.replace(pattern, (segment) => {
    const placeholder = `${prefix}${store.length}__`;
    store.push(segment);
    return placeholder;
  });
}

function restoreSegments(source: string, prefix: string, store: string[]) {
  const pattern = new RegExp(`${prefix}(\\d+)__`, "g");
  return source.replace(pattern, (_, index) => store[Number(index)] ?? "");
}

export function normalizeHref(href: string) {
  const trimmed = href.trim();
  if (!trimmed) return trimmed;

  if (
    trimmed.startsWith("#") ||
    trimmed.startsWith("/") ||
    /^[a-z][a-z0-9+.-]*:/i.test(trimmed)
  ) {
    return trimmed;
  }

  if (trimmed.startsWith("//")) {
    return `https:${trimmed}`;
  }

  if (knownHostStartPattern.test(trimmed)) {
    return `https://${trimmed.replace(/^https?:\/\//i, "")}`;
  }

  return trimmed;
}

export function isExternalHref(href: string) {
  try {
    return new URL(href, SITE_ORIGIN).origin !== new URL(SITE_ORIGIN).origin;
  } catch {
    return false;
  }
}

export function mergeRel(...values: Array<string | undefined>) {
  return Array.from(
    new Set(
      values
        .flatMap((value) => value?.split(/\s+/) ?? [])
        .filter(Boolean)
    )
  ).join(" ");
}

export function normalizeMarkdownLinks(markdown: string) {
  const preservedCode: string[] = [];
  const preservedLinks: string[] = [];

  const withoutCode = preserveSegments(
    markdown,
    INLINE_CODE_OR_FENCE_PATTERN,
    CODE_PLACEHOLDER_PREFIX,
    preservedCode
  );

  const withoutLinks = withoutCode.replace(
    MARKDOWN_LINK_PATTERN,
    (_, label: string, href: string) => {
      const placeholder = `${URL_PLACEHOLDER_PREFIX}${preservedLinks.length}__`;
      preservedLinks.push(`[${label}](${normalizeHref(href)})`);
      return placeholder;
    }
  );

  const linkified = withoutLinks.replace(
    knownBareUrlPattern,
    (match, prefix: string, rawUrl: string) => {
      const { url, trailing } = trimTrailingUrlPunctuation(rawUrl);
      const normalized = normalizeHref(url);

      if (!normalized || !/^https?:\/\//i.test(normalized)) {
        return match;
      }

      return `${prefix}[${normalized}](${normalized})${trailing}`;
    }
  );

  return restoreSegments(
    restoreSegments(linkified, URL_PLACEHOLDER_PREFIX, preservedLinks),
    CODE_PLACEHOLDER_PREFIX,
    preservedCode
  );
}
