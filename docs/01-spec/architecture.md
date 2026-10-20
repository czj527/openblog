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
| 五年经济规划（**脱敏公开数据**） | **Notion Database「Economy Public」** | 只读 | 只含阶段/百分比/里程碑；原始金额留在私人库，永不外流 |
| 评论 | **Supabase Postgres** | 读写 | 需要写入、审核、反垃圾，Notion 不适合 |
| 点赞 | **Supabase Postgres** | 读写 | 高频写入 |
| 留言板 | **Supabase Postgres** | 读写 | 同上 |
| 友链 | **Supabase Postgres** | 读写 | 低频但需后台管理 |
| 项目展示 | **Supabase Postgres** | 读写 | 个人管理数据 |
| 任务看板 | **Supabase Postgres** | 读写 | 同上 |
| 日程 | **Supabase Postgres** | 读写 | 同上 |
| 活动日志 | **Supabase Postgres** | 读写 | 同上 |
| 站点配置 | **Supabase Postgres** | 读写 | 同上 |

> **两个必须遵守的边界**
> 1. **历史文章不迁移**（2026-10-20 决策 Q2）：旧文章、评论、点赞一律不进新库，从零开始。因此**没有** `src/content/` 静态归档这一层。
> 2. **经济数据分两层**（决策 Q3）：私人 `Economy Plan` 库永不出网；公开页只读单独的 `Economy Public` 脱敏库。详见 `T5-economy-and-legal.md`。

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

### 3.2 经济规划：两个库（私人与公开分离）

> 🚨 **原方案已作废。** 原文写「这个库既是陈自己的规划工具，也是博客展示页的数据源 —— 一份数据两用」。
> 按 2026-10-20 决策 Q3（需要公开脱敏版），**这个设计会导致私人财务数据公开在 czj527.xyz 上**。
> 现改为**两个独立库**，数据不共享。

#### 3.2.1 私人库 `Economy Plan`（不接站点）

| 属性名 | Notion 类型 | 说明 |
|---|---|---|
| `Name` | Title | 规划项名称 |
| `Year` | Select | `2027` / ... / `2031` |
| `Category` | Select | `收入` / `储蓄` / `投资` / `支出` / `保障` |
| `Target Amount` | Number | 目标金额（元） |
| `Current Amount` | Number | 当前进度 |
| `Priority` | Select | `P0` / `P1` / `P2` |
| `Status` | Select | `规划中` / `进行中` / `已完成` / `已放弃` |
| `Notes` | Rich Text | 备注 |

**约束**：此库**不得**被站点代码引用。环境变量中**禁止**出现其 Data Source ID（见 T5 的 check-env 规则）。

#### 3.2.2 公开库 `Economy Public`（站点唯一数据源）

| 属性名 | Notion 类型 | 说明 |
|---|---|---|
| `Phase` | Title | 阶段名，如「储蓄积累期」 |
| `Year Start` / `Year End` | Number | 时间节点 |
| `Progress` | Number | **百分比 0-100**（不是金额） |
| `Status` | Select | `未开始` / `进行中` / `已完成` |
| `Description` | Rich Text | 文字描述，**不得含金额** |
| `Milestones` | Rich Text | 里程碑，一行一个 |
| `Order` | Number | 排序 |

**约束**：
- 🚫 **不得**设置 `Target Amount`、`Current Amount`、`Balance`、`Notes` 等字段
- ✅ 站点环境变量只配 `NOTION_ECONOMY_PUBLIC_DATA_SOURCE_ID`
- ✅ 页面顶部注明「本页为脱敏进度展示，不含具体金额」

**为什么必须两个库而不是一个库隐藏字段**：Notion Integration 拿到库权限后能读全部属性，靠代码「只读某些字段」是一层软约束，改错一行就泄露。物理隔离成两个库，是硬约束。

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
写入 Next.js 缓存（`'use cache'` 指令 + `cacheTag('posts')`）
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

