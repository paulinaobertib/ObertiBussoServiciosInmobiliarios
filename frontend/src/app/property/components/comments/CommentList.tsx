import { Stack } from '@mui/material';
import { CommentItem } from './CommentItem';
import { Comment } from '../../types/comment';

export interface Props {
    items: Comment[];
    onEditItem: (item: Comment) => void;
    onDeleteItem: (item: Comment) => void;
    getUserName: (id: string) => string;
}

export const CommentList = ({ items, onEditItem, onDeleteItem, getUserName, }: Props) => {
    const sorted = items
        .slice()
        .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());

    return (
        <Stack direction="column" gap={2} >
            {sorted.map(c => (
                <CommentItem
                    key={c.id}
                    comment={c}
                    authorName={getUserName(c.userId)}
                    onEdit={() => onEditItem(c)}
                    onDelete={() => onDeleteItem(c)}
                />
            ))}
        </Stack>
    );
};
