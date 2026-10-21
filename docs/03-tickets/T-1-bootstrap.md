# T-1 · 项目初始化与白名单迁移（⭐ 真正的第一个工单）

> 状态：`待开工`
> 负责人：开发 Agent
> 验收人：陈
> 所属项目：**openblog**
>
> ⚠️ 执行前必读：`docs/README.md` 硬性规则 + `docs/02-contracts/design-system.md`

---

## 为什么有这个工单

`openblog` 目前**只有文档，没有任何代码**：没有 `src/`、没有 `package.json`、没有锁文件、没有 Next.js 配置、没有 Supabase migration。

而原有 T0/T1 直接要求修改或删除 `portfolio` 仓库中的文件（`src/lib/auth.ts`、`prisma/`、`src/app/ai-write/` 等）。这些路径**在 openblog 里不存在**，照原样执行会直接失败。

所以必须先补齐一个阶段：**在 openblog 建起可运行的地基，并按白名单从 portfolio 迁移资产**。

> 📌 **执行顺序：T-1 → T0 → T1 → T2 → T3 → T4 → T5 → T6**
> 原 T0「安全止血」在 portfolio 上止血已无意义 —— portfolio 不再开发，只做只读基线。

---

## 迁移源（唯一）

| 项 | 值 |
|---|---|
| 仓库 | `czj527/portfolio`（私有） |
| 分支 | **`origin/main`** |
| 基线提交 | `b5facfb` |
| 说明 | 陈本地未提交的修改**不作为**迁移源 |

---

## 任务 A：初始化可运行骨架

在 `openblog` 根目录建立：

```
package.json + pnpm-lock.yaml      ← 锁定版本，不用 ^latest
next.config.ts
tsconfig.json
eslint.config.mjs
postcss.config.mjs
.env.example                       ← 只写 key 名和说明，不写值
.gitignore                         ← 必须含 .env*、*.db、MIGRATION-BACKUP/
supabase/migrations/               ← 先建空目录 + README
src/
  app/
    layout.tsx
    page.tsx                       ← 首页占位
    blog/page.tsx                  ← 列表占位
    blog/[slug]/page.tsx           ← 详情占位
    admin/page.tsx                 ← 后台占位
  components/
  lib/
scripts/
  check-env.mjs                    ← 环境变量启动校验
```

**版本要求**

| 项 | 要求 |
|---|---|
| Node | ≥ 20.9（Next.js 16 最低要求） |
| 包管理器 | pnpm（与 portfolio 一致） |
| Next.js | 16.x（**如不用 16，须在此工单里写明并说明原因**） |
| React | 与 Next.js 16 匹配版本 |
| TypeScript | strict 模式开启 |
| Tailwind | v4（与 design-system 一致） |

**硬性要求**

1. `pnpm build` 必须通过
2. `pnpm dev` 能启动，首页返回 200
3. `tsconfig.json` 开启 `strict: true`
4. **不要**初始化 Prisma（新架构不用）
5. **不要**建通用 Supabase 代理路由 `/api/supabase`
6. `.gitignore` 必须包含 `MIGRATION-BACKUP/`、`.env`、`.env.local`、`*.db`、`*.sqlite`

---

## 任务 B：白名单迁移

**只允许**从 `portfolio origin/main` 复制以下内容。**禁止**整目录复制后再删。

### ✅ 允许迁移

| 类别 | 具体项 | 备注 |
|---|---|---|
| 全局样式 | `src/app/globals.css` | 原样复制，**不得修改色彩令牌** |
| UI 组件 | `src/components/ui/**` | 按实际 import 闭包逐个复制，排除未使用的 |
| 特效组件 | `src/components/effects/**` | 季节/天气相关；排除依赖 AI 的部分 |
| 主题系统 | 主题 provider、hooks、`dsh-four-seasons-theme` 相关 | 保留季节/天气切换 |
| 布局骨架 | `Navigation`、`Footer` | 移除 `/ai-write` 入口 |
| 静态资源 | `public/` 中实际被引用的图片、字体、头像 | 排除示例图、测试图 |
| 设计契约 | `DESIGN.md` → 已在 `02-contracts/design-system.md` | 已是基线，不重复迁移 |

