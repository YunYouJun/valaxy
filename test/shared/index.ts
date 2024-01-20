import { fileURLToPath } from 'node:url'

export const userRoot = fileURLToPath(new URL('../fixtures/user', import.meta.url))

export const fixtureFolder = {
  userRoot,
}
