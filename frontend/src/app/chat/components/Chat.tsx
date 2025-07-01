import { Paper, Box, TextField, IconButton, List, ListItem, ListItemText, CircularProgress, Typography } from "@mui/material";
import SendIcon from "@mui/icons-material/Send";
import { useState } from "react";
import { useChatContext } from "../context/ChatContext";

interface ChatProps {
  propertyId: number;
  sessionId: number;
}

export const Chat = ({ propertyId, sessionId }: ChatProps) => {
    const { messages, sendMessage, loading, error } = useChatContext();
    const [input, setInput] = useState("");

    const handleSend = async () => {
        if (!input.trim()) return;
        try {
            await sendMessage(input, propertyId, sessionId);
            setInput("");
        } catch (err) {
            console.error("Error enviando mensaje:", err);
        }
    }
return (
    <Paper
      elevation={3}
      sx={{
        width: 400,
        height: 500,
        display: "flex",
        flexDirection: "column",
        p: 2,
      }}
    >
      <Typography variant="h6" gutterBottom>
        Asistente Virtual
      </Typography>

      <Box
        sx={{
          flexGrow: 1,
          overflowY: "auto",
          mb: 2,
          border: "1px solid #ccc",
          borderRadius: 1,
          p: 1,
          backgroundColor: "#f9f9f9",
        }}
      >
        <List dense>
          {messages.map((msg, i) => (
            <ListItem
              key={i}
              sx={{
                justifyContent:
                  msg.from === "user" ? "flex-end" : "flex-start",
              }}
            >
              <ListItemText
                primary={msg.content}
                sx={{
                  textAlign: msg.from === "user" ? "right" : "left",
                  bgcolor: msg.from === "user" ? "#1976d2" : "#eee",
                  color: msg.from === "user" ? "#fff" : "#000",
                  p: 1,
                  borderRadius: 1,
                  maxWidth: "75%",
                }}
              />
            </ListItem>
          ))}
          {loading && (
            <ListItem>
              <CircularProgress size={20} />
            </ListItem>
          )}
        </List>
      </Box>

      <Box sx={{ display: "flex", gap: 1 }}>
        <TextField
          variant="outlined"
          fullWidth
          placeholder="Escribí tu mensaje..."
          value={input}
          onChange={(e) => setInput(e.target.value)}
          onKeyDown={(e) => {
            if (e.key === "Enter") handleSend();
          }}
          disabled={loading}
        />
        <IconButton
          color="primary"
          onClick={handleSend}
          disabled={loading || input.trim() === ""}
        >
          <SendIcon />
        </IconButton>
      </Box>

      {error && (
        <Typography color="error" sx={{ mt: 1 }}>
          {error.message}
        </Typography>
      )}
    </Paper>
  );
};