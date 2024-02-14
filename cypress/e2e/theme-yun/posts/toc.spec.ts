context('Theme Yun', {
  baseUrl: Cypress.env('theme-yun'),
}, () => {
  it('toc generate', () => {
    cy.visit('/posts/hello-valaxy')

    cy.get('.yun-aside')
      .should('exist')

    cy.get('.yun-aside .va-toc-item')
      .should('have.length', 2)

    cy.get('.yun-aside .va-toc-item')
      .eq(0)
      .should('have.attr', 'lang', 'en')
      .should('have.text', 'What is Valaxy?')
  })
})
