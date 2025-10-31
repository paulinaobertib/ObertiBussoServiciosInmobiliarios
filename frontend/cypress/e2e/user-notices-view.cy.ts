import { appBaseUrl } from "../support/e2e";
import { interceptGateway } from "../support/intercepts";

describe("Noticias: Visualización desde usuario normal", () => {
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
    interceptGateway("GET", "/users/notices/getAll", "getAllNotices");

    cy.visit(appBaseUrl);
  });

  it("Permite ver las noticias y acceder al detalle", () => {
    // Esperar carga inicial de la página
    cy.wait("@getAmenities", { timeout: 15000 }).its("response.statusCode").should("be.within", 200, 299);
    cy.wait("@getTypes", { timeout: 15000 }).its("response.statusCode").should("be.within", 200, 299);
    cy.wait("@getNeighborhoods", { timeout: 15000 }).its("response.statusCode").should("be.within", 200, 299);
    cy.wait("@getCurrentUser", { timeout: 15000 }).its("response.statusCode").should("be.oneOf", [200, 401]);

    // abrir sección Noticias
    cy.get("[data-testid='navbar-news']")
      .should("be.visible")
      .then(($btn) => cy.wrap($btn).click());

    // Esperar que carguen las noticias
    cy.wait("@getAllNotices", { timeout: 15000 }).its("response.statusCode").should("be.within", 200, 299);

    // verificar que hay noticias cargadas
    cy.get(".MuiCard-root", { timeout: 10000 })
      .should("exist")
      .and("have.length.greaterThan", 0);

    // Hacer clic en la primera noticia disponible
    cy.get(".MuiCard-root")
      .first()
      .should("be.visible")
      .click();

    // Esperar navegación al detalle (puede llamar a getAllNotices de nuevo)
    cy.wait("@getAllNotices", { timeout: 15000 }).its("response.statusCode").should("be.within", 200, 299);

    // verificar detalle visible
    cy.get("h4").should("be.visible");
    cy.get("button").contains("Volver").should("be.visible");

  });
});
