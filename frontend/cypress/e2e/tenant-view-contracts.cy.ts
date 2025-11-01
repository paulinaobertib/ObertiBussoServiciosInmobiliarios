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
    // No need to visit again - loginTenant already navigates to /
    
    // Esperar que cargue la página principal
    cy.wait("@getCurrentUser", { timeout: 15000 }).then((interception) => {
      cy.log('getCurrentUser response:', JSON.stringify(interception.response?.body));
      if (interception.response) {
        expect(interception.response.statusCode).to.be.oneOf([200, 401]);
      }
    });
    cy.wait("@getAmenities", { timeout: 15000 }).its("response.statusCode").should("be.within", 200, 299);
    cy.wait("@getTypes", { timeout: 15000 }).its("response.statusCode").should("be.within", 200, 299);
    cy.wait("@getNeighborhoods", { timeout: 15000 }).its("response.statusCode").should("be.within", 200, 299);
    
    // Esperar a que se obtenga el rol del usuario
    cy.wait("@getUserRole", { timeout: 15000 }).then((interception) => {
      cy.log('getUserRole response:', JSON.stringify(interception.response?.body));
      if (interception.response) {
        expect(interception.response.statusCode).to.be.within(200, 299);
      }
    });

    // Esperar a que la página principal se renderice completamente antes de buscar el botón
    cy.wait(5000);
    
    // Debug: verificar qué hay en el DOM
    cy.get('body').then(($body) => {
      cy.log('Body HTML:', $body.html());
      const buttonTexts = $body.find('button, a, span').map((i, el) => Cypress.$(el).text()).get();
      cy.log('All button/link/span texts:', buttonTexts.join(', '));
    });
    
    // Verificar que el botón esté visible antes de hacer click
    cy.contains("button, a, span", /Soy Inquilino/i, { timeout: VIEW_TIMEOUT })
      .should("be.visible")
      .should("not.be.disabled")
      .then(($btn) => {
        cy.wrap($btn).click({ force: true });
      });

    // Esperar navegación y carga de contratos
    cy.wait("@getUserContracts", { timeout: 15000 }).its("response.statusCode").should("be.within", 200, 299);
    cy.location("pathname", { timeout: VIEW_TIMEOUT }).should("include", "/contract");
    
    // Esperar a que la lista de contratos se renderice
    cy.wait(800);

    cy.contains("button", /Ver detalles/i, { timeout: VIEW_TIMEOUT })
      .should("be.visible")
      .then(($btn) => cy.wrap($btn).click({ force: true }));

    // Esperar carga del detalle del contrato
    cy.wait("@getContractById", { timeout: 15000 }).its("response.statusCode").should("be.within", 200, 299);
    cy.wait("@getUserById", { timeout: 15000 }).its("response.statusCode").should("be.within", 200, 299);
    cy.wait("@getPropertyById", { timeout: 15000 }).its("response.statusCode").should("be.within", 200, 299);
    
    // Esperar a que el detalle se renderice
    cy.wait(500);

    cy.location("pathname", { timeout: VIEW_TIMEOUT }).should("match", /\/contracts?\/\d+$/);
    cy.contains("Detalle de Contrato", { timeout: VIEW_TIMEOUT }).should("be.visible");
  });
});
