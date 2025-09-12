import { Paper, Typography } from "@mui/material";
import Grid from "@mui/material/Grid";

export default function NotesCard({ note }: { note: string }) {
  return (
    <Grid size={{ xs: 12 }}>
      <Paper
        elevation={1}
        sx={{ p: 3, borderRadius: 3, border: "1px solid", borderColor: "grey.200", bgcolor: "grey.50" }}
      >
        <Typography sx={{ mb: 2, fontSize: "1.25rem", fontWeight: 600, color: "primary.main" }}>
          Notas del Contrato
        </Typography>
        <Typography sx={{ fontSize: "1rem", lineHeight: 1.6 }}>{note}</Typography>
      </Paper>
    </Grid>
  );
}
