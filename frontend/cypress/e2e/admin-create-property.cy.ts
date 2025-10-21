import { appBaseUrl } from "../support/e2e";

const ADMIN_TIMEOUT = 60000;

describe("Administrador: creación básica de una propiedad", () => {
  beforeEach(() => {
    cy.clearCookies();
    cy.clearLocalStorage();
    cy.viewport(1280, 720);
  });

  it("Permite seleccionar categorías y acceder al formulario de creación", () => {
    cy.loginAdmin();
    cy.visit(appBaseUrl);

    cy.get('button[aria-label="Acciones de Propiedad"]', { timeout: ADMIN_TIMEOUT })
      .should("be.visible")
      .click({ force: true });

    const openSpeedDialAction = (actionName: "Agregar" | "Editar" | "Eliminar") => {
      const actionTestId =
        actionName === "Agregar"
          ? "admin-action-create"
          : actionName === "Editar"
          ? "admin-action-edit"
          : "admin-action-delete";

      cy.get(`[data-testid="${actionTestId}"]`, { timeout: ADMIN_TIMEOUT })
        .should("be.visible")
        .closest("button")
        .click({ force: true });
    };

    openSpeedDialAction("Agregar");

    cy.location("pathname", { timeout: ADMIN_TIMEOUT }).should("include", "/properties/new");

    cy.intercept("GET", "**/properties/type/getAll").as("getTypes");
    cy.intercept("GET", "**/properties/neighborhood/getAll").as("getNeighborhoods");
    cy.intercept("GET", "**/properties/owner/getAll").as("getOwners");
    cy.intercept("GET", "**/properties/amenity/getAll").as("getAmenities");

    cy.contains("button", /^Tipos$/i, { timeout: ADMIN_TIMEOUT }).click({ force: true });
    cy.wait("@getTypes", { timeout: ADMIN_TIMEOUT });

    cy.get('[role="grid"] [role="row"]', { timeout: ADMIN_TIMEOUT })
      .should("have.length.greaterThan", 1)
      .eq(1)
      .find('input[type="checkbox"], [role="checkbox"]')
      .first()
      .check({ force: true });

    const selectPanel = (label: RegExp, waitAlias: string) => {
      cy.contains("button", label, { timeout: ADMIN_TIMEOUT }).click({ force: true });
      cy.wait(waitAlias, { timeout: ADMIN_TIMEOUT });

      cy.get('[role="grid"] [role="row"]', { timeout: ADMIN_TIMEOUT })
        .should("have.length.greaterThan", 1)
        .eq(1)
        .find('input[type="checkbox"], [role="checkbox"]')
        .first()
        .check({ force: true });
    };

    selectPanel(/^Barrios$/i, "@getNeighborhoods");
    selectPanel(/^Propietarios$/i, "@getOwners");
    selectPanel(/Caracter/i, "@getAmenities");

    cy.contains("button", /^Siguiente$/i, { timeout: ADMIN_TIMEOUT }).should("not.be.disabled").click();

    cy.contains("button", /^Crear$/i, { timeout: ADMIN_TIMEOUT }).should("be.visible");

    cy.contains("label", /^Título/i, { timeout: ADMIN_TIMEOUT })
      .invoke("attr", "for")
      .then((id) => {
        cy.get(`#${id}`).clear().type("Propiedad Cypress");
      });

    const selectOption = (label: RegExp, value: RegExp) => {
      cy.contains("label", label)
        .invoke("attr", "for")
        .then((id) => {
          cy.get(`#${id}`)
            .closest(".MuiFormControl-root")
            .find('[role="combobox"], [aria-haspopup="listbox"]')
            .first()
            .click({ force: true });
        });

      cy.contains('li[role="option"]', value, { timeout: ADMIN_TIMEOUT }).click({ force: true });
    };

    selectOption(/^Operación/i, /VENTA/i);
    selectOption(/^Estado/i, /DISPONIBLE/i);
    selectOption(/^Moneda/i, /Peso Argentino/i);

    cy.contains("label", /^Precio/i)
      .invoke("attr", "for")
      .then((id) => {
        cy.get(`#${id}`).clear().type("123456");
      });
    
    cy.contains("label", /^Expensas/i)
      .invoke("attr", "for")
      .then((id) => {
        cy.get(`#${id}`).clear().type("123");
      });

    cy.contains("label", /^Descripción/i)
      .invoke("attr", "for")
      .then((id) => {
        cy.get(`#${id}`).clear().type("Descripción de prueba generada por Cypress.");
      });

    cy.contains("label", /^Calle/i)
      .invoke("attr", "for")
      .then((id) => {
        cy.get(`#${id}`).clear().type("Derqui");
      });

    cy.contains("label", /^Número/i)
      .invoke("attr", "for")
      .then((id) => {
        cy.get(`#${id}`).clear().type("33");
      });

    cy.contains("label", /^Ambientes/i)
      .invoke("attr", "for")
      .then((id) => {
        cy.get(`#${id}`).clear().type("4");
      });

    cy.contains("label", /^Dormitorios/i)
      .invoke("attr", "for")
      .then((id) => {
        cy.get(`#${id}`).clear().type("2");
      });

    cy.contains("label", /^Baños/i)
      .invoke("attr", "for")
      .then((id) => {
        cy.get(`#${id}`).clear().type("1");
      });

    cy.contains("label", /Superficie Total/i)
      .invoke("attr", "for")
      .then((id) => {
        cy.get(`#${id}`).clear().type("88");
      });

    cy.contains("label", /Imagen principal/i)
      .parent()
      .find('input[type="file"]')
      .selectFile("cypress/fixtures/dpto.jpeg", { force: true });

    cy.wait(1000);

    cy.contains("button", /^Crear$/i, { timeout: ADMIN_TIMEOUT }).should("be.enabled").click();

    cy.contains("¿Crear la propiedad?", { timeout: ADMIN_TIMEOUT }).should("be.visible");
    cy.contains("button", /^Confirmar$/i, { timeout: ADMIN_TIMEOUT }).click({ force: true });

    // Esperar el modal de error y cerrarlo
    cy.contains("button", /^Aceptar$/i, { timeout: ADMIN_TIMEOUT })
      .should("be.visible")
      .click({ force: true });

    // Hacer clic en el logo para volver al home
    cy.get('img[alt="Logo"]:visible', { timeout: ADMIN_TIMEOUT }).click({ force: true })
      .should("be.visible")
      .click({ force: true });

    // Verificar que redirigió al home
    cy.location("pathname", { timeout: ADMIN_TIMEOUT }).should("eq", "/");

  });

});
