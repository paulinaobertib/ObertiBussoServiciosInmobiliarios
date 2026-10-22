import React from "react";
import ReactDOM from "react-dom/client";
import App from "./App";
import { patchNavigationHistory } from "./app/shared/utils/navigationPatch";

patchNavigationHistory();

// Después de un deploy los chunks viejos ya no existen: recargar para traer los nuevos.
// Como máximo una recarga cada 10 s, para no entrar en loop si el chunk sigue fallando.
window.addEventListener("vite:preloadError", (event) => {
  const now = Date.now();
  try {
    const last = Number(sessionStorage.getItem("chunk-reload-at") ?? 0);
    if (now - last < 10_000) return;
    sessionStorage.setItem("chunk-reload-at", String(now));
  } catch {
    return; // sin sessionStorage no hay forma de evitar el loop
  }
  event.preventDefault();
  window.location.reload();
});

const root = ReactDOM.createRoot(document.getElementById("root") as HTMLElement);

root.render(
  <React.StrictMode>
    <App />
  </React.StrictMode>
);

if ("serviceWorker" in navigator) {
  window.addEventListener("load", () => {
    navigator.serviceWorker
      .register("/sw.js")
      // .then(registration => {
      //   console.log('Service Worker registrado con éxito:', registration);
      // })
      .catch((error) => {
        console.error("Error al registrar el Service Worker:", error);
      });
  });
}
