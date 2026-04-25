import { profileFacts, type ProfileFact } from '../knowledge/profile-facts';
import type { Audience, Intent } from './types';
import { matchesAny, tokenize } from './text';

const INTENT_FACT_TAGS: Record<Intent, string[]> = {
  summary: ['identity', 'summary', 'recruiting'],
  experience: ['experience', 'current-role'],
  projects: ['portfolio', 'projects'],
  skills: ['skills', 'frontend', 'ai'],
  work_style: [],
  contact: ['contact'],
  availability: ['location', 'availability', 'contact'],
  education: [],
  recent_updates: ['portfolio', 'projects', 'ai'],
  unknown: ['identity'],
};

const AUDIENCE_FACT_TAGS: Record<Audience, string[]> = {
  recruiter: ['recruiting', 'current-role', 'contact'],
  engineer: ['frontend', 'skills', 'ai'],
  client: ['portfolio', 'contact'],
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

function scoreFact(params: {
  fact: ProfileFact;
  question: string;
  tokens: string[];
  intent: Intent;
  audience: Audience;
}) {
  const factTextTokens = new Set(
    tokenize([params.fact.label, params.fact.value, ...params.fact.tags].join(' '))
  );
  const tokenScore = params.tokens.reduce(
    (score, token) => score + (factTextTokens.has(token) ? 2 : 0),
    0
  );
  const intentTags = new Set(INTENT_FACT_TAGS[params.intent]);
  const audienceTags = new Set(AUDIENCE_FACT_TAGS[params.audience]);
  const tagScore = params.fact.tags.reduce((score, tag) => {
    if (intentTags.has(tag)) return score + 4;
    if (audienceTags.has(tag)) return score + 2;
    return score;
  }, 0);
  const currentRoleScore =
    matchesAny(params.question, CURRENT_ROLE_KEYWORDS) &&
    params.fact.tags.includes('current-role')
      ? 12
      : 0;

  return tokenScore + tagScore + currentRoleScore + params.fact.priority / 100;
}

export function retrieveProfileFacts(params: {
  question: string;
  intent: Intent;
  audience: Audience;
  maxFacts?: number;
}) {
  const tokens = tokenize(params.question);
  const maxFacts = params.maxFacts ?? 5;
  const ranked = profileFacts
    .map((fact) => ({
      fact,
      score: scoreFact({
        fact,
        question: params.question,
        tokens,
        intent: params.intent,
        audience: params.audience,
      }),
    }))
    .filter((entry) => entry.score > entry.fact.priority / 100)
    .sort((a, b) => b.score - a.score)
    .slice(0, maxFacts)
    .map((entry) => entry.fact);

  if (ranked.length > 0) return ranked;

  return profileFacts
    .filter((fact) => ['name', 'current-role', 'linkedin'].includes(fact.id))
    .slice(0, maxFacts);
}
