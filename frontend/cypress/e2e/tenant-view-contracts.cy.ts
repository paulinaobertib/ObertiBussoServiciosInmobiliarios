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
    
    // Esperar que cargue la página principal y capturar respuestas
    cy.wait("@getCurrentUser", { timeout: 15000 }).then((interception) => {
      cy.log("User data:", JSON.stringify(interception.response?.body));
    });
    
    cy.wait("@getUserRole", { timeout: 15000 }).then((interception) => {
      cy.log("User roles:", JSON.stringify(interception.response?.body));
    });
    
    cy.wait("@getAmenities", { timeout: 15000 }).its("response.statusCode").should("be.within", 200, 299);
    cy.wait("@getTypes", { timeout: 15000 }).its("response.statusCode").should("be.within", 200, 299);
    cy.wait("@getNeighborhoods", { timeout: 15000 }).its("response.statusCode").should("be.within", 200, 299);

    // Debug: verificar authInfo en sessionStorage
    cy.window().then((win) => {
      const authInfo = win.sessionStorage.getItem('authInfo');
      cy.log("AuthInfo from sessionStorage:", authInfo);
      if (authInfo) {
        const parsed = JSON.parse(authInfo);
        cy.log("Parsed roles:", JSON.stringify(parsed.roles));
      }
    });

    // Esperar a que la página principal se renderice completamente
    cy.wait(5000);
    
    // Debug: capturar el HTML del navbar para ver qué se está renderizando
    cy.get('nav').then(($nav) => {
      cy.log("Navbar HTML:", $nav.html());
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
