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

  components: {
    MuiListItemButton: {
      styleOverrides: {
        root: {
          "&.Mui-selected": {
            backgroundColor: "#FFE0B2",
            "&:hover": { backgroundColor: "#FFD699" },
          },
        },
      },
    },

    MuiMenuItem: {
      styleOverrides: {
        root: {
          "&.Mui-selected": {
            backgroundColor: "#FFE0B2",
            "&:hover": { backgroundColor: "#FFD699" },
          },
        },
      },
    },
  },
});

export default theme;
