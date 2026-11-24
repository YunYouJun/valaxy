# e2e by playwright

- migrate [cypress](https://www.cypress.io/) tests to [playwright](https://playwright.dev/)
  - for cross-browser testing
  - for better performance

## Running the tests

Build the packages and demo before running `pnpm e2e` (`pnpm run build && pnpm run build:demo`). The optional
`valaxy-blog` scaffold enables the create-valaxy tests (`pnpm ci` creates it).

For docs, `pnpm e2e` runs only `e2e/docs/search.spec.ts` against the dev server; build the docs site first (`pnpm docs:build`) and run `pnpm e2e:ssg` to cover the rest of `e2e/docs/`.

Playwright starts its own servers and does not reuse existing processes. The
ports are defined in `e2e/env.ts`: docs 14859, docs preview 4899 (`pnpm e2e:ssg`), Yun development 14860, Yun preview
14173, and the scaffold 14861. Keep these ports free; regular local development
servers can continue running on their usual ports.
