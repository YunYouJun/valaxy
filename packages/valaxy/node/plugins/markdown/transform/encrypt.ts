import type { PageData } from '../../../../types'
import type { ResolvedValaxyOptions } from '../../../types'
import process from 'node:process'
import { consola } from 'consola'
import { parseCache, parse as parseSfc } from 'vue/compiler-sfc'
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
        const parsed = parseSfc(code, { filename: id, sourceMap: false })
        const templateLoc = parsed.descriptor.template
          ? { start: parsed.descriptor.template.loc.start.offset, end: parsed.descriptor.template.loc.end.offset }
          : null
        const scriptSetupLoc = parsed.descriptor.scriptSetup
          ? { start: parsed.descriptor.scriptSetup.loc.start.offset, end: parsed.descriptor.scriptSetup.loc.end.offset }
          : null

        // Evict the transient pre-encryption AST/source immediately so Vue's global parseCache stays bounded.
        for (const [key, entry] of parseCache) {
          if (entry === parsed) {
            parseCache.delete(key)
            break
          }
        }

        const patches: { start: number, end: number, text: string }[] = []

        if (templateLoc) {
          const content = code.slice(templateLoc.start, templateLoc.end)

          const encryptedContent = await encryptContent(content, {
            password,
            iv: encrypt.iv,
            salt: encrypt.salt,
          })
          frontmatter.encryptedContent = encryptedContent
          frontmatter.encrypt = true
          delete frontmatter.password

          patches.push({
            start: templateLoc.start,
            end: templateLoc.end,
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
        if (scriptSetupLoc) {
          patches.push({
            start: scriptSetupLoc.start,
            end: scriptSetupLoc.end,
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
