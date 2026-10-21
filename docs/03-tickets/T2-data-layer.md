# T2 · 数据层统一（Prisma → Supabase）

> 状态：`已阻塞`
> 负责人：开发 Agent
> 验收人：陈
> 所属项目：openblog
>
> ⚠️ 执行前必读：`docs/README.md` 的硬性规则 + `docs/02-contracts/design-system.md`

---

**目标**：消灭双库，所有数据统一到 Supabase Postgres。

**范围**
- 新建 Supabase 表：`comments`、`likes`、`guestbook`、`friend_links`、`site_config`（若不存在）
- 数据迁移：按 T1 结论迁移留言、友链、配置、projects、tasks、schedules；评论和点赞从零开始，不迁移旧数据
- 改造所有 `getPrisma()` 调用点
- `src/lib/supabase.ts` → 补类型定义、分层（server/client）
- 删除所有 Prisma 相关代码（若 T1 未删尽）

**表结构要求**

```sql
-- comments
id uuid PK, post_id text NOT NULL, author text NOT NULL,
content text NOT NULL, status text DEFAULT 'pending',
created_at timestamptz DEFAULT now()

-- likes
id uuid PK, post_id text NOT NULL, ip_hash text NOT NULL,
created_at timestamptz DEFAULT now(),
UNIQUE(ip_hash, post_id)

-- guestbook
id uuid PK, name text, content text NOT NULL,
emoji text DEFAULT '😀', likes int DEFAULT 0,
created_at timestamptz DEFAULT now()

-- friend_links
id uuid PK, name text NOT NULL, url text NOT NULL,
logo text, sort_order int DEFAULT 0

-- site_config
id uuid PK, key text UNIQUE NOT NULL, value text NOT NULL
```

> ⚠️ **关联键必须是 `post_id`（Notion page ID），不能用 `post_slug`。**
>
> 原方案写「从 `post_id` 改为 `post_slug`，因为 Notion 文章没有本地 int id」——这个理由不成立，而且有害：
> - Notion 文章**有稳定 ID**，就是 page ID（`xxxxxxxx-xxxx-...`，32 位 hex）
> - Slug 会变（改标题、改 URL），一旦改了，评论/点赞就**全部失联**
> - 评审第 9 条明确要求：「评论、点赞和统计关联稳定 `post_id`，不关联当前 Slug」
>
> 所以 `post_id` 字段类型用 `text`（存 Notion page ID），命名保持 `post_id`。

**RLS 策略**

> ⚠️ 与原版的关键差异：**匿名角色不开放任何 INSERT**。
> 所有写入（含公开评论）都经 Next.js API Route 用 service_role 执行。理由见 `T3-permissions.md`。

| 表 | 匿名（anon） | service_role |
|---|---|---|
| `comments` | **只读** `status = 'approved'` 的记录 | 全权限 |
| `likes` | **只读** | 全权限 |
| `guestbook` | **只读**（已审核的） | 全权限 |
| `friend_links` | **只读** | 全权限 |
| `site_config` | **只读** | 全权限 |
| 个人管理表（`tasks`/`schedules`/`projects`/`activity_log`） | **无任何权限**（含读） | 全权限 |

**为什么匿名不给 INSERT**：即使 RLS 限制了列，匿名直插仍绕过 API Route 的输入校验、HTML 清洗、限流和审核状态设置。全部走服务端是唯一可控的路径。

**不建的表**（依 Q1 决策）

- ❌ `project_logs` —— `/project-logs/[id]` 页面已删除
- ❌ `workflow_*` —— `/roadmap` 页面已删除
- ❌ 任何存储经济规划原始金额的表 —— 见 T5 数据分层

**交付物**
- Supabase 迁移 SQL 文件（`supabase/migrations/*.sql`）
- 数据迁移脚本（一次性，可重复执行且幂等）
- 迁移前后各表行数对照表
- RLS 策略清单

**验收标准**
- [ ] 迁移表在 Supabase 存在，行数与迁移前一致（±0）；评论和点赞表从空库开始
- [ ] 留言/友链/项目页数据正常显示，评论和点赞功能可在新站写入
- [ ] 全局无 `getPrisma` 引用
- [ ] 无 `dev.db`、无 `DATABASE_URL` 环境变量
- [ ] RLS 生效：用 anon key **写** comments/guestbook → **被拒绝**
- [ ] RLS 生效：用 anon key 直接查个人管理表 → 空结果或报错
- [ ] `comments`/`likes` 的关联字段是 `post_id`（Notion page ID），**不是 slug**
- [ ] 不存在 `project_logs`、`workflow_*` 表
- [ ] 生产环境冷启动后数据不丢失（部署 2 次后复查）

**依赖**：T1 完成。

---

---

## 执行记录

| 日期 | 状态变更 | 说明 |
|---|---|---|
| — | 待开工（历史记录） | 当前状态已更新为 `已阻塞`，等待 T1 完成 |

## 验收证据

> 交付时在此粘贴：构建日志、页面截图、curl 返回示例。

（待填）
