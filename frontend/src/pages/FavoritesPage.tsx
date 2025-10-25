import { IconButton, Container, Typography, Paper, Stack, Button, Box } from "@mui/material";
import ReplyIcon from "@mui/icons-material/Reply";
import { useNavigate } from "react-router-dom";

import { BasePage } from "./BasePage";
import { FavoritesPanel } from "../app/user/components/favorites/FavoritesPanel";
import { ROUTES } from "../lib";

export default function FavoritesPage() {
  const navigate = useNavigate();

  return (
    <>
      <IconButton
        size="small"
        onClick={() => navigate(-1)}
        sx={{ position: "absolute", top: 64, left: 8, zIndex: 1300 }}
        aria-label="volver"
      >
        <ReplyIcon />
      </IconButton>

      <BasePage maxWidth={false}>
        <Container sx={{ py: { xs: 4, md: 6 } }}>
          <Stack spacing={{ xs: 4, md: 5 }}>
            <Paper
              elevation={0}
              sx={{
                p: { xs: 3, md: 4 },
                borderRadius: 3,
                border: "1px solid",
                borderColor: "divider",
                background: (theme) =>
                  `linear-gradient(135deg, ${theme.palette.primary.light}1A, ${theme.palette.primary.main}26)`,
              }}
            >
              <Stack
                direction={{ xs: "column", md: "row" }}
                spacing={{ xs: 3, md: 4 }}
                alignItems={{ xs: "flex-start", md: "center" }}
                justifyContent="space-between"
              >
                <Box flex={1}>
                  <Typography variant="h4" fontWeight={800} gutterBottom>
                    Mis Favoritos
                  </Typography>
                  <Typography variant="body1" color="text.secondary" sx={{ maxWidth: 540 }}>
                    Organizá tus propiedades guardadas y retomá tu búsqueda cuando quieras. Desde aquí podés volver al
                    detalle, coordinar visitas o compartirlas con quien necesites.
                  </Typography>
                </Box>
              </Stack>

              <Stack
                direction={{ xs: "column", sm: "row" }}
                spacing={2}
                alignItems={{ xs: "stretch", sm: "center" }}
                justifyContent="space-between"
                sx={{ mt: { xs: 3, md: 4 } }}
              >
                <Typography variant="body2" color="text.secondary">
                  ¿Te interesan más opciones? Explorá el catálogo completo para sumar nuevas propiedades a tu lista.
                </Typography>
                <Button
                  variant="contained"
                  onClick={() => navigate(ROUTES.HOME_APP)}
                  sx={{ alignSelf: { xs: "stretch", sm: "center" } }}
                >
                  Ver catálogo
                </Button>
              </Stack>
            </Paper>

            <FavoritesPanel />
          </Stack>
        </Container>
      </BasePage>
    </>
  );
}
