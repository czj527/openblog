# Security handling

## Current repository

当前仓库是设计资产与决策仓库，不包含生产应用、真实认证、数据库或私有工作台数据。`redesign/source/original-requirements.md` 是用户提供的需求原文，含个人叙事和一个薪资数字，仅作需求背景；不得复制到原型、fixture、截图、日志或公开页面。

- 不保存真实密钥、令牌、服务端 JWT、管理员密码或旧站认证实现。
- `.env.example` 只保留空占位；真实值必须通过本地环境变量或托管平台 secret 注入。
- 设计原型和合成 fixture 只能使用 `synthetic` / 占位数据，不得填入真实个人资料、财务金额或私人任务。

## Archived legacy site

旧站副本位于工作区外的受限归档中，仅供迁移审计参考。它包含历史上的服务端凭据样式、默认密码占位符和不安全的 demo 鉴权代码，因此：

- 不得重新放回活动仓库；
- 不得作为新实现的模板；
- 不得把其中的认证代码、service-role 用法或默认密码复制到任何新文件。

当前工作树已移除旧 `docs/`、旧 `DECISIONS.md` 和旧 `TASKS.md`；它们仍可从 Git 历史和工作区外归档查看，但不属于当前约束。

## Archived prototypes

`archive/prototypes/` 中的原型只使用合成数据和结构占位，但仍不是生产代码：

- 不要在其中新增真实数据或凭据；
- 不要把原型中的“演示角色”当成真实认证；
- 不要把原型的 localStorage、内存 store 或审计记录当作安全实现。

## Reference screenshots

第三方参考站截图已移到仓库外：

```text
D:\openblog\_archive\design-refs-20261027\
```

不提交到仓库，避免第三方内容再分发和体积问题。研究文档只保留 URL、核验日期和结论。

## User-provided service credentials

图像生成和网页搜索服务的密钥只可在一次性命令环境中使用，不能写入 source、prompt、日志、报告、截图路径或提交。由于密钥可能曾出现在会话内容中，使用后应在对应服务控制台轮换。

## Before sharing or committing

1. 扫描活动工作区中的 secret-like patterns。
2. 确认旧站目录、旧认证示例和浏览快照不在活动仓库。
3. 确认 `.env*`、日志、截图和构建产物不会被提交。
4. 确认 `archive/prototypes/` 没有真实个人数据或财务数值。
5. 旋转任何曾经出现在聊天、终端或历史仓库中的凭据。
