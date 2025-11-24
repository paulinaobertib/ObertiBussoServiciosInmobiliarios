import { Box, Container, IconButton, Typography } from "@mui/material";
import ReplyIcon from "@mui/icons-material/Reply";
import { useNavigate } from "react-router-dom";

import { BasePage } from "./BasePage";
import NoticesSection from "../app/user/components/notices/NoticesSection";
import { InfoIconWithDialog } from "../app/shared/components/InfoIconWithDialog";

export default function NewsPage() {
  const navigate = useNavigate();
  return (
    <>
      <IconButton
        size="small"
        onClick={() => navigate(-1)}
        sx={{ position: "absolute", top: 64, left: 8, zIndex: 1300, display: { xs: "none", sm: "inline-flex" } }}
      >
        <ReplyIcon />
      </IconButton>
      <BasePage>
        <Container maxWidth="lg" sx={{ py: 2 }}>
          <Box sx={{ display: "flex", alignItems: "center", gap: 1, mb: 3 }}>
            <Typography variant="h5" fontWeight={700}>
              Novedades y noticias
            </Typography>
            <InfoIconWithDialog
              title="Novedades y noticias"
              description="En esta sección vas a encontrar las últimas novedades del mercado inmobiliario: cambios en normativas, actualizaciones sobre la ley de alquileres, tendencias de precios y noticias relevantes para propietarios e inquilinos."
              size={20}
            />
          </Box>

          <NoticesSection />
        </Container>
      </BasePage>
    </>
  );
}
