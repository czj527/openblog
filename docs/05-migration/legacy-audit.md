# 旧项目现状审计（portfolio → openblog）

> **归档文档。** 记录重构前 `czj527/portfolio` 的代码审计结论。
> 新仓库不继承这些问题，但迁移时需要对照本文档逐项确认。
> 审计日期：2026-10-20

> **阅读规则**：本文前半部分是旧项目审计的历史记录。当前迁移范围以文末“当前决策覆盖说明”、`TASKS.md` 和 `DECISIONS.md` 为准；历史记录中的“需迁移”不代表当前仍需迁移。

> 基于 2026-10-20 对 `czj527/portfolio` 仓库（main 分支，253 个文件）的全量代码审阅。

---

## 一、仓库现状

| 项 | 值 |
|---|---|
| 仓库 | `czj527/portfolio`（私有） |
| 描述 | 陈子杰的个人博客 |
| 语言 | TypeScript |
| 框架 | Next.js 16.1.1 (App Router) + React 19.2.3 |
| 样式 | Tailwind CSS v4 (oklch) + shadcn/ui + Radix UI |
| 动画 | Framer Motion 12 |
| 数据库 | **Supabase PostgreSQL** + **Prisma SQLite**（两套并存） |
| 部署 | Vercel（push `main` 自动部署） |
| 代码规模 | 约 253 个文件，1.5 MB |

### 页面清单（14 个路由）

| 路由 | 说明 | 保留 |
|---|---|---|
| `/` | 首页（Hero + 日程 + 问答） | ✅ |
| `/blog` | 博客列表 | ✅ |
| `/blog/[slug]` | 文章详情 | ✅ |
| `/blog/new` | 文章编辑器 | ❌ 删除（Notion 接管） |
| `/ai-write` | AI 协作写作 | ❌ 删除 |
| `/admin` | 管理后台 | ⚠️ 重构（大幅精简） |
| `/archive` | 文章归档 | ✅ |
| `/tags` | 标签云 | ✅ |
| `/projects` | 项目展示 | ✅ |
| `/roadmap` | 项目规划 | ✅ |
| `/tasks` | 任务看板 | ✅ |
| `/schedule` | 周日程 | ✅ |
| `/about` | 关于我 | ✅ |
| `/friends` | 友情链接 | ✅ |
| `/guestbook` | 留言板 | ✅ |

---

## 二、五类问题诊断

### 问题 1 · 鉴权可被完全绕过（🔴 严重）

**文件**：`src/lib/auth.ts`

```ts
// 现状逻辑（伪代码）
verifyAdmin(request):
  token = cookie.admin_token
  if token:
     decoded = base64decode(token)
     return decoded.startsWith('admin:')   // ← 只检查前缀，不校验密码
```

**后果**：任何人设置 `admin_token = base64("admin:任意内容")` 即可获得管理员权限，读写全部数据。

**叠加风险**：
- `ADMIN_PASSWORD` 有硬编码返回默认值 `'「旧默认密码」'`（`src/lib/auth.ts:3`）——即使修补 cookie 校验，密码也已在源码中泄露
- 存在 `src/app/api/clear-data/route.ts`（清空数据接口）和 `src/app/api/supabase/route.ts`（通用任意表增删改查代理）——鉴权一旦失效，攻击面是**全库读写 + 数据清空**

**结论**：必须在任何其他工作之前止血（Phase 0）。

---

### 问题 2 · 双数据库并存，且表重复（🔴 严重）

**文件**：`AGENT.md`、`src/lib/prisma.ts`、`src/lib/supabase.ts`

| Supabase PostgreSQL | Prisma SQLite |
|---|---|
| posts、drafts、schedules、tasks、**projects**、activity_log | comments、likes、**projects**、friend_links、guestbook、site_config |

**`Project` 表两边都有**，数据源歧义 —— 改一处不生效，这是"数据库操作麻烦"的直接原因之一。

---

### 问题 3 · SQLite 部署到 Vercel 会丢数据（🔴 严重）

**文件**：`vercel.json`

```json
"buildCommand": "DATABASE_URL=\"file:./dev.db\" npx prisma generate && next build"
```

Vercel 的 Serverless 文件系统是**只读且临时**的。生产环境中的评论、点赞、留言板、友链数据写入不可靠，冷启动或重新部署后可能丢失。

**这不是"麻烦"，是数据安全隐患。**

---

### 问题 4 · Turso 迁移是半成品

**文件**：`src/lib/prisma.ts`（已写 Turso 适配器）、`prisma/setup-turso.ts`、`prisma/seed-turso.ts`

