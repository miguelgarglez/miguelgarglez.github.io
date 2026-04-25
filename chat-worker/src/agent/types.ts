import type { ProfileBlock } from '../knowledge/profile-data';
import type { ProfileFact } from '../knowledge/profile-facts';
import type { MemoryBlock } from '../knowledge/memories';
import type { ProjectBlock } from '../knowledge/projects';

export type ChatMessage = {
  role: 'system' | 'user' | 'assistant';
  content: string;
};

export type Audience = 'recruiter' | 'engineer' | 'client' | 'unknown';

export type Intent =
  | 'summary'
  | 'experience'
  | 'projects'
  | 'skills'
  | 'work_style'
  | 'contact'
  | 'availability'
  | 'education'
  | 'recent_updates'
  | 'unknown';

export type AgentContext = {
  audience: Audience;
  intent: Intent;
  selectedFacts: ProfileFact[];
  selectedProfileBlocks: ProfileBlock[];
  selectedProjects: ProjectBlock[];
  selectedMemories: MemoryBlock[];
};

export type ProfileAgentResult = {
  messages: ChatMessage[];
  context: AgentContext;
};
