import { Card, Typography } from "@mui/material";
import StickyNote2Outlined from "@mui/icons-material/StickyNote2Outlined";
import Grid from "@mui/material/Grid";

type NotesCardProps = {
  note?: string | null;
  half?: boolean;
  isAdmin?: boolean;
};

export default function NotesCard({ note, half = false, isAdmin = false }: NotesCardProps) {
  if (!isAdmin) return null;

  const hasNote = Boolean(String(note ?? "").trim());
  return (
    <Grid size={{ xs: 12, sm: half ? 6 : 12 }} sx={{ height: "100%", display: "flex" }}>
      <Card
        elevation={2}
        sx={{
          p: "1.5rem",
          borderRadius: "0.75rem",
          display: "flex",
          flexDirection: "column",
          flex: 1,
        }}
      >
        <Typography
          sx={{
            mb: "1.25rem",
            display: "flex",
            alignItems: "center",
            gap: "0.5rem",
            fontSize: "1.25rem",
            fontWeight: 600,
            color: "primary.main",
          }}
        >
          <StickyNote2Outlined />
          Notas del Contrato
        </Typography>
        {hasNote ? (
          <Typography sx={{ fontSize: "1rem", lineHeight: 1.6, color: "#000" }}>{note}</Typography>
        ) : (
          <Typography sx={{ fontSize: "1rem", lineHeight: 1.6, color: "#000" }}>
            No hay notas registradas.
          </Typography>
        )}
      </Card>
    </Grid>
  );
}
