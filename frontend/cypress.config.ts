/// <reference types="node" />
import { defineConfig } from "cypress";

// ============================================================================
// CONFIGURACIÓN SIMPLE - Solo URLs de entorno
// ============================================================================
// Las credenciales están centralizadas en commands.ts (INTEGRATION_CREDENTIALS)

const baseUrl = process.env.CYPRESS_BASE_URL ?? "http://app.localtest.me:4173";
const gatewayUrl = process.env.CYPRESS_GATEWAY_URL ?? "http://api.localtest.me:8090";
const keycloakUrl =
  process.env.CYPRESS_KEYCLOAK_URL ??
  "http://auth.localtest.me:8080/realms/obertibussoserviciosinmobiliarios-integration";
const apiUrl = process.env.CYPRESS_API_URL;

// Alternativa para desarrollo local (descomentar si usas localhost)
// const baseUrl = process.env.CYPRESS_BASE_URL ?? "http://localhost:5173";
// const gatewayUrl = process.env.CYPRESS_GATEWAY_URL ?? "http://localhost:8090";
// const keycloakUrl = process.env.CYPRESS_KEYCLOAK_URL ?? "http://localhost:8080";

export default defineConfig({
  e2e: {
    baseUrl,
    env: {
      appUrl: baseUrl,
      gatewayUrl,
      keycloakUrl,
      VITE_GOOGLE_API_KEY: "AIza-dummy-key-for-cypress-tests",
      ...(apiUrl ? { apiUrl } : {}),
    },

    setupNodeEvents(on, config) {
      // Sobrescribir con variables de entorno de CI si existen
      config.env = {
        ...config.env,
        appUrl: config.baseUrl ?? config.env?.appUrl,
        gatewayUrl: process.env.CYPRESS_GATEWAY_URL ?? config.env?.gatewayUrl,
        keycloakUrl: process.env.CYPRESS_KEYCLOAK_URL ?? config.env?.keycloakUrl,
        ...(process.env.CYPRESS_API_URL ? { apiUrl: process.env.CYPRESS_API_URL } : {}),
      };

      return config;
    },
  },
});
