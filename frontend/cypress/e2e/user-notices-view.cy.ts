import { appBaseUrl } from "../support/e2e";

describe("Noticias: Visualización desde usuario normal", () => {
  const noticiaEjemplo = {
    titulo: "noticia 1", // una que ya exista
  };

  beforeEach(() => {
    cy.clearCookies();
    cy.clearLocalStorage();
    cy.viewport(1280, 720);

    cy.visit(appBaseUrl);
  });

  it("Permite ver las noticias y acceder al detalle", () => {
    // abrir sección Noticias
    cy.get("[data-testid='navbar-news']").should("be.visible").click();

    // verificar que hay noticias cargadas
    cy.get(".MuiCard-root", { timeout: 10000 })
      .should("exist")
      .and("have.length.greaterThan", 0);

    // buscar la noticia de prueba o la primera
    cy.contains(".MuiCard-root", noticiaEjemplo.titulo)
      .should("exist")
      .click();

    // verificar detalle visible
    cy.get("h4").should("be.visible");
    cy.contains(noticiaEjemplo.titulo).should("be.visible");
    cy.get("button").contains("Volver").should("be.visible");

  });
});
