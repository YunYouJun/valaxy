import { Buffer } from 'node:buffer'
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
      salt: Uint8Array.from(salt),
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
 * Encrypt content and return the ciphertext as base64.
 *
 * The ciphertext is embedded in the compiled page module, which UnoCSS scans
 * for utilities. A raw binary string (`String.fromCharCode` per byte) carries
 * quotes, brackets, `$`, `*` and backslashes, so random bytes could form
 * tokens like `p-["*(.]` that UnoCSS turns into unparsable CSS, failing the
 * build at random because salt/iv change on every build. Base64 has none of
 * those characters, and it is smaller once JSON-escaped.
 *
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
      iv: Uint8Array.from(iv),
    },
    key,
    enc.encode(content),
  )

  return Buffer.from(ciphertextData).toString('base64')
}
