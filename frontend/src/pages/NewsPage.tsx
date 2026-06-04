import { Box, Container, IconButton, Typography, Tabs, Tab, List, ListItem, ListItemText } from "@mui/material";
import ReplyIcon from "@mui/icons-material/Reply";
import { useNavigate } from "react-router-dom";
import { useEffect, useState } from "react";

import { BasePage } from "./BasePage";
import NoticesSection from "../app/user/components/notices/NoticesSection";
import { InfoIconWithDialog } from "../app/shared/components/InfoIconWithDialog";
import { useAuthContext } from "../app/user/context/AuthContext";
import { getWasiActivity } from "../app/property/services/wasi.service";

export default function NewsPage() {
  const navigate = useNavigate();
  const { isAdmin } = useAuthContext();
  const [tab, setTab] = useState(0);
  const [activity, setActivity] = useState<{ at: string; level: string; message: string }[]>([]);

  useEffect(() => {
    if (!isAdmin || tab !== 1) return;
    getWasiActivity()
      .then(setActivity)
      .catch(() => setActivity([]));
  }, [isAdmin, tab]);

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

          {isAdmin && (
            <Tabs value={tab} onChange={(_, v) => setTab(v)} sx={{ mb: 2 }}>
              <Tab label="Noticias" />
              <Tab label="Actividad Wasi" />
            </Tabs>
          )}

          {(!isAdmin || tab === 0) && <NoticesSection />}

          {isAdmin && tab === 1 && (
            <List dense>
              {activity.length === 0 ? (
                <Typography variant="body2" color="text.secondary">
                  Sin actividad reciente o Wasi no configurado.
                </Typography>
              ) : (
                activity.map((a, i) => (
                  <ListItem key={i} divider>
                    <ListItemText primary={a.message} secondary={`${a.level} · ${a.at}`} />
                  </ListItem>
                ))
              )}
            </List>
          )}
        </Container>
      </BasePage>
    </>
  );
}
