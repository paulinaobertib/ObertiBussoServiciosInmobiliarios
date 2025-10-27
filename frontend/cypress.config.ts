/// <reference types="node" />
import { defineConfig } from "cypress";
import * as fs from "fs";
import * as path from "path";

const STATE_FILE_PATH = "cypress/fixtures/admin-generate-appointments-state.json";

// const baseUrl = process.env.CYPRESS_BASE_URL ?? "http://app.localtest.me:4173";
// const gatewayUrl = process.env.CYPRESS_GATEWAY_URL ?? "http://api.localtest.me:8090";
// const keycloakUrl =
//   process.env.CYPRESS_KEYCLOAK_URL ??
//   "http://auth.localtest.me:8080/realms/obertibussoserviciosinmobiliarios-integration";

const baseUrl = process.env.CYPRESS_BASE_URL ?? "http://localhost:5173";
const gatewayUrl = process.env.CYPRESS_GATEWAY_URL ?? "http://localhost:8090";
const keycloakUrl = process.env.CYPRESS_KEYCLOAK_URL ?? "http://localhost:8080";

const apiUrl = process.env.CYPRESS_API_URL;

export default defineConfig({
  e2e: {
    baseUrl,
    env: {
      appUrl: baseUrl,
      gatewayUrl,
      keycloakUrl,
      ...(apiUrl ? { apiUrl } : {}),
      keycloakUsername: process.env.CYPRESS_KEYCLOAK_USERNAME,
      keycloakPassword: process.env.CYPRESS_KEYCLOAK_PASSWORD,
    },

    setupNodeEvents(on, config) {
      // Tareas personalizadas
      on("task", {
        // --- Persistencia de estado de turnos admin ---
        "adminAppointments:state:read"() {
          const fullPath = path.join(__dirname, STATE_FILE_PATH);

          try {
            const content = fs.readFileSync(fullPath, "utf-8");
            return JSON.parse(content);
          } catch (error: any) {
            if (error && (error.code === "ENOENT" || error.code === "ENOTDIR")) {
              return null;
            }
            throw error;
          }
        },

        "adminAppointments:state:write"(payload: { year: number; lastGeneratedDay: number }) {
          const fullPath = path.join(__dirname, STATE_FILE_PATH);
          const dir = path.dirname(fullPath);

          fs.mkdirSync(dir, { recursive: true });
          fs.writeFileSync(fullPath, JSON.stringify(payload, null, 2), "utf-8");
          return null;
        },
      });

      config.env = {
        ...config.env,
        appUrl: config.baseUrl ?? config.env?.appUrl,
      };

      return config;
    },
  },
});
