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

  it('word count & reading time', () => {
    cy.visit('/posts/hello-valaxy')

    const counterContainer = cy.get('.post-counter')

    counterContainer
      .get('.word-count span')
      .invoke('text')
      .should('match', /\d+/)

    counterContainer
      .get('.reading-time time')
      .invoke('text')
      .then((text) => {
        text = text.trim()
        const endsWith = ['m', 'h'].some(i => text.endsWith(i))
        expect(endsWith).to.be.true
      })
  })
})
