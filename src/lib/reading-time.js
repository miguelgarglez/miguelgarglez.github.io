const WORDS_PER_MINUTE = 200;

function stripMarkup(value) {
  return value
    .replace(/^\s*---[\s\S]*?---/, " ")
    .replace(/<script[\s\S]*?<\/script>/gi, " ")
    .replace(/<style[\s\S]*?<\/style>/gi, " ")
    .replace(/<[^>]+>/g, " ")
    .replace(/!\[[^\]]*]\([^)]*\)/g, " ")
    .replace(/\[([^\]]+)]\([^)]*\)/g, "$1")
    .replace(/[`*_~>#|:[\]()[\]{}.,;!?/\\-]/g, " ");
}

export function countReadableWords(value) {
  if (!value) {
    return 0;
  }

  return stripMarkup(value).trim().split(/\s+/).filter(Boolean).length;
}

export function estimateReadingMinutes(value) {
  const words = countReadableWords(value);
  return Math.max(1, Math.ceil(words / WORDS_PER_MINUTE));
}

export function formatReadingTime(value) {
  const minutes = estimateReadingMinutes(value);
  return `${minutes} min read`;
}
