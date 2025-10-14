// ACOMODAR PORQUE USA MOCKS
const appointmentsUrl = "http://localhost:5173/appointments";

const adminUsername = Cypress.env("adminUsername") ?? "admin";
const adminEmail = Cypress.env("adminEmail") ?? `${adminUsername}@test.com`;
const adminFirstName = Cypress.env("adminFirstName") ?? "Admin";
const adminLastName = Cypress.env("adminLastName") ?? "Cypress";

type AvailableSlot = {
  id: number;
  date: string;
  availability: boolean;
};

const adminUser = {
  id: "admin-1",
  firstName: adminFirstName,
  lastName: adminLastName,
  userName: adminUsername,
  email: adminEmail,
  phone: Cypress.env("adminPhone") ?? "123456789",
};

const extractId = (url: string) => {
  const match = url.match(/(\d+)(?:\?.*)?$/);
  return match ? Number(match[1]) : null;
};

const setupAppointmentsBackend = () => {
  let availabilityStore: AvailableSlot[] = [];
  let slotSequence = 1;

  cy.intercept("GET", "**/users/availableAppointments/getAll", (req) => {
    const body = [...availabilityStore].sort((a, b) => a.date.localeCompare(b.date));
    req.reply({ statusCode: 200, body });
  }).as("getAvailabilities");

  cy.intercept("GET", "**/users/availableAppointments/available", (req) => {
    const body = availabilityStore.filter((slot) => slot.availability);
    req.reply({ statusCode: 200, body });
  });

  cy.intercept("GET", "**/users/availableAppointments/unavailable", (req) => {
    const body = availabilityStore.filter((slot) => !slot.availability);
    req.reply({ statusCode: 200, body });
  });

  cy.intercept("GET", "**/users/appointments/status*", (req) => {
    req.reply({ statusCode: 200, body: [] });
  }).as("getAppointmentsStatus");

  cy.intercept("GET", "**/users/appointments/user/*", {
    statusCode: 200,
    body: { data: [] },
  }).as("getUserAppointments");

  cy.intercept("POST", "**/users/availableAppointments/create", (req) => {
    const { date, startTime, endTime } = req.body as {
      date: string;
      startTime: string;
      endTime: string;
    };

    const toMinutes = (value: string) => {
      const [hourStr = "0", minuteStr = "0"] = value.split(":");
      return Number(hourStr) * 60 + Number(minuteStr);
    };

    const start = toMinutes(startTime);
    const end = toMinutes(endTime);

    const generated: AvailableSlot[] = [];

    for (let current = start; current < end; current += 30) {
      const hour = Math.floor(current / 60);
      const minute = current % 60;
      generated.push({
        id: slotSequence++,
        date: `${date}T${String(hour).padStart(2, "0")}:${String(minute).padStart(2, "0")}:00`,
        availability: true,
      });
    }

    const generatedKeys = new Set(generated.map((slot) => slot.date));
    availabilityStore = availabilityStore.filter((slot) => !generatedKeys.has(slot.date));
    availabilityStore = [...availabilityStore, ...generated].sort((a, b) => a.date.localeCompare(b.date));

    req.reply({ statusCode: 201, body: generated });
  }).as("createAvailability");

  cy.intercept("DELETE", "**/users/availableAppointments/delete/*", (req) => {
    const id = extractId(req.url);
    if (id != null) {
      availabilityStore = availabilityStore.filter((slot) => slot.id !== id);
    }
    req.reply({ statusCode: 200, body: {} });
  }).as("deleteAvailability");
};

const setupAdminAuth = () => {
  cy.intercept("GET", "**/users/user/me", {
    statusCode: 200,
    body: adminUser,
  }).as("getMe");

  cy.intercept("POST", "**/users/user/registerRole", {
    statusCode: 200,
    body: {},
  }).as("registerRole");

  cy.intercept("GET", "**/users/user/role/*", {
    statusCode: 200,
    body: ["ADMIN"],
  }).as("getRoles");
};

const setupCatalogStubs = () => {
  const emptyList: any[] = [];

  cy.intercept("GET", "**/properties/property/getAll", {
    statusCode: 200,
    body: emptyList,
  }).as("getAllProperties");

  cy.intercept("GET", "**/properties/property/get", {
    statusCode: 200,
    body: emptyList,
  }).as("getPropertiesCatalog");

  cy.intercept("GET", "**/properties/property/search*", {
    statusCode: 200,
    body: emptyList,
  });

  cy.intercept("GET", "**/properties/property/text*", {
    statusCode: 200,
    body: emptyList,
  });
};

