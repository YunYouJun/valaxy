import { webcrypto } from 'node:crypto'
import { describe, expect, it } from 'vitest'
import { encryptContent } from '../packages/valaxy/node/utils/encrypt'

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
      salt,
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
  const data = Uint8Array.from(ciphertext, c => c.charCodeAt(0))
  const decrypted = await webcrypto.subtle.decrypt({ name: 'AES-CBC', iv }, key, data)
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
})
