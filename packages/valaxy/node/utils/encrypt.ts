import { webcrypto } from 'node:crypto'

/**
 * @see https://developer.mozilla.org/zh-CN/docs/Web/API/SubtleCrypto/deriveKey#pbkdf2_2
 * @param password
 */
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

function getCryptoDeriveKey(keyMaterial: CryptoKey | webcrypto.CryptoKey, salt: Uint8Array) {
  return webcrypto.subtle.deriveKey(
    {
      name: 'PBKDF2',
      salt: new Uint8Array(salt.buffer as ArrayBuffer),
      iterations: 100000,
      hash: 'SHA-256',
    },
    keyMaterial,
    {
      name: 'AES-CBC',
      length: 256,
    },
    true,
    ['encrypt', 'decrypt'],
  )
}

/**
 * @see https://github.com/mdn/dom-examples/blob/main/web-crypto/encrypt-decrypt/aes-cbc.js
 * @param content
 */
export async function encryptContent(content: string, options: {
  password: string
  iv: Uint8Array
  salt: Uint8Array
}) {
  const { password, iv, salt } = options
  const keyMaterial = await getKeyMaterial(password)
  const key = await getCryptoDeriveKey(keyMaterial, salt)

  const enc = new TextEncoder()
  const ciphertextData = await webcrypto.subtle.encrypt(
    {
      name: 'AES-CBC',
      iv: new Uint8Array(iv.buffer as ArrayBuffer),
    },
    key,
    enc.encode(content),
  )

  return String.fromCharCode(...new Uint8Array(ciphertextData))
}