const goToMonth = (monthName: string) => {
  cy.get(".MuiPickersCalendarHeader-label")
    .invoke("text")
    .then((text) => {
      if (!text.toLowerCase().includes(monthName.toLowerCase())) {
        cy.get("button[aria-label='Next month'], button[aria-label='Siguiente mes']")
          .first()
          .click();
        goToMonth(monthName);
      }
    });
};

describe("Integración: Pantalla de turnos con administrador logueado", () => {
  beforeEach(() => {
    cy.clearCookies();
    cy.clearLocalStorage();
    cy.viewport(1280, 720);

    setupAdminAuth();
    setupAppointmentsBackend();
    setupCatalogStubs();

    const adminSession = {
      ...adminUser,
      roles: ["ADMIN"],
      preferences: [],
    };

    cy.visit(appointmentsUrl, {
      onBeforeLoad(win) {
        win.sessionStorage.setItem("authInfo", JSON.stringify(adminSession));
      },
    });

    cy.get("body", { timeout: 1000 }).then(($body) => {
      const normalized = $body
        .text()
        .normalize("NFD")
        .replace(/[\u0300-\u036f]/g, "")
        .toLowerCase();
      if (normalized.includes("ocurrio un error")) {
        cy.wrap($body)
          .contains("button", "Aceptar", { matchCase: false })
          .click();
      }
    });

    cy.wait("@getMe");
    cy.wait("@getRoles");
    cy.wait("@getUserAppointments");
    cy.wait("@getAvailabilities");
  });

  it("genera turnos disponibles para el dia seleccionado", () => {
    cy.url({ timeout: 10000 }).should("include", "/appointments");
    cy.contains("Turnero de Visitas", { timeout: 10000 }).should("be.visible");
    cy.contains("Resumen de Turnos del Día", { timeout: 10000 }).should("be.visible");

    cy.contains("button", "Generar turnos").click();

    cy.get("[role='dialog']").within(() => {
      goToMonth("diciembre");
      cy.contains("button", /^17$/).click({ force: true });

      cy.contains("label", "Desde")
        .parent()
        .find("input")
        .clear()
        .type("09:30");

      cy.contains("label", "Hasta")
        .parent()
        .find("input")
        .clear()
        .type("13:00");

      cy.contains("button", /^Generar$/).should("not.be.disabled").click();
    });

    cy.wait("@createAvailability");

    cy.contains("Turnos generados", { timeout: 10000 }).should("be.visible");
    cy.contains("Se crearon turnos", { timeout: 10000 }).should("be.visible");
    cy.contains("button", "Ok").click();

    cy.get("[role='dialog']")
      .find("button[aria-label='cerrar modal']")
      .click();

    cy.wait("@getAvailabilities");

    cy.scrollTo("top");

    const nextMonthButton = "button[aria-label='Next month'], button[aria-label='Siguiente mes']";
    cy.get(nextMonthButton).first().click();
    cy.get(nextMonthButton).first().click();

    cy.contains("button", /^17$/).click({ force: true });

    cy.contains("Disponible: 7", { timeout: 10000 }).should("be.visible");

    cy.contains("button", "POR DIA").click();
    cy.contains("09:30", { timeout: 10000 }).should("be.visible");
    cy.contains("12:30", { timeout: 10000 }).should("be.visible");
    cy.contains("Libre").should("exist");

    cy.contains("09:30")
      .closest(".MuiPaper-root")
      .click();

    cy.get("[role='dialog']").within(() => {
      cy.contains("Detalle del turno").should("be.visible");
      cy.contains("button", "Eliminar").click();
    });

    cy.contains("button", "Confirmar").click();
    cy.contains("button", "Confirmar").click();

    cy.wait("@deleteAvailability");

    cy.contains("Turno eliminado", { timeout: 10000 }).should("be.visible");
    cy.contains("button", "Ok").click();

    cy.wait("@getAvailabilities");

    cy.contains("Detalle del turno").should("not.exist");

    cy.contains("Disponible: 6", { timeout: 10000 }).should("be.visible");

    cy.contains("button", "POR DIA").click();
    cy.contains("09:30").should("not.exist");
  });
});
