import { Box } from '@mui/material';
import { NoticeItem } from './NoticeItem';
import type { Notice } from '../../types/notice';

interface Props {
  notices: Notice[];
  isAdmin: boolean;
  visibleCount: number;
  onUpdate: (n: Notice) => Promise<void>;
  onDeleteClick: (id: number) => void;
}

export const NoticesList = ({
  notices,
  isAdmin,
  visibleCount,
  onUpdate,
  onDeleteClick,
}: Props) => {
  const itemWidth = `${100 / visibleCount}%`;

  return (
    <Box
      sx={{
        display: 'flex',
        overflow: 'hidden',
        gap: 2,
      }}
    >
      {notices.map(n => (
        <Box
          key={n.id}
          sx={{
            flex: `0 0 ${itemWidth}`,
            maxWidth: itemWidth,
          }}
        >
          <NoticeItem
            notice={n}
            isAdmin={isAdmin}
            onUpdate={onUpdate}
            onDeleteClick={onDeleteClick}
          />
        </Box>
      ))}
    </Box>
  );
};