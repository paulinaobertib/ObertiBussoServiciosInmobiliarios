import { useState } from "react";
import { Box, Container, Grid, Typography, Button, IconButton } from "@mui/material";
import FacebookIcon from "@mui/icons-material/Facebook";
import EmailIcon from "@mui/icons-material/Email";
import InstagramIcon from "@mui/icons-material/Instagram";
import WhatsAppIcon from "@mui/icons-material/WhatsApp";
import { ROUTES } from "../../../lib";
import { useNavigate } from "react-router-dom";
import { Modal } from "./Modal";
import { SuggestionForm } from "../../property/components/suggestions/SuggestionForm";

const Footer = () => {
  const navigate = useNavigate();
  const [suggestionOpen, setSuggestionOpen] = useState(false);

  return (
    <Box
      component="footer"
      sx={{
        backgroundColor: "#1a1a1a",
        color: "#fff",
        py: { xs: 2 },
        px: { xs: 2 },
      }}
    >
      <Container maxWidth="xl">
        {/* Tres columnas: Accesos | Redes y Contacto (repetida) | Ubicación */}
        <Grid container spacing={10} justifyContent="center">
          {/* Accesos */}
          <Grid
            size={{ xs: 12, sm: 4, md: 4 }}
            sx={{
              display: "flex",
              flexDirection: "column",
              alignItems: "center",
              gap: 1,
            }}
          >
            <Typography variant="h6" fontWeight="bold" mb={2}>
              Accesos
            </Typography>
            <Button variant="text" sx={{ color: "#fff" }} onClick={() => navigate(ROUTES.HOME_APP)}>
              Inicio
            </Button>
            <Button variant="text" sx={{ color: "#fff" }} onClick={() => navigate(ROUTES.CONTACT)}>
              Generar Consulta
            </Button>
            <Button variant="text" sx={{ color: "#fff" }} onClick={() => setSuggestionOpen(true)}>
              Reportar Problema
            </Button>
            <Button variant="text" sx={{ color: "#fff" }} onClick={() => navigate(ROUTES.NEWS)}>
              Noticias
            </Button>
            <Button variant="text" sx={{ color: "#fff" }} onClick={() => navigate(ROUTES.POLICIES)}>
              Políticas de Privacidad
            </Button>
          </Grid>

          {/* Redes y Contacto (misma sección central) */}
          <Grid size={{ xs: 12, sm: 4, md: 4 }}>
            <Typography variant="h6" fontWeight="bold" mb={2} textAlign="center">
              Redes y Contacto
            </Typography>
            <Box
              sx={{
                display: "flex",
                flexDirection: "column",
                alignItems: "center",
                gap: 1,
              }}
            >
              {/* Facebook */}
              <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
                <IconButton
                  aria-label="Facebook"
                  sx={{ color: "#fff", "&:hover": { color: "#4dabf5" } }}
                  onClick={() => window.open(`https://www.facebook.com/oberti.busso/`, "_blank")}
                >
                  <FacebookIcon />
                </IconButton>
                <Typography
                  variant="body2"
                  sx={{ cursor: "pointer", "&:hover": { color: "#4dabf5" } }}
                  onClick={() => window.open("https://www.facebook.com/oberti.busso/", "_blank")}
                >
                  Facebook
                </Typography>
              </Box>

              {/* Instagram */}
              <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
                <IconButton
                  aria-label="Instagram"
                  sx={{ color: "#fff", "&:hover": { color: "#4dabf5" } }}
                  onClick={() => window.open(`https://www.instagram.com/oberti.busso/`, "_blank")}
                >
                  <InstagramIcon />
                </IconButton>
                <Typography
                  variant="body2"
                  sx={{ cursor: "pointer", "&:hover": { color: "#4dabf5" } }}
                  onClick={() => window.open("https://www.instagram.com/oberti.busso/", "_blank")}
                >
                  Instagram
                </Typography>
              </Box>

              {/* Email */}
              <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
                <IconButton aria-label="Email" sx={{ cursor: "auto", color: "#fff", "&:hover": { color: "#4dabf5" } }}>
                  <EmailIcon />
                </IconButton>
                <Typography variant="body2" sx={{ cursor: "auto", "&:hover": { color: "#4dabf5" } }}>
                  oberti.busso@gmail.com
                </Typography>
              </Box>

              {/* WhatsApp Pablo */}
              <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
                <IconButton
                  aria-label="WhatsApp Pablo"
                  sx={{ color: "#fff", "&:hover": { color: "#4dabf5" } }}
                  onClick={() => window.open("https://wa.me/5493513264536", "_blank")}
                >
                  <WhatsAppIcon />
                </IconButton>
                <Typography
                  variant="body2"
                  sx={{ cursor: "pointer", color: "#fff", "&:hover": { color: "#4dabf5" } }}
                  onClick={() => window.open("https://wa.me/5493513264536", "_blank")}
                >
                  Luis: +54 9 351 3264536
                </Typography>
              </Box>

              {/* WhatsApp Luis */}
              <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
                <IconButton
                  aria-label="WhatsApp Luis"
                  sx={{ color: "#fff", "&:hover": { color: "#4dabf5" } }}
                  onClick={() => window.open("https://wa.me/5493515107888", "_blank")}
                >
                  <WhatsAppIcon />
                </IconButton>
                <Typography
                  variant="body2"
                  sx={{ cursor: "pointer", color: "#fff", "&:hover": { color: "#4dabf5" } }}
                  onClick={() => window.open("https://wa.me/5493515107888", "_blank")}
                >
                  Pablo: +54 9 351 5107888
                </Typography>
              </Box>
            </Box>
          </Grid>

          {/* Ubicación */}
          <Grid size={{ xs: 12, sm: 4, md: 4 }}>
            <Typography variant="h6" fontWeight="bold" mb={2} textAlign={"center"} sx={{ lineHeight: 2 }}>
              Ubicación de Oficinas
            </Typography>
            <Typography variant="body2" textAlign="center">
              <a
                href="https://maps.google.com/?q=Luis+Galeano+1910,+Villa+Cabrera,+Córdoba,+Argentina"
                target="_blank"
                rel="noopener noreferrer"
                style={{ color: "inherit", textDecoration: "none", display: "inline-block", marginBottom: "32px" }}
              >
                Luis Galeano 1910 - Local 2<br />
                Villa Cabrera, Córdoba, Argentina
              </a>
              <br />
              <a
                href="https://www.google.com/maps?q=Lisandro+de+la+Torre+299,+Local+7,+Villa+Carlos+Paz,+Córdoba,+Argentina"
                target="_blank"
                rel="noopener noreferrer"
                style={{ color: "inherit", textDecoration: "none" }}
              >
                Lisandro de la Torre 299 – Local 7<br />
                Villa Carlos Paz, Córdoba, Argentina
              </a>
            </Typography>
            <Box
              component="ul"
              sx={{
                pl: 2,
                m: 0,
                listStyle: "disc",
                color: "#fff",
              }}
            ></Box>
          </Grid>
        </Grid>

        {/* Pie de página */}
        <Box
          sx={{
            mt: 2,
            pt: 2,
            borderTop: "1px solid rgba(255,255,255,0.1)",
            textAlign: "center",
          }}
        >
          <Typography variant="body2" sx={{ color: "rgba(255,255,255,0.6)" }}>
            © {new Date().getFullYear()} Oberti Busso Servicios Inmobiliarios. Todos los derechos reservados.
          </Typography>
        </Box>
      </Container>

      {/* Modal para sugerencias */}
      <Modal
        open={suggestionOpen}
        title="Enviar reporte de mejora para el sitio web"
        onClose={() => setSuggestionOpen(false)}
      >
        <SuggestionForm onSuccess={() => setSuggestionOpen(false)} />
      </Modal>
    </Box>
  );
};

export default Footer;
