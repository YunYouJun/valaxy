import { encryptContent } from '../../../utils/encrypt'
import type { ResolvedValaxyOptions } from '../../../options'

export function createTransformEncrypt(options: ResolvedValaxyOptions) {
  // handle mainContent, encrypt
  const { config: { siteConfig: { encrypt } } } = options

  return async (code: string, _id: string) => {
    // get env after initEnv
    const { frontmatter = {} as Record<string, any> } = options.env

    if (encrypt.enable) {
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
        frontmatter.partiallyEncryptedContents = partiallyEncryptedContents.length ? partiallyEncryptedContents : undefined
        let i = 0
        if (partiallyEncryptedContents.length) {
          code = code.replaceAll(encryptRegexp, () => {
            const partiallyEncryptedContents = `$frontmatter.partiallyEncryptedContents`
            const content = `${partiallyEncryptedContents}[${i++}]`
            return `<ValaxyDecrypt v-if="${partiallyEncryptedContents} && ${content}" :encrypted-content="${content}" />`
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
        const encryptedContentStr = '$frontmatter.encryptedContent'
        code = code.replace(content, `<ValaxyDecrypt v-if="${encryptedContentStr}" :encrypted-content="${encryptedContentStr}" />`)
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
