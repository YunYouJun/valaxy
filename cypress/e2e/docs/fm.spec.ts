context('Frontmatter', {
  baseUrl: Cypress.env('docs'),
}, () => {
  beforeEach(() => {
    cy.visit('/')
  })

  it('basic', () => {
    cy.url()
      .should('eq', Cypress.env('docs'))
  })

  it('get started', () => {
    cy.get('.sese-btn')
      .first()
      .click()
      .url()
      .should('include', '/guide/getting-started')
  })

  it('code height limit', () => {
    cy.visit('/examples/code-height-limit')

    cy.get('button.collapse')
      .should('exist')
  })

  it('partial content encryption', () => {
    cy.visit('/examples/partial-content-encryption')

    cy.get('div.decrypt-password-container')
      .should('exist')
  })
})
