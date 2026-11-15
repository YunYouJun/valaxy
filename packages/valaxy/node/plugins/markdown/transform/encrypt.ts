import type { PageData } from '../../../../types'
import type { ResolvedValaxyOptions } from '../../../types'
import process from 'node:process'
import { consola } from 'consola'
import { parse as parseSfc } from 'vue/compiler-sfc'
import { escapeHtml } from '../../../../shared'
import { encryptContent } from '../../../utils/encrypt'

let globalPasswordLoggedOnce = false

export function createTransformEncrypt(options: ResolvedValaxyOptions) {
  // handle mainContent, encrypt
  const { config: { siteConfig: { encrypt } } } = options

  /**
   * will modify pageData.frontmatter
   */
  return async (code: string, id: string, pageData: PageData) => {
    const { frontmatter = {} } = pageData

    if (encrypt.enable) {
      /**
       * get `<ValaxyDecrypt />` template
       */
      function getValaxyDecryptTemplate(options: {
        encryptedContent: string
        hint?: string
      }) {
        return [
          '<ClientOnly>',
          `<ValaxyDecrypt :encrypted-content="${options.encryptedContent}" hint="${escapeHtml(options.hint || '')}" />`,
          '</ClientOnly>',
        ].join('')
      }

      // Resolve password: frontmatter password > global env password (when encrypt: true)
      const globalPassword = process.env.VALAXY_ENCRYPT_PASSWORD
      const password = frontmatter.password
        || (frontmatter.encrypt === true && globalPassword)
        || undefined

      if (password && !frontmatter.password && globalPassword) {
        if (!globalPasswordLoggedOnce) {
          consola.info('Using global encrypt password from env `VALAXY_ENCRYPT_PASSWORD`')
          globalPasswordLoggedOnce = true
        }
      }

      // partial encryption
      const encryptRegexp = /<!-- valaxy-encrypt-start:(?<password>\w+) -->(?<content>.*?)<!-- valaxy-encrypt-end -->/gs
      const encryptCommentRegexp = /((<!-- valaxy-encrypt-start:\w+ -->)|(<!-- valaxy-encrypt-end -->))/g
      if (password) {
        code = code.replaceAll(encryptCommentRegexp, '')
      }
      else {
        const partiallyEncryptedContents: string[] = []
        for (const matchArr of code.matchAll(encryptRegexp)) {
          partiallyEncryptedContents.push(
            await encryptContent(matchArr.groups!.content, {
              password: matchArr.groups!.password,
              iv: encrypt.iv,
              salt: encrypt.salt,
            }),
          )
        }
        let i = 0
        if (partiallyEncryptedContents.length) {
          // if not exist, not add to frontmatter
          frontmatter.partiallyEncryptedContents = partiallyEncryptedContents
          code = code.replaceAll(encryptRegexp, () => {
            const partiallyEncryptedContents = `$partiallyEncryptedContents`
            const content = `${partiallyEncryptedContents}[${i++}]`
            return getValaxyDecryptTemplate({
              encryptedContent: content,
              hint: frontmatter.password_hint || '',
            })
          })
        }
      }

      // encrypt the entire article
      if (password) {
        const { descriptor } = parseSfc(code, { filename: id })
        const patches: { start: number, end: number, text: string }[] = []

        if (descriptor.template) {
          const { start, end } = descriptor.template.loc
          const content = code.slice(start.offset, end.offset)

          const encryptedContent = await encryptContent(content, {
            password,
            iv: encrypt.iv,
            salt: encrypt.salt,
          })
          frontmatter.encryptedContent = encryptedContent
          frontmatter.encrypt = true
          delete frontmatter.password

          patches.push({
            start: start.offset,
            end: end.offset,
            text: getValaxyDecryptTemplate({
              encryptedContent: '$encryptedContent',
              hint: frontmatter.password_hint,
            }),
          })
        }
        else {
          delete frontmatter.password
        }

        // Remove export / secrets from the real top-level `<script setup>` SFC block only.
        if (descriptor.scriptSetup) {
          patches.push({
            start: descriptor.scriptSetup.loc.start.offset,
            end: descriptor.scriptSetup.loc.end.offset,
            text: '',
          })
        }

        for (const patch of patches.sort((a, b) => b.start - a.start))
          code = `${code.slice(0, patch.start)}${patch.text}${code.slice(patch.end)}`
      }
      if (frontmatter.gallery_password) {
        const encryptedPhotos = await encryptContent(JSON.stringify(frontmatter.photos), {
          password: frontmatter.gallery_password,
          iv: encrypt.iv,
          salt: encrypt.salt,
        })
        frontmatter.encryptedPhotos = encryptedPhotos
        delete frontmatter.gallery_password
        delete frontmatter.photos
      }
    }

    return code
  }
}
