const appBaseUrl = Cypress.env("appUrl");

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

  it("Permite agregar y luego eliminar un favorito desde el panel", () => {
    cy.loginKeycloak();
    cy.visit(appBaseUrl);

    // marcar la primera propiedad como favorita
    cy.get("[data-testid^='favorite-button-']").first().should("not.be.disabled").click();
    cy.contains("button", "Ok", { timeout: 10000 }).click();

    // ir al panel de favoritos desde el navbar
    cy.get("[aria-label='favorites']").click();
    cy.get("[data-testid='favorite-item']", { timeout: 10000 }).should("exist");

    // volver al catálogo
    cy.visit(appBaseUrl);

    // desmarcar el favorito
    cy.get("[data-testid^='favorite-button-']").first().should("not.be.disabled").click();

    // aceptar confirmación de eliminación
    cy.contains("button", "Confirmar", { timeout: 10000 }).click();

    // aceptar modal de éxito
    cy.contains("button", "Ok", { timeout: 10000 }).click();

    // volver a la lista de favoritos
    cy.get("[aria-label='favorites']").click();

    // verificar mensaje vacío
    cy.contains("No tienes favoritos disponibles", { timeout: 10000 }).should("be.visible");
  });
});
