import { useState } from "react";
import {
  Paper,
  Box,
  Typography,
  IconButton,
  Chip,
} from "@mui/material";
import EditIcon from "@mui/icons-material/Edit";
import DeleteIcon from "@mui/icons-material/Delete";
import type { Notice } from "../../types/notice";
import { useUser } from "../../../user/hooks/useUser";

interface Props {
  notice: Notice;
  isAdmin: boolean;
  onEditClick: (n: Notice) => void;
  onDeleteClick: (id: number) => void;
}

export default function NoticeItem({
  notice,
  isAdmin,
  onEditClick,
  onDeleteClick,
}: Props) {
  const { user } = useUser(notice.userId);
  const [expanded, setExpanded] = useState(false);

  const isNew =
    Date.now() - new Date(notice.date).getTime() <
    3 * 24 * 60 * 60 * 1000;

  return (
    <Paper
      elevation={0}
      sx={{
        display: "flex",
        flexDirection: { xs: "column", md: "row" },
        borderLeft: 4,
        borderColor: isNew ? "secondary.main" : "divider",
        p: 3,
        borderRadius: 2,
        overflow: "hidden",
      }}
    >
      <Box sx={{ flex: 1, pr: { md: 2 } }}>
        <Box
          display="flex"
          alignItems="center"
          justifyContent="space-between"
          mb={1}
        >
          <Box display="flex" alignItems="center" gap={1}>
            <Typography
              variant="overline"
              color="textSecondary"
              sx={{ letterSpacing: 1 }}
            >
              Publicada el{" "}
              {new Date(notice.date).toLocaleDateString()}
              {user && ` por ${user.firstName} ${user.lastName}`}
            </Typography>
            {isNew && (
              <Chip
                label="Nuevo"
                size="small"
                sx={{
                  fontWeight: 500,
                  bgcolor: "quaternary.main",
                  color: "quaternary.contrastText",
                }}
              />
            )}
          </Box>
          {isAdmin && (
            <Box display="flex" gap={0.5}>
              <IconButton
                size="small"
                onClick={() => onEditClick(notice)}
                sx={{ p: 0.5 }}
              >
                <EditIcon fontSize="medium" />
              </IconButton>
              <IconButton
                size="small"
                onClick={() => onDeleteClick(notice.id)}
                sx={{ p: 0.5 }}
              >
                <DeleteIcon fontSize="medium" />
              </IconButton>
            </Box>
          )}
        </Box>

        <Typography
          variant="h6"
          component="h2"
          gutterBottom
          sx={{ fontWeight: 600, lineHeight: 1.2 }}
        >
          {notice.title}
        </Typography>

        <Typography
          variant="body2"
          color="textSecondary"
          paragraph
          sx={{
            display: "-webkit-box",
            WebkitLineClamp: expanded ? "none" : 2,
            WebkitBoxOrient: "vertical",
            overflow: expanded ? "auto" : "hidden",
          }}
        >
          {notice.description}
        </Typography>

        <Typography
          variant="button"
          onClick={() => setExpanded((e) => !e)}
          sx={{
            cursor: "pointer",
            color: "primary.main",
            textTransform: "none",
            fontSize: "0.75rem",
          }}
        >
          {expanded ? "Ver menos" : "Ver más"}
        </Typography>
      </Box>

      <Box
        component="img"
        src="/logo.png"
        alt="Logo"
        sx={{
          width: { xs: "100%", md: 120 },
          objectFit: "contain",
          alignSelf: "center",
          ml: { md: 2 },
          mt: { xs: 2, md: 0 },
          display: { xs: "none", md: "block" },
        }}
      />
    </Paper>
  );
}
