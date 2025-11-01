import "cypress-file-upload";

// ============================================================================
// CONFIGURACIÓN CENTRALIZADA - CREDENCIALES DE INTEGRACIÓN
// ============================================================================
// Estas credenciales coinciden EXACTAMENTE con las definidas en:
// - realm/realm-obertibussoserviciosinmobiliarios-integration.json
// Son datos de prueba ficticios, seguros para estar hardcodeados aquí.

const INTEGRATION_CREDENTIALS = {
  user: {
    username: "user",
    password: "Usuario1.",
  },
  tenant: {
    username: "tenant",
    password: "Inquilino1.",
  },
  admin: {
    username: "admin",
    password: "Administrador1.",
  },
} as const;

// ============================================================================
// FUNCIONES AUXILIARES
// ============================================================================

const resolveAppUrl = () => {
  const envUrl = Cypress.env("appUrl") as string | undefined;
  const configUrl = Cypress.config("baseUrl");
  const appUrl = envUrl ?? (typeof configUrl === "string" ? configUrl : undefined);

  if (!appUrl) {
    throw new Error("appUrl/baseUrl no configurado para Cypress");
  }

  return appUrl;
};

// ============================================================================
// COMANDOS DE LOGIN
// ============================================================================

/**
 * Login como usuario normal (rol: user)
 */
Cypress.Commands.add("loginKeycloak", () => {
  const { username, password } = INTEGRATION_CREDENTIALS.user;
  const appUrl = resolveAppUrl();
  const keycloakUrl = Cypress.env("keycloakUrl");
  const keycloakOrigin = new URL(keycloakUrl).origin;

  cy.visit(appUrl);
  cy.contains("button", /Iniciar Ses/i).should("be.visible").click();

  cy.origin(
    keycloakOrigin,
    { args: { username, password } },
    ({ username, password }) => {
      cy.get("form:visible").within(() => {
        cy.get("input#username, input[name='username']")
          .first()
          .clear()
          .type(username, { log: false });
        cy.get("input#password, input[name='password']")
          .first()
          .clear()
          .type(password, { log: false });
        cy.get("input#kc-login, button[type='submit']").first().click();
      });
    }
  );

  cy.location("pathname", { timeout: 30000 }).should("eq", "/");
});

/**
 * Login como administrador (rol: admin)
 */
Cypress.Commands.add("loginAdmin", () => {
  const { username, password } = INTEGRATION_CREDENTIALS.admin;
  const appUrl = resolveAppUrl();
  const keycloakUrl = Cypress.env("keycloakUrl");
  const keycloakOrigin = new URL(keycloakUrl).origin;

  cy.visit(appUrl);
  cy.contains("button", /Iniciar Ses/i).should("be.visible").click();

  cy.origin(
    keycloakOrigin,
    { args: { username, password } },
    ({ username, password }) => {
      cy.get("form:visible").within(() => {
        cy.get("input#username, input[name='username']")
          .first()
          .clear()
          .type(username, { log: false });
        cy.get("input#password, input[name='password']")
          .first()
          .clear()
          .type(password, { log: false });
        cy.get("input#kc-login, button[type='submit']").first().click();
      });
    }
  );

  cy.location("pathname", { timeout: 30000 }).should("eq", "/");
});

/**
 * Login como inquilino (roles: user + tenant)
 */
Cypress.Commands.add("loginTenant", () => {
  const { username, password } = INTEGRATION_CREDENTIALS.tenant;
  const appUrl = resolveAppUrl();
  const keycloakUrl = Cypress.env("keycloakUrl");
  const keycloakOrigin = new URL(keycloakUrl).origin;

  cy.visit(appUrl);
  cy.contains("button", /Iniciar Ses/i).should("be.visible").click();

  cy.origin(
    keycloakOrigin,
    { args: { username, password } },
    ({ username, password }) => {
      cy.get("form:visible").within(() => {
        cy.get("input#username, input[name='username']")
          .first()
          .clear()
          .type(username, { log: false });
        cy.get("input#password, input[name='password']")
          .first()
          .clear()
          .type(password, { log: false });
        cy.get("input#kc-login, button[type='submit']").first().click();
      });
    }
  );

  cy.location("pathname", { timeout: 30000 }).should("eq", "/");
});
