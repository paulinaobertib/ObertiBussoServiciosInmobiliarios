declare namespace Cypress {
  interface Chainable {
    loginKeycloak(): Chainable<void>;
    loginAdmin(): Chainable<void>;
  }
}
