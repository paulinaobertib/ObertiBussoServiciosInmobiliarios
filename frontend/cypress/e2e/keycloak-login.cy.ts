import { appBaseUrl } from "../support/e2e";
import { interceptGateway } from "../support/intercepts";

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

    // Configurar interceptores
    interceptGateway("GET", "/properties/amenity/getAll", "getAmenities");
    interceptGateway("GET", "/properties/type/getAll", "getTypes");
    interceptGateway("GET", "/properties/neighborhood/getAll", "getNeighborhoods");
    interceptGateway("GET", "/properties/property/get", "getAvailableProperties");
    interceptGateway("GET", "/properties/property/search**", "searchProperties");
    interceptGateway("GET", "/users/user/me", "getCurrentUser");
    interceptGateway("POST", "/users/user/registerRole", "registerRole");
    interceptGateway("GET", "/users/user/role/*", "getUserRole");
    interceptGateway("GET", "/users/preference/user/*", "getUserPreferences");
    interceptGateway("GET", "/users/favorites/user/*", "getUserFavorites");
  });

  it("Rechaza login con usuario incorrecto", () => {
    cy.visit(appBaseUrl);
    cy.contains("button", /Iniciar Ses/i).click();

    cy.origin(
      keycloakOrigin,
      { args: { password } },
      ({ password }) => {
        cy.get("form:visible").within(() => {
          cy.get("input#username, input[name='username']")
            .first()
            .clear()
            .type("usuario_invalido", { log: false });
          cy.get("input#password, input[name='password']")
            .first()
            .clear()
            .type(password, { log: false });
          cy.get("input#kc-login, button[type='submit']").first().click();
        });

        // Assert flexible: seguimos en Keycloak y el form de login está visible
        cy.url().should("include", "/realms"); // o tu realm de keycloak
        cy.get("form:visible").should("exist");
        cy.get("input#username, input[name='username']").should("be.visible");
      }
    );
  });

  it("Rechaza login con contraseña incorrecta", () => {
    cy.visit(appBaseUrl);
    cy.contains("button", /Iniciar Ses/i).click();

    cy.origin(
      keycloakOrigin,
      { args: { username } },
      ({ username }) => {
        cy.get("form:visible").within(() => {
          cy.get("input#username, input[name='username']")
            .first()
            .clear()
            .type(username, { log: false });
          cy.get("input#password, input[name='password']")
            .first()
            .clear()
            .type("clave_invalida", { log: false });
          cy.get("input#kc-login, button[type='submit']").first().click();
        });

        cy.url().should("include", "/realms"); // ajusta según tu realm
        cy.get("form:visible").should("exist");
        cy.get("input#username, input[name='username']").should("be.visible");
      }
    );
  });

  it("Permite iniciar sesión y regresar autenticado a la aplicación", () => {
    cy.visit(appBaseUrl);

    cy.contains("button", /Iniciar Ses/i)
      .should("be.visible")
      .click();

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
            cy.get("input#kc-login, button[type='submit']")
              .first()
              .click();
          });
      }
    );

    // Esperar a que regrese autenticado
    cy.location("pathname", { timeout: 30000 }).should("eq", "/");

    // Esperar a que carguen los datos del usuario
    cy.wait("@getCurrentUser", { timeout: 15000 });
    cy.wait("@registerRole", { timeout: 15000 });
    cy.wait("@getUserRole", { timeout: 15000 });
    cy.wait("@getUserPreferences", { timeout: 15000 });
    cy.wait("@getUserFavorites", { timeout: 15000 });

    // Verificar elementos de la UI
    cy.get('[aria-label="profile"]', { timeout: 30000 }).should("be.visible");
    cy.get('[aria-label="logout"]').should("be.visible");
  });

});