迁移已开始但未完成：
- `prisma/schema.prisma` 的 provider 仍是 `sqlite`
- `vercel.json` 仍硬编码 `file:./dev.db`
- `TURSO_DATABASE_URL` / `TURSO_AUTH_TOKEN` 环境变量是否配置未知

**半成品状态比不迁更危险** —— 代码路径分叉，行为不可预测。

---

### 问题 5 · AI 写作助手占用了大量代码量，但与目标不符

**统计**：AI 相关代码约 **35 个文件、约 1500 行**，占项目相当大比重：

- 6 个 API 路由（`assist` / `capture-idea` / `generate-outline` / `generate-section` / `polish-text` / `resolve-ambiguity`）
- 7 个 UI 组件（`AssistPanel` / `ChatPanel` / `DraftList` / `ModeSwitcher` / `PhaseIndicator` / `PreviewPanel` / `index`）
- 1 个 434 行 Hook（`use-blog-writer.ts`）+ 1 个状态 store
- 1 个 Tiptap 富文本编辑器
- 5 个 Prompt 模板 + AI 客户端 + 类型定义

**决策**：整体删除。理由：陈的写作流程将迁到 Notion，本地编辑器不再需要；AI 辅助在 Notion 侧 + 通用 AI 工具里更顺手；这 1500 行维护成本换不来对应价值。

---

### 问题 6 · 缺少 AdSense 必需页面（🟡 中等）

AdSense 审核要求：**隐私政策（Privacy Policy）**、**关于（About）**、**联系方式（Contact）**。
现状：`/about` 有，**Privacy Policy 和 Contact 缺失**。

---

## 三、瘦身清单

### 3.1 删除（AI 写作助手 · 全部）

| 路径 | 说明 |
|---|---|
| `src/app/ai-write/page.tsx` | AI 写作页 |
| `src/app/blog/new/page.tsx` | 本地文章编辑器（Notion 接管） |
| `src/app/api/ai/assist/route.ts` | AI 辅助接口 |
| `src/app/api/ai/capture-idea/route.ts` | 捕捉灵感 |
| `src/app/api/ai/generate-outline/route.ts` | 生成大纲 |
| `src/app/api/ai/generate-section/route.ts` | 生成章节 |
| `src/app/api/ai/polish-text/route.ts` | 润色 |
| `src/app/api/ai/resolve-ambiguity/route.ts` | 消歧义 |
| `src/lib/ai/client.ts` | AI 客户端 |
| `src/lib/ai/types.ts` | AI 类型 |
| `src/lib/ai/prompts/`（5 个 .md） | Prompt 模板 |
| `src/components/blog-agent/`（8 文件） | AI 协作面板组件（**注意：`AdminLogin.tsx` 需先迁移，见 3.3**） |
| `src/components/TiptapEditor.tsx` | 富文本编辑器 |
| `src/hooks/use-blog-writer.ts` | 434 行写作状态机 |
| `src/app/api/drafts/route.ts` | 草稿接口 |
| `src/app/api/drafts/[id]/route.ts` | 草稿详情接口 |

### 3.2 删除（危险 / 冗余接口）

| 路径 | 原因 |
|---|---|
| `src/app/api/clear-data/route.ts` | 数据清空接口，攻击面过大，重构后无用 |
| `src/app/api/supabase/route.ts` | 通用任意表操作代理，违反最小权限原则，改为按资源划分的专用接口 |

### 3.3 删除（Prisma / 双库残留）

| 路径 | 原因 |
|---|---|
| `prisma/`（整个目录，6 文件） | 统一到 Supabase 后无用 |
| `src/lib/prisma.ts` | 同上 |
| `scripts/clear-supabase-data.mjs` | 一次性脚本，重构后无用 |

> ⚠️ `prisma/` 下的 seed 脚本若含历史内容数据，删除前先导出备份。

### 3.4 删除（npm 依赖）

| 依赖 | 原因 |
|---|---|
| `@tiptap/extension-image`、`@tiptap/extension-link`、`@tiptap/react`、`@tiptap/starter-kit` | 编辑器已删 |
| `@prisma/client`、`@prisma/adapter-libsql`、`@libsql/client`、`prisma`（dev） | Prisma 已删 |
| `raw-loader`（dev） | 检查引用后决定 |

**预计减少依赖：8 个**（含 3 个 dev）

### 3.5 保留（视觉与交互资产 · 严禁改动）

