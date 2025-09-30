const appUrl = Cypress.env("appUrl");
const keycloakUrl = Cypress.env("keycloakUrl");

const keycloakOrigin = new URL(keycloakUrl).origin;
const username = Cypress.env("keycloakUsername");
const password = Cypress.env("keycloakPassword");

describe("Login con Keycloak", () => {
  before(function () {
    if (!username || !password) {
      cy.log("Faltan usuario y/o contraseña. Se omite la prueba de login.");
      this.skip();
    }
  });

  beforeEach(() => {
    cy.clearCookies();
    cy.clearLocalStorage();
    cy.viewport(1280, 720);
  });

  it("permite iniciar sesión y regresar autenticado a la aplicación", () => {
    // Abrimos la app
    cy.visit(appUrl);

    // Click en el botón de login de la app
    cy.contains("button", /Iniciar Ses/i)
      .should("be.visible")
      .click();

    // Entramos al dominio de Keycloak
    cy.origin(
      keycloakOrigin,
      { args: { username, password } },
      ({ username, password }) => {
        cy.get("form:visible")
          .should("exist")
          .within(() => {
            cy.get("input#username, input[name='username']")
              .first()
              .clear()
              .type(username, { log: false });
            cy.get("input#password, input[name='password']")
              .first()
              .clear()
              .type(password, { log: false });

            cy.get("input#kc-login, button[type=submit]")
              .first()
              .click();
          });
      }
    );

    // Verificamos que volvimos autenticados a la app
    cy.location("pathname", { timeout: 30000 }).should("eq", "/");
    cy.get('[aria-label="profile"]', { timeout: 30000 }).should("be.visible");
    cy.get('[aria-label="logout"]').should("be.visible");
  });
});
