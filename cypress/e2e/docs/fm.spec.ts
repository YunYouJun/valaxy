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
      .should('eq', 'http://localhost:4859/guide/getting-started')
  })

  it('time warning', () => {
    cy.visit('/test/time-warning')
  })
})
