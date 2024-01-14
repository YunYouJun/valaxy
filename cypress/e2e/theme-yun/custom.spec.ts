context('Custom', {
  baseUrl: Cypress.env('theme-yun'),
}, () => {
  beforeEach(() => {
    cy.visit('/')
  })

  it('inject head and body by index.html', () => {
    cy.get('head meta[name="TEST_INJECT_HEAD')
      .should('exist')

    cy.get('body')
      .get('#TEST_INJECT_BODY')
      .should('exist')
  })
})
