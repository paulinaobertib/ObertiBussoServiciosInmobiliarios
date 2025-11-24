import { useState } from "react";
import { InquiryForm } from "../app/property/components/inquiries/InquiryForm";
import { AppointmentForm } from "../app/user/components/appointments/user/AppointmentForm";
import { BasePage } from "./BasePage";
import { Box, Typography, Button, useTheme, useMediaQuery, IconButton, Stack } from "@mui/material";
import { useNavigate } from "react-router-dom";
import ReplyIcon from "@mui/icons-material/Reply";

export default function ContactPage() {
  const theme = useTheme();
  const isDesktop = useMediaQuery(theme.breakpoints.up("md"));
  const isMobile = !isDesktop;
  const [tab, setTab] = useState<"inquiry" | "appointment">("inquiry");
  const navigate = useNavigate();

  const desktopPanelStyles = {
    m: 1,
    bgcolor: "background.paper",
    boxShadow: 4,
    borderRadius: 2,
    p: 1,
  } as const;

  const desktopContent = (
    <Box
      sx={{
        display: "flex",
        flexDirection: "row",
        flex: 1,
        minHeight: 0,
        overflow: "hidden",
      }}
    >
      <Box
        sx={{
          flexBasis: "35%",
          display: "flex",
          flexDirection: "column",
          overflow: "hidden",
          minHeight: 0,
          ...desktopPanelStyles,
        }}
      >
        <Box
          sx={{
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            p: 2,
          }}
        >
          <Typography variant="h6" align="center" sx={{ flex: 1 }}>
            Realizá tu consulta
          </Typography>
        </Box>

        <Typography variant="body2" align="center" sx={{ px: 2, color: "text.secondary", fontSize: "0.9rem", mb: 2 }}>
          Completá el formulario para enviarnos tu consulta y nos comunicaremos a la brevedad.
        </Typography>

        <Box
          sx={{
            flex: 1,
            minHeight: 0,
            overflowY: "auto",
          }}
        >
          <InquiryForm propertyIds={[]} />
        </Box>
      </Box>

      <Box
        sx={{
          flexBasis: "65%",
          display: "flex",
          flexDirection: "column",
          overflow: "hidden",
          minHeight: 0,
          ...desktopPanelStyles,
        }}
      >
        <Box
          sx={{
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            p: 2,
          }}
        >
          <Typography variant="h6" align="center" sx={{ flex: 1 }}>
            Reservá tu turno
          </Typography>
        </Box>

        <Typography variant="body2" align="center" sx={{ px: 2, pb: 1, color: "text.secondary", fontSize: "0.9rem" }}>
          Seleccioná fecha y horario para solicitar un turno presencial.
        </Typography>

        <Box
          sx={{
            flex: 1,
            minHeight: 0,
            overflowY: "auto",
            p: 2,
          }}
        >
          <AppointmentForm />
        </Box>
      </Box>
    </Box>
  );

  const mobileContent = (
    <Box
      sx={{
        flex: 1,
        display: "flex",
        flexDirection: "column",
        gap: 3,
        py: 3,
      }}
    >
      <Box sx={{ textAlign: "center", px: 1 }}>
        <Typography variant="h4" sx={{ fontWeight: 700 }}>
          ¿Cómo querés contactarnos?
        </Typography>
      </Box>

      <Stack direction="row" spacing={1} sx={{ px: 1 }}>
        <Button
          fullWidth
          variant={tab === "inquiry" ? "contained" : "outlined"}
          color="primary"
          onClick={() => setTab("inquiry")}
        >
          Formulario
        </Button>
        <Button
          fullWidth
          variant={tab === "appointment" ? "contained" : "outlined"}
          color="primary"
          onClick={() => setTab("appointment")}
        >
          Turnero
        </Button>
      </Stack>

      <Box sx={{ flex: 1, display: "flex", flexDirection: "column", gap: 1, px: 1 }}>
        {tab === "inquiry" ? (
          <>
            <Typography variant="h5">Realizá tu consulta</Typography>
            <Typography variant="body2" color="text.secondary">
              Completá el formulario para enviarnos tu consulta y nos comunicaremos a la brevedad.
            </Typography>
            <Box sx={{ mt: 2 }}>
              <InquiryForm propertyIds={[]} />
            </Box>
          </>
        ) : (
          <>
            <Typography variant="h5">Reservá tu turno</Typography>
            <Typography variant="body2" color="text.secondary">
              Seleccioná fecha y horario para solicitar un turno presencial.
            </Typography>
            <Box sx={{ mt: 2 }}>
              <AppointmentForm />
            </Box>
          </>
        )}
      </Box>
    </Box>
  );

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
        <Box
          sx={{
            flex: 1,
            borderRadius: { xs: 4, md: 0 },
            px: { xs: 1, md: 0 },
            py: { xs: 0, md: 0 },
            mt: 1,
          }}
        >
          {isMobile ? mobileContent : desktopContent}
        </Box>
      </BasePage>
    </>
  );
}
