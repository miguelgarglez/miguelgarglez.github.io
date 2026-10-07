export type Lang = 'en' | 'es';

/**
 * grounded: the selected context covers the question, so a refusal is a bug.
 * deflect: the detail is not published, so the answer must point to a contact channel.
 * any: no refusal contract (e.g. prompt injection), only the include/exclude rules apply.
 */
export type AnswerExpectation = 'grounded' | 'deflect' | 'any';

export type AnswerEvalCase = {
  id: string;
  question: string;
  lang: Lang;
  expect: AnswerExpectation;
  mustInclude?: RegExp[];
  mustNotInclude?: RegExp[];
};

export type GradeInput = {
  evalCase: AnswerEvalCase;
  answer: string;
  contextText: string;
};

export type CheckFailure = { check: string; detail: string };

const REFUSAL_PATTERNS = [
  /\b(?:i|we) (?:don't|do not) have (?:any |that |this |specific |enough |more )?(?:information|details|data)\b/i,
  /\b(?:i|we) (?:don't|do not) know\b/i,
  /\bnot (?:available|provided|included|mentioned) in (?:the|my) (?:context|information|profile)\b/i,
  /\b(?:the )?(?:context|profile|information) (?:doesn't|does not) (?:mention|include|specify|say)\b/i,
  /\bthere is no information\b/i,
  /\bI'm not sure\b/i,
  /\bno (?:tengo|dispongo de|cuento con) (?:esa |esta |suficiente |m[aá]s )?(?:informaci[oó]n|datos|detalles)\b/i,
  /\bno (?:aparece|figura|se menciona) en (?:el|la|mi) (?:contexto|informaci[oó]n|perfil)\b/i,
  /\bno hay (?:informaci[oó]n|datos)\b/i,
];

const CONTACT_PATTERNS = [/linkedin|x\.com|\btwitter\b|\be-?mail\b|\bcorreo\b/i, /\bX\b/];

const FIRST_PERSON_PATTERNS = [
  /\bI (?:am|work|worked|have built|built|led|joined)\b/,
  /\bI['’](?:m|ve)\b/,
  /\bmy (?:role|experience|current|work at|team)\b/i,
  /\b(?:soy Miguel|he trabajado|mi experiencia|mi puesto|mi rol)\b/i,
  /(?:^|[.!?]\s+)(?:Trabajo|Estoy|Llevo|Me dedico)\b/,
];

const LANG_MARKERS: Record<Lang, Set<string>> = {
  en: new Set(['the', 'and', 'is', 'of', 'to', 'his', 'with', 'for', 'has', 'he', 'at', 'on']),
  es: new Set(['el', 'la', 'los', 'las', 'de', 'que', 'y', 'es', 'su', 'con', 'para', 'por', 'una', 'del', 'como']),
};

const URL_PATTERNS = [
  /https?:\/\/[^\s<>()[\]"'`]+/g,
  /\b(?:www\.)?(?:linkedin\.com|x\.com|github\.com|[a-z0-9-]+\.vercel\.app|miguelgarglez\.com)\/[^\s<>()[\]"'`]*/gi,
];

function normalizeUrl(url: string) {
  return url
    .replace(/[.,;:!?*_]+$/, '')
    .replace(/^https?:\/\//i, '')
    .replace(/^www\./i, '')
    .replace(/[?#].*$/, '')
    .replace(/\/+$/, '')
    .toLowerCase();
}

export function extractUrls(text: string) {
  return new Set(URL_PATTERNS.flatMap((pattern) => [...text.matchAll(pattern)].map((match) => normalizeUrl(match[0]))));
}

function countMarkers(text: string, lang: Lang) {
  const words = text.toLowerCase().match(/\p{L}+/gu) ?? [];
  return words.filter((word) => LANG_MARKERS[lang].has(word)).length;
}

function firstMatch(patterns: RegExp[], text: string) {
  return patterns.find((pattern) => pattern.test(text));
}

const checks: Record<string, (input: GradeInput) => string | null> = {
  mustInclude: ({ evalCase, answer }) => {
    const missing = (evalCase.mustInclude ?? []).filter((pattern) => !pattern.test(answer));
    return missing.length ? `missing ${missing.join(', ')}` : null;
  },
  mustNotInclude: ({ evalCase, answer }) => {
    const hit = firstMatch(evalCase.mustNotInclude ?? [], answer);
    return hit ? `forbidden ${hit} matched` : null;
  },
  language: ({ evalCase, answer }) => {
    const other: Lang = evalCase.lang === 'en' ? 'es' : 'en';
    const expected = countMarkers(answer, evalCase.lang);
    const unexpected = countMarkers(answer, other);
    return expected > unexpected || unexpected === 0
      ? null
      : `expected ${evalCase.lang}, markers ${evalCase.lang}=${expected} ${other}=${unexpected}`;
  },
  linksFromContext: ({ answer, contextText }) => {
    const allowed = extractUrls(contextText);
    const invented = [...extractUrls(answer)].filter((url) => !allowed.has(url));
    return invented.length ? `links not in context: ${invented.join(', ')}` : null;
  },
  thirdPerson: ({ answer }) => {
    const hit = firstMatch(FIRST_PERSON_PATTERNS, answer);
    return hit ? `speaks as Miguel: ${hit}` : null;
  },
  expectation: ({ evalCase, answer }) => {
    const refusal = firstMatch(REFUSAL_PATTERNS, answer);
    switch (evalCase.expect) {
      case 'grounded':
        return refusal ? `refused despite covered context: ${refusal}` : null;
      case 'deflect':
        return firstMatch(CONTACT_PATTERNS, answer) ? null : 'missing detail not deflected to a contact channel';
      case 'any':
        return null;
      default: {
        const _exhaustive: never = evalCase.expect;
        return _exhaustive;
      }
    }
  },
};

export function gradeAnswer(input: GradeInput): CheckFailure[] {
  const plain = { ...input, answer: input.answer.replace(/\*+/g, '').replace(/[‘’]/g, "'") };
  return Object.entries(checks).flatMap(([check, run]) => {
    const detail = run(plain);
    return detail ? [{ check, detail }] : [];
  });
}
