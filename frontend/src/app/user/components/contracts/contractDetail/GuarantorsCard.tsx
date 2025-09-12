import { Paper, Typography, Box } from "@mui/material";
import Grid from "@mui/material/Grid";
import SecurityOutlined from "@mui/icons-material/SecurityOutlined";
import PersonOutline from "@mui/icons-material/PersonOutline";

type G = { id?: number; name?: string; phone?: string; email?: string };

export default function GuarantorsCard({ guarantors }: { guarantors: G[] }) {
  return (
    <Grid size={{ xs: 12 }}>
      <Paper elevation={1} sx={{ p: 3, borderRadius: 3, border: "1px solid", borderColor: "grey.200" }}>
        <Typography sx={{ mb: 2, display: "flex", alignItems: "center", gap: 1, fontSize: "1.25rem", fontWeight: 600, color: "primary.main" }}>
          <SecurityOutlined />
          Garantes
        </Typography>

        {guarantors.length === 0 ? (
          <Typography color="text.secondary">Sin garantes.</Typography>
        ) : (
          <Box sx={{ display: "flex", flexDirection: "column", gap: 1.5 }}>
            {guarantors.map((g, idx) => (
              <Box key={g.id ?? idx} sx={{ p: 1.5, borderRadius: 2, border: "1px solid", borderColor: "grey.200" }}>
                <Box sx={{ display: "flex", alignItems: "center", gap: 1, mb: 0.5 }}>
                  <PersonOutline fontSize="small" color="action" />
                  <Typography sx={{ fontWeight: 700 }}>{g.name}</Typography>
                </Box>
                <Typography sx={{ color: "text.secondary" }}><strong>Teléfono:</strong> {g.phone ?? "-"}</Typography>
                <Typography sx={{ color: "text.secondary" }}><strong>Email:</strong> {g.email ?? "-"}</Typography>
              </Box>
            ))}
          </Box>
        )}
      </Paper>
    </Grid>
  );
}
