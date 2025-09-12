import { Paper, Typography, Box } from "@mui/material";
import Grid from "@mui/material/Grid";
import CalendarMonthOutlined from "@mui/icons-material/CalendarMonthOutlined";
import { fmtLongDate } from "./utils";

type Props = { startDate: string; endDate: string };

export default function PeriodCard({ startDate, endDate }: Props) {
  return (
    <Grid size={{ xs: 12, sm: 6 }}>
      <Paper elevation={1} sx={{ p: 3, borderRadius: 3, border: "1px solid", borderColor: "grey.200" }}>
        <Typography sx={{ mb: 2, display: "flex", alignItems: "center", gap: 1, fontSize: "1.25rem", fontWeight: 600, color: "primary.main" }}>
          <CalendarMonthOutlined />
          Período del Contrato
        </Typography>
        <Box sx={{ display: "flex", flexDirection: "column", gap: 2 }}>
          <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
            <Typography sx={{ fontSize: ".875rem", color: "text.secondary", fontWeight: 500 }}>
              Desde:
            </Typography>
            <Typography sx={{ fontSize: "1rem", fontWeight: 600 }}>{fmtLongDate(startDate)}</Typography>
          </Box>
          <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
            <Typography sx={{ fontSize: ".875rem", color: "text.secondary", fontWeight: 500 }}>
              Hasta:
            </Typography>
            <Typography sx={{ fontSize: "1rem", fontWeight: 600 }}>{fmtLongDate(endDate)}</Typography>
          </Box>
        </Box>
      </Paper>
    </Grid>
  );
}
