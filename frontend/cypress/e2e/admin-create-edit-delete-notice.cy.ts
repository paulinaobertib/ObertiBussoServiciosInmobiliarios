import { interceptGateway } from "../support/intercepts";
import { appBaseUrl } from "../support/e2e";

describe("Admin - CRUD de noticias", () => {
  const noticia = {
    titulo: "Noticia Cypress",
    descripcion: "Noticia de prueba creada con Cypress",
    imagen: "prueba.jpg",
  };

  const noticiaEditada = {
    titulo: "Noticia Cypress Editada",
    descripcion: "Noticia editada desde Cypress",
  };

  beforeEach(() => {
    cy.clearCookies();
    cy.clearLocalStorage();
    cy.viewport(1280, 720);

    interceptGateway("GET", "/users/notices/getAll", "getNotices");
    interceptGateway("POST", "/users/notices/create", "createNotice");
    interceptGateway("PUT", "/users/notices/update/*", "updateNotice");
    interceptGateway("DELETE", "/users/notices/delete/*", "deleteNotice");

    cy.loginAdmin();

    // Esperar a que la app cargue después del login
    cy.wait(800);

    // esperar a que aparezca el navbar
    cy.get("[data-testid='navbar-admin-panel']", { timeout: 10000 })
      .should("be.visible")
      .click();

    cy.contains("Noticias").click();
    
    // Esperar a que la lista de noticias se cargue
    cy.wait(800);
  });

  it("Crea, visualiza detalle, edita y elimina noticia", () => {
    // ----- CREAR -----
    cy.contains("button", "Nueva noticia").click();

    // Esperar a que el formulario se abra
    cy.wait(500);

    cy.get("[data-testid='input-titulo']").type(noticia.titulo);
    cy.get("[data-testid='input-descripcion']").type(noticia.descripcion);

    cy.get("[data-testid='input-imagen']").attachFile(noticia.imagen);

    cy.contains("button", "Crear").should("not.be.disabled").click();

    cy.contains("Aviso creado", { timeout: 10000 }).should("be.visible");
    cy.contains("button", "Ok").click();

    // Esperar a que el modal se cierre y la lista se actualice
    cy.wait(800);

    cy.contains(".MuiCard-root", noticia.titulo, { timeout: 10000 })
      .should("exist")
      .click();

    // Esperar a que el detalle se renderice
    cy.wait(500);

    cy.contains("h4", noticia.titulo).should("be.visible");
    cy.contains("button", "Volver").click();
    
    // Esperar a que vuelva a la lista
    cy.wait(500);
    
    cy.contains(".MuiCard-root", noticia.titulo).should("exist");

    cy.contains(".MuiCard-root", noticia.titulo).within(() => {
      cy.get('button[aria-label="Editar noticia"]').click();
    });

    // Esperar a que el formulario de edición se abra
    cy.wait(500);

    cy.get("[data-testid='input-titulo']")
      .clear()
      .type(noticiaEditada.titulo);
    cy.get("[data-testid='input-descripcion']")
      .clear()
      .type(noticiaEditada.descripcion);

    cy.contains("button", "Guardar").should("not.be.disabled").click();

    cy.contains("Aviso actualizado", { timeout: 10000 }).should("be.visible");
    cy.contains("button", "Ok").click();

    // Esperar a que el modal se cierre y la lista se actualice
    cy.wait(800);

    cy.contains(".MuiCard-root", noticiaEditada.titulo, {
      timeout: 10000,
    }).should("exist");

    cy.contains(".MuiCard-root", noticiaEditada.titulo).within(() => {
      cy.get('button[aria-label="Eliminar noticia"]').click();
    });

    // Esperar a que el modal de confirmación se abra
    cy.wait(500);

    cy.contains("button", "Confirmar").click();
    cy.contains("button", "Confirmar").click();

    cy.contains("Aviso eliminado", { timeout: 10000 }).should("be.visible");
    cy.contains("button", "Ok").click();

    // Esperar a que la lista se actualice
    cy.wait(500);

    cy.contains(".MuiCard-root", noticiaEditada.titulo).should("not.exist");
  });
});
