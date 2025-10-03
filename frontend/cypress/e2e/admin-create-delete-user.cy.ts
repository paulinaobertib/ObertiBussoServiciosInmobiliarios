const appBaseUrl = Cypress.env("appUrl");

describe("Integración: Crear y eliminar usuario siendo administrador", () => {
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

    // login como admin
    cy.loginAdmin();
    cy.visit(appBaseUrl);

    // ir al panel de administración desde el navbar
    cy.get("[data-testid='navbar-admin-panel']", { timeout: 10000 })
      .should("be.visible")
      .click();

    // entrar a la sección de usuarios
    cy.contains("Usuarios").click();

    // esperar a que cargue la grilla
    cy.get('[role="grid"]', { timeout: 10000 }).should("be.visible");
  });

  it("Crea un nuevo usuario si no existe", () => {
    // si ya existe, lo eliminamos antes
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

    // ----- CREAR -----
    cy.get("[data-testid='add-usuario-button']").click();

    cy.get("[data-testid='input-username']").type(testUser.username);
    cy.get("[data-testid='input-email']").type(testUser.email);
    cy.get("[data-testid='input-firstName']").type(testUser.firstName);
    cy.get("[data-testid='input-lastName']").type(testUser.lastName);
    cy.get("[data-testid='input-phone']").type(testUser.phone);

    cy.contains("button", "Crear usuario").should("not.be.disabled").click();

    cy.contains("Usuario creado", { timeout: 10000 }).should("be.visible");
    cy.contains("button", "Volver").click();

    // verificar que aparece en la grilla
    cy.contains('[role="gridcell"]', testUser.email, { timeout: 10000 }).should("exist");
  });

  it("Elimina un usuario existente", () => {
    // asegurarse que existe antes de eliminar
    cy.contains("body", testUser.email).then(($el) => {
      if ($el.length === 0) {
        // crear el usuario si no existe
        cy.get("[data-testid='add-usuario-button']").click();

        cy.get("[data-testid='input-username']").type(testUser.username);
        cy.get("[data-testid='input-email']").type(testUser.email);
        cy.get("[data-testid='input-firstName']").type(testUser.firstName);
        cy.get("[data-testid='input-lastName']").type(testUser.lastName);
        cy.get("[data-testid='input-phone']").type(testUser.phone);

        cy.contains("button", "Crear usuario").should("not.be.disabled").click();
        cy.contains("Usuario creado", { timeout: 10000 }).should("be.visible");
        cy.contains("button", "Volver").click();
      }
    });

    // ----- ELIMINAR -----
    cy.contains('[role="row"]', testUser.email).within(() => {
      cy.get('button[title="Eliminar"]').click();
    });

    cy.contains("Eliminar usuario").should("be.visible");
    cy.contains("button", "Eliminar usuario").click();

    cy.contains("button", "Confirmar").click();
    cy.contains("button", "Confirmar").click();

    cy.contains("Usuario eliminado", { timeout: 10000 }).should("be.visible");
    cy.contains("button", "Volver").click();

    // verificar que ya no está
    cy.contains('[role="gridcell"]', testUser.email).should("not.exist");
  });
});
