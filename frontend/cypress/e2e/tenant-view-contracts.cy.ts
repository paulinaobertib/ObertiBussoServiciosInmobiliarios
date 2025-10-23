import { appBaseUrl } from "../support/e2e";

const VIEW_TIMEOUT = 60000;

describe("Contratos: visualización para inquilino", () => {
  beforeEach(() => {
    cy.clearCookies();
    cy.clearLocalStorage();
    cy.viewport(1280, 720);
  });

  it("Permite ingresar al panel de inquilino y abrir el detalle de un contrato", () => {
    cy.loginTenant();
    cy.visit(appBaseUrl);

    cy.contains("button, a, span", /Soy Inquilino/i, { timeout: VIEW_TIMEOUT })
      .should("be.visible")
      .click({ force: true });

    cy.location("pathname", { timeout: VIEW_TIMEOUT }).should("include", "/contract");

    cy.get("[data-testid='favorite-item']", { timeout: VIEW_TIMEOUT })
      .should("exist")
      .and("have.length.greaterThan", 0);

    cy.contains("button", /Ver detalles/i, { timeout: VIEW_TIMEOUT })
      .should("be.visible")
      .click({ force: true });

    cy.location("pathname", { timeout: VIEW_TIMEOUT }).should("match", /\/contracts?\/\d+$/);
    cy.contains("Detalle de Contrato", { timeout: VIEW_TIMEOUT }).should("be.visible");
  });
});
