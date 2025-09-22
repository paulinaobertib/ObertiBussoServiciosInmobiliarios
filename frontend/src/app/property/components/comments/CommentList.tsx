import { Stack } from "@mui/material";
import { CommentItem } from "./CommentItem";
import { Comment } from "../../types/comment";

export interface Props {
  items: Comment[];
  onEditItem: (item: Comment) => void;
  onDeleteItem: (item: Comment) => void;
  getUserName: (id: string) => string;
  /** opcional: id que se está eliminando para deshabilitar su botón */
  deletingId?: number | null;
}

export const CommentList = ({ items, onEditItem, onDeleteItem, getUserName, deletingId }: Props) => {
  const sorted = items.slice().sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());

  return (
    <Stack direction="column" gap={2}>
      {sorted.map((c) => (
        <CommentItem
          key={c.id}
          comment={c}
          authorName={getUserName(String(c.userId))}
          onEdit={() => onEditItem(c)}
          onDelete={() => onDeleteItem(c)}
          deleting={deletingId === c.id}
        />
      ))}
    </Stack>
  );
};
