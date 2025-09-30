declare namespace Cypress {
  interface Chainable {
    loginKeycloak(): Chainable<void>;
  }
}
