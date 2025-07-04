import { Box, Fab, Tooltip } from "@mui/material";
import ChatBubbleIcon from "@mui/icons-material/ChatBubble";
import { useState } from "react";
import { Chat } from "../app/chat/components/Chat";
import { useAuthContext } from "../app/user/context/AuthContext";

export function ChatAlways() {
  const [open, setOpen] = useState(false);
  const initialId = Number(localStorage.getItem("selectedPropertyId") || "");
  const { isAdmin } = useAuthContext(); 

  if (isAdmin) return null;         

  return (
    <Box sx={{ position: "fixed", bottom: 16, right: 16, zIndex: 1300 }}>
      {!open ? (
        <Tooltip title="Abrir chat" arrow>
          <Fab color="primary" onClick={() => setOpen(true)}>
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
