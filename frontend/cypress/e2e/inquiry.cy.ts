import { appBaseUrl } from "../support/e2e";

describe("Integración: Consultas", () => {
  beforeEach(() => {
    cy.clearCookies();
    cy.clearLocalStorage();
    cy.viewport(1280, 720);
  });

  it("Permite enviar una consulta, cerrar confirmación y luego cerrar el formulario con la cruz", () => {
    cy.visit(appBaseUrl);

    // abrir la primera propiedad del catálogo
    cy.get("[data-testid='property-card']").first().click();

    // presionar el botón "Consultar por esta propiedad"
    cy.contains("button", "Consultar por esta propiedad", { timeout: 10000 }).click();

    // completar el formulario
    cy.get("input[name='firstName']").type("Juan");
    cy.get("input[name='lastName']").type("Pérez");
    cy.get("input[name='email']").type("juan.perez@test.com");
    cy.get("input[name='phone']").type("123456789");
    cy.get("textarea[name='description']").type(
      "Estoy interesado en esta propiedad, ¿podrían darme más detalles?"
    );

    // enviar la consulta
    cy.contains("button", "Enviar Consulta").click();

    // aparece la confirmación
    cy.contains("Consulta enviada", { timeout: 10000 }).should("be.visible");

    // cerrar el modal de confirmación
    cy.contains("button", "Cerrar", { timeout: 10000 }).click();

    // debería volver a estar visible el formulario de consulta
    cy.contains("Enviar consulta", { timeout: 10000 }).should("be.visible");

    // cerrar ese formulario con la cruz (X)
    cy.get("[data-testid='inquiry-form-close']").click();

  });
});
