# T2 · 数据层统一（Prisma → Supabase）

> 状态：`待开工`
> 负责人：开发 Agent
> 验收人：陈
> 所属项目：openblog
>
> ⚠️ 执行前必读：`docs/README.md` 的硬性规则 + `docs/02-contracts/design-system.md`

---

**目标**：消灭双库，所有数据统一到 Supabase Postgres。

**范围**
- 新建 Supabase 表：`comments`、`likes`、`guestbook`、`friend_links`、`site_config`（若不存在）
- 数据迁移：Prisma SQLite → Supabase（评论、点赞、留言、友链、配置、projects）
- 改造所有 `getPrisma()` 调用点
- `src/lib/supabase.ts` → 补类型定义、分层（server/client）
- 删除所有 Prisma 相关代码（若 T1 未删尽）

**表结构要求**

```sql
-- comments
id uuid PK, post_slug text NOT NULL, author text NOT NULL,
content text NOT NULL, approved boolean DEFAULT false,
created_at timestamptz DEFAULT now()

-- likes
id uuid PK, post_slug text NOT NULL, ip_hash text NOT NULL,
created_at timestamptz DEFAULT now(),
UNIQUE(ip_hash, post_slug)

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

> **注意**：评论/点赞关联字段从 `post_id`（Prisma int 自增）改为 `post_slug`（text）——因为 Notion 文章没有本地 int id。

**RLS 策略**
- `comments`：匿名 `SELECT` 仅 `approved = true`；`INSERT` 允许；`UPDATE`/`DELETE` 仅 service_role
- `likes`：匿名 `SELECT` + `INSERT`；`UPDATE`/`DELETE` 仅 service_role
- `guestbook`：匿名 `SELECT` + `INSERT`；`UPDATE`/`DELETE` 仅 service_role
- `friend_links`：匿名 `SELECT`
- `site_config`：匿名 `SELECT`
- 个人管理表（tasks/schedules/projects/activity_log）：匿名**无权限**，仅 service_role

**交付物**
- Supabase 迁移 SQL 文件（`supabase/migrations/*.sql`）
- 数据迁移脚本（一次性，可重复执行且幂等）
- 迁移前后各表行数对照表
- RLS 策略清单

**验收标准**
- [ ] 所有表在 Supabase 存在，行数与迁移前一致（±0）
- [ ] 评论/留言/友链/项目页数据正常显示
- [ ] 全局无 `getPrisma` 引用
- [ ] 无 `dev.db`、无 `DATABASE_URL` 环境变量
- [ ] RLS 生效：用 anon key 直接查个人管理表 → 空结果或报错
- [ ] 生产环境冷启动后数据不丢失（部署 2 次后复查）

**依赖**：T1 完成。

---

---

## 执行记录

| 日期 | 状态变更 | 说明 |
|---|---|---|
| — | 待开工 | — |

## 验收证据

> 交付时在此粘贴：构建日志、页面截图、curl 返回示例。

（待填）
