<script lang="ts" setup>
import { computed, shallowRef } from 'vue'
import { useI18n } from 'vue-i18n'

const { t, locale } = useI18n()

const frameworks = [
  { id: 'hexo', name: 'Hexo' },
  { id: 'hugo', name: 'Hugo' },
  { id: 'jekyll', name: 'Jekyll' },
  { id: 'wordpress', name: 'WordPress' },
  { id: 'typecho', name: 'Typecho' },
  { id: 'vitepress', name: 'VitePress' },
  { id: 'other', name: () => t('migration.prompt.other') },
]

const selected = shallowRef('hexo')

const isZh = computed(() => locale.value === 'zh-CN')

const prompts: Record<string, { zh: string, en: string }> = {
  hexo: {
    zh: `我正在将博客从 Hexo 迁移到 Valaxy。请帮我完成以下工作：

1. 将 Hexo source/_posts 中的 Markdown 文件迁移到 Valaxy pages/posts 目录
2. 转换 Hexo frontmatter 格式为 Valaxy 支持的格式（如 date、tags、categories）
3. 将 Hexo _config.yml 中的站点配置转换为 Valaxy 的 site.config.ts 和 valaxy.config.ts
4. 迁移静态资源（图片等）从 source 到 public 目录
5. 如果使用了 Hexo 特有的标签插件（tag plugins），转换为 Valaxy/Markdown 等效写法`,
    en: `I'm migrating my blog from Hexo to Valaxy. Please help me with:

1. Migrate Markdown files from Hexo source/_posts to Valaxy pages/posts directory
2. Convert Hexo frontmatter format to Valaxy-supported format (date, tags, categories)
3. Convert Hexo _config.yml site configuration to Valaxy's site.config.ts and valaxy.config.ts
4. Migrate static assets (images, etc.) from source to public directory
5. Convert any Hexo tag plugins to Valaxy/Markdown equivalents`,
  },
  hugo: {
    zh: `我正在将博客从 Hugo 迁移到 Valaxy。请帮我完成以下工作：

1. 将 Hugo content/posts 中的 Markdown 文件迁移到 Valaxy pages/posts 目录
2. 转换 Hugo frontmatter 格式为 Valaxy 支持的格式
3. 将 Hugo config.toml/hugo.toml 中的配置转换为 Valaxy 的 site.config.ts 和 valaxy.config.ts
4. 迁移静态资源从 static 到 public 目录
5. 转换 Hugo shortcodes 为 Valaxy/Markdown 等效写法`,
    en: `I'm migrating my blog from Hugo to Valaxy. Please help me with:

1. Migrate Markdown files from Hugo content/posts to Valaxy pages/posts directory
2. Convert Hugo frontmatter format to Valaxy-supported format
3. Convert Hugo config.toml/hugo.toml to Valaxy's site.config.ts and valaxy.config.ts
4. Migrate static assets from static to public directory
5. Convert Hugo shortcodes to Valaxy/Markdown equivalents`,
  },
  jekyll: {
    zh: `我正在将博客从 Jekyll 迁移到 Valaxy。请帮我完成以下工作：

1. 将 Jekyll _posts 中的 Markdown 文件迁移到 Valaxy pages/posts 目录（去掉文件名中的日期前缀）
2. 转换 Jekyll frontmatter 格式为 Valaxy 支持的格式
3. 将 Jekyll _config.yml 中的配置转换为 Valaxy 的 site.config.ts 和 valaxy.config.ts
4. 迁移静态资源从 assets 到 public 目录
5. 转换 Jekyll Liquid 模板标签为 Valaxy/Markdown 等效写法`,
    en: `I'm migrating my blog from Jekyll to Valaxy. Please help me with:

1. Migrate Markdown files from Jekyll _posts to Valaxy pages/posts directory (remove date prefix from filenames)
2. Convert Jekyll frontmatter format to Valaxy-supported format
3. Convert Jekyll _config.yml to Valaxy's site.config.ts and valaxy.config.ts
4. Migrate static assets from assets to public directory
5. Convert Jekyll Liquid template tags to Valaxy/Markdown equivalents`,
  },
  wordpress: {
    zh: `我正在将博客从 WordPress 迁移到 Valaxy。请帮我完成以下工作：

1. 将 WordPress 导出的文章（XML/HTML）转换为 Markdown 文件，放入 Valaxy pages/posts 目录
2. 为每篇文章生成正确的 Valaxy frontmatter（title、date、tags、categories）
3. 创建 Valaxy 的 site.config.ts 和 valaxy.config.ts 配置文件
4. 迁移图片和媒体文件到 public 目录，并更新文章中的引用路径
5. 将 WordPress 的 HTML 内容转换为 Markdown 格式`,
    en: `I'm migrating my blog from WordPress to Valaxy. Please help me with:

1. Convert WordPress exported posts (XML/HTML) to Markdown files in Valaxy pages/posts directory
2. Generate proper Valaxy frontmatter for each post (title, date, tags, categories)
3. Create Valaxy's site.config.ts and valaxy.config.ts configuration files
4. Migrate images and media files to public directory and update references in posts
5. Convert WordPress HTML content to Markdown format`,
  },
  typecho: {
    zh: `我正在将博客从 Typecho 迁移到 Valaxy。请帮我完成以下工作：

1. 将 Typecho 数据库中导出的文章转换为 Markdown 文件，放入 Valaxy pages/posts 目录
2. 为每篇文章生成正确的 Valaxy frontmatter（title、date、tags、categories）
3. 创建 Valaxy 的 site.config.ts 和 valaxy.config.ts 配置文件
4. 迁移附件和图片到 public 目录，并更新文章中的引用路径`,
    en: `I'm migrating my blog from Typecho to Valaxy. Please help me with:

1. Convert Typecho exported posts to Markdown files in Valaxy pages/posts directory
2. Generate proper Valaxy frontmatter for each post (title, date, tags, categories)
3. Create Valaxy's site.config.ts and valaxy.config.ts configuration files
4. Migrate attachments and images to public directory and update references in posts`,
  },
  vitepress: {
    zh: `我正在将站点从 VitePress 迁移到 Valaxy。请帮我完成以下工作：

1. 将 VitePress 的 Markdown 文件迁移到 Valaxy pages/posts 目录
2. 转换 VitePress frontmatter 格式为 Valaxy 支持的格式
3. 将 VitePress .vitepress/config.ts 转换为 Valaxy 的 site.config.ts 和 valaxy.config.ts
4. 迁移静态资源从 public 到 Valaxy 的 public 目录
5. 转换 VitePress 特有的 Markdown 扩展语法（如自定义容器）为 Valaxy 等效写法`,
    en: `I'm migrating my site from VitePress to Valaxy. Please help me with:

1. Migrate VitePress Markdown files to Valaxy pages/posts directory
2. Convert VitePress frontmatter format to Valaxy-supported format
3. Convert VitePress .vitepress/config.ts to Valaxy's site.config.ts and valaxy.config.ts
4. Migrate static assets from public to Valaxy's public directory
5. Convert VitePress-specific Markdown extensions (custom containers, etc.) to Valaxy equivalents`,
  },
  other: {
    zh: `我正在将博客从 [你的框架名称] 迁移到 Valaxy。请帮我完成以下工作：

1. 将现有文章转换为 Markdown 格式，放入 Valaxy pages/posts 目录
2. 为每篇文章生成正确的 Valaxy frontmatter（title、date、tags、categories）
3. 创建 Valaxy 的 site.config.ts 和 valaxy.config.ts 配置文件
4. 迁移静态资源（图片等）到 public 目录
5. 参考 Valaxy 文档调整不兼容的语法和配置`,
    en: `I'm migrating my blog from [Your Framework Name] to Valaxy. Please help me with:

1. Convert existing posts to Markdown format in Valaxy pages/posts directory
2. Generate proper Valaxy frontmatter for each post (title, date, tags, categories)
3. Create Valaxy's site.config.ts and valaxy.config.ts configuration files
4. Migrate static assets (images, etc.) to public directory
5. Adjust incompatible syntax and configurations following Valaxy documentation`,
  },
}

