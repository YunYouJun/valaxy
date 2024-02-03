context('Create Valaxy Demo', {
  baseUrl: Cypress.env('theme-yun'),
}, () => {
  beforeEach(() => {
    cy.visit('/')
  })

  it('basic', () => {
    cy.url()
      .should('eq', Cypress.env('theme-yun'))
  })

  it('banner', () => {
    // test banner
    cy.get('.char-box')
      .should('exist')
  })

  it('sidebar', () => {
    cy.get('.sidebar')
      .should('exist')
  })

  it('post list', () => {
    cy.get('.yun-post-list')
      .should('exist')
  })

  it('enter post', () => {
    cy.get('.post-title-link')
      .first()
      .click()
      .url()
      .should('include', '/posts/hello-valaxy')

    cy.contains('Hello, Valaxy!')
      .should('exist')

    // post nav next
    cy.get('.post-nav-next')
      .should('exist')
      .click()
      .url()
      .should('include', `/posts/`)
  })

  it('comment', () => {
    cy.visit('/about')

    cy.get('.comment')
      .should('exist')
  })
})
