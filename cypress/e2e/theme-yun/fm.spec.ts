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

  it('posted & edited time', () => {
    cy.visit('/posts/hello-valaxy')

    cy.get('.post-time time')
      .should('have.length', 2)

    cy.get('.post-time > .posted-time time')
      .invoke('text')
      .should('match', /\d{4}-\d{2}-\d{2}/)

    cy.get('.post-time > .edited-time time')
      .invoke('text')
      .should('match', /\d{4}-\d{2}-\d{2}/)
  })

  // time warning in post
  it('time warning', () => {
    cy.visit('/test/time_warning')

    cy.get('.yun-time-warning')
      .should('exist')
  })

  it('word count & reading time', () => {
    cy.visit('/posts/hello-valaxy')

    cy
      .get('.post-counter > .word-count span')
      .invoke('text')
      .should('match', /\d+/)

    cy
      .get('.post-counter > .reading-time time')
      .invoke('text')
      .then((text) => {
        text = text.trim()
        const endsWith = ['m', 'h'].some(i => text.endsWith(i))
        expect(endsWith).to.be.true
      })
  })
})
