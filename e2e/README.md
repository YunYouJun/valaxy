# e2e by playwright

- migrate [cypress](https://www.cypress.io/) tests to [playwright](https://playwright.dev/)
  - for cross-browser testing
  - for better performance

## Running the tests

Build the packages and demo before running `pnpm e2e`. The optional
`valaxy-blog` scaffold enables the create-valaxy tests (`pnpm ci` creates it).

Playwright starts its own servers and does not reuse existing processes. The
ports are defined in `e2e/env.ts`: docs 14859, Yun development 14860, Yun preview
14173, and the scaffold 14861. Keep these ports free; regular local development
servers can continue running on their usual ports.
