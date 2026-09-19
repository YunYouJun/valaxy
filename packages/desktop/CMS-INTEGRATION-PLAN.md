# 客户端计划已迁入云栈

状态：本文件是迁移索引，旧的跨仓客户端建设方案已被替代。本轮只重订计划，尚未移动或删除运行代码。

## 唯一实施主体

Web、桌面、手机编辑器，以及 Valaxy 的内容、配置、主题、创建、预览、构建和发布适配，统一由 `YunLeFun/cms` 第一方维护。Valaxy 仓库继续负责框架、CLI、主题、DevTools 和通用 Node 接口，不再维护独立客户端产品。

主计划位于 CMS 仓库：

- `specs/valaxy-first-party-client/requirements.md`：产品范围与验收要求。
- `specs/valaxy-first-party-client/design.md`：模块归属、平台能力与迁移设计。
- `specs/valaxy-first-party-client/tasks.md`：P0–P7 可执行任务与阶段依赖。

## 对现有工作的处理

- 当前 `packages/desktop` 只保留为迁移资产与验证参考，后续功能在 CMS 实现。
- 将必要的 Electron 主进程、IPC、本地 Valaxy 运行适配、发布、打包与测试迁入 CMS `apps/desktop`；迁移期间不并行新增两套客户端功能。
- 源端使用 Valaxy workspace 打包的假设需要改成框架版本依赖；云栈共享工作台在同仓复用，无需先发布公开编辑器包。
- `valaxy-addon-ylf-cms` 不在本轮范围。云栈直接提供第一方能力，不通过 Addon 连接自身服务。
- CMS 迁移版验收通过后，再清理本仓库客户端包、脚本、专属依赖与安装包 CI。框架通用 API、DevTools 修复和其他工作保留。
- 不直接改 appId 或清空用户数据；应用改名与项目/草稿迁移单独验证。

## 推进顺序

P0 资产与运行边界 → P1 云栈统一工作台 → P2 桌面资产迁入 CMS 与 Valaxy 第一方适配 → P3 文本同步 → P4 手机入口 → P5 离线媒体 → P6 新手发布闭环 → P7 统一发行与源端清理。

“都在云栈实现”指代码与产品归属。CMS 服务端、Web 和手机仍不执行连接仓库的代码；完整预览与构建由授权的桌面本地运行模块或独立 CI 完成。CMS 现有仓库执行约定的适用范围在 P0 明确，本轮未修改规则。

现有原型与历史验证见 [PLAN.md](./PLAN.md)，视觉参考见 [PRODUCT-DIRECTION.md](./PRODUCT-DIRECTION.md)。历史结果不能代替迁移后的验证。
