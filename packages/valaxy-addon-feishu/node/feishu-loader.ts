import type { ContentItem, ContentLoader, ContentLoaderContext } from 'valaxy'
import type { FeishuAddonOptions } from '../types'
import path from 'node:path'
import { consola } from 'consola'
import fs from 'fs-extra'
import { blocksToMarkdown, extractImageTokens, replaceImagePlaceholders } from './blocks-to-md'
import { FeishuClient } from './feishu-client'

function slugify(title: string): string {
  return title
    .toLowerCase()
    .replace(/\s+/g, '-')
    .replace(/[^\w\u4E00-\u9FA5-]/g, '')
    .replace(/-+/g, '-')
    .replace(/^-|-$/g, '')
    || 'untitled'
}

/**
 * @experimental
 * Create a Feishu content loader for use with Valaxy's content loader system.
 */
export function createFeishuLoader(options: FeishuAddonOptions): ContentLoader {
  const prefix = options.prefix ?? 'posts'
  const downloadImages = options.downloadImages ?? true
  const imageDir = options.imageDir ?? 'feishu-images'

  return {
    name: 'feishu',
    devPollInterval: options.devPollInterval,

    async load(ctx: ContentLoaderContext): Promise<ContentItem[]> {
      const client = new FeishuClient({
        appId: options.appId,
        appSecret: options.appSecret,
      })

      // Determine which documents to fetch
      let docList: { docId: string, title: string }[] = []

      if (options.spaceId) {
        consola.info('[feishu] Listing wiki nodes from space:', options.spaceId)
        docList = await client.listWikiNodes(options.spaceId)
      }

      if (options.documents?.length) {
        for (const docId of options.documents) {
          // Check if already in list from wiki
          if (!docList.some(d => d.docId === docId)) {
            const meta = await client.getDocumentMeta(docId)
            docList.push({ docId, title: meta.title })
          }
        }
      }

      if (docList.length === 0) {
        consola.warn('[feishu] No documents found. Provide spaceId or documents[] in options.')
        return []
      }

      consola.info(`[feishu] Fetching ${docList.length} document(s)...`)

      const items: ContentItem[] = []

      for (const doc of docList) {
        try {
          const [blocks, meta] = await Promise.all([
            client.getDocumentBlocks(doc.docId),
            client.getDocumentMeta(doc.docId),
          ])

          let markdown = blocksToMarkdown(blocks)

          // Handle image downloads
          if (downloadImages && ctx.node) {
            const tokens = extractImageTokens(markdown)
            if (tokens.length > 0) {
              const publicImageDir = path.join(ctx.node.options.userRoot, 'public', imageDir)
              await fs.ensureDir(publicImageDir)

              const mapping: Record<string, string> = {}
              for (const token of tokens) {
                try {
                  const buffer = await client.downloadFile(token)
                  const filename = `${token}.png`
                  const filePath = path.join(publicImageDir, filename)
                  await fs.writeFile(filePath, buffer)
                  mapping[token] = `/${imageDir}/${filename}`
                }
                catch (e) {
                  consola.warn(`[feishu] Failed to download image ${token}:`, e)
                  mapping[token] = `https://internal-api-drive-stream.feishu.cn/space/api/box/stream/download/v2/cover/${token}`
                }
              }

              markdown = replaceImagePlaceholders(markdown, mapping)
            }
          }

          const slug = slugify(meta.title)
          // Sanitize title for safe YAML frontmatter embedding:
          // - Remove newlines/control chars to prevent frontmatter injection
          // - Escape double quotes
          const safeTitle = meta.title
            .replace(/[\n\r\t\0]/g, ' ')
            .replace(/"/g, '\\"')
          const frontmatter = [
            '---',
            `title: "${safeTitle}"`,
            meta.createTime ? `date: ${meta.createTime}` : '',
            meta.editTime ? `updated: ${meta.editTime}` : '',
            '---',
          ].filter(Boolean).join('\n')

          items.push({
            path: `${prefix}/${slug}.md`,
            content: `${frontmatter}\n\n${markdown}\n`,
            digest: meta.editTime || undefined,
          })
        }
        catch (e) {
          consola.error(`[feishu] Failed to fetch document ${doc.docId} (${doc.title}):`, e)
        }
      }

      return items
    },
  }
}
