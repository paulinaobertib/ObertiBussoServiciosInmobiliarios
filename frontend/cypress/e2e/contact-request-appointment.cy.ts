import { appBaseUrl } from "../support/e2e";
import { interceptGateway } from "../support/intercepts";

const contactUrl2 = `${appBaseUrl}/contact`;
const nextMonthButtonSelector2 = "button[aria-label='Next month'], button[aria-label='Siguiente mes']";
const keycloakUrl2 = Cypress.env("keycloakUrl");
const keycloakOrigin2 = keycloakUrl2 ? new URL(keycloakUrl2).origin : null;
const keycloakUsername2 = Cypress.env("keycloakUsername");
const keycloakPassword2 = Cypress.env("keycloakPassword");

const MONTH_LABELS = [
  "enero",
  "febrero",
  "marzo",
  "abril",
  "mayo",
  "junio",
  "julio",
  "agosto",
  "septiembre",
  "octubre",
  "noviembre",
  "diciembre",
];

// Calcular el día siguiente (debe coincidir con los turnos generados por el admin)
const targetDate = new Date();
targetDate.setDate(targetDate.getDate() + 1);
const targetDay = targetDate.getDate();
const targetMonth = targetDate.getMonth();
const targetMonthName = MONTH_LABELS[targetMonth];