> ⚠️ **Next.js 16 缓存模型已变，本文档统一使用新写法。**
> `unstable_cache` 在 Next.js 16 **已废弃**，官方建议改用 `'use cache'` 指令；
> `revalidateTag(tag)` 单参数写法**在 16 中不再工作**，必须传 cacheLife profile：`revalidateTag(tag, 'max')`。
> 依据：[unstable_cache 文档](https://nextjs.org/docs/app/api-reference/functions/unstable_cache)、[revalidateTag 文档](https://nextjs.org/docs/app/api-reference/functions/revalidateTag)。

| 场景 | 策略 | 具体写法 |
|---|---|---|
| 列表页 | 缓存组件 + 定时过期 | `'use cache'` + `cacheLife('hours')` + `cacheTag('posts')` |
| 详情页 | 同上，按需失效 | `'use cache'` + `cacheLife('hours')` + `cacheTag('posts', 'post:'+id)` |
| 标签/归档页 | 同上 | `'use cache'` + `cacheTag('posts')` |
| RSS / sitemap | 同上 | `'use cache'` + `cacheTag('posts')` |
| **立即更新** | Notion Webhook → `/api/revalidate` → `revalidateTag('posts', 'max')` | 见 4.4 |

**统一约定（不得混用新旧 API）**

| ✅ 本项目使用 | ❌ 禁止出现 |
|---|---|
| `'use cache'` 指令 | `unstable_cache(...)` |
| `cacheTag('posts')` | — |
| `cacheLife('hours')` | `export const revalidate = 3600`（与 use cache 混用时语义冲突） |
| `revalidateTag('posts', 'max')` | `revalidateTag('posts')`（单参数，Next.js 16 不工作） |

**为什么必须缓存**：Notion API 速率限制为**每分钟 180 次请求（平均 3 次/秒）**（Free/Plus 计划），Business/Enterprise 才 600 次/分钟。每次文章详情渲染可能需要多次 block 请求 —— 不缓存会很快触发 429。

**429 处理要求**：
- 必须读取响应头 `Retry-After`，按其值等待，不要写死固定等待时间
- 重试采用指数退避 + 抖动，并设置重试上限
- 只重试 429 / 529（以及幂等请求的 500/502/503/504），400/401/403 不重试
- 参考：https://developers.notion.com/reference/request-limits

### 4.4 Webhook 设计与兜底（评审补充项）

> 原方案只写了「Webhook → `/api/revalidate`」，缺少验证与兜底。**没有兜底的 Webhook 不能上线**：Webhook 丢了就永远不更新。

**验证流程（`/api/revalidate`）**

| 步骤 | 要求 |
|---|---|
| 1 | 读取原始 body（**不要先 `JSON.parse`**，签名基于原始字节） |
| 2 | 用 `NOTION_WEBHOOK_SECRET` 计算 HMAC-SHA256，与请求头签名比对 |
| 3 | 用 `timingSafeEqual` 比较，防时序攻击 |
| 4 | 校验不通过 → **401，不做任何失效操作** |
| 5 | 通过后只做「失效」，**不在此路径里同步拉取 Notion**（避免超时） |

**首次订阅验证**：Notion 订阅 Webhook 时会发一个 `verification_token` 事件，需在管理界面回填该 token，之后才推送正式事件。这一步必须记录在 T4 的验收证据里。

**兜底策略（Webhook 失败时）**

| 机制 | 配置 | 作用 |
|---|---|---|
| 兜底 1 | `cacheLife('hours')` | Webhook 全挂，最多 1 小时后自动过期重取 |
| 兜底 2 | `/api/cron/refresh` + Vercel Cron（如可用） | 定时主动失效，间隔 6 小时 |
| 兜底 3 | 手动失效接口（需管理员会话） | 出问题时人工触发 |

**验收口径**：同步是「**最终一致**」，不是「1 分钟内一定完成」。

- Webhook 正常：秒级到分钟级
- Webhook 失败：≤ 1 小时（缓存自然过期）
- 验收时**记录实际延迟**，不承诺固定上限

### 4.5 Notion 图片处理（评审补充项）

> ⚠️ **Notion 托管的图片 URL 是临时签名链接，会过期**（通常 1 小时量级）。
> 只配置 `next/image` 的 `remotePatterns` 是**不够的** —— 过期后全站图片 404。

**方案（按优先级）**

| 方案 | 做法 | 取舍 |
|---|---|---|
| A. 代理 + 实时刷新（推荐） | 存 `block_id` 而非 URL；渲染时经 `/api/notion-image/[blockId]` 代理，代理内部**每次重新查 Notion 拿最新 URL** 并 302 或流式转发 | 图片永远新鲜；多一次 API 调用（有缓存兜底） |
| B. 构建时转存 | 构建阶段把图片下载到 `public/` 或对象存储 | 快、稳；但 Notion 改图需重新构建 |
| C. 直连 + 定期刷新 | 缓存 URL 并在过期前刷新 | 实现复杂，容易漏 |

**本项目的选择**：**方案 A**。理由：写作在 Notion，改图频率不低，不想每次改图都触发构建。

**要求**

- 代理接口必须校验 `blockId` 格式，防止 SSRF（**不要**接受任意 URL 参数）
- 代理需设置 `Cache-Control: public, max-age=..., stale-while-revalidate=...`
- `next.config.ts` 的 `images.remotePatterns` 只放 Notion 官方域（`*.notion.so`、`prod-files-secure.s3.*.amazonaws.com`），**不要用通配符 `**`**

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
| `NOTION_ECONOMY_PUBLIC_DATA_SOURCE_ID` | **公开脱敏**经济库 ID | 仅服务端 |
| ~~`NOTION_ECONOMY_DATA_SOURCE_ID`~~ | ❌ **禁止使用**（旧名，指私人库） | — |
| `NEXT_PUBLIC_SUPABASE_URL` | Supabase 项目 URL | 公开 |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY` | Supabase 匿名 key（只读，受 RLS 保护） | 公开 |
| `SUPABASE_SERVICE_ROLE_KEY` | 服务端 key | **仅服务端** |
| `ADMIN_PASSWORD_HASH` | 管理员密码哈希（bcrypt/argon2） | **仅服务端** |
| `AUTH_SECRET` | 会话签名密钥（32+ 字节随机） | **仅服务端** |
| `NOTION_WEBHOOK_SECRET` | Webhook 校验密钥 | **仅服务端** |

**删除的变量**：`DATABASE_URL`、`TURSO_DATABASE_URL`、`TURSO_AUTH_TOKEN`、`ADMIN_PASSWORD`（明文，改为 hash）。

---

## 八、技术选型说明

| 决策点 | 选择 | 理由 |
|---|---|---|
| Notion 客户端 | 官方 `@notionhq/client` | 稳定、类型完整、自带重试 |
| Notion API 版本 | `2025-09-03` | 当前版本，databases 已抽象为 **data sources**（`query-data-source`），旧版 `query-database` 将被淘汰 |
| 渲染方式 | 分层：`notion-to-md` 产 MDX **或** 自建 Block → React 渲染器 | 优先自建渲染器（可控性强、可注入现有 shadcn 组件）；若时间紧张先用 `notion-to-md` + 现有 `react-markdown` 链路 |
| 缓存层 | Next.js 16 `'use cache'` + `cacheTag`/`cacheLife` | 零额外依赖，官方推荐写法 |
| 鉴权 | HMAC 签名 token（详见 `docs/01-spec/auth.md`） | 无状态、无需建表、够安全 |

---

## 九、明确不做的事

- ❌ 不引入第二个 CMS（不装 Strapi / Sanity / Payload）
- ❌ 不在站点内做文章编辑器（写作在 Notion）
- ❌ 不做多语言（`Lang` 字段先预留，不实现切换逻辑）
- ❌ 不做全文搜索（Phase 6 之后再评估）
- ❌ 不改动任何视觉令牌（颜色、圆角、字体、动画）
