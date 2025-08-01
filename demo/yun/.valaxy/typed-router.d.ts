/* eslint-disable */
/* prettier-ignore */
// @ts-nocheck
// Generated by unplugin-vue-router. ‼️ DO NOT MODIFY THIS FILE ‼️
// It's recommended to commit this file.
// Make sure to add this file to your tsconfig.json file as an "includes" or "files" entry.

declare module 'vue-router/auto-routes' {
  import type {
    RouteRecordInfo,
    ParamValue,
    ParamValueOneOrMore,
    ParamValueZeroOrMore,
    ParamValueZeroOrOne,
  } from 'vue-router'

  /**
   * Route name map generated by unplugin-vue-router
   */
  export interface RouteNamedMap {
    '/': RouteRecordInfo<'/', '/', Record<never, never>, Record<never, never>>,
    '/_drafts/README': RouteRecordInfo<'/_drafts/README', '/_drafts/README', Record<never, never>, Record<never, never>>,
    '/[...path]': RouteRecordInfo<'/[...path]', '/:path(.*)', { path: ParamValue<true> }, { path: ParamValue<false> }>,
    '/404': RouteRecordInfo<'/404', '/404', Record<never, never>, Record<never, never>>,
    '/about/': RouteRecordInfo<'/about/', '/about', Record<never, never>, Record<never, never>>,
    '/about/site': RouteRecordInfo<'/about/site', '/about/site', Record<never, never>, Record<never, never>>,
    '/albums/': RouteRecordInfo<'/albums/', '/albums', Record<never, never>, Record<never, never>>,
    '/albums/daily': RouteRecordInfo<'/albums/daily', '/albums/daily', Record<never, never>, Record<never, never>>,
    '/albums/miracle': RouteRecordInfo<'/albums/miracle', '/albums/miracle', Record<never, never>, Record<never, never>>,
    '/albums/sunset': RouteRecordInfo<'/albums/sunset', '/albums/sunset', Record<never, never>, Record<never, never>>,
    '/albums/young': RouteRecordInfo<'/albums/young', '/albums/young', Record<never, never>, Record<never, never>>,
    '/archives/': RouteRecordInfo<'/archives/', '/archives', Record<never, never>, Record<never, never>>,
    '/bangumi/': RouteRecordInfo<'/bangumi/', '/bangumi', Record<never, never>, Record<never, never>>,
    '/categories/': RouteRecordInfo<'/categories/', '/categories', Record<never, never>, Record<never, never>>,
    '/collections/': RouteRecordInfo<'/collections/', '/collections', Record<never, never>, Record<never, never>>,
    '/collections/hamster/': RouteRecordInfo<'/collections/hamster/', '/collections/hamster', Record<never, never>, Record<never, never>>,
    '/collections/hamster/1': RouteRecordInfo<'/collections/hamster/1', '/collections/hamster/1', Record<never, never>, Record<never, never>>,
    '/collections/hamster/2': RouteRecordInfo<'/collections/hamster/2', '/collections/hamster/2', Record<never, never>, Record<never, never>>,
    '/collections/hamster/3': RouteRecordInfo<'/collections/hamster/3', '/collections/hamster/3', Record<never, never>, Record<never, never>>,
    '/collections/hamster/dim-star-sky': RouteRecordInfo<'/collections/hamster/dim-star-sky', '/collections/hamster/dim-star-sky', Record<never, never>, Record<never, never>>,
    '/collections/hamster/hamsters-evolve-today': RouteRecordInfo<'/collections/hamster/hamsters-evolve-today', '/collections/hamster/hamsters-evolve-today', Record<never, never>, Record<never, never>>,
    '/collections/hamster/meeting': RouteRecordInfo<'/collections/hamster/meeting', '/collections/hamster/meeting', Record<never, never>, Record<never, never>>,
    '/collections/hamster/our-journey-is-the-stars-and-sea': RouteRecordInfo<'/collections/hamster/our-journey-is-the-stars-and-sea', '/collections/hamster/our-journey-is-the-stars-and-sea', Record<never, never>, Record<never, never>>,
    '/collections/hamster/the-duelist-romance': RouteRecordInfo<'/collections/hamster/the-duelist-romance', '/collections/hamster/the-duelist-romance', Record<never, never>, Record<never, never>>,
    '/collections/hamster/the-lizard-king': RouteRecordInfo<'/collections/hamster/the-lizard-king', '/collections/hamster/the-lizard-king', Record<never, never>, Record<never, never>>,
    '/collections/hamster/the-third-kind': RouteRecordInfo<'/collections/hamster/the-third-kind', '/collections/hamster/the-third-kind', Record<never, never>, Record<never, never>>,
    '/collections/hamster/they-are-the-gods': RouteRecordInfo<'/collections/hamster/they-are-the-gods', '/collections/hamster/they-are-the-gods', Record<never, never>, Record<never, never>>,
    '/collections/hamster/to-be-or-not-to-be': RouteRecordInfo<'/collections/hamster/to-be-or-not-to-be', '/collections/hamster/to-be-or-not-to-be', Record<never, never>, Record<never, never>>,
    '/collections/love-and-peace/': RouteRecordInfo<'/collections/love-and-peace/', '/collections/love-and-peace', Record<never, never>, Record<never, never>>,
    '/collections/love-and-peace/1': RouteRecordInfo<'/collections/love-and-peace/1', '/collections/love-and-peace/1', Record<never, never>, Record<never, never>>,
    '/collections/love-and-peace/2': RouteRecordInfo<'/collections/love-and-peace/2', '/collections/love-and-peace/2', Record<never, never>, Record<never, never>>,
    '/collections/love-and-peace/3': RouteRecordInfo<'/collections/love-and-peace/3', '/collections/love-and-peace/3', Record<never, never>, Record<never, never>>,
    '/collections/README': RouteRecordInfo<'/collections/README', '/collections/README', Record<never, never>, Record<never, never>>,
    '/examples/addons/components': RouteRecordInfo<'/examples/addons/components', '/examples/addons/components', Record<never, never>, Record<never, never>>,
    '/examples/code-height-limit': RouteRecordInfo<'/examples/code-height-limit', '/examples/code-height-limit', Record<never, never>, Record<never, never>>,
    '/examples/custom-components': RouteRecordInfo<'/examples/custom-components', '/examples/custom-components', Record<never, never>, Record<never, never>>,
    '/examples/sites': RouteRecordInfo<'/examples/sites', '/examples/sites', Record<never, never>, Record<never, never>>,
    '/examples/without-aside': RouteRecordInfo<'/examples/without-aside', '/examples/without-aside', Record<never, never>, Record<never, never>>,
    '/examples/without-sidebar': RouteRecordInfo<'/examples/without-sidebar', '/examples/without-sidebar', Record<never, never>, Record<never, never>>,
    '/girls/': RouteRecordInfo<'/girls/', '/girls', Record<never, never>, Record<never, never>>,
    '/links/': RouteRecordInfo<'/links/', '/links', Record<never, never>, Record<never, never>>,
    '/notes/': RouteRecordInfo<'/notes/', '/notes', Record<never, never>, Record<never, never>>,
    '/page/[page]': RouteRecordInfo<'/page/[page]', '/page/:page', { page: ParamValue<true> }, { page: ParamValue<false> }>,
    '/posts/': RouteRecordInfo<'/posts/', '/posts', Record<never, never>, Record<never, never>>,
    '/posts/abbrlink': RouteRecordInfo<'/posts/abbrlink', '/posts/abbrlink', Record<never, never>, Record<never, never>>,
    '/posts/about': RouteRecordInfo<'/posts/about', '/posts/about', Record<never, never>, Record<never, never>>,
    '/posts/aplayer': RouteRecordInfo<'/posts/aplayer', '/posts/aplayer', Record<never, never>, Record<never, never>>,
    '/posts/categories-a-b': RouteRecordInfo<'/posts/categories-a-b', '/posts/categories-a-b', Record<never, never>, Record<never, never>>,
    '/posts/categories-a-b-c': RouteRecordInfo<'/posts/categories-a-b-c', '/posts/categories-a-b-c', Record<never, never>, Record<never, never>>,
    '/posts/code': RouteRecordInfo<'/posts/code', '/posts/code', Record<never, never>, Record<never, never>>,
    '/posts/date': RouteRecordInfo<'/posts/date', '/posts/date', Record<never, never>, Record<never, never>>,
    '/posts/design': RouteRecordInfo<'/posts/design', '/posts/design', Record<never, never>, Record<never, never>>,
    '/posts/dev': RouteRecordInfo<'/posts/dev', '/posts/dev', Record<never, never>, Record<never, never>>,
    '/posts/draft': RouteRecordInfo<'/posts/draft', '/posts/draft', Record<never, never>, Record<never, never>>,
    '/posts/encrypted-part-post': RouteRecordInfo<'/posts/encrypted-part-post', '/posts/encrypted-part-post', Record<never, never>, Record<never, never>>,
    '/posts/encrypted-post': RouteRecordInfo<'/posts/encrypted-post', '/posts/encrypted-post', Record<never, never>, Record<never, never>>,
    '/posts/excerpt-type-ai': RouteRecordInfo<'/posts/excerpt-type-ai', '/posts/excerpt-type-ai', Record<never, never>, Record<never, never>>,
    '/posts/excerpt-type-html': RouteRecordInfo<'/posts/excerpt-type-html', '/posts/excerpt-type-html', Record<never, never>, Record<never, never>>,
    '/posts/excerpt-type-md': RouteRecordInfo<'/posts/excerpt-type-md', '/posts/excerpt-type-md', Record<never, never>, Record<never, never>>,
    '/posts/excerpt-type-text': RouteRecordInfo<'/posts/excerpt-type-text', '/posts/excerpt-type-text', Record<never, never>, Record<never, never>>,
    '/posts/framework-and-pages': RouteRecordInfo<'/posts/framework-and-pages', '/posts/framework-and-pages', Record<never, never>, Record<never, never>>,
    '/posts/hello-valaxy': RouteRecordInfo<'/posts/hello-valaxy', '/posts/hello-valaxy', Record<never, never>, Record<never, never>>,
    '/posts/hide': RouteRecordInfo<'/posts/hide', '/posts/hide', Record<never, never>, Record<never, never>>,
    '/posts/hide-in-index': RouteRecordInfo<'/posts/hide-in-index', '/posts/hide-in-index', Record<never, never>, Record<never, never>>,
    '/posts/how-to-use-adboard': RouteRecordInfo<'/posts/how-to-use-adboard', '/posts/how-to-use-adboard', Record<never, never>, Record<never, never>>,
    '/posts/katex': RouteRecordInfo<'/posts/katex', '/posts/katex', Record<never, never>, Record<never, never>>,
    '/posts/long-toc': RouteRecordInfo<'/posts/long-toc', '/posts/long-toc', Record<never, never>, Record<never, never>>,
    '/posts/lots-of-images': RouteRecordInfo<'/posts/lots-of-images', '/posts/lots-of-images', Record<never, never>, Record<never, never>>,
    '/posts/markdown': RouteRecordInfo<'/posts/markdown', '/posts/markdown', Record<never, never>, Record<never, never>>,
    '/posts/markdown-styles': RouteRecordInfo<'/posts/markdown-styles', '/posts/markdown-styles', Record<never, never>, Record<never, never>>,
    '/posts/mermaid': RouteRecordInfo<'/posts/mermaid', '/posts/mermaid', Record<never, never>, Record<never, never>>,
    '/posts/nested/a/b/c': RouteRecordInfo<'/posts/nested/a/b/c', '/posts/nested/a/b/c', Record<never, never>, Record<never, never>>,
    '/posts/nested/z/': RouteRecordInfo<'/posts/nested/z/', '/posts/nested/z', Record<never, never>, Record<never, never>>,
    '/posts/post-i18n': RouteRecordInfo<'/posts/post-i18n', '/posts/post-i18n', Record<never, never>, Record<never, never>>,
    '/posts/post-updated': RouteRecordInfo<'/posts/post-updated', '/posts/post-updated', Record<never, never>, Record<never, never>>,
    '/posts/redirect': RouteRecordInfo<'/posts/redirect', '/posts/redirect', Record<never, never>, Record<never, never>>,
    '/posts/test': RouteRecordInfo<'/posts/test', '/posts/test', Record<never, never>, Record<never, never>>,
    '/posts/test-images': RouteRecordInfo<'/posts/test-images', '/posts/test-images', Record<never, never>, Record<never, never>>,
    '/posts/test-tags': RouteRecordInfo<'/posts/test-tags', '/posts/test-tags', Record<never, never>, Record<never, never>>,
    '/posts/type-link-jump': RouteRecordInfo<'/posts/type-link-jump', '/posts/type-link-jump', Record<never, never>, Record<never, never>>,
    '/posts/中文Post测试': RouteRecordInfo<'/posts/中文Post测试', '/posts/中文Post测试', Record<never, never>, Record<never, never>>,
    '/posts/中文分类': RouteRecordInfo<'/posts/中文分类', '/posts/中文分类', Record<never, never>, Record<never, never>>,
    '/projects/': RouteRecordInfo<'/projects/', '/projects', Record<never, never>, Record<never, never>>,
    '/sponsors/': RouteRecordInfo<'/sponsors/', '/sponsors', Record<never, never>, Record<never, never>>,
    '/tags/': RouteRecordInfo<'/tags/', '/tags', Record<never, never>, Record<never, never>>,
    '/test/custom-blocks': RouteRecordInfo<'/test/custom-blocks', '/test/custom-blocks', Record<never, never>, Record<never, never>>,
    '/test/deadlinks': RouteRecordInfo<'/test/deadlinks', '/test/deadlinks', Record<never, never>, Record<never, never>>,
    '/test/define-basic-loader': RouteRecordInfo<'/test/define-basic-loader', '/test/define-basic-loader', Record<never, never>, Record<never, never>>,
    '/test/footnotes': RouteRecordInfo<'/test/footnotes', '/test/footnotes', Record<never, never>, Record<never, never>>,
    '/test/i18n': RouteRecordInfo<'/test/i18n', '/test/i18n', Record<never, never>, Record<never, never>>,
    '/test/markdown-file-inclusion': RouteRecordInfo<'/test/markdown-file-inclusion', '/test/markdown-file-inclusion', Record<never, never>, Record<never, never>>,
    '/test/special-character': RouteRecordInfo<'/test/special-character', '/test/special-character', Record<never, never>, Record<never, never>>,
    '/test/time_warning': RouteRecordInfo<'/test/time_warning', '/test/time_warning', Record<never, never>, Record<never, never>>,
    '/yun/': RouteRecordInfo<'/yun/', '/yun', Record<never, never>, Record<never, never>>,
  }
}
