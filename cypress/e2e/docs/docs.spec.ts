context('Docs', {
  baseUrl: Cypress.env('docs'),
}, () => {
  beforeEach(() => {
    cy.visit('/')
  })

  it('basic', () => {
    cy.url()
      .should('eq', Cypress.env('docs'))
  })
})
