# 计划修订记录 · 2026-10-20

> 对应评审：[`2026-10-20-plan-review.md`](./2026-10-20-plan-review.md)
> 修订人：蓝
> 状态：**15 条评审意见已逐条处理**

---

## 处理方式说明

| 标记 | 含义 |
|---|---|
| ✅ 已采纳 | 按评审建议修改了文档 |
| 🔧 部分采纳 | 采纳方向，但具体做法有调整 |
| ❌ 已驳回 | 核实后评审判断有误，未修改 |
| ➕ 评审遗漏 | 评审未提，但核查时发现并一并修复 |

---

## 逐条处理结果

### ✅ 1. T0/T1 执行对象错误

**采纳。这是最严重的问题。**

- **新增** [`docs/03-tickets/T-1-bootstrap.md`](../03-tickets/T-1-bootstrap.md)：项目初始化 + 白名单迁移，作为第一个工单
- **重写** [`T0-security.md`](../03-tickets/T0-security.md)：从「修 portfolio 的 auth.ts」改为「在 openblog 从零实现安全基线」
- **重写** [`T1-data-migration.md`](../03-tickets/T1-data-migration.md)（原 `T1-slimming.md`）：删除动作在 T-1 白名单阶段已排除，本工单改为数据迁移
- 新执行顺序：**T-1 → T0 → T1 → T2 → T3 → T4 → T5 → T6**

### ✅ 2. D1 已过时

**采纳。** `TASKS.md` 中 D1 已移出决策队列，标注为「已确认」，并指向 `DECISIONS.md` D-004。

### ✅ 3. 迁移白名单没有冻结

**采纳。** 写进 `T-1-bootstrap.md` 的「任务 B」，分「✅ 允许迁移 / ❌ 明确不迁移」两张表，且要求产出 `docs/05-migration/allowlist.md` 逐项记录源路径 → 目标路径。

### ✅ 4. 旧数据模型没有完成映射

**采纳。** `T1-data-migration.md` 新增「任务 A：旧数据盘点」，要求每类数据给出字段映射表，并标记无法映射的字段。含 `project_logs`、`workflow_*`、重复 `projects` 表的处理。

### ✅ 5. 公开写入、RLS 和管理员鉴权相互冲突

**采纳。** `T3-permissions.md` 重写「要求」章节，明确分三类：公开写入（不登录，经 API Route + service role）、管理员写入（verifyAdmin）、公开读取（anon key 只读）。并明确「Supabase anon 不开放 INSERT 权限」。

### ✅ 6. 内存 Map 不能作为生产级全局限流

**采纳。** `T0-security.md` 任务 B 改为三选一（Upstash Redis / Vercel KV / Supabase 表），明确禁用进程内 Map。`T3-permissions.md` 同步修改。

### 🔧 7. Notion API 版本需要重新核对

**部分采纳 —— 版本判断有误，子问题成立。**

