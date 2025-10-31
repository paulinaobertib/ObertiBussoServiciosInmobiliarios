import { appBaseUrl } from "../support/e2e";
import { interceptGateway } from "../support/intercepts";

describe("Integración: Favoritos", () => {
  beforeEach(() => {
    cy.clearCookies();
    cy.clearLocalStorage();
    cy.viewport(1280, 720);
  });

  it("Muestra alerta si intento marcar favorito sin estar logueado", () => {
    cy.visit(appBaseUrl);

    cy.get("[data-testid^='favorite-button-']").first().click();
    cy.contains("Iniciá sesión", { timeout: 10000 }).should("be.visible");
  });

  it("Permite agregar un favorito y verificarlo en el panel", () => {
    interceptGateway("GET", "/properties/property/get", "getAvailableProperties");
    interceptGateway("GET", "/users/user/me", "getCurrentUser");
    interceptGateway("GET", "/users/favorites/user/*", "getUserFavorites");
    interceptGateway("POST", "/users/favorites/create", "addFavorite");
    interceptGateway("DELETE", "/users/favorites/delete/*", "deleteFavorite");

    cy.loginKeycloak();
    cy.visit(appBaseUrl);

    cy.wait("@getAvailableProperties", { timeout: 15000 });
    cy.wait("@getCurrentUser", { timeout: 15000 });
    cy.wait("@getUserFavorites", { timeout: 15000 });

    cy.get("[data-testid^='favorite-button-']").first().should("be.visible").should("not.be.disabled");

    cy.get("[data-testid^='favorite-button-']")
      .first()
      .then(($btn) => {
        cy.log("Clicking favorite button", $btn.attr("data-testid"));
        cy.wrap($btn).click({ multiple: false });
      });

    cy.wait("@addFavorite", { timeout: 15000 }).its("response.statusCode").should("be.within", 200, 299);

    cy.contains("Agregado a favoritos", { timeout: 10000 }).should("be.visible");
    cy.contains("button", "Ok", { timeout: 10000 })
      .should("be.visible")
      .then(($btn) => {
        cy.wrap($btn).click({ force: true });
      });

    cy.get("[aria-label='favorites']").click();
    cy.get("[data-testid='favorite-item']", { timeout: 10000 }).should("exist");

    cy.visit(appBaseUrl);

    cy.wait("@getAvailableProperties", { timeout: 15000 });
    cy.wait("@getCurrentUser", { timeout: 15000 });
    cy.wait("@getUserFavorites", { timeout: 15000 });

    cy.get("[data-testid^='favorite-button-']").first().should("be.visible").should("not.be.disabled");

    cy.get("[data-testid^='favorite-button-']").first().click({ multiple: false });

    cy.contains("button", "Confirmar", { timeout: 10000 })
      .should("be.visible")
      .then(($btn) => {
        cy.wrap($btn).click({ force: true });
      });

    cy.wait("@deleteFavorite", { timeout: 15000 }).its("response.statusCode").should("be.within", 200, 299);

    cy.contains("Eliminado de favoritos", { timeout: 10000 }).should("be.visible");
    cy.contains("button", "Ok", { timeout: 10000 }).should("be.visible").click();

    cy.get("[aria-label='favorites']").click();
    cy.contains("No tienes favoritos disponibles", { timeout: 10000 }).should("be.visible");
  });
});
