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

Cypress.Commands.add("loginKeycloak", () => {
  const username = Cypress.env("keycloakUsername");
  const password = Cypress.env("keycloakPassword");
  const appUrl = Cypress.env("appUrl");
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
        cy.get("input#kc-login, button[type=submit']").first().click();
      });
    }
  );

  cy.location("pathname", { timeout: 30000 }).should("eq", "/");
});

Cypress.Commands.add("loginAdmin", () => {
  const username = Cypress.env("adminUsername");
  const password = Cypress.env("adminPassword");
  const appUrl = Cypress.env("appUrl");
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
        cy.get("input#kc-login, button[type=submit']").first().click();
      });
    }
  );

  cy.location("pathname", { timeout: 30000 }).should("eq", "/");
});

// iniciar sesion reutilizando la autenticacion real del administrador
Cypress.Commands.add("sessionAdmin", (options: SessionAdminOptions = {}) => {
  const username = Cypress.env("adminUsername");
  const appUrl = Cypress.env("appUrl");

  if (!username) {
    throw new Error("adminUsername debe estar configurado en Cypress.env");
  }

  if (!appUrl) {
    throw new Error("appUrl debe estar configurado en Cypress.env");
  }

  const redirectUrl = buildRedirectUrl(appUrl, options.redirectPath);
  const expectedPath = options.redirectPath ? new URL(redirectUrl).pathname : "/";

  cy.session(
    ["admin-session", username, redirectUrl],
    () => {
      cy.loginAdmin();

      // en lugar de visitar la home, vamos directo al turnero
      cy.visit(redirectUrl);

      cy.location("pathname", { timeout: 30000 }).should("eq", expectedPath);

      cy.window().then((win) => {
        const authInfo = win.sessionStorage.getItem("authInfo");
        expect(authInfo, "authInfo en sessionStorage").to.exist;
      });
    },
    { cacheAcrossSpecs: true }
  );
});

// iniciar sesion reutilizando la autenticacion real de un usuario regular
Cypress.Commands.add("sessionUser", (options: SessionUserOptions = {}) => {
  const username = Cypress.env("keycloakUsername");
  const appUrl = Cypress.env("appUrl");

  if (!username) {
    throw new Error("keycloakUsername debe estar configurado en Cypress.env");
  }

  if (!appUrl) {
    throw new Error("appUrl debe estar configurado en Cypress.env");
  }

  const redirectUrl = buildRedirectUrl(appUrl, options.redirectPath);
  const expectedPath = options.redirectPath ? new URL(redirectUrl).pathname : "/";

  cy.session(
    ["user-session", username, redirectUrl],
    () => {
      cy.loginKeycloak();
      cy.visit(redirectUrl);
      cy.location("pathname", { timeout: 30000 }).should("eq", expectedPath);
      cy.window().then((win) => {
        const authInfo = win.sessionStorage.getItem("authInfo");
        expect(authInfo, "authInfo en sessionStorage").to.exist;
      });
    },
    { cacheAcrossSpecs: true }
  );
});

// helpers especificos para llegar directo al turnero
Cypress.Commands.add("sessionAdminTurnero", () => {
  cy.sessionAdmin({ redirectPath: TURNERO_PATH });
});

Cypress.Commands.add("sessionUserTurnero", () => {
  cy.sessionUser({ redirectPath: TURNERO_PATH });
});
