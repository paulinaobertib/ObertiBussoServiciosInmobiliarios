import { Box } from '@mui/material';
import NoticeItem from './NoticeItem';
import type { Notice } from '../../types/notice';

interface Props {
  notices: Notice[];
  isAdmin: boolean;
  onUpdate: (n: Notice) => Promise<void>;
  onDeleteClick: (id: number) => void;
}

export default function NoticesList({
  notices,
  isAdmin,
  onUpdate,
  onDeleteClick,
}: Props) {

  return (
    <Box
      sx={{
        display: 'flex',
        flexDirection: 'row',
        flexWrap: 'nowrap',
        gap: 2,
        justifyContent: 'center',
        overflow: 'hidden',
      }}
    >
      {notices.map(n => (
        <NoticeItem
          key={n.id}
          notice={n}
          isAdmin={isAdmin}
          onUpdate={onUpdate}
          onDeleteClick={onDeleteClick}
        />
      ))}
    </Box>
  );
}