- ❌ **版本无需改**：经查 Notion 官方文档，`2025-09-03` **就是当前正式版本**，data sources 正是在该版本引入。
  依据：[Notion Data source 文档](https://developers.notion.com/reference/data-source)、[2025-09-03 升级 FAQ](https://developers.notion.com/guides/get-started/upgrade-faqs-2025-09-03)
- ✅ **子问题全部采纳并补齐**：`architecture.md` 新增 **4.4 Webhook 设计与兜底**、**4.5 Notion 图片处理**
  - Webhook 签名校验（原始 body + HMAC + timingSafeEqual）
  - 首次订阅 `verification_token` 回填流程
  - Webhook 失败的 3 层兜底（cacheLife / Cron / 手动）
  - 同步验收口径改为「最终一致」，不承诺固定时间
  - 图片 URL 过期的代理方案（存 block_id，实时刷新）

### ✅ 8. Next.js 版本与缓存写法没有对齐

**采纳 —— 核查后确认问题比评审描述更严重。**

经查 Next.js 官方文档：

| 文档原写法 | Next.js 16 实际情况 |
|---|---|
| `unstable_cache` | **已废弃**，官方建议改用 `'use cache'` 指令 |
| `revalidateTag('posts')` | **单参数写法在 16 中不再工作**，必须 `revalidateTag(tag, cacheLife)` |

依据：[unstable_cache](https://nextjs.org/docs/app/api-reference/functions/unstable_cache)、[revalidateTag](https://nextjs.org/docs/app/api-reference/functions/revalidateTag)

**已修改** `architecture.md`：
- 4.1 流程图缓存写法
- 4.3 缓存策略表（重写，含 ✅使用/❌禁止对照表）
- 技术选型表缓存层一行

### ✅ 9. Slug 验收规则与已确认决策冲突

**采纳。** `checklist.md` N6 改为「已发布 Slug 默认不可改；确需修改保留 301/alias」。与 `architecture.md` 的 URL 策略一致。

### ✅ 10. 经济页不能继续作为公开财务数据源

**采纳。** 已在 `TASKS.md` 列为待陈拍板的 **Q3**（确认完全私有）。`T5` 保持私有定位，`checklist.md` 未出现公开经济数据的验收项。

### ✅ 11. 历史文章缺少唯一权威来源

**采纳。** `T1-data-migration.md` 任务 A 明确「文章」一行的来源与目标，并在 `TASKS.md` 升级为 **Q2** 待陈拍板。

### ✅ 12. 任务状态和依赖图不可信

**采纳。** 两处修改：
- `docs/README.md` 新增「四类状态必须分开记录」表，并新增 `已阻塞` 状态
- `TASKS.md` 重排：只有 T-1 标 `待开工`，其余全部 `已阻塞`，并写明阻塞原因

### ✅ 13. 备份不应提交到仓库

**采纳。** 三处修改：
- `T1-data-migration.md` 新增「🔒 安全要求」章节，明确仓库内允许/禁止清单
- `checklist.md` D11 改为「备份归档到仓库外，仓库内只有校验和」
- `T-1-bootstrap.md` 要求 `.gitignore` 包含 `MIGRATION-BACKUP/`、`EVIDENCE/`

### ✅ 14. 文档路径和索引已经漂移

**采纳。** 
- `docs/README.md` 目录树重写：删除不存在的 `data-model.md`，补上 `T6`、`T-1`、`allowlist.md`
- 仓库根 `README.md` 目录树同步更新
- 修正 `T0-security.md`、`T3-permissions.md`、`T4-notion-cms.md` 中对失效文档的引用

### ✅ 15. AdSense 条目混入了未经证实的硬门槛

**采纳。** `checklist.md` 第八节改写：区分「✅ 必须」（Privacy/About/Contact/导航/原创）与「🎯 内部目标」（20-30 篇、域名 6 个月、自然流量），并加说明「达到目标是值得申请的参考，不等于审核必过」。

### ➕ 评审遗漏：`architecture.md` 中的数据清理描述

`architecture.md:68` 原写「`Project` 表统一保留 Supabase 版本，Prisma 版本随 `prisma/` 目录一并删除」——这与问题 1 同源，是在 openblog 文档里描述 portfolio 的清理动作。已在 T-1 白名单中明确「Prisma 不迁移」。

---

## 3 项决策已由陈拍板（2026-10-20）

| # | 决策点 | 结论 | 落实位置 |
|---|---|---|---|
| Q1 | `/roadmap`、`/project-logs/[id]`、`workflow_*` | **全删** | `DECISIONS.md` D-007；`T2` 不建这些表；checklist 删 F12 |
| Q2 | 历史文章 | **全部不要，从零开始** | `DECISIONS.md` D-008；`T1` 大幅缩减；评论/点赞随之不迁 |
| Q3 | 经济页 | **公开脱敏版** | `DECISIONS.md` D-009；`T5` 重写；`architecture.md` 3.2 改为双库 |

### Q2 的连带影响（已在 T1 中明确）

文章全部不要 ⇒ 评论和点赞失去关联对象 ⇒ **也不迁移**。这是必须让陈知道的结果，已写入 `T1-data-migration.md` 开头。

### Q3 的安全设计（已在 T5 中明确）

私人库 `Economy Plan` 与公开库 `Economy Public` **物理隔离**。站点只能配公开库的 ID；旧变量名 `NOTION_ECONOMY_DATA_SOURCE_ID` 被列为**禁止项**，配了直接启动失败。

---

## 变更文件清单

| 文件 | 变更类型 |
|---|---|
| `docs/03-tickets/T-1-bootstrap.md` | **新增** |
| `docs/03-tickets/T0-security.md` | 重写 |
| `docs/03-tickets/T1-data-migration.md` | 重写 + 改名（原 `T1-slimming.md`） |
| `docs/03-tickets/T3-permissions.md` | 修权限分层 + 限流方案 |
| `docs/01-spec/architecture.md` | 缓存模型重写 + 新增 Webhook/图片章节 |
| `docs/04-acceptance/checklist.md` | N6 Slug / D11 备份 / AdSense 定位 |
| `docs/README.md` | 目录树 + 状态约定 |
| `README.md` | 目录树 + 执行顺序 |
| `TASKS.md` | 重写（D1 移出、状态分离、Q1-Q3） |
| `docs/06-review/2026-10-20-plan-review.md` | 加修订状态说明 |
| `docs/06-review/revision-log.md` | **新增**（本文件） |
