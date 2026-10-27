# Prototype archive / 原型废案

> **状态：已归档（2026-10-27）。用户评审未通过，不得作为设计基线。**
> 这些文件只用于回答“当时尝试过什么、验证过什么”，不用于回答“下一版应该长什么样”。

## 为什么在这里

用户已明确表示组合原型“并不能符合我的要求”。因此：

- 组合原型、单页实验、架构图和测试 fixture 全部移入本目录；
- 内部回归结果保留在 [`VALIDATION.md`](./VALIDATION.md)，但只证明合成交互自洽，**不等于用户验收**；
- 已确认的产品、设计、风格决策已提炼到仓库根部的 [`DECISIONS.md`](../../DECISIONS.md) 和 [`DESIGN-BRIEF.md`](../../DESIGN-BRIEF.md)。

## 内容清单

| 文件 | 当时的用途 | 当前状态 |
|---|---|---|
| `composed-prototype.html` + `composed-runtime.js` | Window / Desk / Workbench / 文章链 / Plan 投影的组合演示 | 已否决；仅历史参考 |
| `window-prototype.html` | 首页 poster、WebGL、HUD、降级 | 已归档 |
| `desk-prototype.html` | 写作索引、文章页、三栏阅读 | 已归档 |
| `ia-prototype.html` | Window / Writing / Article / Plan 路由关系 | 已归档 |
| `d4-effects-lab.html` | 雪、雾、玻璃回退、暂停 | 已归档 |
| `d5-content-plan-lab.html` | 合成发布、审批、Ledger 字段可见性 | 已归档 |
| `workbench-prototype.html` | 本周 / 任务 / 项目 / 审阅四视图 | 已归档 |
| `architecture-map.html/.css/.js/.md` | 交互式架构与数据域总图 | 已归档 |
| `spikes/spike-rain-glass.html` | 雨滴玻璃技术 spike | 已归档 |
| `fixtures/` | 文章 raw/draft、Ledger、MCP、Workbench 合成结构 | 仅作结构示例，不是正式 schema |
| `plates.manifest.json` + schema | 探索图资产清单 | 仅探索记录，不是生产资产清单 |
| `VALIDATION.md` | 原型验证记录 | 已归档；内部回归 `370/370`，非用户验收 |

> 注：`architecture-map.js` 中的 `evidence` 文本沿用归档前的路径前缀（如 `source/`、`_brief/`、`_draft/`、`research/`、`prototype/`）。它们只是历史标签，不是可点击链接；实际文件现在位于 `redesign/` 和本归档目录。

## 可以从中借鉴什么

- 合成 fixture 展示了当时对文章 raw/draft、Ledger 字段可见性、MCP 工具和 Workbench 结构的思考。
- 验证记录保留了响应式、无障碍、WebGL 降级和状态门禁的测试思路。
- 架构图保留了 Window / Desk / Workbench 与 Editorial / Plan / Ops 的边界讨论。

## 不要做什么

- 不要复制 `composed-prototype.html` 的布局、视觉 token 或 runtime 作为新原型起点。
- 不要把 `370/370` 写成“设计通过”或“用户验收通过”。
- 不要把 fixture 中的占位字段当成正式 schema。
- 不要在归档上继续开发新功能；新工作应回到 `redesign/` 和根级决策文档。

## 如需运行

这些原型依赖仓库外的 `_assets` 图片，且当时通过本地 HTTP 服务测试。若仅为历史排查需要运行：

```bash
cd D:/openblog
python -m http.server 4175
# 浏览器打开：
# http://127.0.0.1:4175/openblog/archive/prototypes/composed-prototype.html
```

注意：归档文件不保证与当前目录结构、外部资产或浏览器版本兼容；运行结果不代表当前设计方向。
