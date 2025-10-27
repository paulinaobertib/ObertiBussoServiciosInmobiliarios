import { Box, CircularProgress, Typography } from "@mui/material";
import logo from "../../../assets/logoJPG.png";
// import logo from '../../../assets/ic_casa2.png'

type LoadingProps = {
  message?: string;
};

export const Loading = ({ message = "Espera, estamos preparando tu experiencia..." }: LoadingProps) => (
  <Box
    component="div"
    sx={(theme) => ({
      position: "fixed",
      top: 0,
      left: 0,
      width: "100%",
      height: "100%",
      zIndex: theme.zIndex.modal + 3000,
      display: "flex",
      alignItems: "center",
      justifyContent: "center",
      bgcolor: theme.palette.background.default || "#fff",
      overflow: "hidden",
      touchAction: "none",
    })}
  >
    <Box display="flex" flexDirection="column" alignItems="center" gap={2}>
      <Box
        component="img"
        src={logo}
        alt="Logo"
        sx={{
          height: "8rem",
          objectFit: "contain",
        }}
      />
      <CircularProgress size={"3rem"} />
      {message && (
        <Typography color="text.secondary" sx={{ mt: 1, textAlign: "center", px: 2 }}>
          {message}
        </Typography>
      )}
    </Box>
  </Box>
);
