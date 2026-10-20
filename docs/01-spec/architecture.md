# 目标架构与数据模型

> 状态：`草案（待陈确认）`
> 变更需走 git commit，并说明修改原因。
> 本文档定义 openblog 的系统架构、数据职责边界、Notion 数据库模型与渲染链路。

> 本文档定义重构后的系统架构、数据职责边界、Notion 数据库模型与渲染链路。

---

## 一、目标架构

```
┌─────────────────────────────────────────────────────────────┐
│                        客户端（浏览器）                       │
│         Next.js 16 App Router · React 19 · Tailwind v4       │
│         保留：shadcn/ui + Framer Motion + 季节/天气主题       │
└───────────────────────────┬─────────────────────────────────┘
                            │
        ┌───────────────────┼───────────────────┐
        │                   │                   │
   ┌────▼─────┐      ┌──────▼──────┐    ┌──────▼──────┐
   │ 内容读取  │      │  互动数据    │    │  个人管理    │
   │  (只读)   │      │   (读写)     │    │   (读写)     │
   └────┬─────┘      └──────┬──────┘    └──────┬──────┘
        │                   │                   │
   ┌────▼─────────┐   ┌─────▼──────┐    ┌──────▼──────┐
   │  Notion API  │   │  Supabase  │    │  Supabase   │
   │   (CMS)      │   │  Postgres  │    │  Postgres   │
   └──────────────┘   └────────────┘    └─────────────┘
        │
   ┌────▼──────────────────┐
   │  ISR 缓存层            │
   │  revalidate + Webhook  │
   └────────────────────────┘
```

### 核心原则

| 原则 | 说明 |
|---|---|
| **单一数据源** | 每类数据只有一个权威来源，禁止双写、禁止表重复 |
| **内容与互动分离** | 内容（文章）由 Notion 管，互动（评论/点赞）必须存自己的数据库 —— 这是刻意的边界，不是妥协 |
| **内容只读** | 站点对 Notion 只读；写作发生在 Notion 里，不在站点里 |
| **缓存优先** | Notion API 有速率限制，所有内容读取走缓存，不直连 |
| **最小权限** | 不再保留"通用任意表操作"接口；每个资源一个专用接口 |

---

## 二、数据职责划分

| 数据 | 存储位置 | 读写 | 理由 |
|---|---|---|---|
| 文章正文、标题、摘要、标签、分类、封面 | **Notion Database** | 只读 | 陈在 Notion 里写作，天然 Markdown/富文本友好 |
| 草稿 | **Notion Database**（同一库，`Status = Draft`） | 只读 | 不再需要独立草稿表 |
| 五年经济规划（结构化数据） | **Notion Database** | 只读 | 后续可视化取数 |
| 评论 | **Supabase Postgres** | 读写 | 需要写入、审核、反垃圾，Notion 不适合 |
| 点赞 | **Supabase Postgres** | 读写 | 高频写入 |
| 留言板 | **Supabase Postgres** | 读写 | 同上 |
| 友链 | **Supabase Postgres** | 读写 | 低频但需后台管理 |
| 项目展示 | **Supabase Postgres** | 读写 | 个人管理数据 |
| 任务看板 | **Supabase Postgres** | 读写 | 同上 |
| 日程 | **Supabase Postgres** | 读写 | 同上 |
| 活动日志 | **Supabase Postgres** | 读写 | 同上 |
| 站点配置 | **Supabase Postgres** | 读写 | 同上 |
| 静态长文（历史归档） | `src/content/` 本地 MD | 只读 | 保留格式复杂的历史文章，不强制迁移 |

> **注意**：`Project` 表今天在 Supabase 和 Prisma 里各有一份 → 统一保留 **Supabase** 版本，Prisma 版本随 `prisma/` 目录一起删除。

---

## 三、Notion 数据库模型

### 3.1 文章库 `Blog Posts`

