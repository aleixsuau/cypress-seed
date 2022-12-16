describe('Cypress Crash Post', () => {
  beforeEach(() => {
    cy.visit('');
  });

  context('Querying', () => {
    it('should query', () => {
      // Query by CSS selector
      cy.get('#profile');
      cy.get('[data-test=profileGreeting]');

      // Query by text content
      cy.contains("I'm Aleix, frontend developer");

      // Query by index
      cy.get('[data-test="profileLink"]').first(); // LinkedIn logo
      cy.get('[data-test="profileLink"]').eq(2); // Github logo

      // Query + filter
      cy.get('a').filter('[data-test="profileLink"]').should('have.length', 5);

      // Query children
      cy.get('[data-test="contactForm"]').find('input');
      cy.get('[data-test="contactForm"]').contains('Email');

      cy.get('[data-test="contactForm"]').within(($form) => {
        // The following inputs are form’s children        
        cy.get('[data-test="emailInput"]');
        cy.get('[data-test="messageInput"]');
      });
    });
  });

  context('Cypress Chainable Objects', () => {
    it('should chain objects', () => {
      cy.get('[data-test="profileLink"]').eq(2).focus();
    });

    it('should give access to the JQuery object and wrap it back to Cypress chainable object', () => {      
      cy.get('[data-test="menu"]').then(($menu) => {
        // $menu is a JQuery object
        const classList = $menu.attr('class');

        if (!classList.includes('mat-drawer-opened')) {
          cy.get('[data-test="menuToggle"]').click();
        }

        // cy.wrap($menu) converts it back into a Cypress chainable object
        cy.wrap($menu).should('have.class', 'mat-drawer-opened');
      });
    });
  });

  context('Interacting', () => {
    it('should trigger events on DOM elements', () => {
      // Cypress provides some commands like:
      cy.get('[data-test="menuToggle"]').dblclick();
      cy.get('[data-test="menuToggle"]').click();
      cy.get('[data-test="menu"]').rightclick();
      cy.get('[data-test="emailInput"]').type('info@aleixsuau.dev');
      cy.get('[data-test="emailInput"]').clear();

      // We can also trigger events
      cy.get('[data-test="menu"]').trigger('mousedown');

      // In order to trigger events in non-actionable elements (non-visible, disabled, animated…) we need to force it
      cy.get('[data-test=submitButton]').click({ force: true });
    });
  });

  context('Asserting', () => {
    it('should assert things', () => {
      // Assert length
      cy.get('[data-test="menuItem"]').should('have.length', 4);
      // Assert class
      cy.get('[data-test="emailInput"]').should('not.have.class', 'disabled');
      // Assert value
      cy.get('[data-test="messageInput"]').should('have.value', '');
      // Assert text
      cy.get('[data-test="menuItem"]').eq(3).should('include.text', 'CONTACT');
      // Assert existence
      cy.get('[data-test="idontExist"]').should('not.exist');
      // Assert visibility
      cy.get('[data-test="menu"]').should('not.be.visible');
      // Assert state
      cy.get('[data-test=submitButton]').should('be.disabled');
      // Assert CSS
      cy.get('[data-test="menu"]').should('have.css', 'visibility', 'hidden');

      // Assert multiple concerns
      cy.get('[data-test="menuItem"]')
        .first()
        .should('have.class', 'active')
        .and('have.attr', 'href')
        .and('include', '#home');
 
      cy.get('[data-test="menuItem"].active')
        .contains('hi', { matchCase: false })
        .should('exist');
    });
  });

  context('Aliasing', () => {
    beforeEach(() => {
      cy.get('[data-test="menuToggle"]').as('menuToggle');
      cy.fixture('/posts.json').as('postsData');
    });

    it('should work with alias', () => {
      cy.get('@menuToggle').click();
      cy.get('@postsData').should('have.length', 7);
    });
  });

  context('HTTP', () => {
    it('should assert API responses', () => {
      // Alias an HTTP request
      cy.intercept('GET', '/config.json').as('getConfig');

      // We need to visit the site in order the requests are triggered
      cy.visit('');

      // We need to wait the request in order to assert
      cy.wait('@getConfig').its('response.body').should('have.property', 'menu');

      // We can also trigger API requests manually so we don't need to wait
      cy.request('GET', 'https://portfolio-aleix.firebaseio.com/config.json').then(
        (response) => expect(response.body).to.have.property('menu')
      );
    });

    it('should mock API responses', () => {
      // Modify API response
      const mockedAPIResponse = {
        statusCode: 404,
        body: '404 Not Found!',
        headers: {
          'x-not-found': 'true',
        },
      };
      cy.intercept('GET', '/works.json', mockedAPIResponse).as('getWorks');
      cy.visit('');

      cy.wait('@getWorks').its('response.statusCode').should('equal', 404);
    });

    it('should modify API responses', () => {
      cy.intercept('GET', '/works.json', (request) => {
        request.reply((response) => {
          response.body.length = 0;
          
          return response;
        });
      }).as('getWorks');
      cy.visit('');

      cy.wait('@getWorks').its('response.body').should('have.length', 0);
    });
  });
});