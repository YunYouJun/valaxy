# 开发依赖补丁

## braces 3.0.3

`braces@3.0.3.patch` 用于修复开发工具链的深层嵌套模式导致递归栈耗尽问题
（[GHSA-vfj7-8cjw-p6xm](https://github.com/advisories/GHSA-vfj7-8cjw-p6xm)）。
Stylelint 和可选 GitHub Pages 部署工具的开发依赖会使用它。

补丁采用上游 [PR #72](https://github.com/micromatch/braces/pull/72)
提交 `28d440b5dd449dbf1fe6f3506cf94ecca4d02660` 的五个 `lib/` 文件改动，
保留原包及其 MIT 许可证，不改变包名或版本号：

- 在解析和直接接收 AST 的入口限制花括号、圆括号嵌套深度，硬上限为 100。
- 防止通过非有限值或过大的 `maxDepth` 绕过限制。
- 在展开 AST 时拒绝循环父链。

`test/tooling-braces.test.ts` 从两条实际依赖链解析已安装的包，验证恶意字符串、
直接 AST、循环引用和普通模式，并验证 Stylelint 文件发现、排除及诊断功能。
正常的花括号分组、范围及嵌套模式保持原行为；超过限制的模式会收到明确错误。

截至 2026-10-04，上游没有发布修复版。`pnpm audit` 按版本号检查，不能识别
本地补丁，因此完整仓库审计仍会报告这项 High；没有配置审计忽略。
正式发布的运行时依赖不包含 `braces`，生产依赖审计应保持零告警。
此补丁仅作用于本仓库，不能修复用户另行安装的 `gh-pages`。
待上游发布修复版后，升级依赖并移除此补丁，继续保留回归测试。
