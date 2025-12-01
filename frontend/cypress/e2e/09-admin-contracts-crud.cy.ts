/// <reference types="cypress" />

import { interceptGateway } from "../support/intercepts";

const formatISODate = (date: Date) => {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const day = String(date.getDate()).padStart(2, "0");
  return `${year}-${month}-${day}`;
};

const formatCurrency = (value: number) =>
  new Intl.NumberFormat("es-AR", { minimumFractionDigits: 0, maximumFractionDigits: 0 }).format(value);

describe("Admin - CRUD de contratos de alquiler", () => {
  const TENANT_EMAIL = "tenant@test.com";

  const creationData = {
    contractType: "Vivienda",
    contractStatus: "Activo",
    startDate: new Date(2025, 11, 17),
    endDate: new Date(2027, 11, 17),
    amount: 400000,
    currency: "Peso argentino",
    increaseFrequency: 4,
    note: "Contrato creado para las pruebas",
  };

  const updateData = {
    amount: 310000,
  };

  const SLOT_TIMEOUT = 60000;

  const fillTextField = (labelPattern: RegExp, value: string) => {
    cy.contains("label", labelPattern, { timeout: SLOT_TIMEOUT })
      .should("exist")
      .invoke("attr", "for")
      .then((id) => {
        if (!id) {
          throw new Error(`No se encontro input para ${labelPattern}`);
        }
        cy.get(`#${id}`).should("exist").clear({ force: true }).type(value, { force: true });
      });
  };

  const fillDateField = (labelPattern: RegExp, date: Date) => {
    cy.contains("label", labelPattern, { timeout: SLOT_TIMEOUT })
      .should("exist")
      .invoke("attr", "for")
      .then((id) => {
        if (!id) {
          throw new Error(`No se encontro input de fecha para ${labelPattern}`);
        }
        cy.get(`#${id}`)
          .should("have.attr", "type", "date")
          .then(($input) => {
            const nativeInputValueSetter = Object.getOwnPropertyDescriptor(HTMLInputElement.prototype, "value")?.set;

            if (!nativeInputValueSetter) {
              throw new Error("No se pudo obtener el setter nativo de value para inputs de fecha");
            }

            const inputElement = $input[0] as HTMLInputElement;
            const isoDate = formatISODate(date);

            nativeInputValueSetter.call(inputElement, isoDate);
            inputElement.dispatchEvent(new Event("input", { bubbles: true, composed: true }));
            inputElement.dispatchEvent(new Event("change", { bubbles: true, composed: true }));
          });
      });
  };

  const selectOption = (labelPattern: RegExp, optionText: string) => {
    cy.contains("label", labelPattern, { timeout: SLOT_TIMEOUT })
      .should("exist")
      .invoke("attr", "for")
      .then((id) => {
        if (!id) {
          throw new Error(`No se encontro input asociado a ${labelPattern}`);
        }
        cy.get(`#${id}`)
          .closest(".MuiFormControl-root")
          .find('[role="combobox"],[role="button"]')
          .first()
          .click({ force: true });
      });

    cy.get('ul[role="listbox"]', { timeout: SLOT_TIMEOUT })
      .filter(":visible")
      .first()
      .should("be.visible")
      .within(() => {
        cy.contains('li[role="option"]', optionText, { matchCase: false }).should("be.visible").click();
      });
  };

  let createdContractId: number | null = null;

  beforeEach(() => {
    createdContractId = null;

    interceptGateway("GET", "/users/contracts/getAll", "getContracts");
    interceptGateway("POST", "/users/contracts/create", "createContract");
    interceptGateway("PUT", "/users/contracts/update/*", "updateContract");
    interceptGateway("DELETE", "/users/contracts/delete/*", "deleteContract");
    interceptGateway("GET", "/users/contracts/getById/*", "getContractById");
    interceptGateway("GET", "/properties/property/get", "getAvailableProperties");
    interceptGateway("GET", "/users/user/getAll", "getAllUsers");
    interceptGateway("GET", "/users/user/getById/*", "getUserById");
    interceptGateway("GET", "/users/increaseIndex/getAll", "getIncreaseIndexes");
    interceptGateway("PUT", "/properties/property/status/*", "updatePropertyStatus");

    cy.clearCookies();
    cy.clearLocalStorage();
    cy.viewport(1440, 900);
    cy.loginAdmin();
  });

  it("Crea, busca y elimina contrato completo", () => {
    // Esperar a que la página inicial cargue
    cy.wait(800);
    
    cy.get("header, nav")
      .first()
      .within(() => {
        cy.contains("button", /^Contratos$/i)
          .should("be.visible")
          .click();
      });

    cy.location("pathname", { timeout: SLOT_TIMEOUT }).should("include", "/contracts");
    cy.wait("@getContracts", { timeout: SLOT_TIMEOUT });
    
    // Esperar a que la lista de contratos se renderice
    cy.wait(500);

    cy.contains("button", "Nuevo Contrato", { timeout: SLOT_TIMEOUT }).click();

    cy.location("pathname", { timeout: SLOT_TIMEOUT }).should("include", "/contracts/new");
    
    // Esperar a que la tabla de propiedades se renderice
    cy.wait(1000);

    // Buscar la fila que contiene "Propiedad A" y seleccionar su checkbox
    cy.contains('[role="row"]', /Propiedad A/i, { timeout: SLOT_TIMEOUT })
      .should("be.visible")
      .within(() => {
        cy.get('input[type="checkbox"]').first().check({ force: true });
      });

    cy.contains("button", /^Siguiente$/i, { timeout: SLOT_TIMEOUT })
      .should("not.be.disabled")
      .click();

    cy.wait("@getAllUsers", { timeout: SLOT_TIMEOUT });
    
    // Esperar a que la tabla de usuarios se renderice
    cy.wait(800);

    cy.contains('[role="row"]', TENANT_EMAIL, { timeout: SLOT_TIMEOUT })
      .should("be.visible")
      .within(() => {
        cy.get('input[type="checkbox"]').first().check({ force: true });
      });

    cy.contains("button", /^Siguiente$/i, { timeout: SLOT_TIMEOUT })
      .should("not.be.disabled")
      .click();

    cy.wait("@getUserById", { timeout: SLOT_TIMEOUT });
    cy.wait("@getIncreaseIndexes", { timeout: SLOT_TIMEOUT });
    
    // Esperar a que el formulario de contrato se renderice
    cy.wait(800);

    selectOption(/Tipo/i, creationData.contractType);
    selectOption(/Estado/i, creationData.contractStatus);
    fillDateField(/Inicio/i, creationData.startDate);
    fillDateField(/Fin/i, creationData.endDate);
    fillTextField(/^Monto inicial/i, String(creationData.amount));
    selectOption(/Moneda/i, creationData.currency);

    cy.contains("label", /Seleccionar Indice/i, { timeout: SLOT_TIMEOUT })
      .should("exist")
      .invoke("attr", "for")
      .then((id) => {
        if (!id) {
          throw new Error("No se encontro input para seleccionar indice");
        }

        cy.get(`#${id}`)
          .closest(".MuiFormControl-root")
          .find('[role="combobox"],[role="button"]')
          .first()
          .click({ force: true });
      });

    cy.get('ul[role="listbox"]', { timeout: SLOT_TIMEOUT })
      .filter(":visible")
      .first()
      .find('li[role="option"]')
      .first()
      .should("be.visible")
      .click({ force: true });

    fillTextField(/Frecuencia de Aumento/i, String(creationData.increaseFrequency));
    fillTextField(/^Notas$/i, creationData.note);

    cy.contains("button", /^Crear$/i, { timeout: SLOT_TIMEOUT })
      .should("be.enabled")
      .click();

    cy.wait("@createContract", { timeout: SLOT_TIMEOUT }).then((interception) => {
      expect(interception.response?.statusCode, "status al crear contrato").to.be.within(200, 299);

      const body = interception.response?.body as any;
      const idFromResponse =
        body?.id ?? body?.data?.id ?? body?.contract?.id ?? (Array.isArray(body) && body[0]?.id) ?? null;

      if (idFromResponse != null) {
        createdContractId = Number(idFromResponse);
      }
    });

    cy.wait("@getContracts", { timeout: SLOT_TIMEOUT });

    // Esperar a que la tabla de contratos se actualice
    cy.wait(800);
    
    // Click the first "Ir al detalle" button in the contracts table
    // (assuming the newest contract appears first or we just created it)
    cy.contains("button", /^Ir al detalle$/i, { timeout: SLOT_TIMEOUT })
      .first()
      .click({ force: true });

    cy.location("pathname", { timeout: SLOT_TIMEOUT })
      .should("match", /\/contracts?\/\d+$/)
      .then((path) => {
        const match = path.match(/\/contracts?\/(\d+)$/);
        createdContractId = match ? Number(match[1]) : null;
      });

    cy.wait("@getContractById", { timeout: SLOT_TIMEOUT });

    // Esperar a que el detalle del contrato se renderice
    cy.wait(800);
    
    cy.contains("Detalle de Contrato", { timeout: SLOT_TIMEOUT }).should("be.visible");
    cy.contains("Notas del Contrato").parent().should("contain.text", creationData.note);

    cy.contains("button", /^Editar$/i, { timeout: SLOT_TIMEOUT }).click();

    // Esperar a que el formulario de edición se active
    cy.wait(500);
    
    cy.contains("label", /^Monto inicial/i, { timeout: SLOT_TIMEOUT })
      .should("exist")
      .invoke("attr", "for")
      .then((id) => {
        if (id) {
          cy.get(`#${id}`).clear({ force: true }).type(String(updateData.amount), { force: true });
        }
      });

    cy.wait("@getContractById", { timeout: SLOT_TIMEOUT });
    cy.wait("@getIncreaseIndexes", { timeout: SLOT_TIMEOUT });

    cy.contains("button", /^Actualizar$/i, { timeout: SLOT_TIMEOUT })
      .should("be.enabled")
      .click();

    cy.wait("@updateContract", { timeout: SLOT_TIMEOUT }).its("response.statusCode").should("be.within", 200, 299);

    cy.get('[role="dialog"]', { timeout: SLOT_TIMEOUT })
      .should("be.visible")
      .within(() => {
        cy.contains("button", /^Ok$/i).click();
      });

    cy.location("pathname", { timeout: SLOT_TIMEOUT }).should("include", "/contracts");
    cy.wait("@getContracts", { timeout: SLOT_TIMEOUT });

    // Esperar a que la tabla de contratos se actualice después de editar
    cy.wait(800);
    
    cy.contains("button", /^Ver detalle/i, { timeout: SLOT_TIMEOUT })
      .first()
      .click({ force: true });

    cy.wait("@getContractById", { timeout: SLOT_TIMEOUT });
    
    // Esperar a que el detalle se renderice antes de eliminar
    cy.wait(500);

    cy.contains("button", /^Eliminar$/i, { timeout: SLOT_TIMEOUT }).click();

    cy.get('[role="dialog"]', { timeout: SLOT_TIMEOUT })
      .should("be.visible")
      .within(() => {
        cy.contains("button", /^Confirmar$/i).click();
      });

    cy.get('[role="dialog"]', { timeout: SLOT_TIMEOUT })
      .should("be.visible")
      .within(() => {
        cy.contains("button", /^Confirmar$/i).click();
      });

    cy.wait("@deleteContract", { timeout: SLOT_TIMEOUT }).its("response.statusCode").should("be.within", 200, 299);

    cy.get('[role="dialog"]', { timeout: SLOT_TIMEOUT })
      .should("be.visible")
      .within(() => {
        cy.contains("button", /^Ok$/i).click();
      });

    cy.contains("Contrato eliminado: estado de la propiedad", { timeout: SLOT_TIMEOUT })
      .closest('[role="dialog"]')
      .within(() => {
        cy.contains("label", /^Estado$/i)
          .parents(".MuiFormControl-root")
          .first()
          .within(() => {
            cy.get('[aria-haspopup="listbox"], [role="button"][aria-haspopup="listbox"]')
              .first()
              .click({ force: true });
          });
      });

    cy.get('ul[role="listbox"]', { timeout: SLOT_TIMEOUT })
      .filter(":visible")
      .first()
      .find('li[role="option"]')
      .contains(/^DISPONIBLE$/i)
      .click({ force: true });

    cy.contains("Contrato eliminado: estado de la propiedad", { timeout: SLOT_TIMEOUT })
      .closest('[role="dialog"]')
      .within(() => {
        cy.contains("button", /^Confirmar$/i).click();
      });

    cy.wait("@updatePropertyStatus", { timeout: SLOT_TIMEOUT })
      .its("response.statusCode")
      .should("be.within", 200, 299);

    cy.get('[role="dialog"]', { timeout: SLOT_TIMEOUT }).should("be.visible");
    cy.contains("button", /^Ok$/i, { timeout: SLOT_TIMEOUT }).click({ force: true });

    cy.location("pathname", { timeout: SLOT_TIMEOUT }).should("include", "/properties/");

    // Navegar directamente a la página de contratos (visita directa para forzar recarga)
    cy.visit(`${Cypress.config("baseUrl")}/contracts`);

    cy.location("pathname", { timeout: SLOT_TIMEOUT }).should("include", "/contracts");
  });
});
