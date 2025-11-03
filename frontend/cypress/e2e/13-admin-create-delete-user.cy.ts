import { interceptGateway } from "../support/intercepts";
import { appBaseUrl } from "../support/e2e";

describe("Admin - Gestión de usuarios", () => {
  const testUser = {
    username: "usuarioTest",
    email: "usuario@test.com",
    firstName: "Juan",
    lastName: "Pérez",
    phone: "1234567890",
  };

  beforeEach(() => {
    cy.clearCookies();
    cy.clearLocalStorage();
    cy.viewport(1280, 720);

    interceptGateway("GET", "/users/user/getAll", "getAllUsers");
    interceptGateway("POST", "/users/user/create*", "createUser");
    interceptGateway("DELETE", "/users/user/delete/*", "deleteUser");

    cy.loginAdmin();
    cy.visit(appBaseUrl);

    // Esperar a que la app cargue después del login
    cy.wait(800);

    cy.get("[data-testid='navbar-admin-panel']", { timeout: 10000 })
      .should("be.visible")
      .click();

    cy.contains("Usuarios").click();

    cy.get('[role="grid"]', { timeout: 10000 }).should("be.visible");
    
    // Esperar a que la tabla de usuarios se renderice
    cy.wait(800);
  });

  it("Crea nuevo usuario", () => {
    cy.get("body").then(($body) => {
      const exists = $body
        .find('[role="gridcell"]')
        .filter((i, el) => el.innerText.includes(testUser.email)).length > 0;

      if (exists) {
        cy.contains('[role="row"]', testUser.email).within(() => {
          cy.get('button[title="Eliminar"]').click();
        });
        cy.contains("Eliminar usuario").should("be.visible");
        cy.contains("button", "Eliminar usuario").click();
        cy.contains("button", "Confirmar").click();
        cy.contains("button", "Confirmar").click();
        cy.contains("Usuario eliminado", { timeout: 10000 }).should("be.visible");
        cy.contains("button", "Volver").click();
      }
    });

    cy.get("[data-testid='add-usuario-button']").click();

    cy.get("[data-testid='input-username']").type(testUser.username);
    cy.get("[data-testid='input-email']").type(testUser.email);
    cy.get("[data-testid='input-firstName']").type(testUser.firstName);
    cy.get("[data-testid='input-lastName']").type(testUser.lastName);
    cy.get("[data-testid='input-phone']").type(testUser.phone);

    cy.contains("button", "Crear usuario").should("not.be.disabled").click();

    cy.contains("Usuario creado", { timeout: 10000 }).should("be.visible");
    cy.contains("button", "Volver").click();

    cy.contains('[role="gridcell"]', testUser.email, { timeout: 10000 }).should("exist");
  });

  it("Elimina usuario existente", () => {
    cy.contains("body", testUser.email).then(($el) => {
      if ($el.length === 0) {
        cy.get("[data-testid='add-usuario-button']").click();

        // Esperar a que el formulario se abra
        cy.wait(500);

        cy.get("[data-testid='input-username']").type(testUser.username);
        cy.get("[data-testid='input-email']").type(testUser.email);
        cy.get("[data-testid='input-firstName']").type(testUser.firstName);
        cy.get("[data-testid='input-lastName']").type(testUser.lastName);
        cy.get("[data-testid='input-phone']").type(testUser.phone);

        cy.contains("button", "Crear usuario").should("not.be.disabled").click();
        cy.contains("Usuario creado", { timeout: 10000 }).should("be.visible");
        cy.contains("button", "Volver").click();
        
        // Esperar a que el modal se cierre
        cy.wait(500);
      }
    });

    // Esperar a que la tabla se actualice
    cy.wait(500);

    cy.contains('[role="row"]', testUser.email).within(() => {
      cy.get('button[title="Eliminar"]').click();
    });

    // Esperar a que el modal de confirmación se abra
    cy.wait(500);

    cy.contains("Eliminar usuario").should("be.visible");
    cy.contains("button", "Eliminar usuario").click();

    cy.contains("button", "Confirmar").click();
    cy.contains("button", "Confirmar").click();

    cy.contains("Usuario eliminado", { timeout: 10000 }).should("be.visible");
    cy.contains("button", "Volver").click();

    // Esperar a que la tabla se actualice
    cy.wait(500);

    cy.contains('[role="gridcell"]', testUser.email).should("not.exist");
  });
});
