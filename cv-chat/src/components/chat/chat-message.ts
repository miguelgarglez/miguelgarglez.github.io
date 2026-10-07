import type { UIMessage } from 'ai';
import type { CvChatDataParts } from '../../../../shared/chat-parts';

export type CvChatUIMessage = UIMessage<unknown, CvChatDataParts>;

export type CvChatUIPart = CvChatUIMessage['parts'][number];
