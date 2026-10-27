# Legacy planning archive / 旧计划处置

> 旧 `docs/`、旧根级 `DECISIONS.md`、旧 `TASKS.md` 已从当前工作树移除。
> 它们不属于当前设计轨道，也不得作为新实现的依据。

## 为什么不在当前树里

旧计划是 2026-10-20 前后的“Next.js + Notion + Supabase”实现方案，已被 2026-10-23 之后的 redesign 设计轨道取代。旧文档还包含：

- 已废弃的鉴权实现示例；
- 默认管理员密码占位符；
- 旧站 `service_role` 用法和安全模型；
- 与当前 Window / Desk / Workbench 三层模型不一致的页面和数据库假设。

这些内容不适合作为新实现的模板，因此不复制回活动仓库。

## 在哪里还能看到

1. **Git 历史**（推荐，可追溯）：
   ```bash
   git log --all -- docs/ DECISIONS.md TASKS.md
   git show 35a5322:docs/00-overview.md
   git show 35a5322:DECISIONS.md
   ```
2. **工作区外受限归档**：
   `D:\openblog\_archive\openblog-legacy-20261026\`

## 哪些旧结论可能仍有参考价值

以下只是历史线索，不是当前约束；如需采用，必须重新登记到 `DECISIONS.md`：

- 不迁移到 WordPress 的考虑；
- 旧站的数据层、鉴权漏洞和迁移教训；
- 旧站四季 × 天气主题“太花哨、对比度不足”的教训；
- 旧站后台过于繁琐、Agent 无法顺畅操作的问题。

## 禁止

- 不要把旧 `docs/` 复制回当前树。
- 不要把旧认证代码、默认密码、service-role 用法当作新实现模板。
- 不要把旧计划中的 Next.js / Notion / Supabase 选型写成已确认决策。
