class MenuPage {
  static get menu() {
    return cy.get('[data-test="menu"]');
  }

  static get title() {
    return cy.get('[data-test="menuTitle"]');
  }

  static get selectedSection() {
    return cy.get('.active [data-test="menuItemTitle"]');
  }

  static toggleMenu() {
    cy.get('[data-test="menuToggle"]').click();
  }

  static clickSection(sectionName) {
    cy.get('.mat-list-item')
      .contains(sectionName, { matchCase: false })
      .click();
  }
}

class SitePage {
  static section(sectionName) {
    return cy.get(`#${sectionName}`);
  }
}

module.exports = { MenuPage, SitePage };
