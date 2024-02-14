context('Theme Yun', {
  baseUrl: Cypress.env('theme-yun'),
}, () => {
  it('encrypted post', () => {
    cy.visit('/posts/encrypted-post')

    cy.get('.markdown-body')
      .should('exist')

    cy.get('.decrypt-password-container')
      .should('exist')

    cy.get('.decrypt-password-container input')
      .type('valaxy{enter}')

    cy.contains('这里是被加密的复杂文章内容')
  })
})
