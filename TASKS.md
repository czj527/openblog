# 任务板

> **维护者：蓝** · 更新频率：每次状态变化时立即更新
> 最后更新：2026-10-20（按 `docs/06-review/2026-10-20-plan-review.md` 修订）

---

## 当前焦点

**阶段**：计划已修订 → 等陈拍板 3 个决策 → 可开工 T-1
**主攻项目**：openblog（唯一主攻，不并行）
**下一步**：陈回答下方「待陈拍板」3 项后，T-1 即可派给开发 agent

---

## 工单状态总览

> **状态定义见 `docs/README.md`**。`待开工` = 现在就能动手；依赖未满足必须标 `已阻塞`。

| 工单 | 标题 | 状态 | 依赖 | 验收人 |
|---|---|---|---|---|
| [T-1](./docs/03-tickets/T-1-bootstrap.md) | 项目初始化 + 白名单迁移 | `待开工` ⭐ | 无（可立即开始） | 陈 |
| [T0](./docs/03-tickets/T0-security.md) | 安全基线 | `已阻塞` | T-1 + 陈准备凭证 | 陈 |
| [T1](./docs/03-tickets/T1-data-migration.md) | 旧数据盘点与迁移 | `已阻塞` | T-1 + 3 项决策 | 陈 |
| [T2](./docs/03-tickets/T2-data-layer.md) | 数据层（Supabase schema） | `已阻塞` | T1 | 陈 |
| [T3](./docs/03-tickets/T3-permissions.md) | 权限与互动接口 | `已阻塞` | T2 | 陈 |
| [T4](./docs/03-tickets/T4-notion-cms.md) | Notion CMS 接入 | `已阻塞` | T3 + 陈建 Notion 库 | 陈 |
| [T5](./docs/03-tickets/T5-economy-and-legal.md) | 私有经济页 + 合规页 | `已阻塞` | T4 | 陈 |
| [T6](./docs/03-tickets/T6-content-and-launch.md) | 内容与上线 | `已阻塞` | T5 | 陈 |

**状态图例**：`待开工` / `进行中` / `待验收` / `已验收` / `已阻塞` / `已作废`

> 📌 **只有 T-1 是 `待开工`**。其余全部依赖前面工单，不满足「现在能动手」的定义，所以标 `已阻塞`。

---

## 🔴 待陈拍板（阻塞 T1/T2，不阻塞 T-1）

| # | 决策点 | 选项 | 影响 | 状态 |
|---|---|---|---|---|
| **Q1** | `/roadmap`、`/project-logs/[id]`、`workflow_*` 表是否保留？ | A. 全保留<br>B. 全删<br>C. 部分保留（请注明） | 决定 T1 要不要迁这些表、T2 要不要建模型 | ☐ 待定 |
| **Q2** | 历史文章如何处理？ | A. 全部迁入 Notion<br>B. 只迁要保留的<br>C. 旧的留本地 Markdown，新文章走 Notion | 决定 T1 文章迁移路径、T4 数据源结构 | ☐ 待定 |
| **Q3** | 经济规划页确认**完全私有**（仅管理员可见）？ | A. 确认私有<br>B. 需要公开脱敏版 | 决定 T5 是否需要脱敏数据源 | ☐ 待定 |

> 这 3 项**不阻塞 T-1**（T-1 只做骨架和白名单迁移），但会阻塞 T1 正式开工。

---

## 待陈准备（阻塞 T0 / T4）

> ⚠️ 以下凭证**由陈本人在本地生成**，不要通过聊天发给任何 agent。agent 只负责「变量缺失时拒绝启动」的代码。

### 阻塞 T0

| # | 事项 | 状态 | 备注 |
|---|---|---|---|
| 1 | 撤销泄露的 GitHub token，生成新 token | ☐ | 旧 token 已暴露在聊天记录，仍有效 |
| 2 | 设定管理员密码并生成 bcrypt hash | ☐ | 本地跑 `node scripts/hash-password.mjs`（T0 会创建） |
| 3 | 生成 `AUTH_SECRET` | ☐ | `openssl rand -base64 32` |

### 阻塞 T4

| # | 事项 | 状态 | 备注 |
|---|---|---|---|
| 4 | Notion 建「Blog Posts」库（按 `01-spec/architecture.md` 3.1 节） | ☐ | |
| 5 | 建 Notion Integration，拿 token | ☐ | https://www.notion.so/my-integrations |
| 6 | 把库 Connect 到 Integration | ☐ | |
| 7 | 提供 Data Source ID | ☐ | 注意是 data source 不是 database |
| 8 | 录入至少 1 篇测试文章 | ☐ | |

---

## ✅ 已确认的决策（不再讨论）

| # | 决策 | 结论 | 记录 |
|---|---|---|---|
| ~~D1~~ | ~~正式代码在哪个仓库开发？~~ | **已确认：openblog 独立重写；`portfolio origin/main` 只读提供迁移基线（`b5facfb`）** | `DECISIONS.md` D-004 |
| ~~D2~~ | ~~Notion 块渲染：自建 vs `notion-to-md`~~ | **待 T4 前定**（不阻塞当前阶段） | — |
| ~~D3~~ | ~~历史文章是否全迁 Notion~~ | **已升级为 Q2，见上方「待陈拍板」** | — |

> D1 已由陈确认并写入 `DECISIONS.md` D-004，**移出决策队列**，不再作为待决策项。

---

## 每日汇总

### 2026-10-20
- 完成：方案文档 7 份；DeepSeek 搜索 API 接入；`openblog` 仓库创建；完成计划评审
- **完成（本轮）**：按评审修订全部工单与文档 —— 新增 T-1、重写 T0/T1、修 5 处硬冲突、补缓存/Notion 设计
- 阻塞：等陈拍板 Q1/Q2/Q3
- 明日：陈回答后派发 T-1

---

## 每周汇总

### 第 43 周（2026-10-19 ~ 10-25）
- 规划完成度：架构 / 权限 / 工单 / 验收 全部就绪，且已按评审修订
- 代码进度：0%（尚未开工）
- 风险：①凭证未轮换（旧 GitHub token 仍有效且已暴露）；②Q1/Q2/Q3 未定，T1 无法开工