> 上表要求建立迁移时的视觉基线。后续若发现更合适的视觉方案，先向陈提交具体方案并获批准，再修改视觉令牌、设计契约和对应验收项。

### ❌ 明确不迁移

| 类别 | 路径 | 原因 |
|---|---|---|
| AI 写作助手 | `src/app/ai-write/`、`src/app/api/ai/`、`src/lib/ai/`、`src/components/blog-agent/`、`src/hooks/use-blog-writer.ts`、`src/components/TiptapEditor.tsx` | D-002 已决策删除 |
| Prisma | `prisma/`、`src/lib/prisma.ts` | 新架构不用 Prisma |
| 通用代理 | `src/app/api/supabase/route.ts` | 安全风险（任意表读写） |
| 危险接口 | `src/app/api/clear-data/route.ts` | 安全风险 |
| 旧鉴权 | `src/lib/auth.ts` | 有验证绕过漏洞，必须重写 |
| 旧后台 | `src/app/admin/**` | 业务逻辑全部重写 |
| 旧接口 | `src/app/api/{posts,drafts,comments,likes,projects,tasks,schedules}/**` | 业务逻辑全部重写 |
| 示例数据 | seed 脚本、`dev.db`、测试 fixtures | 不含真实数据 |
| 编辑器依赖 | `@tiptap/*`、`@prisma/*`、`@libsql/*` | 随代码一起不迁 |

---

## 任务 C：建立视觉基线

迁移完成后，用 portfolio 生产站点截图作为对照：

| 页面 | 要求 |
|---|---|
| 首页 | 截图存档 |
| 博客列表 | 截图存档 |
| 文章详情 | 截图存档 |

截图存到 `EVIDENCE/T-1/`（**不入库**，见 `04-acceptance/checklist.md` 的备份规则）。

---

## 交付物

- [ ] 可运行的 `openblog` 骨架（`pnpm build` 通过）
- [ ] 白名单迁移清单：`docs/05-migration/allowlist.md`（逐项写明源路径 → 目标路径 → 是否迁移）
- [ ] 首页/列表/详情/后台 4 个占位页可访问
- [ ] `EVIDENCE/T-1/build.log`（构建日志）
- [ ] `EVIDENCE/T-1/screenshots/`（视觉基线截图）

> ⚠️ **`EVIDENCE/` 与 `MIGRATION-BACKUP/` 都不提交进仓库**，只提交清单和校验记录。详见 `docs/04-acceptance/checklist.md`。

---

## 验收标准

| # | 检查项 | 方法 |
|---|---|---|
| B1 | `pnpm install && pnpm build` 通过 | 看构建日志 |
| B2 | `pnpm dev` 启动后 `/` 返回 200 | `curl -I localhost:3000` |
| B3 | 无 Prisma 依赖 | `grep -r "prisma" package.json src/` 无结果 |
| B4 | 无 AI 写作助手残留 | `grep -rn "ai-write\|blog-agent\|tiptap" src/` 无结果 |
| B5 | 无通用 Supabase 代理 | `ls src/app/api/supabase` 不存在 |
| B6 | `.env.example` 只含 key 名 | 人工检查无真实值 |
| B7 | `.gitignore` 覆盖敏感项 | `git check-ignore .env MIGRATION-BACKUP/x` 均返回路径 |
| B8 | 首页视觉与 portfolio 生产站一致 | 陈亲自对比截图 |
| B9 | 迁移清单完整 | `allowlist.md` 每项都有结论 |

---

## 依赖

**无。这是第一个工单。**

## 阻塞项

> ✅ 原有 2 项决策已由陈拍板（Q1 全删 / Q2 历史文章全不要），不再是阻塞项。
> T-1 只需按白名单迁移前端与样式，不涉及数据，**可立即开工**。

| # | 事项 | 状态 |
|---|---|---|
| 1 | `/roadmap`、`/project-logs/[id]` 是否保留 | ✅ 已定：全删 |
| 2 | 历史文章来源 | ✅ 已定：全部不要，从零开始 |

> 决策详情见 `TASKS.md` 的「陈已拍板的决策」。

---

## 执行记录

| 日期 | 状态变更 | 说明 |
|---|---|---|
| — | 待开工 | — |

## 验收证据

> 交付时在此粘贴：构建日志摘要、页面截图路径、curl 返回示例。

（待填）
