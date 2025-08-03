// theme.ts
import { createTheme } from "@mui/material/styles";

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
const theme = createTheme({
  palette: {
    primary: { main: "#EE671E" },
    secondary: { main: "#EB7333" },
    tertiary: { main: "#FAB360" },
    quaternary: { main: "#FED7AA" },
    background: { default: "#FFFFFF" },
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
