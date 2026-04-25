import { projects, type ProjectBlock } from '../knowledge/projects';
import type { Audience, Intent } from './types';
import { matchesAny, normalizeText, tokenize } from './text';

function scoreProject(project: ProjectBlock, questionTokens: string[], audience: Audience) {
  const searchable = [
    project.title,
    project.shortSummary,
    project.problem,
    project.solution,
    project.impact,
    ...project.technologies,
    ...project.tags,
  ]
    .filter(Boolean)
    .join(' ');
  const projectTokens = new Set(tokenize(searchable));
  const tokenScore = questionTokens.reduce(
    (score, token) => score + (projectTokens.has(token) ? 2 : 0),
    0
  );
  const tagTechnologyTokens = new Set(
    [...project.tags, ...project.technologies].flatMap((value) =>
      tokenize(normalizeText(value))
    )
  );
  const tagTechnologyScore = questionTokens.reduce(
    (score, token) => score + (tagTechnologyTokens.has(token) ? 6 : 0),
    0
  );
  const audienceBoost =
    audience === 'recruiter' && project.tags.some((tag) => ['professional', 'frontend', 'agents'].includes(tag))
      ? 8
      : audience === 'engineer' && project.tags.some((tag) => ['frontend', 'ai', 'rag', 'cloudflare'].includes(tag))
        ? 8
        : 0;

  return tokenScore + tagTechnologyScore + audienceBoost + project.priority / 20;
}

function shouldIncludeProjects(question: string, intent: Intent) {
  return (
    ['projects', 'skills', 'experience', 'recent_updates'].includes(intent) ||
    matchesAny(question, ['ai', 'agent', 'agents', 'rag', 'chatbot', 'frontend', 'portfolio'])
  );
}

export function retrieveProjects(params: {
  question: string;
  intent: Intent;
  audience: Audience;
  maxProjects?: number;
}) {
  if (!shouldIncludeProjects(params.question, params.intent)) return [];

  const maxProjects = params.maxProjects ?? (params.intent === 'projects' ? 3 : 2);
  const questionTokens = tokenize(params.question);
  return projects
    .map((project) => ({
      project,
      score: scoreProject(project, questionTokens, params.audience),
    }))
    .filter((entry) => params.intent === 'projects' || entry.score > entry.project.priority / 20)
    .sort((a, b) => b.score - a.score)
    .slice(0, maxProjects)
    .map((entry) => entry.project);
}
