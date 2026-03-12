import { describe, expect, it } from 'vitest'
import { blocksToMarkdown, extractImageTokens, makeImagePlaceholder, replaceImagePlaceholders } from '../packages/valaxy-addon-feishu/node/blocks-to-md'
import { createFeishuLoader } from '../packages/valaxy-addon-feishu/node/feishu-loader'

describe('blocksToMarkdown', () => {
  it('converts text blocks to paragraphs', () => {
    const blocks = [
      {
        block_id: 'page1',
        block_type: 1,
        children: ['block1', 'block2'],
      },
      {
        block_id: 'block1',
        block_type: 2,
        text: {
          elements: [
            { text_run: { content: 'Hello world' } },
          ],
        },
      },
      {
        block_id: 'block2',
        block_type: 2,
        text: {
          elements: [
            { text_run: { content: 'Second paragraph' } },
          ],
        },
      },
    ]

    const md = blocksToMarkdown(blocks)
    expect(md).toBe('Hello world\n\nSecond paragraph')
  })

  it('converts heading blocks', () => {
    const blocks = [
      {
        block_id: 'page1',
        block_type: 1,
        children: ['h1', 'h2', 'h3'],
      },
      {
        block_id: 'h1',
        block_type: 3,
        heading1: { elements: [{ text_run: { content: 'Title' } }] },
      },
      {
        block_id: 'h2',
        block_type: 4,
        heading2: { elements: [{ text_run: { content: 'Subtitle' } }] },
      },
      {
        block_id: 'h3',
        block_type: 5,
        heading3: { elements: [{ text_run: { content: 'Section' } }] },
      },
    ]

    const md = blocksToMarkdown(blocks)
    expect(md).toContain('# Title')
    expect(md).toContain('## Subtitle')
    expect(md).toContain('### Section')
  })

  it('renders h7-h9 as bold text', () => {
    const blocks = [
      {
        block_id: 'page1',
        block_type: 1,
        children: ['h7'],
      },
      {
        block_id: 'h7',
        block_type: 9,
        heading7: { elements: [{ text_run: { content: 'Minor heading' } }] },
      },
    ]

    const md = blocksToMarkdown(blocks)
    expect(md).toBe('**Minor heading**')
  })

  it('converts bullet list blocks', () => {
    const blocks = [
      {
        block_id: 'page1',
        block_type: 1,
        children: ['b1', 'b2'],
      },
      {
        block_id: 'b1',
        block_type: 12,
        bullet: { elements: [{ text_run: { content: 'Item 1' } }] },
      },
      {
        block_id: 'b2',
        block_type: 12,
        bullet: { elements: [{ text_run: { content: 'Item 2' } }] },
      },
    ]

    const md = blocksToMarkdown(blocks)
    expect(md).toContain('- Item 1')
    expect(md).toContain('- Item 2')
  })

  it('converts ordered list blocks', () => {
    const blocks = [
      {
        block_id: 'page1',
        block_type: 1,
        children: ['o1', 'o2'],
      },
      {
        block_id: 'o1',
        block_type: 13,
        ordered: { elements: [{ text_run: { content: 'First' } }] },
      },
      {
        block_id: 'o2',
        block_type: 13,
        ordered: { elements: [{ text_run: { content: 'Second' } }] },
      },
    ]

    const md = blocksToMarkdown(blocks)
    expect(md).toContain('1. First')
    expect(md).toContain('2. Second')
  })

  it('converts code blocks with language', () => {
    const blocks = [
      {
        block_id: 'page1',
        block_type: 1,
        children: ['code1'],
      },
      {
        block_id: 'code1',
        block_type: 14,
        code: {
          style: { language: 30 },
          elements: [{ text_run: { content: 'const x = 1' } }],
        },
      },
    ]

    const md = blocksToMarkdown(blocks)
    expect(md).toContain('```javascript')
    expect(md).toContain('const x = 1')
    expect(md).toContain('```')
  })

  it('converts quote blocks', () => {
    const blocks = [
      {
        block_id: 'page1',
        block_type: 1,
        children: ['q1'],
      },
      {
        block_id: 'q1',
        block_type: 15,
        quote: { elements: [{ text_run: { content: 'A wise quote' } }] },
      },
    ]

    const md = blocksToMarkdown(blocks)
    expect(md).toBe('> A wise quote')
  })

  it('converts todo blocks', () => {
    const blocks = [
      {
        block_id: 'page1',
        block_type: 1,
        children: ['t1', 't2'],
      },
      {
        block_id: 't1',
        block_type: 17,
        todo: {
          style: { done: true },
          elements: [{ text_run: { content: 'Done task' } }],
        },
      },
      {
        block_id: 't2',
        block_type: 17,
        todo: {
          style: { done: false },
          elements: [{ text_run: { content: 'Pending task' } }],
        },
      },
    ]

    const md = blocksToMarkdown(blocks)
    expect(md).toContain('- [x] Done task')
    expect(md).toContain('- [ ] Pending task')
  })

  it('converts divider blocks', () => {
    const blocks = [
      {
        block_id: 'page1',
        block_type: 1,
        children: ['d1'],
      },
      {
        block_id: 'd1',
        block_type: 19,
      },
    ]

    const md = blocksToMarkdown(blocks)
    expect(md).toBe('---')
  })

  it('converts image blocks with placeholder', () => {
    const blocks = [
      {
        block_id: 'page1',
        block_type: 1,
        children: ['img1'],
      },
      {
        block_id: 'img1',
        block_type: 20,
        image: { token: 'abc123' },
      },
    ]

    const md = blocksToMarkdown(blocks)
    expect(md).toBe('![](__FEISHU_IMAGE_abc123__)')
  })

  it('handles inline formatting', () => {
    const blocks = [
      {
        block_id: 'page1',
        block_type: 1,
        children: ['text1'],
      },
      {
        block_id: 'text1',
        block_type: 2,
        text: {
          elements: [
            { text_run: { content: 'bold', text_element_style: { bold: true } } },
            { text_run: { content: ' and ' } },
            { text_run: { content: 'italic', text_element_style: { italic: true } } },
            { text_run: { content: ' and ' } },
            { text_run: { content: 'code', text_element_style: { inline_code: true } } },
            { text_run: { content: ' and ' } },
            { text_run: { content: 'strike', text_element_style: { strikethrough: true } } },
          ],
        },
      },
    ]

    const md = blocksToMarkdown(blocks)
    expect(md).toBe('**bold** and *italic* and `code` and ~~strike~~')
  })

  it('handles links', () => {
    const blocks = [
      {
        block_id: 'page1',
        block_type: 1,
        children: ['text1'],
      },
      {
        block_id: 'text1',
        block_type: 2,
        text: {
          elements: [
            {
              text_run: {
                content: 'click here',
                text_element_style: { link: { url: 'https%3A%2F%2Fexample.com' } },
              },
            },
          ],
        },
      },
    ]

    const md = blocksToMarkdown(blocks)
    expect(md).toBe('[click here](https://example.com)')
  })

  it('handles equations', () => {
    const blocks = [
      {
        block_id: 'page1',
        block_type: 1,
        children: ['text1'],
      },
      {
        block_id: 'text1',
        block_type: 2,
        text: {
          elements: [
            { equation: { content: 'E = mc^2' } },
          ],
        },
      },
    ]

    const md = blocksToMarkdown(blocks)
    expect(md).toBe('$E = mc^2$')
  })

  it('converts table blocks', () => {
    const blocks = [
      {
        block_id: 'page1',
        block_type: 1,
        children: ['table1'],
      },
      {
        block_id: 'table1',
        block_type: 22,
        table: { property: { row_size: 2, column_size: 2 } },
        children: ['cell1', 'cell2', 'cell3', 'cell4'],
      },
      {
        block_id: 'cell1',
        block_type: 23,
        children: ['c1text'],
      },
      {
        block_id: 'cell2',
        block_type: 23,
        children: ['c2text'],
      },
      {
        block_id: 'cell3',
        block_type: 23,
        children: ['c3text'],
      },
      {
        block_id: 'cell4',
        block_type: 23,
        children: ['c4text'],
      },
      {
        block_id: 'c1text',
        block_type: 2,
        text: { elements: [{ text_run: { content: 'Header 1' } }] },
      },
      {
        block_id: 'c2text',
        block_type: 2,
        text: { elements: [{ text_run: { content: 'Header 2' } }] },
      },
      {
        block_id: 'c3text',
        block_type: 2,
        text: { elements: [{ text_run: { content: 'Value 1' } }] },
      },
      {
        block_id: 'c4text',
        block_type: 2,
        text: { elements: [{ text_run: { content: 'Value 2' } }] },
      },
    ]

    const md = blocksToMarkdown(blocks)
    expect(md).toContain('| Header 1 | Header 2 |')
    expect(md).toContain('| --- | --- |')
    expect(md).toContain('| Value 1 | Value 2 |')
  })

  it('returns empty string for empty blocks array', () => {
    expect(blocksToMarkdown([])).toBe('')
  })

  it('returns empty string when no page block exists', () => {
    const blocks = [
      { block_id: 'b1', block_type: 2, text: { elements: [{ text_run: { content: 'orphan' } }] } },
    ]
    expect(blocksToMarkdown(blocks)).toBe('')
  })
})

