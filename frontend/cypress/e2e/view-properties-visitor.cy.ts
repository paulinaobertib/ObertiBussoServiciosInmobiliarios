import { appBaseUrl } from "../support/e2e";

const CATALOG_TIMEOUT = 60000;
const escapeRegExp = (value: string) => value.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");

describe("Integración: Catálogo público para usuarios no autenticados", () => {
  beforeEach(() => {
    cy.clearCookies();
    cy.clearLocalStorage();
    cy.viewport(1280, 720);
    cy.visit(appBaseUrl);
  });

  it("permite ver el listado de propiedades y abrir el detalle sin iniciar sesión", () => {
    cy.contains("button", /Iniciar Ses/i, { timeout: CATALOG_TIMEOUT }).should("be.visible");

    cy.get("[data-testid='favorite-item']", { timeout: CATALOG_TIMEOUT })
      .should("exist")
      .its("length")
      .should("be.greaterThan", 0);

    cy.get("[data-testid='favorite-item']").first().as("firstCard");

    cy.get("@firstCard")
      .find("[data-testid='property-card']")
      .should("be.visible")
      .scrollIntoView()
      .invoke("attr", "alt")
      .then((title) => {
        expect(title, "título de la propiedad").to.be.a("string").and.not.be.empty;
        cy.wrap(title!.trim()).as("selectedTitle");
      });

    cy.get("@firstCard").click();

    cy.location("pathname", { timeout: CATALOG_TIMEOUT }).should("match", /\/properties\/\d+$/);

    cy.get<string>("@selectedTitle").then((selectedTitle) => {
      const titleRegex = new RegExp(escapeRegExp(selectedTitle), "i");
      cy.contains("h5", titleRegex, { timeout: CATALOG_TIMEOUT }).should("be.visible");
    });

    cy.contains("button", /^Consultar por esta propiedad$/i, { timeout: CATALOG_TIMEOUT }).should("be.visible");
    cy.contains(/Especificaciones/i, { timeout: CATALOG_TIMEOUT }).should("be.visible");
    cy.contains(/Caracter/i, { timeout: CATALOG_TIMEOUT }).should("be.visible");
  });
});
