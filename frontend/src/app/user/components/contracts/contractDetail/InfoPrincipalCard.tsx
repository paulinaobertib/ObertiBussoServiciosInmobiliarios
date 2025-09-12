import { Paper, Typography, Box } from "@mui/material";
import Grid from "@mui/material/Grid";
import AccountCircleOutlined from "@mui/icons-material/AccountCircleOutlined";
import HomeOutlined from "@mui/icons-material/HomeOutlined";
import PersonOutline from "@mui/icons-material/PersonOutline";
import { Link } from "react-router-dom";

type Props = {
  userName?: string | null;
  propertyName?: string | null;
  propertyHref: string;
  userId: string | number;
};

export default function InfoPrincipalCard({ userName, propertyName, propertyHref, userId }: Props) {
  return (
    <Grid size={{ xs: 12, sm: 6 }}>
      <Paper elevation={1} sx={{ p: 3, borderRadius: 3, border: "1px solid", borderColor: "grey.200" }}>
        <Typography sx={{ mb: 2, display: "flex", alignItems: "center", gap: 1, fontSize: "1.25rem", fontWeight: 600, color: "primary.main" }}>
          <AccountCircleOutlined />
          Información Principal
        </Typography>

        <Box sx={{ display: "flex", flexDirection: "column", gap: 2 }}>
          <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
            <PersonOutline fontSize="small" color="action" />
            <Typography sx={{ fontSize: ".875rem", color: "text.secondary", fontWeight: 500 }}>
              Usuario:
            </Typography>
            <Typography sx={{ fontSize: "1rem", fontWeight: 600 }}>
              {userName || userId}
            </Typography>
          </Box>

          <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
            <HomeOutlined fontSize="small" color="action" />
            <Typography sx={{ fontSize: ".875rem", color: "text.secondary", fontWeight: 500 }}>
              Propiedad:
            </Typography>
            <Typography
              component={Link}
              to={propertyHref}
              sx={{ fontSize: "1rem", fontWeight: 700, textDecoration: "none", "&:hover": { textDecoration: "underline" }, color: "primary.main" }}
            >
              {propertyName || "Propiedad"}
            </Typography>
          </Box>
        </Box>
      </Paper>
    </Grid>
  );
}
