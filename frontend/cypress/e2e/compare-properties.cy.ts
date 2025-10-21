import { appBaseUrl } from "../support/e2e";

const CATALOG_TIMEOUT = 60000;
const escapeRegExp = (value: string) => value.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");

describe("Integracion: Comparar propiedades", () => {
  beforeEach(() => {
    cy.clearCookies();
    cy.clearLocalStorage();
    cy.viewport(1280, 720);
    cy.visit(appBaseUrl);
  });

  it("Permite comparar propiedades y enviar una consulta por las seleccionadas", () => {
    cy.intercept("GET", "**/properties/property/getById/*").as("getPropertyById");
    cy.intercept("POST", "**/properties/inquiries/create").as("postInquiry");

    cy.contains("button", /Iniciar Ses/i, { timeout: CATALOG_TIMEOUT }).should("be.visible");

    cy.get("[data-testid='favorite-item']", { timeout: CATALOG_TIMEOUT }).should("have.length.greaterThan", 1);

    cy.get("[data-testid='favorite-item']").eq(0).as("firstCard");
    cy.get("[data-testid='favorite-item']").eq(1).as("secondCard");

    cy.get("@firstCard")
      .find("[data-testid='property-card']")
      .invoke("attr", "alt")
      .then((title) => {
        if (!title) {
          throw new Error("No se encontro el titulo de la primera propiedad");
        }
        cy.wrap(title.trim()).as("firstTitle");
      });

    cy.get("@secondCard")
      .find("[data-testid='property-card']")
      .invoke("attr", "alt")
      .then((title) => {
        if (!title) {
          throw new Error("No se encontro el titulo de la segunda propiedad");
        }
        cy.wrap(title.trim()).as("secondTitle");
      });

    cy.get("img[alt='Select']", { timeout: CATALOG_TIMEOUT }).closest("button").click();

    cy.get("[role='dialog']", { timeout: CATALOG_TIMEOUT })
      .should("be.visible")
      .within(() => {
        cy.contains("button", /^Ok$/i).click();
      });

    cy.get("[role='dialog']").should("not.exist");

    cy.get("img[alt='Comparer']", { timeout: CATALOG_TIMEOUT }).closest("button").as("compareButton");
    cy.get("@compareButton").should("be.disabled");

    cy.get("@firstCard").find("input[type='checkbox']").check({ force: true });
    cy.get("@secondCard").find("input[type='checkbox']").check({ force: true });

    cy.wait("@getPropertyById", { timeout: CATALOG_TIMEOUT }).its("response.statusCode").should("eq", 200);
    cy.wait("@getPropertyById", { timeout: CATALOG_TIMEOUT }).its("response.statusCode").should("eq", 200);

    cy.get("@firstCard").find("input[type='checkbox']").should("be.checked");
    cy.get("@secondCard").find("input[type='checkbox']").should("be.checked");

    cy.get("@compareButton").should("not.be.disabled");
    cy.get("@compareButton").click();

    cy.location("pathname", { timeout: CATALOG_TIMEOUT }).should("eq", "/properties/compare");
    cy.wait(5000);
    cy.location("pathname").should("eq", "/properties/compare");

    cy.contains("button", /Consultar por estas propiedades/i, { timeout: CATALOG_TIMEOUT })
      .should("be.visible")
      .click();

    cy.contains("h2", /Enviar consulta/i, { timeout: CATALOG_TIMEOUT })
      .closest("[role='dialog']")
      .as("inquiryModal");

    cy.get("@inquiryModal")
      .should("be.visible")
      .within(() => {
        cy.get("input[name='firstName']").clear().type("Juan");
        cy.get("input[name='lastName']").clear().type("Perez");
        cy.get("input[name='email']").clear().type("juan.perez@example.com");
        cy.get("input[name='phone']").clear().type("123456789");
        cy.get("textarea[name='description']")
          .clear()
          .type("Me interesa recibir mas informacion sobre estas propiedades.");

        cy.contains("button", /^Enviar Consulta$/i).should("be.enabled").click();
      });

    cy.wait("@postInquiry", { timeout: CATALOG_TIMEOUT }).then(({ response }) => {
      expect(response?.statusCode).to.be.within(200, 299);
    });

    cy.contains("h4", /Consulta enviada/i, { timeout: CATALOG_TIMEOUT }).should("be.visible");
    cy.contains("button", /^Cerrar$/i, { timeout: CATALOG_TIMEOUT }).click();
    cy.contains("h4", /Consulta enviada/i).should("not.exist");

    cy.get("@inquiryModal").within(() => {
      cy.get("input[name='firstName']").should("have.value", "");
      cy.get("input[name='lastName']").should("have.value", "");
      cy.get("input[name='email']").should("have.value", "");
      cy.get("input[name='phone']").should("have.value", "");
      cy.get("textarea[name='description']").should("have.value", "");
    });

    cy.get("@inquiryModal").find("[data-testid='inquiry-form-close']").click();
    cy.contains("h2", /Enviar consulta/i).should("not.exist");
  });
});

