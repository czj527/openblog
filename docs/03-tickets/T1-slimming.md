# T1 · 瘦身删除（AI 写作助手 + Prisma）

> 状态：`待开工`
> 负责人：开发 Agent
> 验收人：陈
> 所属项目：openblog
>
> ⚠️ 执行前必读：`docs/README.md` 的硬性规则 + `docs/02-contracts/design-system.md`

---

**目标**：清出干净地基，删除所有 AI 写作助手代码、Prisma 双库残留、冗余依赖。

**范围**
按 `01-现状诊断与瘦身清单.md` 第 3.1 / 3.2 / 3.3 / 3.4 节执行：

**删除文件**
```
src/app/ai-write/page.tsx
src/app/blog/new/page.tsx
src/app/api/ai/**                        (6 个 route.ts)
src/lib/ai/**                            (client, types, 5 个 prompts)
src/components/blog-agent/**             (8 文件，先迁移 AdminLogin.tsx)
src/components/TiptapEditor.tsx
src/hooks/use-blog-writer.ts
src/app/api/drafts/**                    (2 个 route.ts)
prisma/**                                (整个目录)
src/lib/prisma.ts
scripts/clear-supabase-data.mjs
```

**删除依赖**
```
@tiptap/extension-image @tiptap/extension-link @tiptap/react @tiptap/starter-kit
@prisma/client @prisma/adapter-libsql @libsql/client
prisma (devDependency)
```

**改动**
- `src/components/blog-agent/AdminLogin.tsx` → 迁移到 `src/components/admin/LoginForm.tsx`，适配新鉴权
- `src/components/Navigation.tsx` → 移除 `/ai-write` 入口
- `src/app/admin/page.tsx` → 移除文章 CRUD、草稿管理、AI 面板；保留评论/留言/友链管理
- `src/store/index.ts` → 移除写作相关状态
- `next.config.ts` → 移除 `serverExternalPackages` 中的 Prisma 相关项
- `vercel.json` → 移除硬编码 `DATABASE_URL`
- `package.json` → 移除 `postinstall: prisma generate`、`db:*` 脚本

**前置条件（必须先做）**
1. 导出 Supabase `posts` / `drafts` 表全量数据为 JSON + Markdown
2. 若存在 `dev.db`，导出评论/点赞/留言/友链数据
3. 生产站点全页截图存档（视觉基线）

**交付物**
- 删除后的代码
- 一份 `MIGRATION-BACKUP/` 目录（含导出的数据）
- 删除前后的 `pnpm build` 输出对比（构建时间、产物大小）

**验收标准**
- [ ] `pnpm build` 通过，无 TS 错误
- [ ] 全局无残留 import（`grep -rn "blog-agent\|use-blog-writer\|Tiptap\|prisma" src/` 仅剩注释或无结果）
- [ ] `/ai-write`、`/blog/new` 返回 404
- [ ] 导航栏无 AI 写作入口
- [ ] 依赖数减少 ≥ 8 个
- [ ] 首页、博客列表、文章详情视觉**与改造前截图完全一致**（陈亲自验收）

**依赖**：T0 完成。

---

---

## 执行记录

| 日期 | 状态变更 | 说明 |
|---|---|---|
| — | 待开工 | — |

## 验收证据

> 交付时在此粘贴：构建日志、页面截图、curl 返回示例。

（待填）
