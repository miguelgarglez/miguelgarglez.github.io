import { classifyAudience, classifyIntent } from './intent';
import { retrieveProfileFacts } from './facts-retrieval';
import { retrieveMemories } from './memories-retrieval';
import { buildContextText, profileAssistantPolicy } from './prompts';
import { retrieveProfileBlocks } from './retrieval';
import { retrieveProjects } from './projects-retrieval';
import type { ChatMessage, ProfileAgentResult } from './types';

export function runProfileAgent(input: {
  question: string;
  inboundMessages: ChatMessage[];
}): ProfileAgentResult {
  const audience = classifyAudience(input.question);
  const intent = classifyIntent(input.question);
  const selectedFacts = retrieveProfileFacts({
    question: input.question,
    intent,
    audience,
    maxFacts: 5,
  });
  const selectedProfileBlocks = retrieveProfileBlocks({
    question: input.question,
    intent,
    audience,
    maxBlocks: 6,
  });
  const selectedProjects = retrieveProjects({
    question: input.question,
    intent,
    audience,
    maxProjects: intent === 'projects' ? 3 : 2,
  });
  const selectedMemories = retrieveMemories({
    question: input.question,
    intent,
    audience,
    maxMemories: intent === 'recent_updates' ? 3 : 2,
  });
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
