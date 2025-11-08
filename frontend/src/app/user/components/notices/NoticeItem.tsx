import { useState, useRef } from "react";
import { Box, Typography, Button, IconButton, Chip, Card } from "@mui/material";
import EditIcon from "@mui/icons-material/Edit";
import DeleteIcon from "@mui/icons-material/Delete";
import { useNavigate } from "react-router-dom";
import { buildRoute, ROUTES } from "../../../../lib";
import { Modal } from "../../../shared/components/Modal";
import { NoticeForm, NoticeFormHandle } from "./NoticeForm";
import type { Notice } from "../../types/notice";
import { LoadingButton } from "@mui/lab";

interface Props {
  notice: Notice;
  isAdmin?: boolean;
  onUpdate: (n: Notice) => Promise<void>;
  onDeleteClick?: (id: number) => void;
}

export const NoticeItem = ({ notice, isAdmin = false, onUpdate, onDeleteClick }: Props) => {
  const navigate = useNavigate();
  const [editOpen, setEditOpen] = useState(false);
  const [canSave, setCanSave] = useState(false);
  const formRef = useRef<NoticeFormHandle>(null);
  const [saving, setSaving] = useState(false);

  const imageSrc =
    typeof notice.mainImage === "string"
      ? notice.mainImage
      : notice.mainImage
      ? URL.createObjectURL(notice.mainImage)
      : "";

  const isNew = Date.now() - new Date(notice.date).getTime() < 3 * 24 * 60 * 60 * 1000;

  const formattedDate = new Date(notice.date).toLocaleDateString("es-AR", {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
  });

  const goToDetails = () => navigate(buildRoute(ROUTES.NEWS_DETAILS, notice.id));

  const handleCardClick = () => {
    goToDetails();
  };

  const handleReadMore = (event: React.MouseEvent) => {
    event.stopPropagation();
    goToDetails();
  };

  const openEdit = (event: React.MouseEvent) => {
    event.stopPropagation();
    setEditOpen(true);
  };
  const closeEdit = () => setEditOpen(false);

  const handleDeleteClick = (event: React.MouseEvent) => {
    event.stopPropagation();
    onDeleteClick?.(notice.id);
  };

  const handleSave = async () => {
    if (!formRef.current || saving) return;
    const data = formRef.current.getUpdateData();

    setSaving(true);
    await new Promise(requestAnimationFrame);
    try {
      await Promise.all([onUpdate({ ...(data as Notice), id: notice.id, userId: notice.userId })]);
      closeEdit();
    } finally {
      setSaving(false);
    }
  };

  const descriptionPreview = (notice.description ?? "").trim();

  return (
    <>
      <Card
        onClick={handleCardClick}
        sx={{
          boxSizing: "border-box",
          width: "100%",
          display: "flex",
          flexDirection: "column",
          overflow: "hidden",
          cursor: "pointer",
          transition: "transform 0.15s ease",
          height: "100%",
          boxShadow: "0px 20px 40px rgba(15,23,42,0.08)",
          "&:hover": {
            transform: "scale(1.01)",
          },
        }}
      >
        <Box sx={{ position: "relative", flexShrink: 0 }}>
          <Box
            component="img"
            src={imageSrc || undefined}
            alt={notice.title}
            sx={{
              width: "100%",
              aspectRatio: "9 / 16",
              objectFit: "cover",
              display: "block",
              backgroundColor: "action.hover",
            }}
          />

          {isNew && (
            <Chip
              label="NUEVO"
              size="small"
              sx={{
                position: "absolute",
                top: 12,
                left: 12,
                bgcolor: "quaternary.main",
                fontWeight: 600,
                fontSize: "0.65rem",
              }}
            />
          )}

          {isAdmin && (
            <Box sx={{ position: "absolute", top: 8, right: 8, display: "flex", gap: 0.5 }}>
              <IconButton
                size="small"
                onClick={openEdit}
                aria-label="Editar noticia"
                sx={{
                  bgcolor: "rgba(15, 23, 42, 0.55)",
                  color: "common.white",
                  "&:hover": { bgcolor: "rgba(15, 23, 42, 0.75)" },
                }}
              >
                <EditIcon fontSize="small" />
              </IconButton>
              <IconButton
                size="small"
                onClick={handleDeleteClick}
                aria-label="Eliminar noticia"
                sx={{
                  bgcolor: "rgba(15, 23, 42, 0.55)",
                  color: "common.white",
                  "&:hover": { bgcolor: "rgba(15, 23, 42, 0.75)" },
                }}
              >
                <DeleteIcon fontSize="small" />
              </IconButton>
            </Box>
          )}
        </Box>

        <Box sx={{ p: 3, display: "flex", flexDirection: "column", gap: 1.5, flexGrow: 1, minHeight: 0 }}>
          <Typography variant="caption" color="text.secondary">
            {formattedDate}
          </Typography>

          <Typography
            variant="h6"
            sx={{
              fontWeight: 700,
              lineHeight: 1.2,
              display: "-webkit-box",
              WebkitLineClamp: 2,
              WebkitBoxOrient: "vertical",
              overflow: "hidden",
            }}
          >
            {notice.title}
          </Typography>

          {descriptionPreview && (
            <Typography
              variant="body2"
              color="text.secondary"
              sx={{
                display: "-webkit-box",
                WebkitLineClamp: 3,
                WebkitBoxOrient: "vertical",
                overflow: "hidden",
                flexGrow: 1,
              }}
            >
              {descriptionPreview}
            </Typography>
          )}

          <Button variant="outlined" size="small" onClick={handleReadMore} sx={{ alignSelf: "flex-start", mt: "auto" }}>
            Ver detalle
          </Button>
        </Box>
      </Card>

      <Modal open={editOpen} title="Editar novedad" onClose={closeEdit}>
        <NoticeForm key={notice.id} ref={formRef} initialData={notice} onValidityChange={setCanSave} />
        <Box display="flex" justifyContent="flex-end" gap={1} mt={3}>
          <LoadingButton variant="contained" onClick={handleSave} disabled={!canSave} loading={saving}>
            Guardar
          </LoadingButton>
        </Box>
      </Modal>
    </>
  );
};
