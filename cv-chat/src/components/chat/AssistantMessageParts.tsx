import { isDataUIPart } from 'ai';
import {
  MessageContent,
  MessageResponse,
} from '@/components/ai-elements/message';
import { getPartBoardItems } from './board';
import { BoardRefs, type BoardFocusProps } from './ChatBoard';
import type { CvChatUIMessage, CvChatUIPart } from './chat-message';
import { DataPart } from './data-parts';

const partRank: Partial<Record<CvChatUIPart['type'], number>> = {
  'data-sources': 0,
  text: 1,
  'data-projects': 2,
  'data-timeline': 2,
  'data-contact': 2,
  'data-followups': 3,
};

type AssistantMessagePartsProps = {
  message: CvChatUIMessage;
  isLast: boolean;
  boardRefs: BoardFocusProps | null;
};

export function AssistantMessageParts({
  message,
  isLast,
  boardRefs,
}: AssistantMessagePartsProps) {
  const ranked = message.parts
    .map((part, index) => ({ part, index, rank: partRank[part.type] }))
    .filter(
      (entry): entry is typeof entry & { rank: number } =>
        entry.rank !== undefined &&
        (isLast || entry.part.type !== 'data-followups')
    )
    .sort((a, b) => a.rank - b.rank);

  return (
    <>
      {ranked.map(({ part, index }) => {
        const key = `${message.id}-${index}`;
        if (part.type === 'text') {
          return (
            <MessageContent key={key}>
              <MessageResponse>{part.text}</MessageResponse>
            </MessageContent>
          );
        }
        const refItems = boardRefs ? getPartBoardItems(part) : [];
        if (boardRefs && refItems.length) {
          return <BoardRefs key={key} items={refItems} {...boardRefs} />;
        }
        return isDataUIPart(part) ? <DataPart key={key} part={part} /> : null;
      })}
    </>
  );
}
