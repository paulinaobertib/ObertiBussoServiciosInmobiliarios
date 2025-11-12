import { appBaseUrl} from "../support/e2e";
import { interceptGateway } from "../support/intercepts";

const ADMIN_TIMEOUT = 60000;

const getAdminCredentials = () => {
  const username = Cypress.env("adminUsername") ?? "admin";
  const password = Cypress.env("adminPassword") ?? "Administrador1.";
  return { username, password };
};

const loginAsAdmin = () => {
  const { username, password } = getAdminCredentials();
  const keycloakUrl = Cypress.env("keycloakUrl");
  if (!keycloakUrl) {
    throw new Error("Falta configurar keycloakUrl para Cypress");
  }

  const keycloakOrigin = new URL(keycloakUrl).origin;

  cy.visit(appBaseUrl);
  cy.contains("button", /Iniciar Ses/i).should("be.visible").click();

  cy.location("origin", { timeout: ADMIN_TIMEOUT }).then((currentOrigin) => {
    const authOrigin = currentOrigin?.startsWith("http") ? currentOrigin : keycloakOrigin;

    cy.origin(
      authOrigin,
      { args: { username, password, timeout: ADMIN_TIMEOUT } },
      ({ username, password, timeout }) => {
        cy.get("form:visible", { timeout }).within(() => {
          cy.get("input#username, input[name='username']").first().clear().type(username, { log: false });
          cy.get("input#password, input[name='password']").first().clear().type(password, { log: false });
          cy.get("input#kc-login, button[type='submit']").first().click();
        });
      }
    );
  });

  cy.location("pathname", { timeout: ADMIN_TIMEOUT }).should("eq", "/");
};

