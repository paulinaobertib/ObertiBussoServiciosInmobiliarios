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
    MuiCard: {
      styleOverrides: {
        root: ({ theme }) => ({
          borderRadius: 8,
          border: `1px solid ${theme.palette.divider}`,
          backgroundColor: theme.palette.background.paper,
          boxShadow: "0px 12px 32px rgba(15, 23, 42, 0.08)",
        }),
      },
    },
    MuiOutlinedInput: {
      styleOverrides: {
        root: {
          borderRadius: 8,
          "& fieldset": {
            borderRadius: 8,
          },
        },
        input: {
          borderRadius: 8,
        },
      },
    },
    MuiFilledInput: {
      styleOverrides: {
        root: {
          borderTopLeftRadius: 8,
          borderTopRightRadius: 8,
        },
      },
    },
    MuiAutocomplete: {
      styleOverrides: {
        paper: {
          borderRadius: 8,
        },
        option: {
          borderRadius: 8,
        },
      },
    },
    MuiInputBase: {
      styleOverrides: {
        input: ({ theme }) => ({
          fontSize: 16,
          lineHeight: 1.4,
          [theme.breakpoints.up("sm")]: {
            fontSize: "0.95rem",
          },
        }),
      },
    },
    MuiMenu: {
      styleOverrides: {
        paper: {
          borderRadius: 8,
        },
      },
    },
    MuiList: {
      styleOverrides: {
        root: {
          borderRadius: 8,
        },
      },
    },
  },
});

theme = responsiveFontSizes(theme);

export default theme;
