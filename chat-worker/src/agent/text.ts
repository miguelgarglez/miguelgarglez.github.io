export function stripDiacritics(value: string) {
  return value.normalize('NFD').replace(/[\u0300-\u036f]/g, '');
}

export function normalizeText(value: string) {
  return stripDiacritics(value)
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, ' ')
    .trim();
}

export function tokenize(value: string) {
  const normalized = normalizeText(value);
  if (!normalized) return [] as string[];
  return normalized.split(' ').filter((token) => token.length > 2);
}

export function matchesAny(value: string, keywords: string[]) {
  const normalized = normalizeText(value);
  return keywords.some((keyword) => {
    const normalizedKeyword = normalizeText(keyword);
    if (!normalizedKeyword) return false;
    // Avoid false positives like "ai" matching inside "Spain".
    if (normalizedKeyword.length <= 2) {
      return new RegExp(`(?:^|\\s)${normalizedKeyword}(?:\\s|$)`).test(
        normalized
      );
    }
    return normalized.includes(normalizedKeyword);
  });
}
