# 安全要求

> 本项目**不得**提交任何真实凭证。以下为占位说明。

本仓库只存放代码与文档。所有密钥通过环境变量提供，不写入代码、不提交 Git。

## 必需环境变量（部署时配置）

| 变量 | 用途 | 暴露范围 |
|---|---|---|
| `NOTION_TOKEN` | Notion 集成密钥 | 仅服务端 |
| `NOTION_BLOG_DATA_SOURCE_ID` | 文章库 | 仅服务端 |
| `NOTION_ECONOMY_PUBLIC_DATA_SOURCE_ID` | **公开脱敏**经济库 | 仅服务端 |
| `NOTION_WEBHOOK_VERIFICATION_TOKEN` | Notion Webhook 验证 token，同时用于后续签名校验 | 仅服务端 |
| `NEXT_PUBLIC_SUPABASE_URL` | Supabase 项目地址 | 公开 |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY` | Supabase 匿名键（**只读**，受 RLS 保护） | 公开 |
| `SUPABASE_SERVICE_ROLE_KEY` | Supabase 服务端键 | 仅服务端 |
| `ADMIN_PASSWORD_HASH` | 管理员密码哈希 | 仅服务端 |
| `AUTH_SECRET` | 会话签名密钥（≥32 字节随机） | 仅服务端 |

## ❌ 禁止出现的环境变量

| 变量 | 原因 |
|---|---|
| `NOTION_ECONOMY_PRIVATE_DATA_SOURCE_ID` | 私人经济库变量名，站点不得读取或配置 |
| `NOTION_ECONOMY_DATA_SOURCE_ID` | 旧名，指向**私人**经济库。配了会导致财务数据公开 |
| `NOTION_WEBHOOK_SECRET` | 已废弃的 Webhook 变量名，必须迁移到 `NOTION_WEBHOOK_VERIFICATION_TOKEN` |
| `NOTION_WEBHOOK_SIGNING_SECRET` | 已废弃的错误变量名，Notion 不提供独立 signing secret |

> `scripts/check-env.mjs` 检测到禁止变量时应**直接报错退出**，不得静默忽略。

`NOTION_ECONOMY_PUBLIC_DATA_SOURCE_ID` 在 T5 经济页启用前必须配置；T4 之前可以暂缺，但应用不得因此读取或回退到任何私人经济库。

完整清单见 `docs/01-spec/architecture.md` 第 7 节。

## 开工前必须完成

- [ ] `AUTH_SECRET` 用 `openssl rand -base64 32` 生成，不要手打
- [ ] `ADMIN_PASSWORD_HASH` 用脚本生成，不要在代码里留默认值
- [ ] 确认 `.gitignore` 包含 `.env*`、`dev.db`、`*.key`
- [ ] 确认 `git log` 中无历史密钥

## 代码要求

- ❌ 禁止硬编码任何密码或密钥，包括 `|| '默认值'` 形式的 fallback
- ❌ 禁止把 `service_role` key 暴露到客户端
- ✅ 环境变量缺失时**应用拒绝启动**（fail fast），不得静默降级
- ✅ 所有 token 比较使用恒定时间比较（`crypto.timingSafeEqual`）
- ✅ 公开写接口必须做内容校验、频率限制、HTML 转义

详细的安全验收标准见 `docs/01-spec/auth.md` 第 5 节。
