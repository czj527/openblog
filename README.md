# openblog

陈子杰的个人博客（新一代实现）。

保留原前端审美，Notion 作为内容源，Supabase 承载互动数据。

> **当前状态**：规划阶段，尚无代码。

---

## 给开发 Agent

**按顺序读**：

1. [`docs/00-overview.md`](./docs/00-overview.md) —— 项目是什么、边界在哪
2. [`docs/README.md`](./docs/README.md) —— 硬性规则（**不可违反**）
3. [`docs/02-contracts/design-system.md`](./docs/02-contracts/design-system.md) —— 视觉基线（**不可修改**）
4. [`docs/01-spec/`](./docs/01-spec/) —— 目标架构与权限方案
5. [`docs/06-review/2026-10-20-plan-review.md`](./docs/06-review/2026-10-20-plan-review.md) —— 最新计划评审与修订建议
6. [`docs/03-tickets/`](./docs/03-tickets/) —— 计划修订完成后按更新后的工单执行
7. [`docs/04-acceptance/checklist.md`](./docs/04-acceptance/checklist.md) —— 交付前自检

**当前不要直接执行旧版 T0/T1。** 先按评审文档完成 M0/M1 和工单修订，再开始项目初始化。

---

## 目录结构

```
.
├── docs/
│   ├── 00-overview.md              项目总览与边界
│   ├── README.md                   协作规范（agent 必读）
│   ├── 01-spec/                    【计划层】会变，git 记录变化
│   │   ├── architecture.md         目标架构、数据模型、Notion 库、缓存
│   │   └── auth.md                 权限边界与鉴权方案
│   ├── 02-contracts/               【契约层】不可违反
│   │   └── design-system.md        视觉基线
│   ├── 03-tickets/                 【执行层】可变、可作废、可重开
│   │   ├── T0-security.md
│   │   ├── T1-slimming.md
│   │   ├── T2-data-layer.md
│   │   ├── T3-permissions.md
│   │   ├── T4-notion-cms.md
│   │   ├── T5-economy-and-legal.md
│   │   └── T6-content-and-launch.md
│   ├── 04-acceptance/
│   │   └── checklist.md            验收清单（陈主用）
│   ├── 05-migration/
│   │   └── legacy-audit.md         旧项目 portfolio 审计
│   └── 06-review/
│       └── 2026-10-20-plan-review.md 最新计划评审与修订建议
├── TASKS.md                        任务板（蓝维护）
├── DECISIONS.md                    决策日志
└── README.md                       本文件
```

---

## 三条铁律

1. **视觉优先**：`docs/02-contracts/design-system.md` 是已认可的基线。不确定就不要改。
2. **必须交证据**：每个工单交付时提供构建日志、页面截图、curl 返回示例。不接受口头"已完成"。
3. **一个工单一个 commit**：格式 `[T{n}] 简述`。

---

## 技术栈（规划）

Next.js (App Router) · TypeScript · Tailwind v4 (oklch) · shadcn/ui · Radix UI · Framer Motion · Lucide React
内容源：Notion API（版本待实施前核验并固定） · 数据层：Supabase Postgres · 部署：Vercel

详细说明见 [`docs/00-overview.md`](./docs/00-overview.md)。

---

## 前身

旧博客 [`czj527/portfolio`](https://github.com/czj527/portfolio)（私有）。
审计结论见 [`docs/05-migration/legacy-audit.md`](./docs/05-migration/legacy-audit.md)。

---

## 项目所有者

陈子杰 · 项目助理：蓝
