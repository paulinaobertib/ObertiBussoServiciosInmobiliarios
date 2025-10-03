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
        cy.get("input#kc-login, button[type=submit]").first().click();
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

  // click en botón de login
  cy.contains("button", /Iniciar Ses/i).should("be.visible").click();

  // flujo keycloak
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
        cy.get("input#kc-login, button[type=submit]").first().click();
      });
    }
  );

  cy.location("pathname", { timeout: 30000 }).should("eq", "/");
});