| 路径 / 资源 | 说明 |
|---|---|
| `docs/02-contracts/design-system.md` | **设计体系基线，后续开发必须遵循** |
| `src/app/globals.css`（13.7 KB） | 设计令牌：oklch 色彩、季节/天气主题、动画工具类 |
| `src/components/ui/`（70 个组件） | shadcn/ui 组件库，全量保留 |
| `src/components/effects/`（9 个） | HeroSection、SeasonParticles、BlogCard、ProjectCards、QnASection、AboutSection、MicroInteractions、PageTransition、PortalHeroSection |
| `src/components/Navigation.tsx` | 导航栏（需移除 `/ai-write` 入口） |
| `src/components/ThemeProvider.tsx` / `ThemeToggle.tsx` | 主题系统 |
| `src/components/effects/index.ts` | 导出索引 |
| `src/app/robots.ts` | SEO |
| `src/app/sitemap.xml/route.ts` | SEO（需改造为动态读 Notion） |
| `src/app/rss.xml/route.ts` | RSS（同上） |
| `src/content/blog/streamlit-ai-companion/` | 历史文章内容，保留为归档 |
| `public/`（avatar、qq-icon、.nojekyll） | 静态资源 |

### 3.6 重构（保留但改数据源）

| 路径 | 改动 |
|---|---|
| `src/app/admin/page.tsx`（14.8 KB） | 大幅精简：移除文章 CRUD，只留互动数据管理（评论审核 / 留言管理 / 友链管理） |
| `src/components/blog-agent/AdminLogin.tsx` | **先迁移**到 `src/components/admin/LoginForm.tsx`，再随 `blog-agent/` 一起删除原文件 |
| `src/app/blog/page.tsx` | 数据源：Supabase posts → **Notion** |
| `src/app/blog/[slug]/page.tsx`（13.3 KB） | 同上；渲染方式改为 Notion block → MDX/HTML |
| `src/app/archive/page.tsx` | 同上 |
| `src/app/tags/page.tsx` | 同上（标签来自 Notion multi_select） |
| `src/app/api/posts/route.ts`、`src/app/api/posts/[slug]/route.ts` | 改为 Notion 读取 + 缓存 |
| `src/app/api/categories/route.ts`、`tags/route.ts` | 数据源改造 |
| `src/app/api/comments/route.ts`、`likes/route.ts`、`guestbook/route.ts`、`friend-links/route.ts` | 统一走 Supabase，补齐鉴权与校验 |
| `src/app/api/schedules/route.ts`、`tasks/route.ts`、`projects/route.ts` | 统一走 Supabase |
| `src/hooks/use-admin.ts` | 适配新鉴权 |
| `src/lib/supabase.ts` | 保留，补充类型定义 |
| `src/lib/seed-data.ts` | 待 Notion 接入后评估是否还需要 |
| `next.config.ts` | 移除 Prisma external 包配置；补 Notion 图片域名 |
| `vercel.json` | 移除硬编码 `DATABASE_URL` |
| `AGENT.md` | **全量重写**，反映新架构 |

---

## 四、删除影响评估

| 影响项 | 评估 |
|---|---|
| 已发布文章 | 1 篇（`streamlit-ai-companion`，静态内容 + 可能 1 条 Supabase 记录）→ 需迁移到 Notion |
| 评论 / 点赞 / 留言数据 | 存于 Prisma SQLite，**可能在 Vercel 上已丢失**，需先导出检查 |
| 章节导航 | 删除 `/ai-write` 后需同步清理 `Navigation.tsx` 入口 |
| 依赖体积 | 预计减少 8 个依赖，构建体积下降 |
| 代码量 | 预计删除约 **35-40 个文件、约 2000 行** |

---

## 五、执行前必做的三件事

1. **备份数据库**：导出 Supabase 全量 + Prisma `dev.db`（若存在）
2. **备份文章内容**：把 `src/content/` 与 Supabase `posts` 表内容导出为 Markdown
3. **建立基线快照**：当前生产站点截图存档（用于重构后视觉回归对比）

> 这三件事不做，不允许开始 Phase 1。

## 当前决策覆盖说明（2026-10-21）

本归档审计保留 2026-10-20 对旧项目的原始观察；以下决策覆盖其中与当前执行计划不一致的建议：

- `/roadmap`、`/project-logs/[id]` 与 `workflow_*` 全部删除，不迁移页面、表或接口。
- 历史文章、旧评论、旧点赞全部不迁移；`src/content/` 仅作只读参考，不进入新站。
- 经济页采用公开脱敏版，只能读取独立的 `Economy Public` 数据源；私人 `Economy Plan` 不得被站点读取。
- 完整旧数据备份只允许保存在仓库外的安全位置，仓库内仅保留清单、校验和与不含敏感内容的证据。
- 本文“执行前必做”中导出历史文章的建议仅适用于仓库外的个人备份，不表示历史文章需要迁入新站；无需为迁移目的导出或导入这些文章。