describe("Administrador: creación básica de una propiedad", () => {
  beforeEach(() => {
    cy.clearCookies();
    cy.clearLocalStorage();
    cy.viewport(1280, 720);

    interceptGateway("GET", "/properties/property/get", "getAvailableProperties");
    interceptGateway("GET", "/properties/property/getById/**", "getPropertyById");
    interceptGateway("GET", "/properties/owner/getByProperty/**", "getOwnerByProperty");
    interceptGateway("GET", "/properties/image/getByProperty/**", "getPropertyImages");
    interceptGateway("GET", "/properties/type/getAll", "getTypes");
    interceptGateway("GET", "/properties/neighborhood/getAll", "getNeighborhoods");
    interceptGateway("GET", "/properties/owner/getAll", "getOwners");
    interceptGateway("GET", "/properties/amenity/getAll", "getAmenities");
    interceptGateway("POST", "/properties/property/create", "createProperty");
    interceptGateway("PUT", "/properties/property/update/*", "updateProperty");
    interceptGateway("DELETE", "/properties/property/delete/*", "deleteProperty");

    // Interceptar la petición de geocoding de Google Maps con mock
    cy.intercept('GET', 'https://maps.googleapis.com/maps/api/geocode/json*', {
      statusCode: 200,
      body: {
        results: [{
          formatted_address: "Italia 2889, Villa Cabrera, Córdoba, Argentina",
          geometry: { location: { lat: -31.4, lng: -64.2 } }
        }],
        status: 'OK'
      }
    }).as('geocode');
  });

  it("Permite crear una propiedad, editarla y luego eliminarla.", () => {
    loginAsAdmin();
    cy.visit(appBaseUrl);

    // Esperar a que la página principal cargue completamente
    cy.wait(500);
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
    
    // Esperar a que el formulario de creación se renderice completamente
    cy.wait(500);
    cy.contains("button", /^Tipos$/i, { timeout: ADMIN_TIMEOUT }).should("be.visible");

    const clickModalButtonIfPresent = (...labels: RegExp[]) => {
      cy.get("body", { timeout: ADMIN_TIMEOUT }).then(($body) => {
        const buttons = $body.find("button").toArray();
        const target = buttons.find((btn) => {
          const text = btn.innerText.trim();
          return labels.some((label) => label.test(text));
        });
        if (target) {
          cy.wrap(target).click({ force: true });
        }
      });
    };

    cy.contains("button", /^Tipos$/i, { timeout: ADMIN_TIMEOUT }).click({ force: true });
    //cy.wait("@getTypes", { timeout: ADMIN_TIMEOUT });

    cy.get('[role="grid"] [role="row"][data-rowindex]', { timeout: ADMIN_TIMEOUT })
      .first()
      .within(() => {
        cy.get('input[type="checkbox"], [role="checkbox"]')
          .first()
          .click({ force: true });
      });

    const selectPanel = (label: RegExp, rowMatcher?: RegExp) => {
      cy.contains("button", label, { timeout: ADMIN_TIMEOUT }).click({ force: true });

      if (rowMatcher) {
        cy.contains('[role="row"][data-rowindex]', rowMatcher, { timeout: ADMIN_TIMEOUT }).within(() => {
          cy.get('input[type="checkbox"], [role="checkbox"]').first().click({ force: true });
        });
        return;
      }

      cy.get('[role="grid"] [role="row"][data-rowindex]', { timeout: ADMIN_TIMEOUT })
        .first()
        .within(() => {
          cy.get('input[type="checkbox"], [role="checkbox"]')
            .first()
            .click({ force: true });
        });
    };

    const fillTextFieldByLabel = (label: RegExp, value: string) => {
      cy.contains("label", label, { timeout: ADMIN_TIMEOUT })
        .should("be.visible")
        .invoke("attr", "for")
        .then((id) => {
          cy.get(`#${id}`).clear().type(value);
        });
    };

    selectPanel(/^Barrios$/i);
    fillTextFieldByLabel(/^Calle$/i, "Italia");
    fillTextFieldByLabel(/^Número$/i, "2889");
    cy.wait('@geocode', { timeout: 10000 }); // Esperar la petición de geocoding de Google Maps
    cy.contains(/Dirección validada|Ubicación validada/, { timeout: 15000 }).should("be.visible");
    cy.wait(500); // Esperar después de la validación para procesamiento
    selectPanel(/^Propietarios$/i);
    selectPanel(/Caracter/i);

    cy.contains("button", /^Siguiente$/i, { timeout: ADMIN_TIMEOUT })
      .should("not.be.disabled")
      .click();

    // Esperar a que el formulario de detalles se renderice completamente
    cy.wait(800);
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

    cy.contains("button", /^Crear$/i, { timeout: ADMIN_TIMEOUT })
      .should("be.enabled")
      .click();

    cy.contains("¿Crear la propiedad?", { timeout: ADMIN_TIMEOUT }).should("be.visible");
    cy.contains("button", /^Confirmar$/i, { timeout: ADMIN_TIMEOUT }).click({ force: true });
    cy.wait("@createProperty", { timeout: ADMIN_TIMEOUT }).its("response.statusCode").should("be.within", 200, 299);

    // Wait for success modal and click "Volver" button
    cy.contains("Propiedad creada", { timeout: ADMIN_TIMEOUT }).should("be.visible");
    cy.contains("button", /^Volver$/i, { timeout: ADMIN_TIMEOUT })
      .should("be.visible")
      .click({ force: true });

    // Verify navigation after closing modal
    cy.location("pathname", { timeout: ADMIN_TIMEOUT }).should("eq", "/");

    // Esperar a que la página principal cargue completamente antes de editar
    cy.wait(800);
    cy.get('button[aria-label="Acciones de Propiedad"]', { timeout: ADMIN_TIMEOUT })
      .should("be.visible")
      .click({ force: true });

    cy.on("window:confirm", () => true);

    openSpeedDialAction("Editar");

    clickModalButtonIfPresent(/^ok$/i, /^aceptar$/i, /^entendido$/i);

    cy.contains('[data-testid="favorite-item"]', "Propiedad Cypress", { timeout: ADMIN_TIMEOUT })
      .should("be.visible")
      .click({ force: true });

    cy.wait("@getPropertyById", { timeout: ADMIN_TIMEOUT });
    cy.wait("@getOwnerByProperty", { timeout: ADMIN_TIMEOUT });
    cy.wait("@getPropertyImages", { timeout: ADMIN_TIMEOUT });

    // Esperar a que el formulario de edición cargue completamente
    cy.wait(500);
    cy.contains("button", /^Siguiente$/i, { timeout: ADMIN_TIMEOUT }).click({ force: true });

    // Esperar a que el segundo paso del stepper se renderice
    cy.wait(800);
    cy.contains("button", /^Actualizar$/i, { timeout: ADMIN_TIMEOUT }).should("be.visible");

    cy.contains("label", /^Título/i, { timeout: ADMIN_TIMEOUT })
      .invoke("attr", "for")
      .then((id) => {
        cy.get(`#${id}`).clear().type("Propiedad Cypress Editada");
      });

    cy.contains("button", /^Actualizar$/i, { timeout: ADMIN_TIMEOUT })
      .should("be.visible")
      .click({ force: true });

    cy.contains("Guardar cambios en la propiedad?", { timeout: ADMIN_TIMEOUT }).should("be.visible");
    cy.contains("button", /^Confirmar$/i, { timeout: ADMIN_TIMEOUT })
      .should("be.visible")
      .then(($btn) => {
        cy.wrap($btn).click({ force: true });
      });
    cy.wait("@updateProperty", { timeout: ADMIN_TIMEOUT }).its("response.statusCode").should("be.within", 200, 299);

    cy.contains("Propiedad actualizada", { timeout: ADMIN_TIMEOUT }).should("be.visible");
    cy.contains("button", /^Volver$/i, { timeout: ADMIN_TIMEOUT })
      .should("be.visible")
      .then(($btn) => {
        cy.wrap($btn).click({ force: true });
      });

    cy.location("pathname", { timeout: ADMIN_TIMEOUT }).should("eq", "/");

    // Esperar a que la página principal cargue completamente antes de eliminar
    cy.wait(800);
    cy.get('button[aria-label="Acciones de Propiedad"]', { timeout: ADMIN_TIMEOUT })
      .should("be.visible")
      .click({ force: true });

    cy.on("window:confirm", () => true);

    openSpeedDialAction("Eliminar");

    cy.contains("button", /^Entendido$/i, { timeout: ADMIN_TIMEOUT })
      .should("be.visible")
      .click({ force: true });

    cy.contains('[data-testid="favorite-item"]', "Propiedad Cypress Editada", { timeout: ADMIN_TIMEOUT })
      .should("be.visible")
      .click({ force: true });

    cy.contains("button", /^Confirmar$/i, { timeout: ADMIN_TIMEOUT })
      .should("be.visible")
      .then(($btn) => {
        cy.wrap($btn).click({ force: true });
      });

    cy.contains("button", /^Confirmar$/i, { timeout: ADMIN_TIMEOUT })
      .should("be.visible")
      .then(($btn) => {
        cy.wrap($btn).click({ force: true });
      });
    cy.wait("@deleteProperty", { timeout: ADMIN_TIMEOUT }).its("response.statusCode").should("be.within", 200, 299);

    cy.contains("Propiedad eliminada", { timeout: ADMIN_TIMEOUT }).should("be.visible");
    cy.contains("button", /^Volver$/i, { timeout: ADMIN_TIMEOUT })
      .should("be.visible")
      .then(($btn) => {
        cy.wrap($btn).click({ force: true });
      });

    cy.location("pathname", { timeout: ADMIN_TIMEOUT }).should("eq", "/");
  });
});
