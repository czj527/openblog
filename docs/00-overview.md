# openblog · 项目总览

> **一句话**：陈子杰的个人博客新一代实现 —— 保留原前端审美，Notion 作为内容源，Supabase 承载互动数据。
>
> 状态：`规划中（尚未开始编码）`
> 前身：`czj527/portfolio`（私有仓库，详见 `docs/05-migration/legacy-audit.md`）
> 目标域名：`czj527.xyz`

---

## 一、这个项目要解决什么

旧博客（portfolio）能用，但有三类结构性问题：

| 问题 | 后果 |
|---|---|
| **双数据库并存**（Supabase Postgres + Prisma SQLite） | `projects` 表存两份，改一处不生效 |
| **SQLite 部署在 Vercel** | 每次重新部署，评论/点赞/留言可能全丢 —— 这是数据安全事故 |
| **AI 写作助手占地过大** | 35 个文件 / 1500 行，比博客主体还重，且不再需要 |
| **鉴权可一行 JS 绕过** | `/admin` 形同虚设 |

新版只做两件事：**统一数据层** + **写作流程迁到 Notion**。

---

## 二、边界（明确不做什么）

- ❌ 不引入第二个 CMS（不装 Strapi / Sanity / Payload）
- ❌ 不在站点内做文章编辑器（写作在 Notion 里完成）
- ❌ 不做多语言（`Lang` 字段预留，不实现切换）
- ❌ 不做全文搜索（内容量起来后再评估）
- ✅ 默认遵循 `portfolio origin/main` 与 `docs/02-contracts/design-system.md`；经陈批准后可调整视觉方案，并同步更新契约和验收项
- ❌ 不迁移到 WordPress

---

## 三、技术栈

| 层级 | 选型 | 说明 |
|---|---|---|
| 框架 | Next.js（App Router） | 沿用旧项目版本 |
| 语言 | TypeScript | |
| UI | shadcn/ui + Radix UI | **保留** |
| 样式 | Tailwind CSS v4（oklch） | **保留** |
| 动画 | Framer Motion | **保留** |
| 图标 | Lucide React | |
| 内容源 | **Notion API**（实施版本 `2026-03-11`；data source 语义自 `2025-09-03` 引入） | 文章、草稿、经济规划 |
| 互动数据 | **Supabase Postgres** | 评论、点赞、留言、友链、个人管理 |
| 部署 | Vercel | |

> 视觉细节见 `docs/02-contracts/design-system.md`（**不可违反**）。

---

## 四、数据职责划分

| 数据 | 存在哪 | 为什么 |
|---|---|---|
| 文章正文 / 草稿 / 分类 / 标签 | Notion | 陈在 Notion 写作，天然 Markdown 友好 |
| 五年经济规划（**脱敏公开版**） | Notion「Economy Public」 | 只含阶段/百分比/里程碑 |
| 五年经济规划（**私人原始数据**） | Notion「Economy Plan」 | **不接站点**，金额永不出网 |
| 评论 / 点赞 / 留言 / 友链 | Supabase | 需要写入、审核、防垃圾、频率限制 |
| 项目 / 任务 / 日程 / 活动日志 | Supabase | 个人管理数据 |
| 站点配置 | Supabase | |

**核心原则：每类数据只有一个权威来源。禁止双写，禁止表重复。**

> 详细模型见 `docs/01-spec/architecture.md`。

---

## 五、三层权限

| 层 | 身份 | 能做什么 |
|---|---|---|
| L0 | 匿名访客 | 读文章、点赞、留言、评论（频率限制 + 待审核） |
| L1 | 管理员（陈） | L0 + 审核/删除评论、管理友链、任务/日程/项目 CRUD |
| L2 | 系统（Vercel） | 读写 Supabase（service_role）、读 Notion |

> 详细方案见 `docs/01-spec/auth.md`。

---

## 六、当前阶段

**规划中。** 尚无任何代码。

三个关键决策已于 2026-10-20 由陈确认（详见 `TASKS.md`）：

| 决策 | 结论 |
|---|---|
| Q1 | `/roadmap`、`/project-logs`、`workflow_*` **全删** |
| Q2 | 历史文章**全部不要，从零开始**（评论/点赞随之不迁） |
| Q3 | 经济页**公开脱敏版**（原始金额留在私人 Notion，永不外流） |

下一步：按 `docs/03-tickets/` 顺序开工，从 **`T-1-bootstrap.md`** 开始。

---

## 七、文档索引

| 文档 | 内容 |
|---|---|
| `docs/README.md` | 协作规范与硬性规则（**agent 必读**） |
| `docs/00-overview.md` | 本文档 · 项目总览 |
| `docs/01-spec/architecture.md` | 目标架构、数据模型、Notion 库设计、缓存策略 |
| `docs/01-spec/auth.md` | 权限边界、鉴权方案、安全验收 |
| `docs/02-contracts/design-system.md` | 视觉基线（默认遵循，偏离需陈批准） |
| `docs/03-tickets/` | 工单（按 T0→T6 顺序执行） |
| `docs/04-acceptance/checklist.md` | 验收清单（陈主用） |
| `docs/05-migration/legacy-audit.md` | 旧项目审计（迁移对照） |
| `TASKS.md` | 当前任务板（蓝维护） |
| `DECISIONS.md` | 决策日志（为什么这么定） |
