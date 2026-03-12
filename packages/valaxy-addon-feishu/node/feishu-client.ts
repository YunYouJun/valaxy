import { Buffer } from 'node:buffer'
import * as lark from '@larksuiteoapi/node-sdk'

export interface WikiNode {
  docId: string
  title: string
}

/**
 * Feishu API client wrapping @larksuiteoapi/node-sdk
 */
export class FeishuClient {
  private client: lark.Client

  constructor(options: { appId: string, appSecret: string }) {
    this.client = new lark.Client({
      appId: options.appId,
      appSecret: options.appSecret,
      appType: lark.AppType.SelfBuild,
    })
  }

  /**
   * List wiki nodes in a space, returning their doc IDs and titles.
   * Paginates through all top-level nodes available from the Feishu API.
   */
  async listWikiNodes(spaceId: string): Promise<WikiNode[]> {
    const nodes: WikiNode[] = []
    let pageToken: string | undefined

    do {
      const res = await this.client.wiki.spaceNode.list({
        params: {
          page_size: 50,
          ...(pageToken ? { page_token: pageToken } : {}),
        },
        path: { space_id: spaceId },
      })

      const items = res?.data?.items || []
      for (const item of items) {
        if (item.obj_type === 'docx' && item.obj_token) {
          nodes.push({
            docId: item.obj_token,
            title: item.title || 'Untitled',
          })
        }
      }

      pageToken = res?.data?.page_token || undefined
    } while (pageToken)

    return nodes
  }

  /**
   * Fetch all blocks from a document.
   * Paginates with 200ms delay between pages to respect 5 QPS limit.
   */
  async getDocumentBlocks(documentId: string): Promise<any[]> {
    const blocks: any[] = []
    let pageToken: string | undefined

    do {
      if (pageToken) {
        // 200ms delay between pages to respect Feishu API rate limit (5 QPS)
        await new Promise(resolve => setTimeout(resolve, 200))
      }

      const res = await this.client.docx.documentBlock.list({
        params: {
          page_size: 200,
          document_revision_id: -1,
          ...(pageToken ? { page_token: pageToken } : {}),
        },
        path: { document_id: documentId },
      })

      const items = res?.data?.items || []
      blocks.push(...items)

      pageToken = res?.data?.page_token || undefined
    } while (pageToken)

    return blocks
  }

  /**
   * Download a file (e.g. image) by file token.
   * Returns the file content as a Buffer.
   */
  async downloadFile(fileToken: string): Promise<Buffer> {
    const res = await this.client.drive.file.download({
      path: { file_token: fileToken },
    })
    const chunks: Uint8Array[] = []
    // The SDK may return a readable stream as res or res.data depending on version
    const stream = ((res as any)?.data ?? res) as AsyncIterable<Uint8Array>
    for await (const chunk of stream) {
      chunks.push(chunk)
    }
    return Buffer.concat(chunks)
  }

  /**
   * Get document metadata (title, create/edit time).
   */
  async getDocumentMeta(documentId: string): Promise<{ title: string, createTime?: string, editTime?: string }> {
    const res = await this.client.docx.document.get({
      path: { document_id: documentId },
    })

    const doc = res?.data?.document
    // The SDK types don't include create_time/edit_time but the API returns them
    const docAny = doc as any
    return {
      title: doc?.title || 'Untitled',
      createTime: docAny?.create_time ? new Date(Number(docAny.create_time) * 1000).toISOString() : undefined,
      editTime: docAny?.edit_time ? new Date(Number(docAny.edit_time) * 1000).toISOString() : undefined,
    }
  }
}
