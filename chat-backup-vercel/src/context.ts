import { profileSections } from './profile-data.js';

const systemPromptBase =
  'You are a professional profile assistant for Miguel Garcia. ' +
  'Answer using only the provided context. ' +
  'If the answer is not in the context, say you do not have that information ' +
  'and invite the user to reach out by his X account or LinkedIn. ' +
  'Reply in the same language as the user.';

function stripDiacritics(value: string) {
  return value.normalize('NFD').replace(/[\u0300-\u036f]/g, '');
}

function normalizeText(value: string) {
  return stripDiacritics(value)
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, ' ')
    .trim();
}

function tokenize(value: string) {
  const normalized = normalizeText(value);
  if (!normalized) return [] as string[];
  return normalized.split(' ').filter((token) => token.length > 2);
}

const TAG_KEYWORDS: Record<string, string[]> = {
  trayectoria: ['trayectoria', 'camino', 'historia', 'inicios', 'origen', 'empezar', 'empece', 'empezo'],
  motivacion: ['motivacion', 'motiva', 'porque', 'razon', 'razones', 'pasion'],
  'forma-de-trabajar': ['trabajar', 'forma', 'metodo', 'metodologia', 'priorizo', 'organizo', 'proceso', 'workflow'],
  equipo: ['equipo', 'companero', 'colaboracion', 'colaborar', 'feedback', 'comunicacion', 'liderazgo'],
  fortalezas: ['fortaleza', 'fortalezas', 'fuerte', 'strength'],
  debilidades: ['debilidad', 'debilidades', 'defecto', 'defectos'],
  valores: ['valores', 'principios', 'etica', 'importante', 'prioridad'],
  impacto: ['impacto', 'logro', 'resultado', 'metricas', 'mejora', 'mejorar'],
  aprendizaje: ['aprendizaje', 'aprender', 'aprendo', 'curiosidad'],
  cultura: ['cultura', 'ambiente', 'entorno'],
  proyectos: ['proyecto', 'proyectos', 'caso', 'ejemplo', 'situacion', 'reto'],
  futuro: ['futuro', 'objetivo', 'objetivos', 'crecer'],
};

const TYPE_KEYWORDS: Record<string, string[]> = {
  example: ['ejemplo', 'caso', 'situacion', 'reto', 'problema'],
  story: ['historia', 'camino', 'trayectoria', 'inicios', 'origen'],
  answer: ['fortaleza', 'debilidad', 'valoras', 'detestas', 'prefieres'],
};

const MAX_CONTEXT_BLOCKS = 6;

function extractIntentTags(tokens: string[]) {
  const intentTags = new Set<string>();
  Object.entries(TAG_KEYWORDS).forEach(([tag, keywords]) => {
    if (keywords.some((keyword) => tokens.includes(keyword))) {
      intentTags.add(tag);
    }
  });
  return intentTags;
}

function extractIntentTypes(tokens: string[]) {
  const intentTypes = new Set<string>();
  Object.entries(TYPE_KEYWORDS).forEach(([type, keywords]) => {
    if (keywords.some((keyword) => tokens.includes(keyword))) {
      intentTypes.add(type);
    }
  });
  return intentTypes;
}

function scoreSection(sectionText: string, tokens: string[]) {
  if (tokens.length === 0) return 0;
  const sectionTokens = new Set(tokenize(sectionText));
  let score = 0;
  tokens.forEach((token) => {
    if (sectionTokens.has(token)) score += 1;
  });
  return score;
}

function buildContext(question: string) {
  const tokens = tokenize(question);
  const intentTags = extractIntentTags(tokens);
  const intentTypes = extractIntentTypes(tokens);
  const ranked = profileSections
    .map((section) => ({
      section,
      score:
        scoreSection(`${section.title} ${section.content}`, tokens) +
        section.tags.reduce((total, tag) => total + (intentTags.has(tag) ? 2 : 0), 0) +
        (intentTypes.has(section.type) ? 2 : 0),
    }))
    .sort((a, b) => b.score - a.score);

  const topSections = ranked
    .filter((entry) => entry.score > 0)
    .slice(0, MAX_CONTEXT_BLOCKS)
    .map((entry) => `# ${entry.section.title}\n${entry.section.content}`);

  if (topSections.length === 0) {
    return profileSections
      .slice(0, MAX_CONTEXT_BLOCKS)
      .map((section) => `# ${section.title}\n${section.content}`)
      .join('\n\n');
  }

  return topSections.join('\n\n');
}

export function buildSystemPrompt(question: string) {
  const context = buildContext(question);
  return `${systemPromptBase}\n\nContext:\n${context}`;
}
