import { Box, Container, IconButton, Typography } from "@mui/material";
import ReplyIcon from "@mui/icons-material/Reply";
import { useNavigate } from "react-router-dom";

import { BasePage } from "./BasePage";
import NoticesSection from "../app/user/components/notices/NoticesSection";

export default function NewsPage() {
  const navigate = useNavigate();
  return (
    <>
      <IconButton
        size="small"
        onClick={() => navigate(-1)}
        sx={{ position: "absolute", top: 64, left: 8, zIndex: 1300 }}
      >
        <ReplyIcon />
      </IconButton>

      <BasePage>
        <Container maxWidth="lg" sx={{ py: 2 }}>
          <Box>
            <Typography variant="h5" fontWeight={700} gutterBottom>
              Novedades y noticias
            </Typography>
          </Box>

          <NoticesSection />
        </Container>
      </BasePage>
    </>
  );
}
