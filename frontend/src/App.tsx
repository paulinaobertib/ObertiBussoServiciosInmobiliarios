import React from "react";

import { ThemeProvider } from "@mui/material/styles";
import theme from "./theme";
import Routes from "./Routes";
import { BrowserRouter } from "react-router-dom";
import { PropertyCrudProvider } from "./app/property/context/PropertiesContext";
import { AlertProvider } from "./app/shared/context/AlertContext";
import { AuthProvider } from "./app/user/context/AuthContext";
import { ChatProvider } from "./app/chat/context/ChatContext";
import { ChatAlways } from "./pages/ChatAlways";
import "./index.css";
import AuthLoaderOverlay from "./app/user/context/AuthLoader";
import AuthExpired from "./app/user/context/AuthExpired";

function App() {
  const apiUrl = import.meta.env.VITE_API_URL;
  const baseUrl = import.meta.env.VITE_BASE_URL;

  console.log("API URL en App:", apiUrl);
  console.log("BASE URL en App:", baseUrl);

  return (
    <React.StrictMode>
      <ThemeProvider theme={theme}>
        <BrowserRouter>
          <AlertProvider>
            <AuthProvider>
              <PropertyCrudProvider>
                <ChatProvider>
                  <Routes />
                  <ChatAlways />
                  {/* Overlays globales, al final para “tapar” todo */}
                  <AuthLoaderOverlay />
                  <AuthExpired />
                </ChatProvider>
              </PropertyCrudProvider>
            </AuthProvider>
          </AlertProvider>
        </BrowserRouter>
      </ThemeProvider>
    </React.StrictMode>
  );
}

export default App;
