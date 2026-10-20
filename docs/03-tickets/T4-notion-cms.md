# T4 · Notion CMS 接入

> 状态：`待开工`
> 负责人：开发 Agent
> 验收人：陈
> 所属项目：openblog
>
> ⚠️ 执行前必读：`docs/README.md` 的硬性规则 + `docs/02-contracts/design-system.md`

---

**目标**：文章内容从 Supabase 迁到 Notion，站点只读。

**范围**

**新增**
```
src/lib/notion/client.ts          — Notion 客户端（含重试、限流队列）
src/lib/notion/types.ts           — 内部 Post/Block 类型
src/lib/notion/posts.ts           — 文章查询 + 缓存
src/lib/notion/blocks.ts          — 块递归拉取 + 分页
src/lib/notion/mapper.ts          — Notion → 内部类型映射
src/components/notion/Renderer.tsx — 块渲染器
src/components/notion/blocks/*.tsx — 各块类型组件
src/app/api/revalidate/route.ts    — Webhook 失效接口
```

**改造**
```
src/app/blog/page.tsx
src/app/blog/[slug]/page.tsx
src/app/archive/page.tsx
src/app/tags/page.tsx
src/app/api/posts/route.ts
src/app/api/posts/[slug]/route.ts
src/app/api/categories/route.ts
src/app/api/tags/route.ts
src/app/sitemap.xml/route.ts
src/app/rss.xml/route.ts
next.config.ts                     — 补 Notion 图片域名
```

**要求**
1. Notion API 版本固定 `2025-09-03`（data sources 抽象）
2. 实现请求队列 + 429/529 处理：读 `Retry-After`，指数退避 + 抖动，重试上限 3 次
3. 列表页/详情页/归档/标签/RSS/sitemap 全部走缓存（`revalidate = 3600`）
4. 块渲染器支持 `02-目标架构与Notion-CMS设计.md` 第 5 节 P0 + P1 块类型
5. 必须处理嵌套块（递归深度上限 10）与分页（`has_more`）
6. 图片走 `next/image`，`remotePatterns` 补 `www.notion.so`、`s3.us-west-2.amazonaws.com`、`prod-files-secure.s3.us-west-2.amazonaws.com`
7. **URL 结构不得变化** —— `/blog/[slug]` 的 slug 由 Notion `Slug` 字段控制
8. 实现 `/api/revalidate`：校验 `REVALIDATE_SECRET`，调 `revalidateTag('posts')`

**前置条件（陈需先做）**
1. Notion 建「Blog Posts」库，按 `02` 文档第 3.1 节建全部属性
2. 建 Integration（https://www.notion.so/my-integrations），拿到 token
3. 把 Blog Posts 库 **Connect** 到这个 Integration
4. 提供 `Data Source ID`（不是 Database ID —— 2025-09-03 版本用 data source）
5. 把现有文章录入 Notion（至少 1 篇用于测试）

**交付物**
- 上述代码
- `.env.example`（列出所需变量，不含真实值）
- Notion 库结构截图（供陈核对）
- 缓存策略说明（写在 `SECURITY.md` 或新建 `ARCHITECTURE.md`）

**验收标准**
- [ ] `/blog` 列表显示 Notion 文章，排序按 `Published At` desc
- [ ] `/blog/[slug]` 正文正常渲染（标题、段落、代码、图片、引用、列表、表格）
- [ ] 代码块有语法高亮
- [ ] 图片正常显示（含 caption）
- [ ] 在 Notion 改文章 → Webhook 触发 → 1 分钟内站点更新
- [ ] 触发 429 时有重试日志，最终成功
- [ ] `revalidate = 3600` 生效（连续请求不重复打 Notion API，看日志验证）
- [ ] `/rss.xml`、`/sitemap.xml` 包含新文章
- [ ] 所有已有 URL 200（URL 对照表逐项 curl）
- [ ] 视觉风格与改造前一致（陈验收）

**依赖**：T3 完成 + 陈完成 Notion 侧准备。

---

---

## 执行记录

| 日期 | 状态变更 | 说明 |
|---|---|---|
| — | 待开工 | — |

## 验收证据

> 交付时在此粘贴：构建日志、页面截图、curl 返回示例。

（待填）
