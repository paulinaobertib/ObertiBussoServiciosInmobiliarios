/// <reference types="cypress" />

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
const DECEMBER_INDEX = 11;
const DECEMBER_NAME = "diciembre";
const BASE_DAY = 18;
const MAX_DAY = 31;

type AppointmentState = {
  year: number;
  lastGeneratedDay: number;
};

const sanitize = (value: string) =>
  value
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase()
    .trim();

const parseCalendarHeader = (label: string) => {
  const normalized = sanitize(label).replace(/\s+/g, " ");
  const regex = new RegExp(`(${MONTH_LABELS.join("|")})(?:\\s+de)?\\s+(\\d{4})`);
  const match = normalized.match(regex);

  if (!match) {
    throw new Error(`No se pudo interpretar el encabezado del calendario: "${label}"`);
  }

  const monthName = match[1];
  const year = Number(match[2]);
  const monthIndex = MONTH_LABELS.indexOf(monthName);

  return { monthIndex, year };
};

const moveCalendarTo = (monthIndex: number, year: number) => {
  const headerSelector = ".MuiPickersCalendarHeader-label";
  const nextSelector = "button[aria-label='Next month'], button[aria-label='Siguiente mes']";
  const prevSelector = "button[aria-label='Previous month'], button[aria-label='Mes anterior']";

  cy.get(headerSelector)
    .first()
    .invoke("text")
    .then((label) => {
      const { monthIndex: currentMonth, year: currentYear } = parseCalendarHeader(label);

      if (currentMonth === monthIndex && currentYear === year) {
        return;
      }

      const monthDelta = (year - currentYear) * 12 + (monthIndex - currentMonth);
      const selector = monthDelta > 0 ? nextSelector : prevSelector;
      const steps = Math.abs(monthDelta);

      Cypress._.times(steps, () => {
        cy.get(selector)
          .filter(":visible")
          .first()
          .click();
      });
    })
    .then(() => {
      cy.get(headerSelector)
        .first()
        .invoke("text")
        .then((finalLabel) => {
          const { monthIndex: finalMonth, year: finalYear } = parseCalendarHeader(finalLabel);
          expect(finalMonth, "mes esperado en calendario").to.eq(monthIndex);
          expect(finalYear, "año esperado en calendario").to.eq(year);
        });
    });
};

const selectCalendarDay = (day: number) => {
  const dayLabel = new RegExp(`^${String(day)}$`);

  cy.contains("button.MuiPickersDay-root", dayLabel)
    .filter(":visible")
    .first()
    .should("not.be.disabled")
    .click({ force: true });
};

const setTimeInput = (labelText: string, value: string) => {
  cy.contains("label", labelText)
    .parent()
    .find("input")
    .clear()
    .type(value);
};

const computeDefaultYear = () => {
  const today = new Date();
  const baseDateThisYear = new Date(today.getFullYear(), DECEMBER_INDEX, BASE_DAY);

  if (today <= baseDateThisYear) {
    return baseDateThisYear.getFullYear();
  }

  return baseDateThisYear.getFullYear() + 1;
};

const SLOT_TIMEOUT = 70000;

const getSlotByTime = (timeLabel: RegExp) =>
  cy.contains(".MuiPaper-root", timeLabel, { timeout: SLOT_TIMEOUT }).filter(":visible").first();

