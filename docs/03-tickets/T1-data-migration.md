# T1 · 数据迁移与清理（原「瘦身删除」已作废重写）

> 状态：`待开工`
> 负责人：开发 Agent
> 验收人：陈
> 所属项目：**openblog**
> 依赖：**T-1 完成**（白名单迁移已确认无 AI 写作助手与 Prisma）
>
> ⚠️ 执行前必读：`docs/README.md` 硬性规则 + `docs/02-contracts/design-system.md`

---

## 重要说明：本工单已被重写

旧版 T1 叫「瘦身删除」，要求删除 `portfolio` 的 `src/app/ai-write/`、`prisma/`、`src/components/blog-agent/` 等 20+ 个文件。

**这些文件在 openblog 里从来没有**：
- T-1 的白名单就已经排除了 AI 写作助手和 Prisma
- openblog 从零建起，不存在「先复制再删除」的问题

所以本工单的实际内容变成：**历史数据迁移 + 旧站数据源确认**。

> 📌 原 T1 中仍然有效的要求已并入 T-1（不迁移 AI 助手/Prisma）与本工单（数据导出与校验）。

---

## 任务 A：旧数据盘点

在动手迁移前，先产出一份**数据清单**：`docs/05-migration/data-inventory.md`

| 数据类别 | 旧位置 | 目标表 | 保留？ | 备注 |
|---|---|---|---|---|
| 文章 | Supabase `posts` + `src/content/` + Markdown | Notion | 待陈定 | 见 D3 |
| 草稿 | Supabase `drafts` | **不迁移** | ❌ | 站点不再有草稿概念 |
| 评论 | Prisma SQLite `comments` | Supabase `comments` | ✅ | 需字段映射 |
| 点赞 | Prisma SQLite `likes` | Supabase `likes` | ✅ | 需按 post_id 重关联 |
| 留言 | Prisma SQLite `guestbook` | Supabase `guestbook` | ✅ | 旧数据有 `email`，新模型无 |
| 友链 | Prisma SQLite `friend-links` | Supabase `friend_links` | ✅ | |
| 项目 | Supabase `projects` **与** Prisma `projects` 各一份 | Supabase `projects` | 待陈定 | 两套字段不一致，需比对 |
| 任务 | Supabase `tasks` | Supabase `tasks` | 待陈定 | |
| 日程 | Supabase `schedules` | Supabase `schedules` | 待陈定 | |
| 项目日志 | `project_logs` | ? | 待陈定 | 目标模型未定义 |
| 路线图 | `workflow_*` 多张表 | ? | 待陈定 | 目标模型未定义 |
| 站点配置 | Prisma `siteconfig` | Supabase `site_config` | ✅ | |

**要求**

1. 每类数据记录**迁移前行数**
2. 每类数据给出**字段映射表**（旧字段 → 新字段 → 转换规则）
3. 标记**无法映射**的字段，说明是丢弃还是保留在新字段

---

## 任务 B：导出旧数据

| 要求 | 说明 |
|---|---|
| 导出格式 | JSON（结构化数据）+ Markdown（文章正文） |
| 存放位置 | **仓库外**，如 `~/openblog-backup/2026-10-20/` |
| 敏感字段 | 评论/留言的 `email`、IP 需单独标注，迁移时决定是否保留 |
| 校验 | 每个文件生成 SHA-256 |

> 🚨 **绝对不能提交进 Git**。理由见下方「安全要求」。

---

## 任务 C：执行迁移

按 `data-inventory.md` 的映射表执行，**每张表一个脚本**：

```
scripts/migrate/
  01-comments.mjs
  02-likes.mjs
  03-guestbook.mjs
  04-friend-links.mjs
  05-projects.mjs
  ...
```

**每个脚本必须**

1. 可重复执行（幂等，用 `ON CONFLICT DO UPDATE` 或先清空再插入）
2. 输出「迁移前 N 行 → 迁移后 M 行」
3. 失败时回滚，不留半截数据

---

## 任务 D：校验

| 检查项 | 方法 |
|---|---|
| 行数一致 | 旧表行数 = 新表行数（或有明确说明的差异） |
| 内容抽样 | 每类数据抽 5 条，人工比对字段 |
| 关联完整 | 评论→文章、点赞→文章的 `post_id` 都能对上 |
| 无孤儿数据 | `SELECT COUNT(*) FROM comments WHERE post_id NOT IN (...)` 为 0 |

---

## 🔒 安全要求（重要）

### 备份不得入库

旧数据库可能包含：评论者邮箱、IP 地址、私人财务数据（经济规划）、未公开草稿。

**因此**：

| ✅ 仓库内允许 | ❌ 仓库内禁止 |
|---|---|
| 迁移清单（`data-inventory.md`） | 完整数据库导出（`.sql`、`.json` dump） |
| 迁移前后行数记录 | `dev.db`、`*.sqlite` 文件 |
| 校验哈希（SHA-256） | 含邮箱/IP 的原始数据 |
| 脱敏后的验证记录 | `MIGRATION-BACKUP/` 整个目录 |

**`.gitignore` 必须包含**（T-1 已要求）：

```
MIGRATION-BACKUP/
EVIDENCE/
*.db
*.sqlite
backup/
```

**校验和记录格式**（这个可以入库）：

```markdown
| 文件 | 行数 | SHA-256（前 16 位） | 导出时间 |
|---|---|---|---|
| comments.json | 1,234 | a3f8c2d1e9b4... | 2026-10-20 15:00 |
```

---

## 交付物

- [ ] `docs/05-migration/data-inventory.md`（数据清单 + 字段映射）
- [ ] `scripts/migrate/*.mjs`（每表一个，幂等）
- [ ] 迁移校验报告（行数、抽样比对、孤儿数据检查）
- [ ] `EVIDENCE/T1/` 下放迁移日志（**不入库**）
- [ ] 校验和记录表（**入 `data-inventory.md`，可入库**）

---

## 验收标准

| # | 检查项 | 方法 |
|---|---|---|
| D1 | 数据清单覆盖所有旧表 | 对照 `legacy-audit.md` 逐表确认 |
| D2 | 字段映射表完整 | 每个旧字段都有「→ 新字段」或「丢弃原因」 |
| D3 | 迁移脚本幂等 | 连续执行两次，第二次行数不变 |
| D4 | 行数一致 | 迁移前后对照表 |
| D5 | 无孤儿数据 | SQL 检查返回 0 |
| D6 | 抽样内容一致 | 每类 5 条人工比对 |
| D7 | **备份不在仓库内** | `git ls-files \| grep -E "backup\|\.db$\|dump"` 无结果 |
| D8 | 校验和记录完整 | `data-inventory.md` 中有哈希表 |

---

## 依赖

**T-1 完成。**

## 阻塞项（需陈拍板）

| # | 事项 | 影响 |
|---|---|---|
| 1 | `/roadmap`、`/project-logs/[id]`、`workflow_*` 表是否保留 | 决定这些表迁不迁 |
| 2 | 历史文章是否全部迁入 Notion（D3） | 决定文章迁移路径 |
| 3 | 旧评论/留言的 `email` 字段是否保留 | 涉及隐私合规 |

> 这三项不明确，任务 C 无法开工。**任务 A（盘点）可以先做。**

---

## 执行记录

| 日期 | 状态变更 | 说明 |
|---|---|---|
| 2026-10-20 | 重写 | 原「瘦身删除」内容已作废，改为数据迁移 |

## 验收证据

> 交付时在此粘贴：迁移前后行数对照、抽样比对结果、孤儿数据检查 SQL 输出。

（待填）