describe('image placeholder utilities', () => {
  it('creates and extracts image placeholders', () => {
    const placeholder = makeImagePlaceholder('token123')
    expect(placeholder).toBe('__FEISHU_IMAGE_token123__')

    const md = `Some text ![](${placeholder}) more text ![](__FEISHU_IMAGE_token456__)`
    const tokens = extractImageTokens(md)
    expect(tokens).toEqual(['token123', 'token456'])
  })

  it('replaces image placeholders', () => {
    const md = '![](__FEISHU_IMAGE_abc__) and ![](__FEISHU_IMAGE_def__)'
    const mapping = {
      abc: '/feishu-images/abc.png',
      def: '/feishu-images/def.png',
    }
    const result = replaceImagePlaceholders(md, mapping)
    expect(result).toBe('![](/feishu-images/abc.png) and ![](/feishu-images/def.png)')
  })

  it('keeps placeholder when no mapping exists', () => {
    const md = '![](__FEISHU_IMAGE_missing__)'
    const result = replaceImagePlaceholders(md, {})
    expect(result).toBe('![](__FEISHU_IMAGE_missing__)')
  })
})

describe('createFeishuLoader', () => {
  it('returns a valid ContentLoader shape', () => {
    const loader = createFeishuLoader({
      appId: 'test-id',
      appSecret: 'test-secret',
      documents: ['doc1'],
    })

    expect(loader.name).toBe('feishu')
    expect(typeof loader.load).toBe('function')
    expect(loader.devPollInterval).toBeUndefined()
  })

  it('uses custom devPollInterval', () => {
    const loader = createFeishuLoader({
      appId: 'test-id',
      appSecret: 'test-secret',
      devPollInterval: 30000,
    })

    expect(loader.devPollInterval).toBe(30000)
  })
})
