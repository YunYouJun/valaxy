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

  // Ciphertext is embedded in the page module that UnoCSS scans. Random binary
  // bytes used to form arbitrary-value utilities such as `p-["*(.]`, whose CSS
  // failed postcss parsing at random (salt/iv change on every build).
  it('emits base64 that UnoCSS cannot read as utilities', async () => {
    const uno = await createGenerator({ presets: [presetWind4(), presetAttributify()] })
    const content = Array.from({ length: 2000 }, (_, i) => `<p class="p-${i}">${i}</p>`).join('')
    for (let i = 0; i < 20; i++) {
      const cipher = await encryptContent(content, {
        password: testPw,
        iv: webcrypto.getRandomValues(new Uint8Array(16)),
        salt: webcrypto.getRandomValues(new Uint8Array(16)),
      })
      expect(cipher).toMatch(/^[A-Z0-9+/]+=*$/i)

      const code = `const $encryptedContent = ${transformObject(cipher)}`
      const { css, matched } = await uno.generate(code, { preflights: false })
      expect([...matched]).toEqual([])
      expect(() => postcss.parse(css)).not.toThrow()
    }
  })
})
