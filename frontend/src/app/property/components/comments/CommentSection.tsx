import { useState, useCallback } from "react";
import { Box, Typography, Divider, CircularProgress } from "@mui/material";

import type { Comment } from "../../types/comment";
import { CommentForm } from "../forms/CommentForm";
import { CommentList } from "./CommentList";
import { EmptyState } from "../../../shared/components/EmptyState";
import { useAuthContext } from "../../../user/context/AuthContext";
import { usePropertyNotes } from "../../hooks/usePropertyNotes";

export interface Props {
  propertyId: number;
  loading: boolean;
  items: Comment[];
  refresh: () => Promise<void>;
  getUserName: (id: string) => string;
}

export const CommentSection = ({ propertyId, loading, items, refresh, getUserName }: Props) => {
  const [action, setAction] = useState<"add" | "edit">("add");
  const [selected, setSelected] = useState<Comment>();
  const [deletingId, setDeletingId] = useState<number | null>(null);

  const { isAdmin } = useAuthContext();

  // 👍 Sólo usamos del hook la acción centralizada (confirmación + éxito + manejo de errores)
  const { removeComment } = usePropertyNotes(propertyId);

  const startEdit = (c: Comment) => {
    setAction("edit");
    setSelected(c);
  };

  const handleDelete = useCallback(
    async (c: Comment) => {
      setDeletingId(c.id);
      try {
        const ok = await removeComment(c); // el hook hace confirm + success + maneja errores
        if (ok) await refresh(); // sincronizamos la lista del padre
      } finally {
        setDeletingId(null);
      }
    },
    [removeComment, refresh]
  );

  const handleDone = () => {
    setAction("add");
    setSelected(undefined);
  };

  return (
    <Box>
      <Box sx={{ p: 3 }}>
        <Box display="flex" alignItems="center" mb={2}>
          <Typography variant="h6" fontWeight={700}>
            {action === "add" ? "Agregar Comentario" : "Editar Comentario"}
          </Typography>
        </Box>

        <CommentForm propertyId={propertyId} action={action} item={selected} refresh={refresh} onDone={handleDone} />
      </Box>

      <Box sx={{ p: 3 }}>
        <Box display="flex" alignItems="center" mb={2}>
          <Typography variant="h6" fontWeight={700}>
            Lista de Comentarios
          </Typography>
        </Box>
        <Divider sx={{ mb: 2 }} />

        {loading ? (
          <Box display="flex" justifyContent="center" py={4}>
            <CircularProgress />
          </Box>
        ) : items.length === 0 ? (
          <EmptyState
            title={isAdmin ? "No hay comentarios registrados." : "No hay comentarios disponibles."}
            description={
              isAdmin
                ? "Todavía no se cargaron comentarios para esta propiedad."
                : "Sé el primero en dejar tu opinión sobre la propiedad."
            }
          />
        ) : (
          <CommentList
            items={items}
            onEditItem={startEdit}
            onDeleteItem={handleDelete}
            getUserName={getUserName}
            deletingId={deletingId}
          />
        )}
      </Box>
    </Box>
  );
};
