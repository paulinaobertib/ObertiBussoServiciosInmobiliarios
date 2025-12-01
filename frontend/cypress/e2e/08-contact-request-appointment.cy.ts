import { appBaseUrl } from "../support/e2e";
import { interceptGateway } from "../support/intercepts";

const contactUrl2 = `${appBaseUrl}/contact`;
const nextMonthButtonSelector2 = "button[aria-label='Next month'], button[aria-label='Siguiente mes']";
const keycloakUrl2 = Cypress.env("keycloakUrl");
const keycloakOrigin2 = keycloakUrl2 ? new URL(keycloakUrl2).origin : null;
// Credenciales del realm de integración para usuario regular
const keycloakUsername2 = "user";
const keycloakPassword2 = "Usuario1.";

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

const selectFirstAvailableSlot = () => {
  cy.contains(/Seleccion.*un d[ií]a/i, { timeout: 10000 }).should("be.visible");

  // Esperar que se carguen los turnos disponibles primero
  cy.wait("@getAvailableAppointments", { timeout: 15000 }).its("response.statusCode").should("be.within", 200, 299);

  // Esperar a que el calendario se renderice completamente
  cy.wait(800);

  const today = new Date();
  const tomorrow = new Date(today);
  tomorrow.setDate(today.getDate() + 1);

  const currentMonth = today.getMonth();
  const tomorrowMonth = tomorrow.getMonth();
  const tomorrowDay = tomorrow.getDate();

  // Si mañana está en el mes siguiente, hacer clic en "siguiente mes"
  if (tomorrowMonth !== currentMonth) {
    cy.get(nextMonthButtonSelector2, { timeout: 10000 }).should("be.visible").click({ force: true });

    // Esperar a que el calendario cambie de mes
    cy.wait(500);
  }

  // Buscar un día habilitado >= mañana (evitar fines de semana: 0=domingo, 6=sábado)
  cy.get("button.MuiPickersDay-root:visible:not(.Mui-disabled)", { timeout: 10000 }).then(($buttons) => {
    let selectedButton = $buttons.first();

    for (let i = 0; i < $buttons.length; i++) {
      const dayText = $buttons.eq(i).text().trim();
      const day = parseInt(dayText);

      if (day >= tomorrowDay) {
        selectedButton = $buttons.eq(i);
        break;
      }
    }

    cy.wrap(selectedButton).as("firstAvailableDay").click({ force: true });
  });

  cy.get("@firstAvailableDay").should("have.class", "Mui-selected");

  // Esperar que se carguen los horarios después de seleccionar el día
  cy.wait("@getAvailableAppointments", { timeout: 15000 }).its("response.statusCode").should("be.within", 200, 299);

  // Esperar a que los slots se rendericen
  cy.wait(800);

  // Seleccionar el primer horario disponible
  cy.contains("button:enabled", /^\d{2}:\d{2}$/, { timeout: 10000 })
    .first()
    .as("slotButton");

  cy.get("@slotButton").should("be.visible").click();
};

describe("Reserva de turno - Usuario no autenticado", () => {
  before(function () {
    // Ya no necesitamos verificar variables de entorno, usamos credenciales hardcoded
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

  it("Redirige a login y completa reserva tras autenticación", () => {
    // Esperar carga inicial
    cy.wait("@getAvailableAppointments", { timeout: 15000 }).its("response.statusCode").should("be.within", 200, 299);
    cy.wait("@getCurrentUser", { timeout: 15000 }).its("response.statusCode").should("be.oneOf", [200, 401]);

    // Esperar a que la página de contacto se renderice completamente
    cy.wait(800);
    cy.contains(/Reserv.*tu turno/i, { timeout: 10000 }).should("be.visible");
    selectFirstAvailableSlot();

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

    // Esperar a que la app se estabilice después del login
    cy.wait(1000);

    cy.visit(contactUrl2);

    // Esperar carga de contacto autenticado
    cy.wait("@getUserAppointments", { timeout: 15000 }).its("response.statusCode").should("be.within", 200, 299);
    cy.wait("@getAvailableAppointments", { timeout: 15000 }).its("response.statusCode").should("be.within", 200, 299);
    cy.wait("@getUserFavorites", { timeout: 15000 }).its("response.statusCode").should("be.within", 200, 299);

    // Esperar a que la página de contacto se renderice completamente
    cy.wait(800);
    cy.contains(/Reserv.*tu turno/i, { timeout: 10000 }).should("be.visible");
    selectFirstAvailableSlot();

    // Esperar segunda carga de slots
    cy.wait("@getAvailableAppointments", { timeout: 15000 }).its("response.statusCode").should("be.within", 200, 299);

    // Esperar a que los slots se rendericen después de la segunda selección
    cy.wait(500);

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

    // Esperar a que el diálogo se cierre completamente
    cy.wait(800);

    // Navegar directamente a la ruta de perfil/turnos
    cy.visit(`${appBaseUrl}/profile`, { timeout: 15000 });

    // Esperar a que la página de perfil se renderice
    cy.wait(1000);

    // Click en el botón "Mis Turnos" para abrir la sección
    cy.contains("button, a, li", /Mis Turnos/i, { timeout: 10000 })
      .should("be.visible")
      .then(($btn) => cy.wrap($btn).click());

    // Esperar que se carguen los turnos después de hacer click
    cy.wait("@getUserAppointments", { timeout: 15000 }).its("response.statusCode").should("be.within", 200, 299);

    // Esperar a que la sección se renderice
    cy.wait(800);

    // Buscar y hacer click en el primer botón "Cancelar"
    cy.contains("button", /^Cancelar$/i, { timeout: 10000 })
      .first()
      .should("be.visible")
      .then(($btn) => cy.wrap($btn).click());

    // Esperar que aparezca el modal de confirmación (usar .last() para obtener el diálogo más reciente)
    cy.get('.MuiDialog-root, [role="dialog"]', { timeout: 10000 }).last().should("be.visible");

    // Confirmar la cancelación en el diálogo (usar .last() para trabajar con el diálogo más reciente)
    cy.get('.MuiDialog-root, [role="dialog"]')
      .last()
      .within(() => {
        cy.contains("button", /^Confirmar$/i, { timeout: 10000 })
          .should("be.visible")
          .then(($btn) => cy.wrap($btn).click());
      });

    // Segunda confirmación (doble confirmación como en eliminar propiedad)
    cy.get('.MuiDialog-root, [role="dialog"]', { timeout: 10000 }).last().should("be.visible");
    cy.get('.MuiDialog-root, [role="dialog"]')
      .last()
      .within(() => {
        cy.contains("button", /^Confirmar$/i, { timeout: 10000 })
          .should("be.visible")
          .then(($btn) => cy.wrap($btn).click());
      });

    // Esperar que se elimine el turno
    cy.wait("@deleteAppointment", { timeout: 15000 }).its("response.statusCode").should("be.within", 200, 299);

    // Cerrar el diálogo de confirmación de eliminación exitosa
    cy.get('.MuiDialog-root, [role="dialog"]', { timeout: 10000 }).last().should("be.visible");
    cy.get('.MuiDialog-root, [role="dialog"]')
      .last()
      .within(() => {
        cy.contains("button", /^(Ok|Aceptar|Cerrar)$/i, { timeout: 10000 })
          .should("be.visible")
          .then(($btn) => cy.wrap($btn).click());
      });
  });
});
