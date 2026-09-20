# valaxy-addon-typedoc

在 Valaxy 站内生成 TypeScript API 参考文档。TypeDoc 仅在 Node 侧运行，Press 提供导航和文档布局。

本插件依赖下一版 Valaxy 的生成内容集成能力。该版本发布前，请在本仓库的 pnpm workspace 中使用。

```ts
import { defineValaxyConfig } from 'valaxy'
import { addonTypeDoc } from 'valaxy-addon-typedoc'

export default defineValaxyConfig({
  theme: 'press',
  addons: [addonTypeDoc({
    options: './typedoc.json',
    watch: ['../src/**/*.ts', './tsconfig*.json'],
    routeBase: '/api/',
    // 自己编写 pages/api/index.md 总览时启用。
    excludeIndex: true,
  })],
})
```

```json
{
  "entryPoints": ["../src/index.ts"],
  "tsconfig": "./tsconfig.typedoc.json",
  "excludePrivate": true,
  "excludeProtected": true,
  "excludeInternal": true
}
```

`options`、`watch` 相对 Valaxy 站点目录；TypeDoc JSON 中的路径相对该配置文件。请显式指定 `tsconfig`，避免误用文档应用的编译配置。`watch` 应覆盖源码目录，以发现新增文件和导出；插件还会追踪 TypeScript 依赖声明及继承的编译配置。

插件负责 Markdown 输出，生成文件位于 `.valaxy/content/pages/`，不要手动编辑。缓存键包含源码内容、配置、依赖声明、编译器和插件版本、Git 提交。删除 `.valaxy/content/` 可强制重新生成。

开发模式会合并短时间变更并串行生成；普通 Markdown 修改不会触发 TypeDoc。生成失败时保留上次成功页面并输出错误；生产模式直接阻断构建，输入匹配的缓存可正常复用。空文档、重复路由以及与手写页面冲突均会报错。

自动侧栏只写入 `routeBase` 分区，保留其他分区；使用 `sidebar: false` 可自行管理导航。生成页标记 `sharedLocale: true`，切换界面语言保持同一个参考 URL。`themeConfig.apiReference` 和页面的 `apiSource` 提供源码提交、可获取的包版本及未提交修改标记。

使用教程与示例继续手写。可选的 `<PressApiIndex :groups="groups" />` 提供分类和即时筛选；每组包含 `title` 和 `items: { text, link }[]`。

按普通 Valaxy 站点部署即可。旧 API 域名的 HTTP 重定向需在旧域名的托管平台配置，安装插件不会修改 DNS 或重定向。
