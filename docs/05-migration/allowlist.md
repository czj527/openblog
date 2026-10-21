# 迁移白名单

> 状态：待 T-1 产出并逐项核验
> 迁移基线：`portfolio origin/main`
> 目标仓库：`openblog`

本文件是迁移的唯一允许清单。T-1 完成后，必须把每一项的实际源路径、目标路径、校验结果和备注补齐；未列入允许清单的内容不得迁入新站。

## 允许迁移

| 类别 | 源路径/来源 | 目标路径/用途 | 结论 | 备注 |
|---|---|---|---|---|
| 视觉令牌 | `portfolio origin/main` 的样式、组件和资源 | `openblog` 的 `src/components/ui/`、`globals.css`、资源目录 | 待核验 | 以远端 `origin/main` 为准 |
| 页面结构参考 | `portfolio origin/main` 的页面与布局 | `openblog` 对应页面 | 待核验 | 只迁移经确认的视觉与组件基线 |
| 旧数据模型盘点 | `portfolio origin/main` 的 Prisma/Supabase schema | `docs/05-migration/` 盘点记录 | 待核验 | 仅作为字段映射参考，不默认迁移数据 |
| 站点配置参考 | 旧项目配置文件 | `openblog` 的配置设计 | 待核验 | 不复制密钥或生产环境值 |

## 明确不迁移

| 内容 | 处理方式 | 原因 |
|---|---|---|
| 历史文章 | 不迁移，不保留旧 slug | Q2：从零开始发布 |
| 旧评论与点赞 | 不迁移 | 关联文章不迁移 |
| `/roadmap` | 删除 | Q1 已确认 |
| `/project-logs/[id]` | 删除 | Q1 已确认 |
| `workflow_*` | 删除 | Q1 已确认 |
| 私人 `Economy Plan` 数据 | 禁止迁移 | 公开站点只读取脱敏的 `Economy Public` |
| 密钥、token、密码、生产环境变量 | 禁止迁移 | 安全边界 |
| `EVIDENCE/`、`MIGRATION-BACKUP/` | 不提交 Git | 仅本地留存审计证据 |

## 记录模板

| 源路径 | 目标路径 | 是否迁移 | 校验命令/证据 | 结论 | 备注 |
|---|---|---|---|---|---|
| 待 T-1 填写 | 待 T-1 填写 | 待定 | 待填写 | 待定 | |
