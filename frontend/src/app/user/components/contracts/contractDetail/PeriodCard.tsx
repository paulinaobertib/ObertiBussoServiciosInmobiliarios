import { Card, Typography, Box } from "@mui/material";
import Grid from "@mui/material/Grid";
import CalendarMonthOutlined from "@mui/icons-material/CalendarMonthOutlined";
import { fmtLongDate } from "./utils";

type Props = { startDate: string; endDate: string };

export default function PeriodCard({ startDate, endDate }: Props) {
  return (
    <Grid size={{ xs: 12, sm: 6 }}>
      <Card elevation={2} sx={{ p: "1.5rem", borderRadius: "0.75rem" }}>
        <Typography
          sx={{
            mb: 2,
            display: "flex",
            alignItems: "center",
            gap: 1,
            fontSize: "1.25rem",
            fontWeight: 600,
            color: "primary.main",
          }}
        >
          <CalendarMonthOutlined />
          Período del Contrato
        </Typography>
        <Box sx={{ display: "flex", flexDirection: "column", gap: 2 }}>
          <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
            <Typography sx={{ fontSize: ".875rem", color: "#000", fontWeight: 500 }}>Desde:</Typography>
            <Typography sx={{ fontSize: "1rem", fontWeight: 600 }}>{fmtLongDate(startDate)}</Typography>
          </Box>
          <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
            <Typography sx={{ fontSize: ".875rem", color: "#000", fontWeight: 500 }}>Hasta:</Typography>
            <Typography sx={{ fontSize: "1rem", fontWeight: 600 }}>{fmtLongDate(endDate)}</Typography>
          </Box>
        </Box>
      </Card>
    </Grid>
  );
}
