context('Docs', () => {
  beforeEach(() => {
    cy.visit('/')
  })

  it('basic', () => {
    cy.url()
      .should('eq', 'http://localhost:3333/')
  })
})
