import { useState } from "react";
import { Box, Fab, Tooltip, Menu, MenuItem, ListItemText, Typography } from "@mui/material";
import WhatsAppIcon from "@mui/icons-material/WhatsApp";
import { useAuthContext } from "../app/user/context/AuthContext";
import { fabSlot } from "../app/shared/utils/fabSlot";
import { trackGoogleAdsConversion } from "../app/shared/utils/googleAds";

const CONTACTS = [
  { name: "Luis", phone: "5493513264536" },
  { name: "Pablo", phone: "5493515107888" },
];

const DEFAULT_WHATSAPP_MESSAGE = "Hola, quisiera realizar una consulta. Muchas gracias.";

export function WhatsAppFab() {
  const { isAdmin } = useAuthContext();
  const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null);
  const fabSize = "3.5rem";

  if (isAdmin) return null;

  const handleOpen = (e: React.MouseEvent<HTMLElement>) => setAnchorEl(e.currentTarget);
  const handleClose = () => setAnchorEl(null);

  const handleSelect = (phone: string) => {
    handleClose();
    trackGoogleAdsConversion("click_whatsapp");
    const encodedMessage = encodeURIComponent(DEFAULT_WHATSAPP_MESSAGE);
    window.open(`https://wa.me/${phone}?text=${encodedMessage}`, "_blank");
  };

  return (
    <>
      <Box sx={fabSlot(1, fabSize, { xs: 16, sm: 20, md: 24 })}>
        <Tooltip title="Escríbanos por WhatsApp" arrow>
          <Fab
            onClick={handleOpen}
            sx={{
              width: fabSize,
              height: fabSize,
              bgcolor: "#25D366",
              "&:hover": { bgcolor: "#1DA851" },
              color: "#fff",
            }}
          >
            <WhatsAppIcon sx={{ fontSize: "1.8rem" }} />
          </Fab>
        </Tooltip>
      </Box>

      <Menu
        anchorEl={anchorEl}
        open={Boolean(anchorEl)}
        onClose={handleClose}
        anchorOrigin={{ vertical: "top", horizontal: "center" }}
        transformOrigin={{ vertical: "bottom", horizontal: "center" }}
        slotProps={{
          paper: {
            sx: {
              borderRadius: 3,
              minWidth: 220,
              mb: 1.5,
              overflow: "visible",
              "&::after": {
                content: '""',
                position: "absolute",
                bottom: -6,
                left: "50%",
                transform: "translateX(-50%)",
                width: 12,
                height: 12,
                bgcolor: "background.paper",
                borderRight: "1px solid",
                borderBottom: "1px solid",
                borderColor: "divider",
                rotate: "45deg",
              },
            },
          },
        }}
      >
        <Box sx={{ px: 2, pt: 1, pb: 0.5 }}>
          <Typography variant="caption" color="text.secondary" fontWeight={600}>
            Elija a quién contactar
          </Typography>
        </Box>
        {CONTACTS.map((c) => (
          <MenuItem key={c.phone} onClick={() => handleSelect(c.phone)}>
            <WhatsAppIcon sx={{ color: "#25D366", mr: 1.5, fontSize: 20 }} />
            <ListItemText primary={c.name} secondary={`+${c.phone.replace(/^549/, "54 9 ").replace(/(\d{3})(\d{3})(\d{4})$/, "$1 $2$3")}`} />
          </MenuItem>
        ))}
      </Menu>
    </>
  );
}
