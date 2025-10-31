import { appBaseUrl } from "../support/e2e";
import { interceptGateway } from "../support/intercepts";

const VIEW_TIMEOUT = 60000;

describe("Inquilino - Visualización de contratos", () => {
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
    interceptGateway("GET", "/users/user/me", "getCurrentUser");
    interceptGateway("POST", "/users/user/registerRole", "registerRole");
    interceptGateway("GET", "/users/user/role/*", "getUserRole");
    interceptGateway("GET", "/users/preference/user/*", "getUserPreferences");
    interceptGateway("GET", "/users/favorites/user/*", "getUserFavorites");
    interceptGateway("GET", "/users/contracts/getByUser/*", "getUserContracts");
    interceptGateway("GET", "/users/contracts/getById/*", "getContractById");
    interceptGateway("GET", "/users/user/getById/*", "getUserById");
    interceptGateway("GET", "/properties/property/getById/*", "getPropertyById");
  });

  it("Permite ingresar al panel de inquilino y abrir el detalle de un contrato", () => {
    cy.loginTenant();
    cy.visit(appBaseUrl);

    // Esperar que cargue la página principal
    cy.wait("@getCurrentUser", { timeout: 15000 }).its("response.statusCode").should("be.oneOf", [200, 401]);
    cy.wait("@getAmenities", { timeout: 15000 }).its("response.statusCode").should("be.within", 200, 299);
    cy.wait("@getTypes", { timeout: 15000 }).its("response.statusCode").should("be.within", 200, 299);
    cy.wait("@getNeighborhoods", { timeout: 15000 }).its("response.statusCode").should("be.within", 200, 299);

    cy.contains("button, a, span", /Soy Inquilino/i, { timeout: VIEW_TIMEOUT })
      .should("be.visible")
      .then(($btn) => cy.wrap($btn).click({ force: true }));

    // Esperar navegación y carga de contratos
    cy.wait("@getUserContracts", { timeout: 15000 }).its("response.statusCode").should("be.within", 200, 299);
    cy.location("pathname", { timeout: VIEW_TIMEOUT }).should("include", "/contract");

    cy.contains("button", /Ver detalles/i, { timeout: VIEW_TIMEOUT })
      .should("be.visible")
      .then(($btn) => cy.wrap($btn).click({ force: true }));

    // Esperar carga del detalle del contrato
    cy.wait("@getContractById", { timeout: 15000 }).its("response.statusCode").should("be.within", 200, 299);
    cy.wait("@getUserById", { timeout: 15000 }).its("response.statusCode").should("be.within", 200, 299);
    cy.wait("@getPropertyById", { timeout: 15000 }).its("response.statusCode").should("be.within", 200, 299);

    cy.location("pathname", { timeout: VIEW_TIMEOUT }).should("match", /\/contracts?\/\d+$/);
    cy.contains("Detalle de Contrato", { timeout: VIEW_TIMEOUT }).should("be.visible");
  });
});
