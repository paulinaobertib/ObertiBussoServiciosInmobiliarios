import { Box } from '@mui/material';
import type { Inquiry } from '../../types/inquiry';
import type { ChatSession } from '../../../chat/types/chatSession';
import { InquiryItem } from './InquiryItem';
import { ChatSessionItem } from './InquiryChat';

interface Props {
  inquiries?: Inquiry[];
  chatSessions?: ChatSession[];
  loadingId: number | null;
  onResolve: (id: number) => void;
  onCloseChat: (id: number) => void;
}

type MixedItem =
  | { type: 'inquiry'; date: string; id: number; data: Inquiry }
  | { type: 'chat'; date: string; id: number; data: ChatSession };

export const MixedList = ({
  inquiries = [],
  chatSessions = [],
  loadingId,
  onResolve,
  onCloseChat,
}: Props) => {
  // Unimos ambos arreglos y los etiquetamos
  const allItems: MixedItem[] = [
    ...inquiries.map(i => ({
      type: 'inquiry' as const,
      date: i.date,
      id: i.id,
      data: i,
    })),
    ...chatSessions.map(s => ({
      type: 'chat' as const,
      date: s.date,
      id: s.id,
      data: s,
    })),
  ];

  // Ordenamos por fecha descendente (más reciente primero)
  const sorted = allItems.sort(
    (a, b) => new Date(b.date).getTime() - new Date(a.date).getTime()
  );

  return (
    <Box display="flex" flexDirection="column" gap={2}>
      {sorted.map(item =>
        item.type === 'inquiry' ? (
          <InquiryItem
            key={`inq-${item.id}`}
            inquiry={item.data}
            loading={loadingId === item.id}
            onResolve={onResolve}
          />
        ) : (
          <ChatSessionItem
            key={`chat-${item.id}`}
            session={item.data}
            loading={loadingId === item.id}
            onClose={onCloseChat}
          />
        )
      )}
    </Box>
  );
};
