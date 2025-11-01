import { appBaseUrl } from "../support/e2e";
import { interceptGateway } from "../support/intercepts";

const VIEW_TIMEOUT = 60000;

describe("Inquilino - Visualización de contratos", () => {
  beforeEach(() => {
    cy.clearCookies();
    cy.clearLocalStorage();
    cy.viewport(1280, 720);

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
    interceptGateway("GET", "/users/contracts/getByUser/*", "getUserContracts");
    interceptGateway("GET", "/users/contracts/getById/*", "getContractById");
    interceptGateway("GET", "/users/user/getById/*", "getUserById");
    interceptGateway("GET", "/properties/property/getById/*", "getPropertyById");
  });

  it("Permite ingresar al panel de inquilino y abrir el detalle de un contrato", () => {
    cy.loginTenant();
    
    // Esperar que cargue la página principal
    // Nota: puede devolver 401 si la sesión aún no está completamente establecida
    cy.wait("@getCurrentUser", { timeout: 15000 }).its("response.statusCode").should("be.oneOf", [200, 401]);
    
    // Esperar MÚLTIPLES intentos de obtener roles (el AuthContext hace retries)
    // Vamos a esperar al menos uno que sea exitoso
    let rolesReceived: string[] = [];
    
    // Interceptar TODOS los intentos de getRoles hasta que tengamos roles válidos
    cy.wait("@getUserRole", { timeout: 15000 }).then((interception) => {
      rolesReceived = interception.response?.body || [];
      
      // Si el primer intento no tiene roles, esperar más intentos
      if (rolesReceived.length === 0) {
        cy.wait("@getUserRole", { timeout: 15000 }).then((int2) => {
          rolesReceived = int2.response?.body || rolesReceived;
        });
      }
    });
    
    // Esperar otros recursos
    cy.wait("@getAmenities", { timeout: 15000 }).its("response.statusCode").should("be.within", 200, 299);
    cy.wait("@getTypes", { timeout: 15000 }).its("response.statusCode").should("be.within", 200, 299);
    cy.wait("@getNeighborhoods", { timeout: 15000 }).its("response.statusCode").should("be.within", 200, 299);

    // Esperar MÁS TIEMPO para que AuthContext complete todos los retries (5 intentos x 700ms = 3.5s)
    // + tiempo de procesamiento + actualización de React state
    cy.wait(6000);
    
    // Verificar que AuthContext guardó correctamente la info en sessionStorage
    cy.window().then((win) => {
      const authInfoStr = win.sessionStorage.getItem('authInfo');
      
      if (!authInfoStr) {
        throw new Error("❌ authInfo NO existe en sessionStorage. El AuthContext no guardó la información del usuario.");
      }
      
      const authInfo = JSON.parse(authInfoStr);
      
      if (!authInfo.roles || authInfo.roles.length === 0) {
        throw new Error(`❌ authInfo NO tiene roles. AuthInfo completo: ${JSON.stringify(authInfo)}`);
      }
      
      const rolesLower = authInfo.roles.map((r: string) => r.toLowerCase());
      
      if (!rolesLower.includes("tenant")) {
        throw new Error(`❌ authInfo NO contiene el rol 'tenant'. Roles encontrados: ${JSON.stringify(authInfo.roles)}`);
      }
      
      // Si llegamos aquí, todo está bien
      cy.log(`✅ Roles correctos en sessionStorage: ${JSON.stringify(authInfo.roles)}`);
    });
    
    // Buscar el botón por data-testid (más confiable que por texto)
    // Intenta primero por testid, si falla intenta por aria-label
    cy.get('body').then(($body) => {
      if ($body.find('[data-testid="tenant-contracts-button"]').length > 0 || 
          $body.find('[data-testid="tenant-contracts-button-desktop"]').length > 0) {
        // Encontrado por testid
        cy.get('[data-testid="tenant-contracts-button"], [data-testid="tenant-contracts-button-desktop"]')
          .should("be.visible")
          .first()
          .click({ force: true });
      } else {
        // Fallback: buscar por aria-label="tenant"
        cy.get('[aria-label="tenant"]')
          .should("be.visible")
          .click({ force: true });
      }
    });

    // Esperar navegación y carga de contratos
    cy.wait("@getUserContracts", { timeout: 15000 }).its("response.statusCode").should("be.within", 200, 299);
    cy.location("pathname", { timeout: VIEW_TIMEOUT }).should("include", "/contract");
    
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