describe("Integración: Turnero admin genera turnos reales en diciembre", () => {
  let targetDay = BASE_DAY;
  let targetYear = computeDefaultYear();

  before(function () {
    const requiredEnvVars = ["adminUsername", "adminPassword", "keycloakUrl", "appUrl"];
    const missing = requiredEnvVars.filter((key) => {
      const value = Cypress.env(key);
      return typeof value !== "string" || value.trim().length === 0;
    });

    if (missing.length > 0) {
      cy.log(`Faltan variables de entorno requeridas: ${missing.join(", ")}`);
      this.skip();
      return;
    }

    cy.task("adminAppointments:state:read").then((rawState) => {
      const state = rawState as AppointmentState | null;
      const defaultYear = computeDefaultYear();
      const storedYear = typeof state?.year === "number" ? state.year : defaultYear;
      const storedDay = typeof state?.lastGeneratedDay === "number" ? state.lastGeneratedDay : BASE_DAY - 1;

      let nextYear = storedYear;
      let nextDay = storedDay + 1;

      if (nextDay > MAX_DAY) {
        nextDay = BASE_DAY;
        nextYear += 1;
      }

      if (nextDay < BASE_DAY) {
        nextDay = BASE_DAY;
      }

      if (nextYear < defaultYear) {
        nextYear = defaultYear;
        if (nextDay < BASE_DAY) {
          nextDay = BASE_DAY;
        }
      }

      targetDay = nextDay;
      targetYear = nextYear;

      cy.log(`Generando turnos para ${targetDay} de ${DECEMBER_NAME} de ${targetYear}`);
    });
  });

  beforeEach(() => {
    cy.clearCookies();
    cy.clearLocalStorage();
    cy.viewport(1280, 720);
  });

  afterEach(function () {
    if (this.currentTest?.state !== "passed") {
      return;
    }

    cy.task("adminAppointments:state:write", {
      year: targetYear,
      lastGeneratedDay: targetDay,
    });
  });

  it("Genera turnos disponibles y luego los elimina", () => {
    cy.intercept("GET", "**/users/availableAppointments/getAll").as("getAllSlots");
    cy.intercept("GET", "**/users/appointments/status?status=ESPERA").as("getPendingAppointments");
    cy.intercept("GET", "**/users/appointments/status?status=ACEPTADO").as("getAcceptedAppointments");
    cy.intercept("POST", "**/users/availableAppointments/create").as("createAvailability");
    cy.intercept("DELETE", "**/users/availableAppointments/delete/*").as("deleteAvailability");

    cy.loginAdmin();

    cy.get("header, nav")
      .first()
      .within(() => {
        cy.contains("button", /^Turnero$/i).should("be.visible").click();
      });

    cy.location("pathname", { timeout: 30000 }).should("include", "/appointments");
    cy.contains("Turnero de Visitas", { timeout: 30000 }).should("be.visible");
    cy.wait("@getAllSlots", { timeout: SLOT_TIMEOUT });
    cy.wait("@getPendingAppointments", { timeout: SLOT_TIMEOUT });
    cy.wait("@getAcceptedAppointments", { timeout: SLOT_TIMEOUT });

    moveCalendarTo(DECEMBER_INDEX, targetYear);
    selectCalendarDay(targetDay);

    cy.contains("button", /^Generar turnos$/i).should("be.visible").click();

    cy.get("[role='dialog']").within(() => {
      cy.contains("Generar turnos", { timeout: 10000 }).should("be.visible");

      moveCalendarTo(DECEMBER_INDEX, targetYear);
      selectCalendarDay(targetDay);

      setTimeInput("Desde", "09:00");
      setTimeInput("Hasta", "10:00");

      cy.contains("button", /^Generar$/i).should("be.enabled").click();
    });

    cy.contains("Turnos generados", { timeout: 30000 }).should("be.visible");
    cy.contains("Se crearon turnos", { timeout: 30000 }).should("be.visible");
    cy.contains("button", /^Ok$/i).click();
    cy.wait("@createAvailability", { timeout: SLOT_TIMEOUT })
      .its("response.statusCode")
      .should("be.within", 200, 299);
    cy.wait("@getAllSlots", { timeout: SLOT_TIMEOUT });
    cy.wait("@getPendingAppointments", { timeout: SLOT_TIMEOUT });
    cy.wait("@getAcceptedAppointments", { timeout: SLOT_TIMEOUT });

    cy.contains("Turnos generados").should("not.exist");
    cy.get("[role='dialog']")
      .find("button[aria-label='cerrar modal'], button[aria-label='close']")
      .filter(":visible")
      .first()
      .click({ force: true });
    cy.get("[role='dialog']").should("not.exist");

    moveCalendarTo(DECEMBER_INDEX, targetYear);
    selectCalendarDay(targetDay);

    cy.contains("button", /^POR DIA$/i).click();

    getSlotByTime(/09:00/)
      .should("be.visible")
      .and("contain.text", "Libre");
    getSlotByTime(/09:30/)
      .should("be.visible")
      .and("contain.text", "Libre");

    const confirmDeletion = () => {
      cy.contains("button", /^Confirmar$/i, { timeout: SLOT_TIMEOUT })
        .filter(":visible")
        .first()
        .click();

      cy.contains("button", /^Confirmar$/i, { timeout: SLOT_TIMEOUT })
        .filter(":visible")
        .first()
        .click();

      cy.wait("@deleteAvailability", { timeout: SLOT_TIMEOUT })
        .its("response.statusCode")
        .should("be.within", 200, 299);
      cy.wait("@getAllSlots", { timeout: SLOT_TIMEOUT });
      cy.wait("@getPendingAppointments", { timeout: SLOT_TIMEOUT });
      cy.wait("@getAcceptedAppointments", { timeout: SLOT_TIMEOUT });

      cy.contains("Turno eliminado", { timeout: SLOT_TIMEOUT }).should("be.visible");
      cy.contains("button", /^Ok$/i, { timeout: SLOT_TIMEOUT }).click();
      cy.contains("Turno eliminado", { timeout: SLOT_TIMEOUT }).should("not.exist");
      cy.get("[role='dialog']", { timeout: SLOT_TIMEOUT }).should("not.exist");
    };

    const openSlotDetail = (
      timePattern: RegExp,
      attempts = 3
    ): Cypress.Chainable<JQuery<HTMLElement>> => {
      const tryOpen = (
        remaining: number
      ): Cypress.Chainable<JQuery<HTMLElement>> => {
        return getSlotByTime(timePattern)
          .click()
          .then(() =>
            cy
              .contains("[role='dialog']", "Detalle del turno", { timeout: SLOT_TIMEOUT })
              .filter(":visible")
              .first()
          )
          .then(($dialog) => {
            if ($dialog.length) {
              return cy
                .wrap($dialog)
                .within(() => {
                  cy.contains("button", "Eliminar", {
                    timeout: SLOT_TIMEOUT,
                    matchCase: false,
                  })
                    .should("exist")
                    .and("be.visible")
                    .and("be.enabled");
                })
                .then(() => cy.wrap($dialog));
            }

            if (remaining <= 1) {
              throw new Error(
                `No se pudo abrir el detalle del turno para ${timePattern.toString()}`
              );
            }

            cy.log(
              `El detalle del turno se cerro, reintentando apertura (${remaining - 1} intentos restantes).`
            );

            return cy.wait(500).then(() => tryOpen(remaining - 1));
          });
      };

      return tryOpen(attempts);
    };

    const deleteSlot = (timePattern: RegExp) => {
      openSlotDetail(timePattern).within(() => {
        cy.contains("button", "Eliminar", { timeout: SLOT_TIMEOUT, matchCase: false })
          .should("exist")
          .and("be.visible")
          .and("be.enabled")
          .click();
      });

      confirmDeletion();
      cy.contains(".MuiPaper-root", timePattern, { timeout: SLOT_TIMEOUT }).should("not.exist");
    };

    deleteSlot(/09:00/);
    cy.wait(10000);
    deleteSlot(/09:30/);
    cy.contains("No hay turnos disponibles para esta fecha.", { timeout: SLOT_TIMEOUT }).should("be.visible");
  });
});
