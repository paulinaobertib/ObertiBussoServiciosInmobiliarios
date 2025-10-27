import "cypress-file-upload";

type SessionAdminOptions = {
  redirectPath?: string;
};

type SessionUserOptions = SessionAdminOptions;
const TURNERO_PATH = "/appointments";

const buildRedirectUrl = (baseUrl: string, redirectPath?: string) => {
  if (!redirectPath) {
    return baseUrl;
  }

  if (/^https?:\/\//i.test(redirectPath)) {
    return redirectPath;
  }

  const normalizedBase = baseUrl.replace(/\/+$/, "");
  const normalizedPath = redirectPath.startsWith("/") ? redirectPath : `/${redirectPath}`;
  return `${normalizedBase}${normalizedPath}`;
};

const resolveAppUrl = () => {
  const envUrl = Cypress.env("appUrl") as string | undefined;
  const configUrl = Cypress.config("baseUrl");
  const appUrl = envUrl ?? (typeof configUrl === "string" ? configUrl : undefined);

  if (!appUrl) {
    throw new Error("appUrl/baseUrl no configurado para Cypress");
  }

  return appUrl;
};

Cypress.Commands.add("loginKeycloak", () => {
  const username = Cypress.env("keycloakUsername");
  const password = Cypress.env("keycloakPassword");
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

Cypress.Commands.add("loginAdmin", () => {
  const username = Cypress.env("adminUsername");
  const password = Cypress.env("adminPassword");
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

type SessionTenantOptions = SessionAdminOptions;

Cypress.Commands.add("loginTenant", () => {
  const username = Cypress.env("tenantUsername") ?? Cypress.env("keycloakUsername");
  const password = Cypress.env("tenantPassword") ?? Cypress.env("keycloakPassword");
  if (!username || !password) {
    throw new Error("Credenciales de tenant no configuradas en Cypress env");
  }
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
