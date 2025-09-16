// theme.ts
import { createTheme, responsiveFontSizes } from "@mui/material/styles";

// 1) Ampliamos los tipos de Palette para incluir tertiary y quaternary
declare module "@mui/material/styles" {
  interface Palette {
    tertiary: Palette["primary"];
    quaternary: Palette["primary"];
  }
  interface PaletteOptions {
    tertiary?: PaletteOptions["primary"];
    quaternary?: PaletteOptions["primary"];
  }
}

// 2) Creamos el tema con 4 colores de marca
let theme = createTheme({
  palette: {
    primary: { main: "#EE671E" },
    secondary: { main: "#EB7333" },
    tertiary: { main: "#FAB360" },
    quaternary: { main: "#FED7AA" },
    background: { default: "#FFFFFF" },
  },
  components: {
    MuiButton: {
      styleOverrides: {
        root: {
          textTransform: "none",
          borderRadius: 8,
          fontWeight: 600,
        },
      },
    },
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

theme = responsiveFontSizes(theme);

export default theme;
