context('Demo Yun', () => {
  beforeEach(() => {
    cy.visit('/')
  })

  it('basic', () => {
    cy.url()
      .should('eq', 'http://localhost:3333/')
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
      .should('eq', 'http://localhost:3333/posts/hello-valaxy')

    cy.contains('Hello, Valaxy!')
      .should('exist')

    // post nav next
    cy.get('.post-nav-next')
      .should('exist')
      .click()
      .url()
      .should('contain', 'http://localhost:3333/posts/')
  })

  it('comment', () => {
    cy.visit('/about')

    cy.get('.comment')
      .should('exist')
  })
})
