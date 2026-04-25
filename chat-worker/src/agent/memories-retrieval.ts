import { memories, type MemoryBlock } from '../knowledge/memories';
import type { Audience, Intent } from './types';
import { matchesAny, normalizeText, tokenize } from './text';

function shouldIncludeMemories(question: string, intent: Intent) {
  return (
    ['recent_updates', 'projects', 'skills'].includes(intent) ||
    matchesAny(question, [
      'latest',
      'recent',
      'now',
      'actualidad',
      'últimamente',
      'ultimamente',
      'agentes',
      'agents',
      'ai',
      'rag',
      'opencode',
      'worker',
    ])
  );
}

function scoreMemory(memory: MemoryBlock, questionTokens: string[], audience: Audience) {
  const memoryTokens = new Set(
    tokenize([memory.title, memory.content, ...memory.tags].join(' '))
  );
  const tokenScore = questionTokens.reduce(
    (score, token) => score + (memoryTokens.has(token) ? 2 : 0),
    0
  );
  const tagTokens = new Set(
    memory.tags.flatMap((tag) => tokenize(normalizeText(tag)))
  );
  const tagScore = questionTokens.reduce(
    (score, token) => score + (tagTokens.has(token) ? 6 : 0),
    0
  );
  const audienceBoost = audience === 'engineer' && memory.tags.includes('backend') ? 4 : 0;
  return tokenScore + tagScore + audienceBoost + memory.priority / 25;
}

export function retrieveMemories(params: {
  question: string;
  intent: Intent;
  audience: Audience;
  maxMemories?: number;
}) {
  if (!shouldIncludeMemories(params.question, params.intent)) return [];

  const questionTokens = tokenize(params.question);
  return memories
    .filter(
      (memory) =>
        memory.visibility === 'public' && memory.confidence === 'verified'
    )
    .map((memory) => ({
      memory,
      score: scoreMemory(memory, questionTokens, params.audience),
    }))
    .filter((entry) => params.intent === 'recent_updates' || entry.score > entry.memory.priority / 25)
    .sort((a, b) => b.score - a.score)
    .slice(0, params.maxMemories ?? 2)
    .map((entry) => entry.memory);
}
