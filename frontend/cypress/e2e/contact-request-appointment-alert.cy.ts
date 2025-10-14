import { appBaseUrl } from "../support/e2e";
const contactUrl2 = `${appBaseUrl}/contact`;
const nextMonthButtonSelector2 = "button[aria-label='Next month'], button[aria-label='Siguiente mes']";
const decemberDayLabel2 = /^12$/;

describe("Integracion: Contacto solicita turno sin autenticacion", () => {
  beforeEach(() => {
    cy.clearCookies();
    cy.clearLocalStorage();
    cy.visit(contactUrl2);
  });

  it("permite elegir fecha y horario y muestra aviso de login al solicitar turno", () => {
    cy.contains(/Reserv.*tu turno/i, { timeout: 10000 }).should("be.visible");
    cy.contains(/Seleccion.*un d[ií]a/i, { timeout: 10000 }).should("be.visible");

    cy.get(nextMonthButtonSelector2).last().click();
    cy.get(nextMonthButtonSelector2).last().click();
    cy.get(".MuiPickersCalendarHeader-label", { timeout: 10000 }).should("contain.text", "diciembre");

    cy.contains("button", decemberDayLabel2).as("selectedDay");
    cy.get("@selectedDay").click({ force: true });
    cy.get("@selectedDay").should("have.class", "Mui-selected");

    cy.contains("button:enabled", /^\d{2}:\d{2}$/, { timeout: 10000 })
      .first()
      .as("slotButton");

    cy.get("@slotButton").should("be.visible").click();

    cy.contains("button", /^Solicitar Turno$/).scrollIntoView().click();

    cy.contains(/Debes iniciar sesi.n para solicitar un turno/i, { timeout: 10000 }).should("be.visible");
    cy.contains("button", "Aceptar").click();
  });
});
