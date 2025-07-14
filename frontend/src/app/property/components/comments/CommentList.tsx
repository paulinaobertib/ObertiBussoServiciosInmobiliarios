import { Stack } from '@mui/material';
import { CommentItem, CommentData } from './CommentItem';

export interface CommentListProps {
    items: CommentData[];
    onEditItem: (item: CommentData) => void;
    onDeleteItem: (item: CommentData) => void;
}

export const CommentList = ({ items, onEditItem, onDeleteItem }: CommentListProps) => {
    const sorted = [...items].sort(
        (a, b) => new Date(b.date).getTime() - new Date(a.date).getTime()
    );

    return (
        <Stack spacing={2}>
            {sorted.map(c => (
                <CommentItem
                    key={`${c.date}-${c.description.slice(0, 10)}`}
                    comment={c}
                    onEdit={() => onEditItem(c)}
                    onDelete={() => onDeleteItem(c)}
                />
            ))}
        </Stack>
    );
};
