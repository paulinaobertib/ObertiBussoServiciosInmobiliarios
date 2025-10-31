import { appBaseUrl } from "../support/e2e";
import { interceptGateway } from "../support/intercepts";

const CATALOG_TIMEOUT = 60000;
const escapeRegExp = (value: string) => value.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");

describe("Integración: Catálogo público para usuarios no autenticados", () => {
  beforeEach(() => {
    cy.clearCookies();
    cy.clearLocalStorage();
    cy.viewport(1280, 720);

    // Interceptar todas las llamadas API
    interceptGateway("GET", "/properties/amenity/getAll", "getAmenities");
    interceptGateway("GET", "/properties/type/getAll", "getTypes");
    interceptGateway("GET", "/properties/neighborhood/getAll", "getNeighborhoods");
    interceptGateway("GET", "/properties/property/get", "getProperties");
    interceptGateway("GET", "/properties/property/search*", "searchProperties");
    interceptGateway("GET", "/properties/property/getById/*", "getPropertyById");
    interceptGateway("GET", "/users/user/me", "getCurrentUser");

    cy.visit(appBaseUrl);
  });

  it("permite ver el listado de propiedades y abrir el detalle sin iniciar sesión", () => {
    // Esperar carga inicial de la página
    cy.wait("@getAmenities", { timeout: 15000 }).its("response.statusCode").should("be.within", 200, 299);
    cy.wait("@getTypes", { timeout: 15000 }).its("response.statusCode").should("be.within", 200, 299);
    cy.wait("@getNeighborhoods", { timeout: 15000 }).its("response.statusCode").should("be.within", 200, 299);
    cy.wait("@getProperties", { timeout: 15000 }).its("response.statusCode").should("be.within", 200, 299);
    cy.wait("@getCurrentUser", { timeout: 15000 }).its("response.statusCode").should("be.oneOf", [200, 401]);
    cy.wait("@searchProperties", { timeout: 15000 }).its("response.statusCode").should("be.within", 200, 299);

    cy.contains("button", /Iniciar Ses/i, { timeout: CATALOG_TIMEOUT }).should("be.visible");

    cy.get("[data-testid='favorite-item']", { timeout: CATALOG_TIMEOUT })
      .should("exist")
      .its("length")
      .should("be.greaterThan", 0);

    // Esperar la segunda carga de propiedades
    cy.wait("@getProperties", { timeout: 15000 }).its("response.statusCode").should("be.within", 200, 299);

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

    cy.get("@firstCard").then(($card) => cy.wrap($card).click());

    // Esperar navegación y carga del detalle
    cy.wait("@searchProperties", { timeout: 15000 }).its("response.statusCode").should("be.within", 200, 299);
    cy.wait("@getPropertyById", { timeout: 15000 }).its("response.statusCode").should("be.within", 200, 299);

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
