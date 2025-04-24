import { expect, it } from 'vitest'
import { getAbbrlinkHash } from '../node/utils'

it('abbrlink hash', () => {
  const str = '/posts/hello-valaxy' + '2022-01-01'
  const hash = getAbbrlinkHash(str)
  expect(hash).toBe('430f31c5')
})
