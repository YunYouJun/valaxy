context('Frontmatter', {
  baseUrl: Cypress.env('theme-yun'),
}, () => {
  beforeEach(() => {
    cy.visit('/')
  })

  it('basic', () => {
    cy.url()
      .should('eq', Cypress.env('theme-yun'))
  })

  // time warning in post
  it('time warning', () => {
    cy.visit('/test/time_warning')

    cy.get('.yun-time-warning')
      .should('exist')
  })
})
