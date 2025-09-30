const appBaseUrl = Cypress.env("appUrl");

describe("Integración: Favoritos", () => {
  beforeEach(() => {
    cy.clearCookies();
    cy.clearLocalStorage();
    cy.viewport(1280, 720);
  });

  it("muestra alerta si intento marcar favorito sin estar logueado", () => {
    cy.visit(appBaseUrl);

    cy.get("[data-testid^='favorite-button-']").first().click();
    cy.contains("Iniciá sesión", { timeout: 10000 }).should("be.visible");
  });

});