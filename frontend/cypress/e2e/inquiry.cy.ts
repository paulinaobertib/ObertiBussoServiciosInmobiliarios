import { appBaseUrl } from "../support/e2e";
import { interceptGateway } from "../support/intercepts";

describe("Consultas de propiedades", () => {
  beforeEach(() => {
    cy.clearCookies();
    cy.clearLocalStorage();
    cy.viewport(1280, 720);
  });

  it("Envía consulta y cierra confirmación", () => {
    // Configurar interceptores
    interceptGateway("GET", "/properties/amenity/getAll", "getAmenities");
    interceptGateway("GET", "/properties/type/getAll", "getTypes");
    interceptGateway("GET", "/properties/neighborhood/getAll", "getNeighborhoods");
    interceptGateway("GET", "/properties/property/get", "getAvailableProperties");
    interceptGateway("GET", "/properties/property/getById/*", "getPropertyById");
    interceptGateway("GET", "/properties/property/search**", "searchProperties");
    interceptGateway("POST", "/properties/inquiries/create", "createInquiry");

    cy.visit(appBaseUrl);

    // Esperar a que cargue el catálogo
    cy.wait("@getAvailableProperties", { timeout: 15000 });

    // abrir la primera propiedad del catálogo
    cy.get("[data-testid='property-card']").first().click();

    // Esperar a que cargue el detalle de la propiedad
    cy.wait("@getPropertyById", { timeout: 15000 });

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

    // Esperar a que se complete la petición
    cy.wait("@createInquiry", { timeout: 15000 }).its("response.statusCode").should("be.within", 200, 299);

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
