export const EXTERNAL_URL_RE = /^(?:[a-z]+:|\/\/)/i

/**
 * @experimental
 * 标识这是一个使用国际化的 key
 * 从 locales/ 目录中获取对应的翻译
 */
export const LOCALE_PREFIX = '$locale:'

/**
 * Frontmatter fields that contain sensitive or internal data
 * and should be stripped before public output (e.g. llms.txt).
 *
 * **Note**: This is intended for public text output only.
 * Route meta has different requirements — fields like `draft`, `hide`,
 * `encrypt`, and `encryptedContent` are needed by the client at runtime.
 *
 * - Password/encryption fields: `password`, `gallery_password`, `password_hint`, `encrypt`
 * - Encrypted content (generated at build time): `encryptedContent`, `partiallyEncryptedContents`, `encryptedPhotos`
 * - Visibility control: `draft`, `hide`
 */
export const SENSITIVE_FRONTMATTER_KEYS = new Set([
  // passwords & encryption
  'password',
  'gallery_password',
  'password_hint',
  'encrypt',
  // build-time generated encrypted content
  'encryptedContent',
  'partiallyEncryptedContents',
  'encryptedPhotos',
  // visibility control
  'draft',
  'hide',
])
