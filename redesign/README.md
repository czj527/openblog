# Redesign design track

这是 openblog 的设计轨道。当前阶段是**设计资产整理与方向重对齐**，不是生产实现。

> **2026-10-27 更新**：组合体验原型未通过用户评审；所有 HTML 实验原型已整体移入 [`archive/prototypes/`](../archive/prototypes/)。已确认的产品、设计、风格决策保留在仓库根部，继续作为后续设计依据。

## 阅读顺序

1. [`../DECISIONS.md`](../DECISIONS.md)：已确认决策、推荐项、待决问题和已否决项。
2. [`../DESIGN-BRIEF.md`](../DESIGN-BRIEF.md)：产品定性、体验模型、视觉与风格规划。
3. [`../AGENTS.md`](../AGENTS.md)：后续 Agent 的工作规则。
4. [`source/original-requirements.md`](./source/original-requirements.md)：用户原文的无密钥副本，唯一权威需求源。
5. [`source/requirements-addendum-20261026.md`](./source/requirements-addendum-20261026.md)：Workbench 与“避风港”定位增补。
6. [`_brief/CONTEXT.md`](./_brief/CONTEXT.md)：需求编号、工作假设和协作边界。
7. [`_brief/ART-DIRECTION.md`](./_brief/ART-DIRECTION.md)：首页“窗外”视觉方向。
8. [`_brief/design-status.md`](./_brief/design-status.md)：当前状态矩阵，区分硬要求、推荐、待决和归档。
9. [`_brief/decision-register.md`](./_brief/decision-register.md)：逐条决策与证据。
10. [`_brief/workbench-boundary.md`](./_brief/workbench-boundary.md)：Workbench 私有层、公开成果投影、与 Editorial / Plan / Ops 的边界。
11. [`_draft/`](./_draft/)：设计案草稿；未标为用户确认的内容不能直接视为契约。
12. [`research/`](./research/)：调研与技术预研证据。
13. [`../archive/prototypes/README.md`](../archive/prototypes/README.md)：历史原型；只在需要了解“尝试过什么”时读，不得作为基线。

> Workbench 是 2026-10-26 批准方案中的**需求增补**，不在 `source/original-requirements.md` 的既有条目内；已落盘为 [`source/requirements-addendum-20261026.md`](./source/requirements-addendum-20261026.md)。增补不改写原文，两者冲突时先回到用户确认记录重新决策。

## 当前判断

- **已确认**：个人小窝定位、四季 × 天气主题、首页沉浸视觉、二级页信息优先、成熟文章管理、Agent 原生运营、三层模型（Window 公开情绪 / Desk 公开信息 / Workbench 私有工作）、Workbench 默认私有、避风港体验、前期不填假内容、字段级经济公开、Plan 域只消费版本化公开快照、全球可访问中文首发、MCP 优先、MVP 占位天气与手动预览。
- **推荐但未确认**：Git + Markdown/frontmatter 内容契约、原生 WebGL2 渐进增强、Desk 左对齐三栏阅读布局、Workbench 首版四视图。
- **待决**：新视觉方向、域名/备案、写作适配器优先级、玻璃跨浏览器最终方案、Workbench 认证/私有存储/任务项目 schema、Workbench 四视图是否全部进入首版、Plan/Ops 是否只读、公开投影字段矩阵、MVP 互动和商业化范围。
- **已否决**：2026-10-27 的组合体验原型；此前所有 HTML 实验原型已一并归档。内部回归通过不等于用户验收。

## 设计门

- **D0 信息架构**：空状态、路由关系和未上线模块的隐藏行为。
- **D1 Window**：静态 poster、动态增强、HUD、手动覆盖与无障碍。
- **D2 Desk**：左对齐三栏阅读页、索引页和响应式断点。
- **D3 资产与主题**：四季/时段最小资产集、manifest 和参考站拆解。
- **D4 技术体验**：LCP、WebGL 降级、玻璃、雪/雾、移动端和跨浏览器。
- **D5 内容与规划**：Agent 发布闭环、内容契约、Ledger Snapshot 和字段可见性。
- **D6 Workbench**：本周/任务/项目/审阅四视图、私有入口与默认私有、公开成果投影白名单/撤回、Editorial/Plan/Ops 边界、Agent 对等、空状态与可用性。
- **D7 Composition**：把 Window、Desk、Workbench 和发布/投影链组合成同一体验。

D0–D7 的探索和内部验证已完成，但**用户已在 2026-10-27 否决组合原型的整体结果**。因此：

- 这些门只保留“探索过什么、验证过哪些技术点”的证据价值；
- 不能把任何原型写成“设计已通过”；
- 下一轮需要新的视觉/体验提案，并由用户重新评审；
- 生产认证、私有存储、MCP、服务端投影、真实内容和真机性能仍未实现。

## 参考站与截图

参考站 StyleKit、Linear、DeepSeek、Artificial Analysis、Apple、OpenColorful 等只作系统层参考：借鉴字号、间距、配色和博客版式的组织方式，不直接复用模板、提示词或代码，不采用衬线 + 暖色编辑模板。细节见 [`_brief/workbench-boundary.md`](./_brief/workbench-boundary.md) §10。

第三方参考站截图不进入仓库，已移到本地受限归档；说明见 [`research/refs/README.md`](./research/refs/README.md)。

## 原型

旧原型入口已归档：[`archive/prototypes/`](../archive/prototypes/)。不要在新设计或生产工程中复用其中的 CSS、JS、布局或状态机。
