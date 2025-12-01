import { Box, Typography, IconButton, Tooltip, Chip, Divider, Card } from "@mui/material";
import EditIcon from "@mui/icons-material/Edit";
import DeleteIcon from "@mui/icons-material/Delete";
import type { Comment } from "../../types/comment";

export interface Props {
  comment: Comment;
  authorName?: string;
  onEdit: () => void;
  onDelete: () => void;
  /** opcional: deshabilita el botón de borrar mientras se procesa */
  deleting?: boolean;
}

export const CommentItem = ({ comment, authorName, onEdit, onDelete, deleting }: Props) => {
  const date = new Date(comment.date);
  const isNew = Date.now() - date.getTime() < 3 * 24 * 60 * 60 * 1000;

  return (
    <Card variant="elevation" sx={{ p: 2 }}>
      <Box display="flex" alignItems="center" justifyContent={"space-between"}>
        <Box>
          <Typography variant="subtitle1">
            Creado por: <strong>{authorName ?? comment.userId}</strong>
          </Typography>
          <Typography variant="subtitle2" color="text.secondary">
            {date.toLocaleDateString(undefined, {
              day: "numeric",
              month: "short",
              year: "numeric",
            })}{" "}
            · {date.toLocaleTimeString(undefined, { hour: "2-digit", minute: "2-digit", hour12: false })}
          </Typography>
        </Box>
        <Box>
          {isNew && (
            <Chip
              label="Nuevo"
              color="primary"
              size="small"
              clickable={false}
              tabIndex={-1}
              sx={{ mr: 1, pointerEvents: "none", cursor: "default", userSelect: "none" }}
            />
          )}

          <Box display={"flex"}>
            <Tooltip title="Editar">
              <span>
                <IconButton size="small" onClick={onEdit}>
                  <EditIcon fontSize="small" />
                </IconButton>
              </span>
            </Tooltip>
            <Tooltip title="Eliminar">
              <span>
                <IconButton size="small" onClick={onDelete} disabled={deleting}>
                  <DeleteIcon fontSize="small" />
                </IconButton>
              </span>
            </Tooltip>
          </Box>
        </Box>
      </Box>
      <Divider sx={{ my: 1 }} />
      <Typography variant="body1" color="text.primary" sx={{ whiteSpace: "pre-wrap" }}>
        {comment.description}
      </Typography>
    </Card>
  );
};
