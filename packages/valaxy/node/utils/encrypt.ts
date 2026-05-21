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
      salt,
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
 * Convert a byte array to a binary string without using spread,
 * which would otherwise overflow the call stack on long content.
 *
 * @see https://github.com/YunYouJun/valaxy/issues/699
 */
function bytesToBinaryString(bytes: Uint8Array) {
  const CHUNK_SIZE = 0x8000
  let result = ''
  for (let i = 0; i < bytes.length; i += CHUNK_SIZE)
    result += String.fromCharCode.apply(null, bytes.subarray(i, i + CHUNK_SIZE) as unknown as number[])
  return result
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
      iv,
    },
    key,
    enc.encode(content),
  )

  return bytesToBinaryString(new Uint8Array(ciphertextData))
}
