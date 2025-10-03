/// <reference types="cypress" />
/// <reference types="cypress-file-upload" />

declare namespace Cypress {
  interface Chainable {
    loginKeycloak(): Chainable<void>;
    loginAdmin(): Chainable<void>;
  }
}
