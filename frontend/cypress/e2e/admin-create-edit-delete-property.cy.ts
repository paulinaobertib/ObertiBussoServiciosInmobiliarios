describe("Propiedades: Crear, ver, editar y eliminar desde admin", () => {
  const owner = {
    id: 1,
    firstName: "Laura",
    lastName: "Lopez",
    email: "laura.lopez@test.com",
    phone: "3511234567",
  };

  const neighborhood = {
    id: 10,
    name: "Nueva Córdoba",
    city: "Córdoba",
    type: "ABIERTO",
    latitude: -31.420082,
    longitude: -64.188776,
  };

  const type = {
    id: 5,
    name: "Departamento",
    hasRooms: false,
    hasBedrooms: false,
    hasBathrooms: false,
    hasCoveredArea: false,
  };

  const amenity = {
    id: 3,
    name: "Cochera Cubierta",
  };

  const creationForm = {
    title: "Propiedad Cypress",
    description: "Propiedad generada desde Cypress",
    operation: "VENTA",
    status: "DISPONIBLE",
    currency: "USD",
    price: 150000,
    expenses: 2500,
    area: 120,
    street: "Calle Falsa",
    number: "123",
  };

  const updatedValues = {
    title: "Propiedad Cypress Editada",
    price: 175000,
    description: "Propiedad actualizada desde Cypress",
  };

  let propertiesStore: any[] = [];
  let propertySequence = 1000;

  const extractId = (url: string) => {
    const match = url.match(/\/(\d+)(?:\?.*)?$/);
    return match ? Number(match[1]) : null;
  };

  const setupBackendStubs = () => {
    propertiesStore = [];
    propertySequence = 1000;

    const propertyPayload = () => ({
      title: creationForm.title,
      description: creationForm.description,
      operation: creationForm.operation,
      status: creationForm.status,
      currency: creationForm.currency,
      price: creationForm.price,
      expenses: creationForm.expenses,
      area: creationForm.area,
      coveredArea: 0,
      street: creationForm.street,
      number: creationForm.number,
      rooms: 0,
      bedrooms: 0,
      bathrooms: 0,
      showPrice: true,
      credit: true,
      financing: false,
      outstanding: false,
      owner,
      neighborhood,
      type,
      amenities: [amenity],
      mainImage: "https://static.test/property-main.jpg",
      images: [] as string[],
      date: new Date().toISOString(),
    });

    const replyWithProperties = (req: any) => {
      req.reply({ statusCode: 200, body: propertiesStore });
    };

    cy.intercept("GET", "**/properties/owner/getAll", {
      statusCode: 200,
      body: [owner],
    }).as("getOwners");

    cy.intercept("GET", "**/properties/neighborhood/getAll", {
      statusCode: 200,
      body: [{ id: neighborhood.id, name: neighborhood.name, city: neighborhood.city, type: neighborhood.type }],
    }).as("getNeighborhoods");

    cy.intercept("GET", "**/properties/type/getAll", {
      statusCode: 200,
      body: [type],
    }).as("getTypes");

    cy.intercept("GET", "**/properties/amenity/getAll", {
      statusCode: 200,
      body: [amenity],
    }).as("getAmenities");

    cy.intercept("GET", "**/properties/neighborhood/getById/*", (req) => {
      req.reply({
        statusCode: 200,
        body: {
          id: neighborhood.id,
          name: neighborhood.name,
          city: neighborhood.city,
          type: neighborhood.type,
          latitude: neighborhood.latitude,
          longitude: neighborhood.longitude,
        },
      });
    }).as("getNeighborhoodById");

    cy.intercept("GET", "**/properties/property/getAll", replyWithProperties).as("getProperties");

    cy.intercept("GET", "**/properties/property/get", replyWithProperties).as("getAvailableProperties");

    cy.intercept("GET", "**/properties/property/text*", replyWithProperties);
    cy.intercept("GET", "**/properties/property/search*", replyWithProperties);

    cy.intercept("GET", "**/properties/property/getById/*", (req) => {
      const id = extractId(req.url);
      const property = propertiesStore.find((p) => Number(p.id) === id);
      if (!property) {
        req.reply({ statusCode: 404, body: {} });
        return;
      }
      req.reply({ statusCode: 200, body: property });
    }).as("getPropertyDetail");

    cy.intercept("GET", "**/properties/owner/getByProperty/*", {
      statusCode: 200,
      body: owner,
    }).as("getPropertyOwner");

    cy.intercept("GET", "**/properties/image/getByProperty/*", {
      statusCode: 200,
      body: [] as any[],
    }).as("getPropertyImages");

    cy.intercept("POST", "**/properties/property/create", (req) => {
      const created = {
        id: propertySequence++,
        ...propertyPayload(),
      };
      propertiesStore.push(created);
      req.reply({ statusCode: 201, body: created });
    }).as("createProperty");

    cy.intercept("PUT", "**/properties/property/update/*", (req) => {
      const id = extractId(req.url);
      const index = propertiesStore.findIndex((p) => Number(p.id) === id);
      if (index === -1) {
        req.reply({ statusCode: 404, body: {} });
        return;
      }

      const updated = {
        ...propertiesStore[index],
        title: updatedValues.title,
        price: updatedValues.price,
        description: updatedValues.description,
      };

      propertiesStore[index] = updated;
      req.reply({ statusCode: 200, body: updated });
    }).as("updateProperty");

    cy.intercept("DELETE", "**/properties/property/delete/*", (req) => {
      const id = extractId(req.url);
      propertiesStore = propertiesStore.filter((p) => Number(p.id) !== id);
      req.reply({ statusCode: 200, body: {} });
    }).as("deleteProperty");

    cy.intercept("GET", "https://nominatim.openstreetmap.org/search*", {
      statusCode: 200,
      body: [{ lat: neighborhood.latitude, lon: neighborhood.longitude }],
    }).as("nominatimSearch");

    cy.intercept("GET", "https://nominatim.openstreetmap.org/reverse*", {
      statusCode: 200,
      body: {
        address: { road: creationForm.street, house_number: creationForm.number },
      },
    });

    cy.intercept("GET", /https:\/\/[abc]\.tile\.openstreetmap\.org\/.*/, {
      statusCode: 200,
      body: "",
    });
  };

  const fillTextField = (labelPattern: RegExp, value: string) => {
    cy.contains("label", labelPattern)
      .should("exist")
      .invoke("attr", "for")
      .then((id) => {
        if (!id) {
          throw new Error(`No se encontró input para ${labelPattern}`);
        }
        cy.get(`[id="${id}"]`).clear().type(value);
      });
  };

  const selectOption = (labelPattern: RegExp, optionText: string) => {
    cy.contains("label", labelPattern)
      .should("exist")
      .invoke("attr", "for")
      .then((id) => {
        if (!id) {
          throw new Error(`No se encontró input asociado a ${labelPattern}`);
        }
        cy.get(`[id="${id}"]`)
          .closest(".MuiFormControl-root")
          .find('[role="combobox"],[role="button"]')
          .first()
          .click({ force: true });
      });

    cy.get('ul[role="listbox"]', { timeout: 5000 })
      .should("be.visible")
      .within(() => {
        cy.contains('li[role="option"]', optionText, { matchCase: false })
          .should("be.visible")
          .click();
      });
  };

  const selectRowByText = (text: string) => {
    cy.contains('[role="row"]', text, { timeout: 10000 })
      .should("be.visible")
      .find('input[type="checkbox"]')
      .first()
      .check({ force: true });
  };

  const openCategoryPanel = (labelPattern: RegExp, waitAlias: string) => {
    cy.contains("button", labelPattern).should("be.visible").click();
    cy.wait(waitAlias);
    cy.get('[role="grid"]', { timeout: 10000 }).should("be.visible");
  };

  const openSpeedDialAction = (actionName: "Agregar" | "Editar" | "Eliminar") => {
    cy.get('button[aria-label="Acciones de Propiedad"]', { timeout: 10000 })
      .should("be.visible")
      .click();

    const actionTestId =
      actionName === "Agregar" ? "admin-action-create" : actionName === "Editar" ? "admin-action-edit" : "admin-action-delete";

    cy.get(`[data-testid="${actionTestId}"]`, { timeout: 10000 })
      .should("be.visible")
      .closest("button")
      .click();
  };

  beforeEach(() => {
    setupBackendStubs();

    cy.clearCookies();
    cy.clearLocalStorage();
    cy.viewport(1280, 720);

    cy.loginAdmin();
    cy.wait("@getProperties");
  });

  it("permite crear, ver, editar y eliminar una propiedad", () => {
    openSpeedDialAction("Agregar");
    cy.url().should("include", "/properties/new");

    openCategoryPanel(/^Tipos$/i, "@getTypes");
    selectRowByText(type.name);

    openCategoryPanel(/^Barrios$/i, "@getNeighborhoods");
    selectRowByText(neighborhood.name);

    openCategoryPanel(/^Propietarios$/i, "@getOwners");
    selectRowByText(owner.email);

    openCategoryPanel(/Caracter/i, "@getAmenities");
    selectRowByText(amenity.name);

    cy.contains("button", "Siguiente").should("not.be.disabled").click();

    fillTextField(/T.*tulo/i, creationForm.title);
    selectOption(/Operac/i, "Venta");
    selectOption(/Estado/i, "Disponible");
    selectOption(/Moneda/i, "USD");
    fillTextField(/Precio/i, String(creationForm.price));
    fillTextField(/Descrip/i, creationForm.description);
    fillTextField(/Calle$/i, creationForm.street);
    fillTextField(/N.*mero$/i, creationForm.number);
    fillTextField(/Superficie Total/i, String(creationForm.area));

    cy.get('[data-testid="expensas"]').clear().type(String(creationForm.expenses));
    cy.get('[data-testid="credit-checkbox"]').check({ force: true });

    cy.contains("label", "Imagen principal")
      .find('input[type="file"]')
      .attachFile("prueba.jpg");

    cy.contains("button", "Crear").should("not.be.disabled").click();
    cy.contains("button", "Confirmar").click();
    cy.wait("@createProperty");

    cy.contains("Propiedad creada", { timeout: 10000 }).should("be.visible");
    cy.contains("button", /Volver|Aceptar|Ok/i).click();

    cy.location("pathname", { timeout: 10000 }).should("eq", "/");
    cy.wait("@getProperties");

    cy.contains('[data-testid="favorite-item"]', creationForm.title, { timeout: 10000 })
      .should("exist")
      .click();

    cy.wait("@getPropertyDetail");
    cy.contains(creationForm.title).should("be.visible");
    cy.go("back");

    cy.wait("@getProperties");

    openSpeedDialAction("Editar");
    cy.contains("button", /Ok|Aceptar/).click();

    cy.contains('[data-testid="favorite-item"]', creationForm.title, { timeout: 10000 })
      .should("exist")
      .click();

    cy.wait("@getPropertyDetail");
    cy.wait("@getPropertyOwner");
    cy.wait("@getPropertyImages");

    cy.contains("button", "Siguiente", { timeout: 10000 }).should("not.be.disabled").click();

    fillTextField(/T.*tulo/i, updatedValues.title);
    fillTextField(/Precio/i, String(updatedValues.price));
    fillTextField(/Descrip/i, updatedValues.description);

    cy.contains("button", "Actualizar").should("not.be.disabled").click();
    cy.contains("button", "Confirmar").click();
    cy.wait("@updateProperty");

    cy.contains("Propiedad actualizada", { timeout: 10000 }).should("be.visible");
    cy.contains("button", /Volver|Aceptar|Ok/i).click();

    cy.location("pathname", { timeout: 10000 }).should("eq", "/");
    cy.wait("@getProperties");

    cy.contains('[data-testid="favorite-item"]', updatedValues.title, { timeout: 10000 }).should("exist");

    openSpeedDialAction("Eliminar");
    cy.contains("button", /Entendido|Aceptar/).click();

    cy.contains('[data-testid="favorite-item"]', updatedValues.title, { timeout: 10000 })
      .should("exist")
      .click();

    cy.contains("button", "Confirmar").click();
    cy.contains("button", /continuar|Continuar/i).click();
    cy.wait("@deleteProperty");

    cy.contains("Propiedad eliminada", { timeout: 10000 }).should("be.visible");
    cy.contains("button", /Volver|Aceptar|Ok/i).click();

    cy.wait("@getProperties");
    cy.contains('[data-testid="favorite-item"]', updatedValues.title).should("not.exist");
    cy.contains("No hay propiedades cargadas.").should("be.visible");
  });
});
