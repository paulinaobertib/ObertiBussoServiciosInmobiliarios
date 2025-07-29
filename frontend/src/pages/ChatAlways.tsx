import { Box, Fab, Tooltip } from "@mui/material";
import ChatBubbleIcon from "@mui/icons-material/ChatBubble";
import { useState } from "react";
import { Chat } from "../app/chat/components/Chat";
import { useAuthContext } from "../app/user/context/AuthContext";

export function ChatAlways() {
  const [open, setOpen] = useState(false);
  const initialId = Number(localStorage.getItem("selectedPropertyId") || "");
  const { isAdmin } = useAuthContext();
  const fabSize = { xs: '3rem', sm: '3.5rem' };

  if (isAdmin) return null;

  return (
    <Box sx={{ position: "fixed", bottom: 16, right: 16, zIndex: 1300 }}>
      {!open ? (
        <Tooltip title="Abrir chat" arrow>
          <Fab
            onClick={() => setOpen(true)}
            sx={{
              width: fabSize,
              height: fabSize,
              bgcolor: (t) => t.palette.primary.main,
              '&:hover': { bgcolor: (t) => t.palette.primary.dark },
              color: '#fff',
            }}
          >
            <ChatBubbleIcon />
          </Fab>
        </Tooltip>
      ) : (
        <Chat
          initialPropertyId={initialId > 0 ? initialId : undefined}
          onClose={() => setOpen(false)}
        />
      )}
    </Box>
  );
}
