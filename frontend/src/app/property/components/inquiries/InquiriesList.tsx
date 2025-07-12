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
    inquiries, isAdmin, loadingId, onOpen, onResolve,
}: Props) => (
    <>
        {inquiries.map(i => (
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
