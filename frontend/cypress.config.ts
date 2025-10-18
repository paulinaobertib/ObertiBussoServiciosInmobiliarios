/// <reference types="node" />
import { defineConfig } from "cypress";

const baseUrl = process.env.CYPRESS_BASE_URL ?? "http://app.localtest.me:4173";
const gatewayUrl = process.env.CYPRESS_GATEWAY_URL ?? "http://api.localtest.me:8090";
const keycloakUrl =
  process.env.CYPRESS_KEYCLOAK_URL ??
  "http://auth.localtest.me:8080/realms/obertibussoserviciosinmobiliarios-integration";

export default defineConfig({
  e2e: {
    baseUrl,
    env: {
      appUrl: baseUrl,
      gatewayUrl,
      keycloakUrl,
      keycloakUsername: process.env.CYPRESS_KEYCLOAK_USERNAME,
      keycloakPassword: process.env.CYPRESS_KEYCLOAK_PASSWORD,
    },
    setupNodeEvents(on, config) {
      return config;
    },
  },
});
