import { Container, Toolbar, Box, Fab, Tooltip } from '@mui/material';
import ChatBubbleIcon from '@mui/icons-material/ChatBubble';
import { PropsWithChildren } from 'react';
import { NavBar } from '../app/shared/components/Navbar';
import { Chat } from '../app/chat/components/Chat';
import { useState } from 'react';

interface BasePageProps {
  maxWidth?: boolean; // Prop opcional para definir si debe estirarse el contenedor
}

export const BasePage = ({ children, maxWidth = true }: PropsWithChildren<BasePageProps>) => {
  const [chatOpen, setChatOpen] = useState(false);
  const initialPropertyId = Number(localStorage.getItem("selectedPropertyId") || "");

  return (
    <>
      <NavBar />
      <Container maxWidth={maxWidth ? "lg" : false} sx={{ height: '100%', display: 'flex', flexDirection: 'column' }}>
        <Toolbar />
        {children}

        <Box
          sx={{
            position: "fixed",
            bottom: 16,       
            right: 16,        
            zIndex: 1300,
          }}
        >
          {!chatOpen && (
            <Tooltip title="Abrir chat" arrow>
              <Fab
                color="primary"
                aria-label="Abrir chat"
                onClick={() => setChatOpen(true)}
                sx={{
                  width: 56,
                  height: 56,
                  bgcolor: "primary.main",
                  color: "common.white",
                  boxShadow: 3,
                  "&:hover": {
                    bgcolor: "primary.dark",
                  },
                  cursor: "pointer",
                }}
              >
                <ChatBubbleIcon />
              </Fab>
            </Tooltip>
          )}

          {chatOpen && (
            <Chat
              initialPropertyId={initialPropertyId > 0 ? initialPropertyId : undefined}
              onClose={() => setChatOpen(false)}
            />
          )}
        </Box>
      </Container>
    </>
  );
};