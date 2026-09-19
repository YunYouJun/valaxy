---
title: Arknights 主题
categories: 主题
---

**valaxy-theme-arknights** 是 Valaxy 的 AI 主题开发示例，采用 AK UI 的 `system` 设计强度：冷白与石墨色阅读面、黄色行动色、原创工业几何，以及来自真实文章的档案列表。正文保持清晰的行宽和层级。

- [在线预览](https://arknights.valaxy.site/) · [npm 包](https://www.npmjs.com/package/valaxy-theme-arknights)
- [主题源码与更新记录](https://github.com/valaxyjs/valaxy-theme-arknights)
- [英文使用文档](/themes/arknights)
- [AI 主题设计简报与 Skill](/zh/themes/write#generate-a-theme-with-ai)
- [AK UI 设计语言与 Skill](https://ak-ui.yyj.moe/)
- [官方主题模板](https://github.com/valaxyjs/valaxy-theme-starter)

![Arknights 主题首页：边境手记与真实文章归档](/themes/arknights-preview.webp)

## 先运行示例

需要 Node.js **22.12+**、pnpm **10**。当前验证版本为 Valaxy **1.0.0-rc.11** 与 AK UI **1.1.0**。

```bash
pnpm dlx degit valaxyjs/valaxy-theme-arknights my-arknights-blog
cd my-arknights-blog
pnpm install
pnpm dev
```

`theme/` 是可分发的主题源码，`demo/` 是使用它的博客。主题已发布到 npm；已有 Valaxy 博客可以直接安装，方法见下方。

## 修改站点与主题配置

在 `demo/site.config.ts` 设置站点标题、简介、作者、网址和 `lang`；`zh-CN` 使用中文界面，其他语言使用英文界面。默认显示的「边境手记」是示例内容，可以全部替换。

在 `demo/valaxy.config.ts` 设置主题：

```ts
import type { ThemeConfig } from 'valaxy-theme-arknights'
import { defineValaxyConfig } from 'valaxy'

export default defineValaxyConfig<ThemeConfig>({
  theme: 'arknights',
  themeConfig: {
    eyebrow: 'MY FIELD NOTES',
    motto: '记录值得留下的事。',
    accent: '#ffd84a',
    outline: 'deep',
    nav: [
      { text: '首页', link: '/' },
      { text: '归档', link: '/archives/' },
      { text: '关于', link: '/about/' },
      { text: 'GitHub', link: 'https://github.com/your-name' },
    ],
    footer: '在自己的空间，留下自己的声音。',
  },
})
```

| 配置 | 默认值 | 用途 |
| --- | --- | --- |
| `eyebrow` | `PERSONAL FIELD NOTES` | 首页标题上方的短标签 |
| `motto` | `Observe. Record. Share.` | 首页下方的短句 |
| `accent` | `#ffd84a` | 行动按钮与原创几何的强调色；需与深色按钮文字保持对比 |
| `nav` | `[]` | 空数组显示首页与归档；自定义链接同时用于桌面与手机菜单 |
| `outline` | `'deep'` | 目录层级：数字、`[min, max]`、`'deep'` 或 `false` |
| `footer` | `''` | 页脚补充文字 |

导航支持站内路径、`https:` 和 `mailto:` 链接。链接指向的普通页面需要自己创建。

## 写文章与添加页面

在 `demo/pages/posts/` 新建 Markdown 文件，例如 `hello.md`：

```md
---
title: 第一份手记
description: 在这里写一段简短的文章介绍。
date: 2026-09-19
tags: [生活, 记录]
top: 1
---

## 从这里开始

文章内容仍然是普通 Markdown。
```

文章卡片使用 `description` 作为纯文本摘要。主题沿用 Valaxy 的文章排序，第一篇作为精选文章；`top` 可控制置顶。设为 `draft: true` 的文章不会出现在生产构建的列表中。搜索匹配标题，并可叠加标签筛选；它不是全文检索。

新建 `demo/pages/about.md` 即可得到 `/about/`。支持 `home`、`post`、`default`、`404` 布局；主题提供 `/`、`/archives/` 和 `/404`，用户同路径页面优先。文章正文静态生成，目录在页面加载后从实际标题生成。

## 安装到已有博客

在使用 Valaxy 1.x 的博客目录运行：

```bash
pnpm add valaxy-theme-arknights
```

在 `valaxy.config.ts` 设置 `theme: 'arknights'`，即可使用自己的文章和站点配置。查看 [npm 版本](https://www.npmjs.com/package/valaxy-theme-arknights)。

### 安装本地定制版本

如果修改了主题源码，在主题工作区打包：

```bash
pnpm check
pnpm pack:theme
```

然后在已有 Valaxy 博客中安装生成的文件（将路径替换为实际位置）：

```bash
pnpm add /absolute/path/to/artifacts/valaxy-theme-arknights-0.1.1.tgz
```

在博客的 `valaxy.config.ts` 设置 `theme: 'arknights'`，并保留自己的 `site.config.ts` 与 `pages/`。归档包含组件、布局、类型与样式，AK UI 作为主题运行时依赖自动安装；博客无需关联开发者本机工作区。

## 构建与部署

```bash
pnpm build
```

示例构建脚本明确运行 SSG，产物在 `demo/dist`。可部署到支持静态站点的服务。

示例的 `demo/vite.config.ts` 会把 `VITE_BASE` 传给 Vite 的 `base`。安装到已有博客时，也需要在自己的 `vite.config.ts` 中设置 `base`，或接入同样的环境变量。若部署在子路径，设置相同的 `VITE_BASE` 与 `siteConfig.url`。例如 macOS/Linux：

```bash
VITE_BASE=/my-blog/ pnpm build
```

PowerShell：

```powershell
$env:VITE_BASE = '/my-blog/'
pnpm build
```

官方示例通过 Cloudflare Pages 自动部署到 [arknights.valaxy.site](https://arknights.valaxy.site/)。推送 `main` 更新预览；版本标签通过 OIDC 发布 npm。详见[发布与部署说明](https://github.com/valaxyjs/valaxy-theme-arknights/blob/main/docs/releasing.md)。

备用的手动 GitHub Pages 工作流使用 `/valaxy-theme-arknights/`；复制仓库后应改成自己的路径。部署和 npm 发布是独立操作，生成主题不会自动执行它们。

## 用新版 AK UI Skill 继续定制

```bash
pnpm dlx skills add YunYouJun/valaxy --skill valaxy-theme
pnpm dlx skills add YunYouJun/ak-ui --skill ak-ui
```

主题 Skill 负责 Valaxy 结构与验证，AK UI Skill 负责设计语言和交互接入；设计简报提供本次需求。可在 [生成器](/zh/themes/write#generate-a-theme-with-ai) 选择 **AK UI / Arknights**，修改主题时选择 **修改现有主题**。

这个示例使用 CSS Core 与语义 Token，并从 AK UI 1.1 的 `/site` 引入 `createMobileMenu`：手机菜单提供 Escape 关闭、焦点限制与返回、链接关闭和桌面断点关闭；无 JavaScript 时保留普通导航。控制器在挂载后初始化，卸载时清理，兼容 SSR 与减少动态效果偏好。

检查首页和长文、筛选空状态、深浅色、手机菜单与键盘导航。涉及依赖或导出变更时，额外把 `.tgz` 安装到独立博客验证。源码仓库的 `tests/browser_smoke.py` 可复用这些回归检查。

这是独立、非官方的原创主题，与《明日方舟》及其权利方无关联，不包含游戏素材。代码使用 MIT 许可。
