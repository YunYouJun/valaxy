import type { PageData } from '../../../../types'
import type { ResolvedValaxyOptions } from '../../../options'
import { encryptContent } from '../../../utils/encrypt'

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
          `<ValaxyDecrypt :encrypted-content="${options.encryptedContent}" hint="${options.hint}" />`,
          '</ClientOnly>',
        ].join('')
      }

      // partial encryption
      const encryptRegexp = /<!-- valaxy-encrypt-start:(?<password>\w+) -->(?<content>.*?)<!-- valaxy-encrypt-end -->/gs
      const encryptCommentRegexp = /((<!-- valaxy-encrypt-start:\w+ -->)|(<!-- valaxy-encrypt-end -->))/g
      if (frontmatter.password) {
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
      if (frontmatter.password) {
        const templateStart = code.indexOf('<template>')
        const templateEnd = code.lastIndexOf('</template>')
        const content = code.slice(templateStart + 10, templateEnd)

        const encryptedContent = await encryptContent(content, {
          password: frontmatter.password,
          iv: encrypt.iv,
          salt: encrypt.salt,
        })
        frontmatter.encryptedContent = encryptedContent
        frontmatter.encrypt = true
        delete frontmatter.password
        // replace content in <template></template> to empty
        const encryptedContentStr = '$encryptedContent'
        code = code.replace(content, getValaxyDecryptTemplate({
          encryptedContent: encryptedContentStr,
          hint: frontmatter.password_hint,
        }))

        // remove export
        const scriptSetupStart = code.lastIndexOf('<script setup>')
        const scriptSetupEnd = code.lastIndexOf('</script>')
        const scriptSetupContent = code.slice(scriptSetupStart + 14, scriptSetupEnd)
        // hide password in script setup
        code = code.replace(scriptSetupContent, '')
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