const selectFirstAvailableSlot = () => {
  cy.contains(/Seleccion.*un d[ií]a/i, { timeout: 10000 }).should("be.visible");

  // Navegar al mes objetivo
  const currentMonth = new Date().getMonth();
  let monthsToAdvance = targetMonth - currentMonth;
  if (monthsToAdvance < 0) monthsToAdvance += 12;

  for (let i = 0; i < monthsToAdvance; i++) {
    cy.get(nextMonthButtonSelector2).last().click();
  }

  cy.get(".MuiPickersCalendarHeader-label", { timeout: 10000 }).should("contain.text", targetMonthName);

  // Seleccionar el día calculado
  cy.contains("button", new RegExp(`^${targetDay}$`)).as("selectedDay");
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
    interceptGateway("GET", "/users/availableAppointments/getAll", "getAvailableAppointments");
    interceptGateway("GET", "/users/appointments/user/*", "getUserAppointments");
    interceptGateway("POST", "/users/appointments/create", "createAppointment");
    interceptGateway("DELETE", "/users/appointments/delete/*", "deleteAppointment");

    cy.visit(contactUrl2);
  });

  it("Solicita login si no hay sesión y permite completar la reserva tras autenticarse", () => {
    // Esperar carga inicial
    cy.wait("@getAvailableAppointments", { timeout: 15000 }).its("response.statusCode").should("be.within", 200, 299);
    cy.wait("@getCurrentUser", { timeout: 15000 }).its("response.statusCode").should("be.oneOf", [200, 401]);

    cy.contains(/Reserv.*tu turno/i, { timeout: 10000 }).should("be.visible");
    selectFirstAvailableSlot();

    // Esperar carga de slots disponibles
    cy.wait("@getAvailableAppointments", { timeout: 15000 }).its("response.statusCode").should("be.within", 200, 299);

    cy.contains("button", /^Solicitar Turno$/)
      .scrollIntoView()
      .click();

    cy.contains(/Debes iniciar sesi.n para solicitar un turno/i, { timeout: 10000 }).should("be.visible");
    cy.contains("button", "Aceptar").click();

    cy.contains("button", /Iniciar Ses/i, { timeout: 10000 })
      .should("be.visible")
      .click();

    cy.origin(
      keycloakOrigin2!,
      { args: { username: keycloakUsername2, password: keycloakPassword2 } },
      ({ username, password }) => {
        cy.get("form:visible").within(() => {
          cy.get("input#username, input[name='username']").first().clear().type(username, { log: false });
          cy.get("input#password, input[name='password']").first().clear().type(password, { log: false });
          cy.get("input#kc-login, button[type='submit']").first().click();
        });
      }
    );

    // Esperar autenticación exitosa
    cy.wait("@getAmenities", { timeout: 15000 }).its("response.statusCode").should("be.within", 200, 299);
    cy.wait("@getCurrentUser", { timeout: 15000 }).its("response.statusCode").should("be.within", 200, 299);
    cy.wait("@registerRole", { timeout: 15000 }).its("response.statusCode").should("be.within", 200, 299);
    cy.wait("@getUserRole", { timeout: 15000 }).its("response.statusCode").should("be.within", 200, 299);
    cy.wait("@getUserPreferences", { timeout: 15000 }).its("response.statusCode").should("be.within", 200, 299);

    cy.get('[aria-label="profile"]', { timeout: 30000 }).should("be.visible");

    cy.visit(contactUrl2);

    // Esperar carga de contacto autenticado
    cy.wait("@getUserAppointments", { timeout: 15000 }).its("response.statusCode").should("be.within", 200, 299);
    cy.wait("@getAvailableAppointments", { timeout: 15000 }).its("response.statusCode").should("be.within", 200, 299);
    cy.wait("@getUserFavorites", { timeout: 15000 }).its("response.statusCode").should("be.within", 200, 299);

    cy.contains(/Reserv.*tu turno/i, { timeout: 10000 }).should("be.visible");
    selectFirstAvailableSlot();

    // Esperar segunda carga de slots
    cy.wait("@getAvailableAppointments", { timeout: 15000 }).its("response.statusCode").should("be.within", 200, 299);

    cy.contains("button", /^Solicitar Turno$/)
      .scrollIntoView()
      .click();

    // Esperar creación del turno
    cy.wait("@createAppointment", { timeout: 15000 }).its("response.statusCode").should("be.within", 200, 299);

    cy.contains("Solicitud enviada", { timeout: 20000 }).should("be.visible");
    cy.contains("Tu turno quedó en espera de confirmación.", { timeout: 20000 }).should("be.visible");
    cy.contains("button", /^Ok$/i).click();

    // Esperar que se cierre el diálogo
    cy.wait("@getAvailableAppointments", { timeout: 15000 }).its("response.statusCode").should("be.within", 200, 299);

    // Navegar directamente a la ruta de perfil/turnos
    cy.visit(`${appBaseUrl}/profile`, { timeout: 15000 });

    // Esperar carga de los turnos del usuario
    cy.wait("@getUserAppointments", { timeout: 15000 }).its("response.statusCode").should("be.within", 200, 299);

    // Click en el botón "Mis Turnos" para abrir la sección
    cy.contains("button, a, li", /Mis Turnos/i, { timeout: 10000 })
      .should("be.visible")
      .then(($btn) => cy.wrap($btn).click());

    // Buscar y hacer click en el primer botón "Cancelar"
    cy.contains("button", /^Cancelar$/i, { timeout: 10000 })
      .first()
      .should("be.visible")
      .then(($btn) => cy.wrap($btn).click());

    // Esperar que aparezca el modal de confirmación (usar .last() para obtener el diálogo más reciente)
    cy.get('.MuiDialog-root, [role="dialog"]', { timeout: 10000 }).last().should("be.visible");

    // Confirmar la cancelación en el diálogo (usar .last() para trabajar con el diálogo más reciente)
    cy.get('.MuiDialog-root, [role="dialog"]').last().within(() => {
      cy.contains("button", /^Confirmar$/i, { timeout: 10000 })
        .should("be.visible")
        .then(($btn) => cy.wrap($btn).click());
    });

    // Segunda confirmación (doble confirmación como en eliminar propiedad)
    cy.get('.MuiDialog-root, [role="dialog"]', { timeout: 10000 }).last().should("be.visible");
    cy.get('.MuiDialog-root, [role="dialog"]').last().within(() => {
      cy.contains("button", /^Confirmar$/i, { timeout: 10000 })
        .should("be.visible")
        .then(($btn) => cy.wrap($btn).click());
    });

    // Esperar que se elimine el turno
    cy.wait("@deleteAppointment", { timeout: 15000 }).its("response.statusCode").should("be.within", 200, 299);

    // Cerrar el diálogo de confirmación de eliminación exitosa
    cy.get('.MuiDialog-root, [role="dialog"]', { timeout: 10000 }).last().should("be.visible");
    cy.get('.MuiDialog-root, [role="dialog"]').last().within(() => {
      cy.contains("button", /^(Ok|Aceptar|Cerrar)$/i, { timeout: 10000 })
        .should("be.visible")
        .then(($btn) => cy.wrap($btn).click());
    });
  });
});
