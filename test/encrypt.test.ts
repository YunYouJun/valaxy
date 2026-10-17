import { Buffer } from 'node:buffer'
import { webcrypto } from 'node:crypto'
import postcss from 'postcss'
import { createGenerator, presetAttributify, presetWind4 } from 'unocss'
import { describe, expect, it } from 'vitest'
import { encryptContent } from '../packages/valaxy/node/utils/encrypt'
import { transformObject } from '../packages/valaxy/node/utils/helper'

function getKeyMaterial(password: string) {
  const enc = new TextEncoder()
  return webcrypto.subtle.importKey(
    'raw',
    enc.encode(password),
    'PBKDF2',
    false,
    ['deriveBits', 'deriveKey'],
  )
}

function getCryptoDeriveKey(keyMaterial: webcrypto.CryptoKey, salt: Uint8Array) {
  return webcrypto.subtle.deriveKey(
    {
      name: 'PBKDF2',
      salt: Uint8Array.from(salt),
      iterations: 100000,
      hash: 'SHA-256',
    },
    keyMaterial,
    { name: 'AES-CBC', length: 256 },
    true,
    ['encrypt', 'decrypt'],
  )
}

async function decrypt(pw: string, ciphertext: string, iv: Uint8Array, salt: Uint8Array) {
  const keyMaterial = await getKeyMaterial(pw)
  const key = await getCryptoDeriveKey(keyMaterial, salt)
  const data = Uint8Array.from(atob(ciphertext), c => c.charCodeAt(0))
  const decrypted = await webcrypto.subtle.decrypt({ name: 'AES-CBC', iv: Uint8Array.from(iv) }, key, data)
  return new TextDecoder().decode(decrypted)
}

describe('encryptContent', () => {
  const iv = webcrypto.getRandomValues(new Uint8Array(16))
  const salt = webcrypto.getRandomValues(new Uint8Array(16))
  const testPw = Math.random().toString(36).slice(2)

  it('encrypts and decrypts short content', async () => {
    const content = 'hello world'
    const cipher = await encryptContent(content, { password: testPw, iv, salt })
    expect(typeof cipher).toBe('string')
    expect(await decrypt(testPw, cipher, iv, salt)).toBe(content)
  })

  // https://github.com/YunYouJun/valaxy/issues/699
  it('encrypts large content without stack overflow', async () => {
    const content = '爱你'.repeat(41400)
    const cipher = await encryptContent(content, { password: testPw, iv, salt })
    expect(typeof cipher).toBe('string')
    expect(await decrypt(testPw, cipher, iv, salt)).toBe(content)
  })

  // Ciphertext is embedded in the page module that UnoCSS scans. With these
  // fixed inputs the old binary-string encoding contained `b="$KX…(Y"`, which
  // UnoCSS turned into `border-color: color-mix(in …(Y, …)` and postcss
  // rejected ("Unclosed bracket"). Salt/iv used to differ between builds, so
  // the build failed at random.
  it('emits base64 that UnoCSS cannot read as utilities', async () => {
    const fromHex = (hex: string) => Uint8Array.from(Buffer.from(hex, 'hex'))
    const password = 'valaxy'
    const iv = fromHex('00736552c9a4931d838ba865286f20a5')
    const salt = fromHex('63479ad69a090b258277ec8fba6f9941')
    const content = '<p>valaxy</p>'.repeat(300)

    const cipher = await encryptContent(content, { password, iv, salt })
    expect(cipher).toMatch(/^[A-Z0-9+/]+=*$/i)
    expect(await decrypt(password, cipher, iv, salt)).toBe(content)

    const uno = await createGenerator({ presets: [presetWind4(), presetAttributify()] })
    const embed = (ciphertext: string) => `const $encryptedContent = ${transformObject(ciphertext)}`
    const { matched } = await uno.generate(embed(cipher), { preflights: false })
    expect([...matched]).toEqual([])

    // Guard that the fixture still reproduces the old failure: `atob` gives
    // back the binary string the old encoding emitted.
    const legacy = await uno.generate(embed(atob(cipher)), { preflights: false })
    expect(() => postcss.parse(legacy.css)).toThrow(/Unclosed bracket/)
  })
})
