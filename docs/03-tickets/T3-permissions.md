# T3 · 权限重构（完整落地）

> 状态：`待开工`
> 负责人：开发 Agent
> 验收人：陈
> 所属项目：openblog
>
> ⚠️ 执行前必读：`docs/README.md` 的硬性规则 + `docs/02-contracts/design-system.md`

---

**目标**：把 T0 的止血版本，落地为完整的权限矩阵。

**范围**
- 按 `docs/01-spec/auth.md` 第 2.2 节实现接口权限矩阵
- 新建专用接口，替代已删除的通用接口：
  - `PATCH /api/comments/[id]`（审核）
  - `DELETE /api/comments/[id]`
  - `DELETE /api/guestbook/[id]`
  - `POST/PUT/DELETE /api/friend-links`
  - `GET/POST/PATCH/DELETE /api/tasks`、`/api/schedules`、`/api/projects`
- 公开写接口加防护（长度校验、频率限制、strip HTML）
- `/admin` 后台适配新接口

**要求**

### 权限分层（关键：不要把所有写接口都要求 verifyAdmin）

> ⚠️ 原版写「所有写接口必须 `verifyAdmin` 先行」，这与「匿名用户可以发表评论/点赞/留言」**直接矛盾**。
> 正确做法是**分成两类**：

| 类别 | 接口 | 权限 | 写入方式 |
|---|---|---|---|
| **公开写入** | `POST /api/comments`<br>`POST /api/likes`<br>`POST /api/guestbook`<br>`POST /api/friend-links` | **不需要登录** | 经 API Route 校验后，用 **service role** 写入 |
| **管理员写入** | `PATCH/DELETE /api/comments/[id]`<br>`DELETE /api/guestbook/[id]`<br>`PATCH/DELETE /api/friend-links/*`<br>`* /api/tasks`、`/api/schedules`、`/api/projects` | **必须 `verifyAdmin`** | service role |
| **公开读取** | `GET /api/comments`、`GET /api/posts` 等 | 匿名可读 | anon key 或 service role |

**核心规则**

1. 浏览器只用 **anon key**，且**只读**公开数据
2. 所有写操作（含匿名评论）**必须经过 API Route**，不直连数据库
3. Supabase 的 anon 角色**不开放** comments/likes/guestbook 的 INSERT 权限
4. API Route 内部用 service role 写入，负责：输入校验、HTML 清洗、限流、设置审核状态
5. 只有管理员专属资源才校验 `verifyAdmin`

### 其他要求

- 所有公开写接口必须 strip HTML（防 XSS），存纯文本
- **限流不能用进程内 Map**（Vercel 多实例不共享）—— 用 T0 选定的方案（Upstash / Vercel KV / Supabase 表）
- 评论默认 `status = 'pending'`，管理员审核后前台可见
- 错误响应不泄露内部信息（不返回 SQL、堆栈、表名）

**验收标准**
- 对应 `docs/04-acceptance/checklist.md` 安全项 S1-S12、S21 全部通过
- 新增专项：
  - [ ] 匿名 `POST /api/tasks` → 401
  - [ ] 匿名 `DELETE /api/comments/xxx` → 401
  - [ ] 管理员增删改任务/日程/项目/友链全部正常
  - [ ] 评论提交后为待审核状态（`status='pending'`），管理员审核后前台可见
  - [ ] 评论/点赞写入的 `post_id` 是 Notion page ID，**不是 slug**
  - [ ] 匿名直接用 anon key 插库 → 被 RLS 拒绝
  - [ ] 同 IP 1 分钟内提交 4 条评论 → 第 4 条被限流

**依赖**：T2 完成。

---

---

## 执行记录

| 日期 | 状态变更 | 说明 |
|---|---|---|
| — | 待开工 | — |

## 验收证据

> 交付时在此粘贴：构建日志、页面截图、curl 返回示例。

（待填）
