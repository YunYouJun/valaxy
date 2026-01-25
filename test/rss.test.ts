import type { Author, Item } from 'feed'
import type { ResolvedValaxyOptions } from '../packages/valaxy/node'
import { resolve } from 'node:path'
import fs from 'fs-extra'
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import { getPosts } from '../packages/valaxy/node/modules/rss/utils'

const mockUserRoot = resolve(__dirname, 'fixtures/rss')

describe('rss utils', () => {
  beforeEach(async () => {
    // Create test fixtures
    await fs.ensureDir(mockUserRoot)
    await fs.ensureDir(resolve(mockUserRoot, 'pages/posts'))

    // Create test markdown files
    await fs.writeFile(
      resolve(mockUserRoot, 'pages/posts/post1.md'),
      `---
title: Test Post 1
date: 2024-01-01
description: First test post
---
# Post 1
This is the content of post 1.`,
      'utf-8',
    )

    await fs.writeFile(
      resolve(mockUserRoot, 'pages/posts/post2.md'),
      `---
title: Test Post 2
date: 2024-01-15
updated: 2024-01-20
description: Second test post
---
# Post 2
This is the content of post 2.`,
      'utf-8',
    )

    await fs.writeFile(
      resolve(mockUserRoot, 'pages/posts/draft.md'),
      `---
title: Draft Post
date: 2024-01-10
draft: true
---
# Draft
This is a draft.`,
      'utf-8',
    )

    await fs.writeFile(
      resolve(mockUserRoot, 'pages/posts/encrypted.md'),
      `---
title: Encrypted Post
date: 2024-01-05
password: secret
---
# Encrypted
This is encrypted.`,
      'utf-8',
    )

    await fs.writeFile(
      resolve(mockUserRoot, 'pages/posts/hidden.md'),
      `---
title: Hidden Post
date: 2024-01-08
hide: true
---
# Hidden
This is hidden.`,
      'utf-8',
    )
  })

  afterEach(async () => {
    // Clean up
    await fs.remove(mockUserRoot)
    vi.clearAllMocks()
  })

  describe('getPosts', () => {
    it('should filter out draft, encrypted, and hidden posts', async () => {
      const author: Author = {
        name: 'Test Author',
        email: 'test@example.com',
      }

      const files = [
        resolve(mockUserRoot, 'pages/posts/post1.md'),
        resolve(mockUserRoot, 'pages/posts/post2.md'),
        resolve(mockUserRoot, 'pages/posts/draft.md'),
        resolve(mockUserRoot, 'pages/posts/encrypted.md'),
        resolve(mockUserRoot, 'pages/posts/hidden.md'),
      ]

      const mockOptions = {
        userRoot: mockUserRoot,
        config: {
          siteConfig: {
            url: 'https://example.com/',
            lang: 'en',
          },
          modules: {
            rss: {
              fullText: false,
              extractImagePathsFromHTML: true,
            },
          },
        },
      } as ResolvedValaxyOptions

      const posts = await getPosts({
        author,
        files,
        DOMAIN: 'https://example.com',
      }, mockOptions)

      expect(posts).toHaveLength(2)
      expect(posts?.map(p => p.title)).toEqual(['Test Post 2', 'Test Post 1'])
    })

    it('should sort posts by date (default)', async () => {
      const author: Author = {
        name: 'Test Author',
        email: 'test@example.com',
      }

      const files = [
        resolve(mockUserRoot, 'pages/posts/post1.md'),
        resolve(mockUserRoot, 'pages/posts/post2.md'),
      ]

      const mockOptions = {
        userRoot: mockUserRoot,
        config: {
          siteConfig: {
            url: 'https://example.com/',
            lang: 'en',
            orderBy: 'date',
          },
          modules: {
            rss: {
              fullText: false,
              extractImagePathsFromHTML: true,
            },
          },
        },
      } as ResolvedValaxyOptions

      const posts = await getPosts({
        author,
        files,
        DOMAIN: 'https://example.com',
      }, mockOptions)

      expect(posts).toHaveLength(2)
      expect(posts![0].title).toBe('Test Post 2') // 2024-01-15
      expect(posts![1].title).toBe('Test Post 1') // 2024-01-01
    })

    it('should sort posts by updated time when orderBy is "updated"', async () => {
      const author: Author = {
        name: 'Test Author',
        email: 'test@example.com',
      }

      // Create additional test post with later date but earlier update
      await fs.writeFile(
        resolve(mockUserRoot, 'pages/posts/post3.md'),
        `---
title: Test Post 3
date: 2024-01-25
updated: 2024-01-10
description: Third test post
---
# Post 3
This is the content of post 3.`,
        'utf-8',
      )

      const files = [
        resolve(mockUserRoot, 'pages/posts/post1.md'),
        resolve(mockUserRoot, 'pages/posts/post2.md'),
        resolve(mockUserRoot, 'pages/posts/post3.md'),
      ]

      const mockOptions = {
        userRoot: mockUserRoot,
        config: {
          siteConfig: {
            url: 'https://example.com/',
            lang: 'en',
            orderBy: 'updated',
            lastUpdated: true,
          },
          modules: {
            rss: {
              fullText: false,
              extractImagePathsFromHTML: true,
            },
          },
        },
      } as ResolvedValaxyOptions

      const posts = await getPosts({
        author,
        files,
        DOMAIN: 'https://example.com',
      }, mockOptions)

      expect(posts).toHaveLength(3)

      // When orderBy is 'updated', posts should be sorted by updated time (or fallback to date)
      const post2 = posts!.find(p => p.title === 'Test Post 2')
      const post3 = posts!.find(p => p.title === 'Test Post 3')

      // Verify post2 has explicit updated time (2024-01-20)
      expect(post2).toBeDefined()
      const post2Data = post2 as Item & { updated?: Date }
      expect(post2Data.updated).toBeDefined()

      // Verify post3 has explicit updated time (2024-01-10)
      expect(post3).toBeDefined()
      const post3Data = post3 as Item & { updated?: Date }
      expect(post3Data.updated).toBeDefined()

      // post2 should come before post3 (2024-01-20 > 2024-01-10)
      const post2Index = posts!.indexOf(post2!)
      const post3Index = posts!.indexOf(post3!)
      expect(post2Index).toBeLessThan(post3Index)
    })

    it('should include required RSS fields', async () => {
      const author: Author = {
        name: 'Test Author',
        email: 'test@example.com',
      }

      const files = [
        resolve(mockUserRoot, 'pages/posts/post1.md'),
      ]

      const mockOptions = {
        userRoot: mockUserRoot,
        config: {
          siteConfig: {
            url: 'https://example.com/',
            lang: 'en',
          },
          modules: {
            rss: {
              fullText: false,
              extractImagePathsFromHTML: true,
            },
          },
        },
      } as ResolvedValaxyOptions

      const posts = await getPosts({
        author,
        files,
        DOMAIN: 'https://example.com',
      }, mockOptions)

      expect(posts).toHaveLength(1)
      const post = posts![0] as Item & { updated?: Date, published?: Date }

      expect(post.title).toBe('Test Post 1')
      expect(post.description).toBe('First test post')
      expect(post.date).toBeInstanceOf(Date)
      expect(post.published).toBeInstanceOf(Date)
      expect(post.content).toContain('<h1>Post 1</h1>')
      expect(post.content).toContain('Visit <a href="https://example.com/posts/post1"')
      expect(post.link).toBe('https://example.com/posts/post1')
      expect(post.author).toEqual([author])
    })

    it('should include updated field when present', async () => {
      const author: Author = {
        name: 'Test Author',
        email: 'test@example.com',
      }

      const files = [
        resolve(mockUserRoot, 'pages/posts/post2.md'),
      ]

      const mockOptions = {
        userRoot: mockUserRoot,
        config: {
          siteConfig: {
            url: 'https://example.com/',
            lang: 'en',
            lastUpdated: true,
          },
          modules: {
            rss: {
              fullText: false,
              extractImagePathsFromHTML: true,
            },
          },
        },
      } as ResolvedValaxyOptions

      const posts = await getPosts({
        author,
        files,
        DOMAIN: 'https://example.com',
      }, mockOptions)

      expect(posts).toHaveLength(1)
      const post = posts![0] as Item & { updated?: Date }

      expect(post.updated).toBeInstanceOf(Date)
      expect(post.updated?.toISOString()).toContain('2024-01-20')
    })

    it('should render full text when fullText is true', async () => {
      const author: Author = {
        name: 'Test Author',
        email: 'test@example.com',
      }

      const files = [
        resolve(mockUserRoot, 'pages/posts/post1.md'),
      ]

      const mockOptions = {
        userRoot: mockUserRoot,
        config: {
          siteConfig: {
            url: 'https://example.com/',
            lang: 'en',
          },
          modules: {
            rss: {
              fullText: true,
              extractImagePathsFromHTML: true,
            },
          },
        },
      } as ResolvedValaxyOptions

      const posts = await getPosts({
        author,
        files,
        DOMAIN: 'https://example.com',
      }, mockOptions)

      expect(posts).toHaveLength(1)
      const post = posts![0]

      expect(post.content).toContain('<h1>Post 1</h1>')
      expect(post.content).toContain('This is the content of post 1.')
      expect(post.content).toContain('view original article')
    })

    it('should handle Chinese locale', async () => {
      const author: Author = {
        name: '测试作者',
        email: 'test@example.com',
      }

      const files = [
        resolve(mockUserRoot, 'pages/posts/post1.md'),
      ]

      const mockOptions = {
        userRoot: mockUserRoot,
        config: {
          siteConfig: {
            url: 'https://example.com/',
            lang: 'zh-CN',
          },
          modules: {
            rss: {
              fullText: false,
              extractImagePathsFromHTML: true,
            },
          },
        },
      } as ResolvedValaxyOptions

      const posts = await getPosts({
        author,
        files,
        DOMAIN: 'https://example.com',
      }, mockOptions)

      expect(posts).toHaveLength(1)
      const post = posts![0]

      expect(post.content).toContain('阅读全文')
      expect(post.content).toContain('访问')
    })

    it('should convert relative image URLs to absolute', async () => {
      await fs.writeFile(
        resolve(mockUserRoot, 'pages/posts/post-with-image.md'),
        `---
title: Post with Image
date: 2024-01-01
image: /images/cover.jpg
---
![Test](/images/test.png)`,
        'utf-8',
      )

      const author: Author = {
        name: 'Test Author',
        email: 'test@example.com',
      }

      const files = [
        resolve(mockUserRoot, 'pages/posts/post-with-image.md'),
      ]

      const mockOptions = {
        userRoot: mockUserRoot,
        config: {
          siteConfig: {
            url: 'https://example.com/',
            lang: 'en',
          },
          modules: {
            rss: {
              fullText: true,
              extractImagePathsFromHTML: true,
            },
          },
        },
      } as ResolvedValaxyOptions

      const posts = await getPosts({
        author,
        files,
        DOMAIN: 'https://example.com',
      }, mockOptions)

      expect(posts).toHaveLength(1)
      const post = posts![0]

      expect(post.image).toBe('https://example.com/images/cover.jpg')
      expect(post.content).toContain('src="https://example.com/images/test.png"')
    })

    it('should convert relative image paths without built HTML', async () => {
      await fs.ensureDir(resolve(mockUserRoot, 'pages/posts/hello-valaxy'))
      await fs.writeFile(
        resolve(mockUserRoot, 'pages/posts/hello-valaxy/index.md'),
        `---
title: Hello Valaxy
date: 2024-01-01
---
![pic](test.webp)
![pic2](./another.png)`,
        'utf-8',
      )

      const author: Author = {
        name: 'Test Author',
        email: 'test@example.com',
      }

      const files = [
        resolve(mockUserRoot, 'pages/posts/hello-valaxy/index.md'),
      ]

      const mockOptions = {
        userRoot: mockUserRoot,
        config: {
          siteConfig: {
            url: 'https://example.com/',
            lang: 'en',
          },
          modules: {
            rss: {
              fullText: true,
              extractImagePathsFromHTML: true,
            },
          },
        },
      } as ResolvedValaxyOptions

      const posts = await getPosts({
        author,
        files,
        DOMAIN: 'https://example.com',
      }, mockOptions)

      expect(posts).toHaveLength(1)
      const post = posts![0]

      // Without built HTML, relative paths should be converted to post directory URLs
      expect(post.content).toContain('src="https://example.com/posts/hello-valaxy/test.webp"')
      expect(post.content).toContain('src="https://example.com/posts/hello-valaxy/another.png"')
    })

    it('should use built HTML asset paths when available', async () => {
      // Create the markdown file
      await fs.ensureDir(resolve(mockUserRoot, 'pages/posts/hello-valaxy'))
      await fs.writeFile(
        resolve(mockUserRoot, 'pages/posts/hello-valaxy/index.md'),
        `---
title: Hello Valaxy
date: 2024-01-01
---
![pic](test.webp)`,
        'utf-8',
      )

      // Create a mock built HTML file with hashed asset
      await fs.ensureDir(resolve(mockUserRoot, 'dist/posts/hello-valaxy'))
      await fs.writeFile(
        resolve(mockUserRoot, 'dist/posts/hello-valaxy/index.html'),
        `<!DOCTYPE html>
<html>
<body>
  <img src="/assets/test.zBFFFKJX.webp" alt="pic">
</body>
</html>`,
        'utf-8',
      )

      const author: Author = {
        name: 'Test Author',
        email: 'test@example.com',
      }

      const files = [
        resolve(mockUserRoot, 'pages/posts/hello-valaxy/index.md'),
      ]

      const mockOptions = {
        userRoot: mockUserRoot,
        config: {
          siteConfig: {
            url: 'https://example.com/',
            lang: 'en',
          },
          modules: {
            rss: {
              fullText: true,
              extractImagePathsFromHTML: true,
            },
          },
        },
      } as ResolvedValaxyOptions

      const posts = await getPosts({
        author,
        files,
        DOMAIN: 'https://example.com',
      }, mockOptions)

      expect(posts).toHaveLength(1)
      const post = posts![0]

      // With built HTML, should use the actual hashed asset path
      expect(post.content).toContain('src="https://example.com/assets/test.zBFFFKJX.webp"')
    })

    it('should not extract image paths when extractImagePathsFromHTML is false', async () => {
      // Create the markdown file
      await fs.ensureDir(resolve(mockUserRoot, 'pages/posts/hello-valaxy-no-extract'))
      await fs.writeFile(
        resolve(mockUserRoot, 'pages/posts/hello-valaxy-no-extract/index.md'),
        `---
title: Hello Valaxy No Extract
date: 2024-01-01
---
![pic](test.webp)`,
        'utf-8',
      )

      // Create a mock built HTML file with hashed asset (this should be ignored)
      await fs.ensureDir(resolve(mockUserRoot, 'dist/posts/hello-valaxy-no-extract'))
      await fs.writeFile(
        resolve(mockUserRoot, 'dist/posts/hello-valaxy-no-extract/index.html'),
        `<!DOCTYPE html>
<html>
<body>
  <img src="/assets/test.zBFFFKJX.webp" alt="pic">
</body>
</html>`,
        'utf-8',
      )

      const author: Author = {
        name: 'Test Author',
        email: 'test@example.com',
      }

      const files = [
        resolve(mockUserRoot, 'pages/posts/hello-valaxy-no-extract/index.md'),
      ]

      const mockOptions = {
        userRoot: mockUserRoot,
        config: {
          siteConfig: {
            url: 'https://example.com/',
            lang: 'en',
          },
          modules: {
            rss: {
              fullText: true,
              extractImagePathsFromHTML: false,
            },
          },
        },
      } as ResolvedValaxyOptions

      const posts = await getPosts({
        author,
        files,
        DOMAIN: 'https://example.com',
      }, mockOptions)

      expect(posts).toHaveLength(1)
      const post = posts![0]

      // Without HTML extraction, should use fallback URL construction
      expect(post.content).toContain('src="https://example.com/posts/hello-valaxy-no-extract/test.webp"')
      // Should NOT contain the hashed asset path
      expect(post.content).not.toContain('zBFFFKJX')
    })
  })
})
