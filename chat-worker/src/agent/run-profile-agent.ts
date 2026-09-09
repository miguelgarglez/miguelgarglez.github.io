import { classifyAudience, classifyIntent } from './intent';
import { retrieveProfileFacts } from './facts-retrieval';
import { retrieveMemories } from './memories-retrieval';
import { buildContextText, profileAssistantPolicy } from './prompts';
import { retrieveProfileBlocks } from './retrieval';
import { retrieveProjects } from './projects-retrieval';
import { matchSuggestedPrompt } from './suggested-prompts';
import { profileFacts } from '../knowledge/profile-facts';
import { profileSections } from '../knowledge/profile-data';
import { projects } from '../knowledge/projects';
import { memories } from '../knowledge/memories';
import type { ChatMessage, ProfileAgentResult } from './types';

function mergePinned<T extends { id: string }>(
  selected: T[],
  catalog: T[],
  pinnedIds: string[] | undefined,
  max: number
) {
  if (!pinnedIds?.length) return selected.slice(0, max);
  const catalogById = new Map(catalog.map((item) => [item.id, item]));
  const pinned = pinnedIds
    .map((id) => catalogById.get(id))
    .filter((item): item is T => Boolean(item));
  const rest = selected.filter((item) => !pinnedIds.includes(item.id));
  return [...pinned, ...rest].slice(0, max);
}

export function runProfileAgent(input: {
  question: string;
  inboundMessages: ChatMessage[];
}): ProfileAgentResult {
  const suggested = matchSuggestedPrompt(input.question);
  const audience = classifyAudience(input.question);
  const intent = suggested?.intent ?? classifyIntent(input.question);
  const selectedFacts = mergePinned(
    retrieveProfileFacts({
      question: input.question,
      intent,
      audience,
      maxFacts: 5,
    }),
    profileFacts,
    suggested?.factIds,
    5
  );
  const selectedProfileBlocks = mergePinned(
    retrieveProfileBlocks({
      question: input.question,
      intent,
      audience,
      maxBlocks: 6,
    }),
    profileSections,
    suggested?.blockIds,
    6
  );
  const selectedProjects = mergePinned(
    retrieveProjects({
      question: input.question,
      intent,
      audience,
      maxProjects: intent === 'projects' ? 3 : 2,
    }),
    projects,
    suggested?.projectIds,
    intent === 'projects' ? 3 : 2
  );
  const selectedMemories = mergePinned(
    retrieveMemories({
      question: input.question,
      intent,
      audience,
      maxMemories: intent === 'recent_updates' ? 3 : 2,
    }),
    memories,
    suggested?.memoryIds,
    Math.max(intent === 'recent_updates' ? 3 : 2, suggested?.memoryIds?.length ?? 0)
  );
  const context = {
    audience,
    intent,
    selectedFacts,
    selectedProfileBlocks,
    selectedProjects,
    selectedMemories,
  };
  const systemContent = `${profileAssistantPolicy}\n\n${buildContextText(context)}`;
  const fallbackUserMessage: ChatMessage = {
    role: 'user',
    content: input.question,
  };

  return {
    messages: [
      { role: 'system', content: systemContent },
      ...(input.inboundMessages.length > 0
        ? input.inboundMessages
        : [fallbackUserMessage]),
    ],
    context,
  };
}
