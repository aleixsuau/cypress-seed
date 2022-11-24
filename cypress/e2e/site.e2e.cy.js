import { MenuPage, SitePage } from '../support/e2e'

describe('My site', () => {
  beforeEach(() => {
    cy.intercept('GET', '/config.json').as('getConfig');
    cy.intercept('GET', '/works.json').as('getWorks');
    cy.intercept('GET', '/posts.json').as('getPosts');
    cy.visit('');
    cy.viewport('macbook-13');
  });

  context('Data', () => {
    it('should fetch the data', () => {
      cy.wait('@getConfig').its('response.statusCode').should('equal', 200);
      cy.wait('@getWorks').its('response.statusCode').should('equal', 200);
      cy.wait('@getPosts').its('response.statusCode').should('equal', 200);
    });
  });

  context('Menus', () => {
    it('should open and close the menu', () => {
      MenuPage.menu.should('not.be.visible');

      MenuPage.toggleMenu();

      MenuPage.menu.should('be.visible');

      MenuPage.toggleMenu();

      MenuPage.menu.should('not.be.visible');
    });

    it('should go to the section', () => {
      const section = 'blog';
      const anotherSection = 'contact';

      MenuPage.toggleMenu();
      MenuPage.clickSection(section);

      MenuPage.selectedSection.should('include.text', section.toUpperCase());
      MenuPage.title.should('contain', section);
      SitePage.section(section).should('be.visible');
      SitePage.section(anotherSection).should('be.not.visible');

      MenuPage.clickSection(anotherSection);

      MenuPage.selectedSection.should('include.text', anotherSection.toUpperCase());
      MenuPage.title.should('contain', anotherSection);
      SitePage.section(anotherSection).should('be.visible');
    });
  });

  context('Sections', () => {
    context('Hi (profile)', () => {
      it('should display the correct UI elements', () => {
        SitePage.section('profile').should('exist');

        SitePage.section('profile').within(() => {
          cy.get('[data-test=profileGreeting]').should('contain.text', "I'm Aleix, frontend developer");
          cy.get('a .profile__logo').should('have.length', 5);
        });
      });
    });

    context('Blog section', () => {
      it('should display a gallery of posts', () => {
        SitePage.section('blog').should('exist');

        SitePage.section('blog').get('#blog .gallery_container').should('exist');
      });

      it('should open the post in a new tab', () => {
        // Mocking http response so we can assert based on this data below
        cy.intercept('GET', '/posts.json', { fixture: 'posts' }).as('getPosts');
        cy.visit('');

        cy.window().then((windowRef) => {
          cy.spy(windowRef, 'open').as('openNewTab');
        });
        
        SitePage.section('blog').get('mat-card').first().click();
        cy.get('@openNewTab').should('be.calledWith', 'https://www.scalablepath.com/javascript/progressive-web-apps', '_blank');
      });
    });

    context('Code section', () => {
      it('should display a gallery of code snippets', () => {
        SitePage.section('works').find('[data-test="galleryContainer"]').should('exist');
      });

      it('should open the code snippet in a dialog', () => {
        // Mocking http response so we can assert based on this data below
        cy.intercept('GET', '/works.json', { fixture: 'works' }).as('getWorks');
        cy.visit('');

        SitePage.section('works').find('[data-test="galleryCard"]').first().click();
        
        cy.get('[data-test="dialogIframe"]').should('have.attr', 'src', 'https://stackblitz.com/edit/portfolio-underconstruction');
      });

      it('should close the dialog', () => {
        SitePage.section('works').find('[data-test="galleryCard"]').first().click();

       cy.get('[data-test="dialogIframeContainer"]').should('exist');

        // The iframe can last a bit to load, let's give it some extra time
        cy.get('[data-test="dialogCloseButton"]', { timeout: 10000 }).click();

        cy.get('[data-test="dialogIframeContainer"]').should('not.exist');
      });      
    });

    context('Contact section', () => {
      it('should display the contact form', () => {
        SitePage.section('contact').should('exist');
        cy.get('[data-test="emailInput"]').should('exist');
        cy.get('[data-test="messageInput"]').should('exist');
        cy.get('[data-test="submitButton"]').should('exist');
      });

      it('should display an error when the email is invalid', () => {
        cy.get('[data-test="emailInput"]').focus().type('hey').blur();

        cy.get('[data-test="emailInputError"]').should('exist');
      });

      it('should display an error when the message is invalid', () => {
        cy.get('[data-test="messageInput"]').focus().blur();

        cy.get('[data-test="messageInputError"]').should('exist');
      });

      it('should enable the submit button when the form is valid', () => {
        cy.get('[data-test="submitButton"]').should('be.disabled');

        cy.get('[data-test="emailInput"]').type('hey@bro.com');

        cy.get('[data-test="submitButton"]').should('be.disabled');

        cy.get('[data-test="messageInput"]').type('Kind regards');

        cy.get('[data-test="submitButton"]').should('be.enabled');
      });

      it('should send the message to the backend', () => {
        cy.intercept('POST', 'https://us-central1-portfolio-aleix.cloudfunctions.net/contactEmail').as('postContactForm');        

        cy.get('[data-test="emailInput"]').type('hey@bro.com');
        cy.get('[data-test="messageInput"]').type('Kind regards');

        cy.get('[data-test="submitButton"]').click();

        cy.wait('@postContactForm').its('request.body').should('deep.equal', {
          'email': 'hey@bro.com',
          'message': 'Kind regards'
        });
      });
    });
  });
})
