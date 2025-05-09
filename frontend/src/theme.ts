import { createTheme } from "@mui/material/styles";

const theme = createTheme({
  palette: {
    primary: {
      main: "#e65100",
    },
    secondary: {
      main: "#eb7333",
    },
    background: {
      default: "white",
    },
  },

  typography: {
    body2: { fontSize: "0.875rem" },
    caption: { fontSize: "0.75rem" },
  },
  components: {
    MuiInputBase: {
      styleOverrides: {
        input: {
          fontSize: "0.8rem",
          "@media (max-width:600px)": { fontSize: "0.75rem" },
        },
      },
    },
    MuiInputLabel: {
      styleOverrides: {
        root: {
          fontSize: "0.8rem",
          "@media (max-width:600px)": { fontSize: "0.75rem" },
        },
      },
    },
  },
});

export default theme;
