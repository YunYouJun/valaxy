context('Client Redirect', {
  baseUrl: Cypress.env('theme-yun'),
}, () => {
  beforeEach(() => {
    cy.visit('/')
  })

  it('/redirect/old1', () => {
    cy.visit('/redirect/old1')

    cy.url().should('eq', `${Cypress.env('theme-yun')}posts/redirect`)
  })

  it('/redirect/old2', () => {
    cy.visit('/redirect/old2')

    cy.url().should('eq', `${Cypress.env('theme-yun')}posts/redirect`)
  })

  it('/foo', () => {
    cy.visit('/foo')

    cy.url().should('eq', `${Cypress.env('theme-yun')}about`)
  })
})
