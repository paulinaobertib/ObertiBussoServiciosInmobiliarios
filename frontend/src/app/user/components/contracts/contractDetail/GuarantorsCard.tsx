import { Card, Typography, Box, Button } from "@mui/material";
import Grid from "@mui/material/Grid";
import SecurityOutlined from "@mui/icons-material/SecurityOutlined";
import PersonOutline from "@mui/icons-material/PersonOutline";

type G = { id?: number; name?: string; phone?: string; email?: string };

export default function GuarantorsCard({
  guarantors,
  onManage,
  onUnlink,
}: {
  guarantors: G[];
  onManage?: () => void;
  onUnlink?: (id: number) => void;
}) {
  return (
    <Grid size={{ xs: 12 }}>
      <Card elevation={2} sx={{ p: "1.5rem", borderRadius: "0.75rem" }}>
        <Box sx={{ display: "flex", alignItems: "center", mb: 2 }}>
          <Typography
            sx={{
              display: "flex",
              alignItems: "center",
              gap: 1,
              fontSize: "1.25rem",
              fontWeight: 600,
              color: "primary.main",
            }}
          >
            <SecurityOutlined />
            Garantes
          </Typography>
          <Box sx={{ flexGrow: 1 }} />
          {onManage && (
            <Button
              variant="outlined"
              size="small"
              onClick={onManage}
              sx={{ textTransform: "none", borderRadius: 2, fontWeight: 600 }}
            >
              Agregar garantes
            </Button>
          )}
        </Box>

        {guarantors.length === 0 ? (
          <Typography color="text.secondary">Sin garantes.</Typography>
        ) : (
          <Box sx={{ display: "flex", flexDirection: "column", gap: 1.5 }}>
            {guarantors.map((g, idx) => (
              <Box key={g.id ?? idx} sx={{ p: 1.5, borderRadius: 2, border: "1px solid", borderColor: "grey.200" }}>
                <Box sx={{ display: "flex", alignItems: "center", gap: 1, mb: 0.5 }}>
                  <PersonOutline fontSize="small" color="action" />
                  <Typography sx={{ fontWeight: 700 }}>{g.name}</Typography>
                  <Box sx={{ flexGrow: 1 }} />
                  {onUnlink && g.id != null && (
                    <Button
                      size="small"
                      variant="outlined"
                      color="error"
                      onClick={() => onUnlink(g.id!)}
                      sx={{ textTransform: "none", borderRadius: 2, fontWeight: 600 }}
                    >
                      Desvincular
                    </Button>
                  )}
                </Box>
                <Typography sx={{ color: "text.secondary" }}>
                  <strong>Teléfono:</strong> {g.phone ?? "-"}
                </Typography>
                <Typography sx={{ color: "text.secondary" }}>
                  <strong>Email:</strong> {g.email ?? "-"}
                </Typography>
              </Box>
            ))}
          </Box>
        )}
      </Card>
    </Grid>
  );
}
