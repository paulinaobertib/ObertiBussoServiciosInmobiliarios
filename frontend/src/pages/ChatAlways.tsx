import { Box, Fab, Tooltip } from "@mui/material";
import ChatIconUrl from '../assets/ic_chat.png';
import { useState } from "react";
import { Chat } from "../app/chat/components/Chat";
import { useAuthContext } from "../app/user/context/AuthContext";
import { fabSlot } from "../app/shared/utils/fabSlot";

export function ChatAlways() {
  const [open, setOpen] = useState(false);
  const initialId = Number(localStorage.getItem("selectedPropertyId") || "");
  const { isAdmin } = useAuthContext();
  const fabSize = '3.5rem';

  if (isAdmin) return null;

  return (
    <>
      {!open ? (
        <Box sx={fabSlot(0, fabSize)}>
          <Tooltip title="Abrir chat" arrow>
            <Fab
              onClick={() => setOpen(true)}
              sx={{
                width: fabSize, height: fabSize,
                bgcolor: (t) => t.palette.primary.main,
                '&:hover': { bgcolor: (t) => t.palette.primary.dark },
                color: '#fff',
              }}
            >
              <img src={ChatIconUrl} alt="Chat" style={{ width: '2.2rem', height: '2.2rem' }} />
            </Fab>
          </Tooltip>
        </Box>
      ) : (
        <Chat
          initialPropertyId={initialId > 0 ? initialId : undefined}
          onClose={() => setOpen(false)}
        />
      )}
    </>
  );
}