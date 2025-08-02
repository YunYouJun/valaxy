import { useSiteConfig } from 'valaxy'

/**
 * @see https://developer.mozilla.org/zh-CN/docs/Web/API/SubtleCrypto/deriveKey#pbkdf2_2
 * @param password
 */
export function getKeyMaterial(password: string) {
  const enc = new TextEncoder()
  return window.crypto.subtle.importKey(
    'raw',
    enc.encode(password),
    'PBKDF2',
    false,
    ['deriveBits', 'deriveKey'],
  )
}

export function getKey(keyMaterial: CryptoKey, salt: BufferSource) {
  return window.crypto.subtle.deriveKey(
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

export function useDecrypt() {
  const siteConfig = useSiteConfig()

  const { encrypt } = siteConfig.value
  const iv = Uint8Array.from(Object.values(encrypt.iv))
  const salt = Uint8Array.from(Object.values(encrypt.salt))

  return {
    decrypt: async (password: string, ciphertext: string) => {
      if (!password)
        return

      const keyMaterial = await getKeyMaterial(password)
      const key = await getKey(keyMaterial, salt)

      const ciphertextData = Uint8Array.from(ciphertext, c => c.charCodeAt(0))

      const decrypted = await window.crypto.subtle.decrypt(
        {
          name: 'AES-CBC',
          iv,
        },
        key,
        ciphertextData,
      )

      return new TextDecoder().decode(decrypted)
    },
  }
}
