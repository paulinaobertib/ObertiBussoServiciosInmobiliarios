/// <reference types="cypress" />
/// <reference types="cypress-file-upload" />

declare namespace Cypress {
  interface Chainable {
    loginKeycloak(): Chainable<void>;
    loginAdmin(): Chainable<void>;
    loginTenant(): Chainable<void>;
    sessionAdmin(options?: { redirectPath?: string }): Chainable<void>;
    sessionUser(options?: { redirectPath?: string }): Chainable<void>;
    sessionAdminTurnero(): Chainable<void>;
    sessionUserTurnero(): Chainable<void>;
  }
}
