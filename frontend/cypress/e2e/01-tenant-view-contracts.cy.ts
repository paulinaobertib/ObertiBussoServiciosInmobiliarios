import { appBaseUrl } from "../support/e2e";
import { buildGatewayUrl, interceptGateway } from "../support/intercepts";

const VIEW_TIMEOUT = 60000;

const TENANT_EMAIL = "tenant@test.com";

// el inquilino necesita un contrato activo propio; la base de integración persiste entre corridas,
// así que si no lo tiene se crea uno (como admin) en una propiedad que no use otro test
const ensureTenantContract = () => {
  cy.loginAdmin();
  cy.request(buildGatewayUrl("/users/user/getAll")).then((usersResp) => {
    const users: any[] = Array.isArray(usersResp.body) ? usersResp.body : [];
    const tenant = users.find((u) => String(u?.email).toLowerCase() === TENANT_EMAIL);
    expect(tenant, `usuario ${TENANT_EMAIL}`).to.exist;

    cy.request(buildGatewayUrl("/users/contracts/getAll")).then((contractsResp) => {
      const contracts: any[] = Array.isArray(contractsResp.body) ? contractsResp.body : [];
      const hasActive = contracts.some((c) => c.userId === tenant.id && String(c.contractStatus) === "ACTIVO");
      if (hasActive) return;

      const busy = new Set(
        contracts.filter((c) => String(c.contractStatus) === "ACTIVO").map((c) => Number(c.propertyId))
      );
      cy.request(buildGatewayUrl("/properties/property/getAll")).then((propsResp) => {
        const props: any[] = Array.isArray(propsResp.body) ? propsResp.body : [];
        // "Propiedad A" la usa el CRUD de contratos y "Propiedad Cypress" el CRUD de propiedades;
        // se prefiere una que no esté DISPONIBLE para no cambiar lo que ven los otros tests
        const candidates = props
          .filter((p) => !busy.has(Number(p.id)) && !/Propiedad A|Cypress/i.test(String(p?.title ?? "")))
          .sort((a, b) => Number(a.status === "DISPONIBLE") - Number(b.status === "DISPONIBLE"));
        const property = candidates[0];
        expect(property, "propiedad libre para el contrato del inquilino").to.exist;

        cy.request(buildGatewayUrl("/users/increaseIndex/getAll")).then((idxResp) => {
          const indexId = Array.isArray(idxResp.body) && idxResp.body.length ? idxResp.body[0].id : null;
          const today = new Date();
          const iso = (d: Date) => d.toISOString().slice(0, 10);
          const end = new Date(today);
          end.setFullYear(today.getFullYear() + 2);

          cy.request({
            method: "POST",
            url: buildGatewayUrl("/users/contracts/create"),
            body: {
              userId: tenant.id,
              propertyId: property.id,
              contractType: "VIVIENDA",
              contractStatus: "ACTIVO",
              startDate: iso(today),
              endDate: iso(end),
              currency: "ARS",
              initialAmount: 100000,
              adjustmentFrequencyMonths: 6,
              adjustmentIndexId: indexId,
              lastPaidAmount: null,
              lastPaidDate: null,
              note: "Contrato de prueba para el inquilino (e2e)",
              hasDeposit: false,
              depositAmount: null,
              depositNote: null,
              guarantorsIds: [],
            },
          })
            .its("status")
            .should("be.within", 200, 299);
        });
      });
    });
  });
};

describe("Inquilino - Visualización de contratos", () => {
  before(() => {
    cy.clearAllCookies();
    cy.clearAllLocalStorage();
    ensureTenantContract();
    // la sesión del admin vive en el dominio del gateway: clearCookies() solo limpia el dominio actual
    cy.clearAllCookies();
    cy.clearAllLocalStorage();
    cy.clearAllSessionStorage();
  });

  beforeEach(() => {
    cy.clearAllCookies();
    cy.clearAllLocalStorage();
    cy.viewport(1280, 720);

    // Interceptar todas las llamadas API
    interceptGateway("GET", "/properties/property/get", "getProperties");
    interceptGateway("GET", "/users/user/me", "getCurrentUser");
    interceptGateway("POST", "/users/user/registerRole", "registerRole");
    interceptGateway("GET", "/users/user/role/*", "getUserRole");
    interceptGateway("GET", "/users/preference/user/*", "getUserPreferences");
    interceptGateway("GET", "/users/contracts/getByUser/*", "getUserContracts");
    interceptGateway("GET", "/users/contracts/getById/*", "getContractById");
    interceptGateway("GET", "/users/user/getById/*", "getUserById");
    interceptGateway("GET", "/properties/property/getById/*", "getPropertyById");
    interceptGateway("GET", "/users/portalAccess/me", "getPortalAccess");
  });

  it("Permite ingresar al panel de inquilino y abrir el detalle de un contrato", () => {
    cy.loginTenant();
    // No need to visit again - loginTenant already navigates to /
    
    // Esperar que cargue la página principal
    cy.wait("@getCurrentUser", { timeout: 15000 }).its("response.statusCode").should("be.oneOf", [200, 401]);
    // Esperar a que la página principal se renderice completamente antes de buscar el botón
    cy.wait(5000);
    
    // Verificar que el botón esté visible antes de hacer click
    cy.contains("button, a, span", /Soy Inquilino/i, { timeout: VIEW_TIMEOUT })
      .should("be.visible")
      .should("not.be.disabled")
      .then(($btn) => {
        cy.wrap($btn).click({ force: true });
      });

    // Esperar navegación y carga de contratos
    cy.wait("@getUserContracts", { timeout: 15000 }).its("response.statusCode").should("be.within", 200, 299);
    // "Soy Inquilino" abre el portal del inquilino (contratos y/o recibos según lo habilitado)
    cy.location("pathname", { timeout: VIEW_TIMEOUT }).should("include", "/tenant");
    
    // Esperar a que la lista de contratos se renderice
    cy.wait(800);

    cy.contains("button", /Ver detalles/i, { timeout: VIEW_TIMEOUT })
      .should("be.visible")
      .then(($btn) => cy.wrap($btn).click({ force: true }));

    // Esperar carga del detalle del contrato
    cy.wait("@getContractById", { timeout: 15000 }).its("response.statusCode").should("be.within", 200, 299);
    cy.wait("@getUserById", { timeout: 15000 }).its("response.statusCode").should("be.within", 200, 299);
    cy.wait("@getPropertyById", { timeout: 15000 }).its("response.statusCode").should("be.within", 200, 299);
    
    // Esperar a que el detalle se renderice
    cy.wait(500);

    cy.location("pathname", { timeout: VIEW_TIMEOUT }).should("match", /\/contracts?\/\d+$/);
    cy.contains("Detalle de Contrato", { timeout: VIEW_TIMEOUT }).should("be.visible");
  });
});
