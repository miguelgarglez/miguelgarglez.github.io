import type { AgentContext, Audience, Intent } from './types';

export type ContextTraceSource = {
  kind: 'fact' | 'profile' | 'project' | 'memory';
  id: string;
  title: string;
};

export type ContextTrace = {
  intent: Intent;
  audience: Audience;
  sources: ContextTraceSource[];
};

export function buildContextTrace(context: AgentContext): ContextTrace {
  return {
    intent: context.intent,
    audience: context.audience,
    sources: [
      ...context.selectedFacts.map((fact) => ({
        kind: 'fact' as const,
        id: fact.id,
        title: fact.label,
      })),
      ...context.selectedProfileBlocks.map((block) => ({
        kind: 'profile' as const,
        id: block.id,
        title: block.title,
      })),
      ...context.selectedProjects.map((project) => ({
        kind: 'project' as const,
        id: project.id,
        title: project.title,
      })),
      ...context.selectedMemories.map((memory) => ({
        kind: 'memory' as const,
        id: memory.id,
        title: memory.title,
      })),
    ],
  };
}
