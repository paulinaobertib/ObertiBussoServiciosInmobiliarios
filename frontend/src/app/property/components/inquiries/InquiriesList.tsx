import type { Inquiry } from '../../types/inquiry';
import { InquiryItem } from './InquiryItem';

interface Props {
  inquiries: Inquiry[];
  isAdmin: boolean;
  loadingId: number | null;
  onOpen: (inq: Inquiry) => void;
  onResolve: (id: number) => void;
}

export const InquiriesList = ({
  inquiries,
  isAdmin,
  loadingId,
  onOpen,
  onResolve,
}: Props) => {
  // Ordeno de más reciente a más antiguo
  const sorted = [...inquiries].sort((a, b) =>
    new Date(b.date).getTime() - new Date(a.date).getTime()
  );

  return (
    <>
      {sorted.map(i => (
        <InquiryItem
          key={i.id}
          inquiry={i}
          isAdmin={isAdmin}
          loading={loadingId === i.id}
          onOpen={onOpen}
          onResolve={onResolve}
        />
      ))}
    </>
  );
};
