import { Box } from '@mui/material';
import type { Inquiry } from '../../types/inquiry';
import { InquiryItem } from './InquiryItem';

interface Props {
  inquiries: Inquiry[];
  loadingId: number | null;
  onResolve: (id: number) => void;
}

export const InquiriesList = ({ inquiries, loadingId, onResolve }: Props) => {
  const sorted = [...inquiries].sort((a, b) =>
    new Date(b.date).getTime() - new Date(a.date).getTime()
  );

  return (
    <Box
      display="flex"
      flexDirection="column"
      gap={2}
    >
      {sorted.map(i => (
        <InquiryItem
          key={i.id}
          inquiry={i}
          loading={loadingId === i.id}
          onResolve={onResolve}
        />
      ))}
    </Box>
  );
};
