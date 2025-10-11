import { appBaseUrl } from "../support/e2e";

describe("Noticias: Crear, ver detalle, editar y eliminar", () => {
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

    cy.loginAdmin(); // ya incluye el visit y espera al redirect

    // esperar a que aparezca el navbar
    cy.get("[data-testid='navbar-admin-panel']", { timeout: 10000 })
      .should("be.visible")
      .click();

    cy.contains("Noticias").click();
  });

  it("crea, navega al detalle, edita y elimina la noticia", () => {
    // ----- CREAR -----
    cy.contains("button", "Nueva noticia").click();

    cy.get("[data-testid='input-titulo']").type(noticia.titulo);
    cy.get("[data-testid='input-descripcion']").type(noticia.descripcion);

    cy.get("[data-testid='input-imagen']").attachFile(noticia.imagen);

    cy.contains("button", "Crear").should("not.be.disabled").click();

    cy.contains("Aviso creado", { timeout: 10000 }).should("be.visible");
    cy.contains("button", "Ok").click();

    cy.contains(".MuiCard-root", noticia.titulo, { timeout: 10000 })
      .should("exist")
      .click();

    cy.contains("h4", noticia.titulo).should("be.visible");
    cy.contains("button", "Volver").click();
    cy.contains(".MuiCard-root", noticia.titulo).should("exist");

    // ----- EDITAR -----
    cy.contains(".MuiCard-root", noticia.titulo).within(() => {
      cy.get('button[aria-label="Editar noticia"]').click();
    });

    cy.get("[data-testid='input-titulo']")
      .clear()
      .type(noticiaEditada.titulo);
    cy.get("[data-testid='input-descripcion']")
      .clear()
      .type(noticiaEditada.descripcion);

    cy.contains("button", "Guardar").should("not.be.disabled").click();

    cy.contains("Aviso actualizado", { timeout: 10000 }).should("be.visible");
    cy.contains("button", "Ok").click();

    cy.contains(".MuiCard-root", noticiaEditada.titulo, {
      timeout: 10000,
    }).should("exist");

    // ----- ELIMINAR -----
    cy.contains(".MuiCard-root", noticiaEditada.titulo).within(() => {
      cy.get('button[aria-label="Eliminar noticia"]').click();
    });

    // doble confirmación
    cy.contains("button", "Confirmar").click();
    cy.contains("button", "Confirmar").click();

    // alerta de éxito
    cy.contains("Aviso eliminado", { timeout: 10000 }).should("be.visible");
    cy.contains("button", "Ok").click();

    // verificar que ya no esté en catálogo
    cy.contains(".MuiCard-root", noticiaEditada.titulo).should("not.exist");
  });
});
