const baseUrl = Cypress.env("appUrl") ?? "http://localhost:5173";
const contactUrl = `${baseUrl}/contact`;
const nextMonthButtonSelector = "button[aria-label='Next month'], button[aria-label='Siguiente mes']";
const decemberDayLabel = /^12$/;
const generationRange = { from: "09:30", to: "13:00" };

const ensureDecemberAvailability = () => {
  cy.sessionAdmin({ redirectPath: "/appointments" });

  cy.contains("button", "Generar turnos", { timeout: 10000 }).click();

  cy.get("[role='dialog']").within(() => {
    cy.get(".MuiPickersCalendarHeader-label", { timeout: 10000 }).should("be.visible");

    cy.get(nextMonthButtonSelector).last().click();
    cy.get(nextMonthButtonSelector).last().click();
    cy.contains("button", decemberDayLabel).click({ force: true });

    cy.contains("label", "Desde")
      .parent()
      .find("input")
      .clear()
      .type(generationRange.from);

    cy.contains("label", "Hasta")
      .parent()
      .find("input")
      .clear()
      .type(generationRange.to);

    cy.contains("button", /^Generar$/).should("not.be.disabled").click();
  });

  cy.contains("Turnos generados", { timeout: 15000 }).should("be.visible");
  cy.contains("button", "Ok").click();

  cy.get("[role='dialog']")
    .find("button[aria-label='cerrar modal']")
    .click();
};

describe("Integracion: Contacto solicita turno con usuario logueado", () => {
  before(() => {
    ensureDecemberAvailability();
  });

  beforeEach(() => {
    cy.visit(baseUrl);
    cy.contains("button", "Aceptar", { timeout: 10000 }).click();

    cy.sessionUser();

    cy.contains("button", "Aceptar", { timeout: 10000 }).click();

    cy.visit(contactUrl);
  });

  it("genera una solicitud de turno con usuario autenticado", () => {
    cy.contains(/Reserv.*tu turno/i, { timeout: 10000 }).should("be.visible");
    cy.contains(/Seleccion.*un d[ií]a/i, { timeout: 10000 }).should("be.visible");

    cy.get(nextMonthButtonSelector).last().click();
    cy.get(nextMonthButtonSelector).last().click();
    cy.get(".MuiPickersCalendarHeader-label", { timeout: 10000 }).should("contain.text", "diciembre");

    cy.contains("button", decemberDayLabel).as("selectedDay");
    cy.get("@selectedDay").click({ force: true });
    cy.get("@selectedDay").should("have.class", "Mui-selected");

    cy.contains("button:enabled", /^\d{2}:\d{2}$/, { timeout: 10000 })
      .first()
      .as("slotButton");

    cy.get("@slotButton").should("be.visible").click();

    cy.contains("button", /^Solicitar Turno$/).scrollIntoView().click();

    cy.contains("Solicitud enviada", { timeout: 15000 }).should("be.visible");
    cy.contains(/Tu turno qued[oó] en espera de confirmaci[oó]n/i).should("be.visible");
    cy.contains("button", "Ok").click();
  });
});
