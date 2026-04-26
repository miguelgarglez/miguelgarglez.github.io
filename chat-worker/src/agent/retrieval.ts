import { profileSections, type ProfileBlock } from '../knowledge/profile-data';
import type { Audience, Intent } from './types';
import { matchesAny, tokenize } from './text';

const MAX_CONTEXT_BLOCKS = 6;

const TAG_KEYWORDS: Record<string, string[]> = {
  directorio: ['directorio', 'indice', 'pagina', 'principal', 'index', 'directory', 'homepage', 'home', 'root', 'landing', 'projects'],
  trayectoria: ['trayectoria', 'camino', 'historia', 'inicios', 'origen', 'journey', 'background', 'career'],
  motivacion: ['motivacion', 'motiva', 'porque', 'razon', 'pasion', 'motivation', 'drives', 'purpose'],
  'forma-de-trabajar': ['trabajar', 'forma', 'metodo', 'metodologia', 'workflow', 'work', 'working', 'style', 'ownership', 'autonomy', 'delivery', 'pragmatic'],
  equipo: ['equipo', 'persona', 'personas', 'colaboracion', 'feedback', 'comunicacion', 'team', 'teamwork', 'collaboration', 'stakeholder', 'stakeholders'],
  fortalezas: ['fortaleza', 'fortalezas', 'fuerte', 'strength', 'strengths'],
  debilidades: ['debilidad', 'debilidades', 'weakness', 'weaknesses', 'improve', 'growth'],
  valores: ['valores', 'principios', 'etica', 'quality', 'values', 'principles'],
  impacto: ['impacto', 'logro', 'resultado', 'metricas', 'impact', 'outcome', 'result', 'metrics', 'kpi'],
  aprendizaje: ['aprendizaje', 'aprender', 'curiosidad', 'generalista', 'generalist', 'learning', 'learn'],
  cultura: ['cultura', 'ambiente', 'entorno', 'culture', 'environment', 'healthy', 'standards'],
  experiencia: ['experiencia', 'empresa', 'trabajo', 'puesto', 'cargo', 'rol', 'role', 'position', 'current', 'actual', 'actualmente'],
  proyectos: ['proyecto', 'proyectos', 'caso', 'ejemplo', 'reto', 'project', 'projects', 'example', 'challenge'],
  futuro: ['futuro', 'objetivo', 'crecer', 'carrera', 'future', 'goal', 'next', 'career'],
  recruiting: ['recruiter', 'recruiting', 'hire', 'hiring', 'candidate', 'profile', 'talent', 'seleccion'],
  comunicacion: ['comunicacion', 'communication', 'present', 'presentation', 'demo'],
  liderazgo: ['liderazgo', 'leadership', 'lead', 'mentor', 'mentoring', 'leader'],
  disponibilidad: ['disponibilidad', 'availability', 'available', 'timezone', 'remote', 'hybrid', 'onsite', 'start'],
  ownership: ['ownership', 'accountability', 'responsibility', 'autonomy', 'own'],
  stakeholders: ['stakeholder', 'stakeholders', 'business', 'product'],
  contact: ['contact', 'linkedin', 'email', 'reach', 'contacto'],
  educacion: ['educacion', 'educación', 'university', 'degree', 'certifications', 'certificaciones'],
  skills: ['skills', 'stack', 'technologies', 'habilidades', 'tecnologias', 'tecnologías'],
  ai: ['ai', 'ia', 'artificial intelligence', 'herramientas', 'tools', 'windsurf', 'devin', 'codex', 'copilot', 'mcp', 'skills'],
  frontend: ['frontend', 'react', 'typescript', 'ui', 'components', 'design system'],
  devops: ['devops', 'cloud', 'ci', 'cd', 'cloudflare', 'vercel', 'github actions'],
};

const TYPE_KEYWORDS: Record<ProfileBlock['type'], string[]> = {
  example: ['ejemplo', 'caso', 'reto', 'problema', 'example', 'challenge', 'case'],
  story: ['historia', 'camino', 'trayectoria', 'story', 'journey', 'background'],
  answer: ['fortaleza', 'debilidad', 'valores', 'strength', 'weakness', 'values', 'fit', 'motivation', 'career'],
  fact: ['contact', 'education', 'certification', 'facts', 'where', 'location'],
};

const AUDIENCE_TAG_BOOSTS: Record<Audience, string[]> = {
  recruiter: ['recruiting', 'impacto', 'liderazgo', 'ownership', 'fortalezas'],
  engineer: ['frontend', 'devops', 'skills', 'proyectos', 'arquitectura'],
  client: ['impacto', 'product', 'business', 'clientes', 'stakeholders'],
  unknown: [],
};

const INTENT_TAG_BOOSTS: Record<Intent, string[]> = {
  summary: ['recruiting', 'fortalezas', 'impacto'],
  experience: ['experiencia', 'impacto', 'proyectos'],
  projects: ['proyectos'],
  skills: ['skills', 'frontend', 'devops', 'ai'],
  work_style: ['forma-de-trabajar', 'equipo', 'ownership'],
  contact: ['contact'],
  availability: ['disponibilidad', 'contact'],
  education: ['educacion', 'certificaciones'],
  recent_updates: ['proyectos', 'skills', 'devops'],
  unknown: [],
};

const CURRENT_ROLE_KEYWORDS = [
  'puesto actual',
  'cargo actual',
  'rol actual',
  'posición actual',
  'posicion actual',
  'current role',
  'current position',
  'current job',
  'actualmente',
];

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
  const intentTypes = new Set<ProfileBlock['type']>();
  Object.entries(TYPE_KEYWORDS).forEach(([type, keywords]) => {
    if (keywords.some((keyword) => tokens.includes(keyword))) {
      intentTypes.add(type as ProfileBlock['type']);
    }
  });
  return intentTypes;
}

function scoreText(value: string, tokens: string[]) {
  if (tokens.length === 0) return 0;
  const sectionTokens = new Set(tokenize(value));
  return tokens.reduce((score, token) => score + (sectionTokens.has(token) ? 1 : 0), 0);
}

export function retrieveProfileBlocks(params: {
  question: string;
  intent: Intent;
  audience: Audience;
  maxBlocks?: number;
}) {
  const maxBlocks = params.maxBlocks ?? MAX_CONTEXT_BLOCKS;
  const tokens = tokenize(params.question);
  const intentTags = extractIntentTags(tokens);
  const intentTypes = extractIntentTypes(tokens);
  const boostedTags = new Set([
    ...AUDIENCE_TAG_BOOSTS[params.audience],
    ...INTENT_TAG_BOOSTS[params.intent],
  ]);
  const isCurrentRoleQuestion = matchesAny(
    params.question,
    CURRENT_ROLE_KEYWORDS
  );

  const ranked = profileSections
    .map((section) => {
      const tokenScore = scoreText(`${section.title} ${section.content}`, tokens);
      const tagScore = section.tags.reduce((total, tag) => {
        if (intentTags.has(tag)) return total + 2;
        if (boostedTags.has(tag)) return total + 1;
        return total;
      }, 0);
      const typeScore = intentTypes.has(section.type) ? 2 : 0;
      const currentRoleScore =
        isCurrentRoleQuestion && section.id === 'experience-ods' ? 8 : 0;
      return {
        section,
        score: tokenScore + tagScore + typeScore + currentRoleScore,
      };
    })
    .sort((a, b) => b.score - a.score);

  const selected = ranked
    .filter((entry) => entry.score > 0)
    .slice(0, maxBlocks)
    .map((entry) => entry.section);

  if (selected.length > 0) return selected;
  return profileSections.slice(0, maxBlocks);
}