| 属性名 | Notion 类型 | 必填 | 说明 |
|---|---|---|---|
| `Title` | Title | ✅ | 文章标题 |
| `Slug` | Rich Text | ✅ | URL 短名，唯一，小写连字符 |
| `Status` | Select | ✅ | `Draft` / `Published` / `Archived` |
| `Excerpt` | Rich Text | ❌ | 摘要，用于列表页与 SEO description |
| `Cover` | Files & media | ❌ | 封面图 |
| `Category` | Select | ❌ | 分类 |
| `Tags` | Multi-select | ❌ | 标签 |
| `Published At` | Date | ✅ | 发布时间（用于排序、归档、RSS） |
| `Pinned` | Checkbox | ❌ | 是否置顶 |
| `Lang` | Select | ❌ | `zh` / `en`（为将来多语言预留） |
| `SEO Title` | Rich Text | ❌ | 覆盖默认 title |
| `SEO Description` | Rich Text | ❌ | 覆盖默认 description |
| `Views` | Number | ❌ | 阅读数（可选，也可只存 Supabase） |

**正文**：页面 body 内容（Notion blocks）。

### 3.2 经济规划库 `Economy Plan`

| 属性名 | Notion 类型 | 说明 |
|---|---|---|
| `Name` | Title | 规划项名称（如"应急基金"、"技能投资"） |
| `Year` | Select | `2027` / `2028` / ... / `2031`（五年规划） |
| `Category` | Select | `收入` / `储蓄` / `投资` / `支出` / `保障` |
| `Target Amount` | Number | 目标金额（元） |
| `Current Amount` | Number | 当前进度 |
| `Priority` | Select | `P0` / `P1` / `P2` |
| `Status` | Select | `规划中` / `进行中` / `已完成` / `已放弃` |
| `Notes` | Rich Text | 备注 |
| `Milestones` | Relation | 关联里程碑子库（可选） |

> 这个库既是**陈自己的规划工具**，也是**博客展示页的数据源** —— 一份数据两用，这是 Notion 做 CMS 的最大价值点。

---

## 四、渲染链路

### 4.1 文章列表页 `/blog`

```
请求 /blog
  ↓
Next.js Server Component
  ↓
getBlogPosts()  ← src/lib/notion/posts.ts
  ↓
[缓存命中?] ──是──→ 返回缓存
  │
  否
  ↓
Notion API: query data source（filter Status=Published, sort Published At desc）
  ↓
映射为内部 Post 类型
  ↓
写入 Next.js 缓存（unstable_cache / revalidate tag: 'posts'）
  ↓
返回
```

### 4.2 文章详情页 `/blog/[slug]`

```
请求 /blog/xxx
  ↓
getPostBySlug(slug)  ← 先查缓存索引，命中则返回
  ↓
Notion API: 查 data source（filter Slug=xxx）
  ↓
Notion API: retrieve block children（分页拉全量，递归处理嵌套块）
  ↓
渲染器：Notion Block → React 组件
  ↓
生成静态参数（generateStaticParams）+ ISR
```

### 4.3 缓存与失效策略

| 场景 | 策略 |
|---|---|
| 列表页 | ISR，`revalidate = 3600`（1 小时） |
| 详情页 | ISR，`revalidate = 3600` + 按需失效 |
| 标签/归档页 | ISR，`revalidate = 3600` |
| RSS / sitemap | ISR，`revalidate = 3600` |
| **立即更新** | Notion Webhook → `/api/revalidate` → `revalidateTag('posts')` |

**为什么必须缓存**：Notion API 速率限制为**每分钟 180 次请求（平均 3 次/秒）**（Free/Plus 计划），Business/Enterprise 才 600 次/分钟。每次文章详情渲染可能需要多次 block 请求 —— 不缓存会很快触发 429。

**429 处理要求**：
- 必须读取响应头 `Retry-After`，按其值等待，不要写死固定等待时间
- 重试采用指数退避 + 抖动，并设置重试上限
- 只重试 429 / 529（以及幂等请求的 500/502/503/504），400/401/403 不重试
- 参考：https://developers.notion.com/reference/request-limits

---

## 五、Notion 块渲染器要求

需支持以下块类型（按优先级）：