const currentPrompt = computed(() => {
  const p = prompts[selected.value]
  return isZh.value ? p.zh : p.en
})
</script>

<template>
  <div class="migration-prompt" my-4>
    <div
      class="framework-selector"
      role="group"
      flex="~ wrap gap-2"
      mb-3
      :aria-label="t('migration.prompt.frameworkLabel')"
    >
      <button
        v-for="fw in frameworks"
        :key="fw.id"
        type="button"
        class="framework-btn"
        :class="{ active: selected === fw.id }"
        :aria-pressed="selected === fw.id"
        px-3 py-1.5 rounded-md text-sm cursor-pointer
        border="~ solid $va-c-divider"
        transition="colors duration-200"
        @click="selected = fw.id"
      >
        {{ typeof fw.name === 'function' ? fw.name() : fw.name }}
      </button>
    </div>

    <PromptCopy
      :prompt="currentPrompt"
      :copy-label="t('migration.prompt.copy')"
      :copied-label="t('migration.prompt.copied')"
    />
  </div>
</template>

<style scoped>
.framework-btn {
  background: var(--va-c-bg);
  color: var(--va-c-text);
}

.framework-btn:hover {
  border-color: var(--va-c-primary);
  color: var(--va-c-text);
}

.framework-btn.active {
  border-color: var(--va-c-primary);
  background: var(--va-c-bg-soft);
  box-shadow: inset 0 0 0 1px var(--va-c-primary);
  color: var(--va-c-text);
  font-weight: 600;
}

.framework-btn:focus-visible {
  outline: 2px solid var(--va-c-primary);
  outline-offset: 2px;
}
</style>
