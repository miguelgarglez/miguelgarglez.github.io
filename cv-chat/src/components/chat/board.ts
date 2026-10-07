import type {
  ContactCard,
  ProjectCard,
  RoleEntry,
} from '../../../../shared/chat-parts';
import type { CvChatUIMessage, CvChatUIPart } from './chat-message';

export type BoardItem =
  | { key: string; kind: 'project'; title: string; project: ProjectCard }
  | { key: string; kind: 'timeline'; title: string; roles: RoleEntry[] }
  | { key: string; kind: 'contact'; title: string; contact: ContactCard };

export const boardKindLabel: Record<BoardItem['kind'], string> = {
  project: 'Project',
  timeline: 'Experience',
  contact: 'Contact',
};

export function getPartBoardItems(part: CvChatUIPart): BoardItem[] {
  switch (part.type) {
    case 'data-projects':
      return part.data.items.map((project) => ({
        key: `project:${project.slug}`,
        kind: 'project',
        title: project.name,
        project,
      }));
    case 'data-timeline':
      return [
        {
          key: 'timeline',
          kind: 'timeline',
          title: 'Career timeline',
          roles: part.data.items,
        },
      ];
    case 'data-contact':
      return [
        {
          key: 'contact',
          kind: 'contact',
          title: 'Reach Miguel',
          contact: part.data,
        },
      ];
    default:
      return [];
  }
}

export function getBoardItems(messages: CvChatUIMessage[]): BoardItem[] {
  const items = new Map<string, BoardItem>();
  for (const part of messages.flatMap((message) => message.parts)) {
    for (const item of getPartBoardItems(part)) {
      if (!items.has(item.key)) items.set(item.key, item);
    }
  }
  return [...items.values()];
}

export function getLatestBoardKey(messages: CvChatUIMessage[]) {
  const latest = messages
    .flatMap((message) => message.parts)
    .map(getPartBoardItems)
    .findLast((items) => items.length > 0);
  return latest?.[0]?.key ?? null;
}
