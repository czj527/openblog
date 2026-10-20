# 任务板

> **维护者：蓝** · 更新频率：每次状态变化时立即更新
> 最后更新：2026-10-20

---

## 当前焦点

**阶段**：评审完成 → 等待修订计划
**主攻项目**：openblog（唯一主攻，不并行）
**阻塞项**：先完成 `docs/06-review/2026-10-20-plan-review.md` 中的 M0/M1 计划修订，再开始项目初始化

---

## 工单状态总览

| 工单 | 标题 | 状态 | 依赖 | 验收人 |
|---|---|---|---|---|
| [T0](./docs/03-tickets/T0-security.md) | 安全止血 | `待开工` 🔴 | 待陈准备凭证 | 陈 |
| [T1](./docs/03-tickets/T1-slimming.md) | 瘦身删除 | `待开工` | T0 | 陈 |
| [T2](./docs/03-tickets/T2-data-layer.md) | 数据层统一 | `待开工` | T1 | 陈 |
| [T3](./docs/03-tickets/T3-permissions.md) | 权限重构 | `待开工` | T2 | 陈 |
| [T4](./docs/03-tickets/T4-notion-cms.md) | Notion CMS 接入 | `待开工` | T3 + 陈建 Notion 库 | 陈 |
| [T5](./docs/03-tickets/T5-economy-and-legal.md) | 经济规划页 + 合规页 | `待开工` | T4 | 陈 |
| [T6](./docs/03-tickets/T6-content-and-launch.md) | 内容与上线 | `待开工` | T5 | 陈 |

**状态图例**：`待开工` / `进行中` / `待验收` / `已验收` / `已作废`

---

## ⚠️ 待陈处理（阻塞 T0）

| # | 事项 | 状态 | 备注 |
|---|---|---|---|
| 1 | 撤销泄露的 GitHub token，生成新 token | ☐ 未完成 | 旧 token 仍有效，已暴露在聊天记录中 |
| 2 | 设定新管理员密码（非默认值） | ☐ 未完成 | 需要能生成 bcrypt hash |
| 3 | 生成 `AUTH_SECRET`（`openssl rand -base64 32`） | ☐ 未完成 | ≥32 字节随机值 |

## 待陈处理（阻塞 T4）

| # | 事项 | 状态 | 备注 |
|---|---|---|---|
| 4 | Notion 建「Blog Posts」库（按 `01-spec/architecture.md` 3.1 节） | ☐ 未完成 | |
| 5 | 建 Notion Integration，拿 token | ☐ 未完成 | https://www.notion.so/my-integrations |
| 6 | 把库 Connect 到 Integration | ☐ 未完成 | |
| 7 | 提供 Data Source ID | ☐ 未完成 | 注意是 data source 不是 database |
| 8 | 录入至少 1 篇测试文章 | ☐ 未完成 | |

---

## 需要陈拍板的决策（决策队列）

| # | 决策点 | 选项 | 影响 |
|---|---|---|---|
| D1 | 正式代码在哪个仓库开发？ | **已确认：openblog 独立重写；portfolio origin/main 只读提供迁移基线** | 已完成，不再作为待决策项 |
| D2 | Notion 块渲染：自建渲染器 vs `notion-to-md` + 现有 markdown 链路 | A. 自建（可控、工作量大）<br>B. 复用（快、样式受限） | 影响 T4 工期 |
| D3 | 旧博客的历史文章是否全部迁移到 Notion？ | A. 全迁<br>B. 只迁要保留的<br>C. 旧的留本地 MD | 影响 T4 |

---

## 每日汇总

> 模板，实际使用时按天追加。

### 2026-10-20
- 完成：方案文档 7 份；DeepSeek 搜索 API 接入；`openblog` 仓库创建；文档按新结构重组；完成计划评审并记录于 `docs/06-review/2026-10-20-plan-review.md`
- 阻塞：先按评审建议修订计划并冻结未决页面范围，再进入项目初始化
- 明日：待定

---

## 每周汇总

### 第 43 周（2026-10-19 ~ 10-25）
- 规划完成度：架构 / 权限 / 工单 / 验收 全部就绪
- 代码进度：0%（尚未开工）
- 风险：凭证未轮换（旧 GitHub token 仍有效且已暴露）