**P0（必须）**
- `paragraph`、`heading_1/2/3`、`bulleted_list_item`、`numbered_list_item`
- `code`（含语法高亮语言标识）
- `image`（含 caption）
- `quote`、`divider`
- `to_do`、`toggle`
- `bookmark`、`link_preview`

**P1（重要）**
- `callout`（含 emoji + 颜色）
- `table` / `table_row`
- `column_list` / `column`
- `video`、`embed`

**P2（可选）**
- `synced_block`、`child_page`、`equation`

**技术要求**
- 必须处理**嵌套块**（递归，注意深度限制）
- 必须处理**分页**（`has_more` + `next_cursor`，单次最多 100 块）
- 图片必须走代理或 `next/image` 配置 `notion.so` / S3 域名
- 代码高亮复用已有的 `highlight.js` + `rehype-highlight`

---

## 六、URL 与 SEO 保持

**硬性要求：重构后所有已有 URL 不得变化。**

| 路径 | 保持不变 |
|---|---|
| `/blog/[slug]` | ✅ slug 由 Notion `Slug` 字段控制，与现状对齐 |
| `/archive` | ✅ |
| `/tags` | ✅ |
| `/rss.xml` | ✅ 格式不变 |
| `/sitemap.xml` | ✅ 改为动态生成，但结构不变 |
| `/robots.txt` | ✅ 不变 |

> Phase 4 上线前必须生成 URL 对照表，逐个 curl 验证 200。

---

## 七、环境变量（重构后）

| 变量 | 用途 | 暴露范围 |
|---|---|---|
| `NOTION_TOKEN` | Notion Integration Token | **仅服务端** |
| `NOTION_BLOG_DATA_SOURCE_ID` | 文章库 Data Source ID | 仅服务端 |
| `NOTION_ECONOMY_DATA_SOURCE_ID` | 经济规划库 ID | 仅服务端 |
| `NEXT_PUBLIC_SUPABASE_URL` | Supabase 项目 URL | 公开 |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY` | Supabase 匿名 key（只读，受 RLS 保护） | 公开 |
| `SUPABASE_SERVICE_ROLE_KEY` | 服务端 key | **仅服务端** |
| `ADMIN_PASSWORD_HASH` | 管理员密码哈希（bcrypt/argon2） | **仅服务端** |
| `AUTH_SECRET` | 会话签名密钥（32+ 字节随机） | **仅服务端** |
| `REVALIDATE_SECRET` | Webhook 校验密钥 | **仅服务端** |

**删除的变量**：`DATABASE_URL`、`TURSO_DATABASE_URL`、`TURSO_AUTH_TOKEN`、`ADMIN_PASSWORD`（明文，改为 hash）。

---

## 八、技术选型说明

| 决策点 | 选择 | 理由 |
|---|---|---|
| Notion 客户端 | 官方 `@notionhq/client` | 稳定、类型完整、自带重试 |
| Notion API 版本 | `2025-09-03` | 当前版本，databases 已抽象为 **data sources**（`query-data-source`），旧版 `query-database` 将被淘汰 |
| 渲染方式 | 分层：`notion-to-md` 产 MDX **或** 自建 Block → React 渲染器 | 优先自建渲染器（可控性强、可注入现有 shadcn 组件）；若时间紧张先用 `notion-to-md` + 现有 `react-markdown` 链路 |
| 缓存层 | Next.js `unstable_cache` + `revalidateTag` | 零额外依赖 |
| 鉴权 | HMAC 签名 token（详见 `docs/01-spec/auth.md`） | 无状态、无需建表、够安全 |

---

## 九、明确不做的事

- ❌ 不引入第二个 CMS（不装 Strapi / Sanity / Payload）
- ❌ 不在站点内做文章编辑器（写作在 Notion）
- ❌ 不做多语言（`Lang` 字段先预留，不实现切换逻辑）
- ❌ 不做全文搜索（Phase 6 之后再评估）
- ❌ 不改动任何视觉令牌（颜色、圆角、字体、动画）
