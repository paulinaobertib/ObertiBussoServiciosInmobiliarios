import { appBaseUrl } from "../support/e2e";
const contactUrl2 = `${appBaseUrl}/contact`;
const nextMonthButtonSelector2 = "button[aria-label='Next month'], button[aria-label='Siguiente mes']";
const decemberDayLabel2 = /^12$/;
const keycloakUrl2 = Cypress.env("keycloakUrl");
const keycloakOrigin2 = keycloakUrl2 ? new URL(keycloakUrl2).origin : null;
const keycloakUsername2 = Cypress.env("keycloakUsername");
const keycloakPassword2 = Cypress.env("keycloakPassword");

const selectFirstAvailableSlot = () => {
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
};

describe("Integracion: Contacto solicita turno sin autenticacion", () => {
  before(function () {
    if (!keycloakOrigin2 || !keycloakUsername2 || !keycloakPassword2) {
      cy.log("Faltan credenciales de Keycloak. Se omite la prueba de login desde contacto.");
      this.skip();
    }
  });

  beforeEach(() => {
    cy.clearCookies();
    cy.clearLocalStorage();
    cy.visit(contactUrl2);
  });

  it("Solicita login si no hay sesión y permite completar la reserva tras autenticarse", () => {
    cy.contains(/Reserv.*tu turno/i, { timeout: 10000 }).should("be.visible");
    selectFirstAvailableSlot();

    cy.contains("button", /^Solicitar Turno$/).scrollIntoView().click();

    cy.contains(/Debes iniciar sesi.n para solicitar un turno/i, { timeout: 10000 }).should("be.visible");
    cy.contains("button", "Aceptar").click();

    cy.contains("button", /Iniciar Ses/i, { timeout: 10000 }).should("be.visible").click();

    cy.origin(
      keycloakOrigin2!,
      { args: { username: keycloakUsername2, password: keycloakPassword2 } },
      ({ username, password }) => {
        cy.get("form:visible").within(() => {
          cy.get("input#username, input[name='username']")
            .first()
            .clear()
            .type(username, { log: false });
          cy.get("input#password, input[name='password']")
            .first()
            .clear()
            .type(password, { log: false });
          cy.get("input#kc-login, button[type='submit']").first().click();
        });
      }
    );

    cy.get('[aria-label="profile"]', { timeout: 30000 }).should("be.visible");

    cy.visit(contactUrl2);

    cy.contains(/Reserv.*tu turno/i, { timeout: 10000 }).should("be.visible");
    selectFirstAvailableSlot();

    cy.contains("button", /^Solicitar Turno$/).scrollIntoView().click();

    cy.contains("Solicitud enviada", { timeout: 20000 }).should("be.visible");
    cy.contains("Tu turno quedó en espera de confirmación.", { timeout: 20000 }).should("be.visible");
    cy.contains("button", /^Ok$/i).click();
  });
});
