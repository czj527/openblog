# 给后续 Agent 的工作指引

> 最后更新：2026-10-27
> 适用对象：后续设计 agent、开发 agent、内容 agent。
> 当前阶段：**设计资产整理完成，原型已被否决并归档；尚未进入生产实现。**

## 1. 先读什么

按顺序读，不要直接从归档原型开始：

1. [`README.md`](./README.md)：仓库是什么、现在处于什么阶段。
2. [`DECISIONS.md`](./DECISIONS.md)：已确认决策、推荐项、待决问题、已否决项。
3. [`DESIGN-BRIEF.md`](./DESIGN-BRIEF.md)：产品定性、体验模型、视觉与风格规划。
4. [`redesign/source/original-requirements.md`](./redesign/source/original-requirements.md)：用户原始需求，唯一权威需求源。
5. [`redesign/source/requirements-addendum-20261026.md`](./redesign/source/requirements-addendum-20261026.md)：Workbench 与“避风港”定位增补。
6. [`redesign/_brief/CONTEXT.md`](./redesign/_brief/CONTEXT.md)：需求编号、工作假设、协作边界。
7. [`redesign/_brief/ART-DIRECTION.md`](./redesign/_brief/ART-DIRECTION.md)：首页“窗外”视觉方向。
8. [`redesign/_brief/workbench-boundary.md`](./redesign/_brief/workbench-boundary.md)：Workbench 私有层、公开投影和域边界。
9. [`redesign/_brief/decision-register.md`](./redesign/_brief/decision-register.md)：逐条决策与证据。
10. [`redesign/_draft/`](./redesign/_draft/)：设计草稿。**未标为 confirmed 的内容不是契约。**
11. [`redesign/research/`](./redesign/research/)：调研与技术预研。区分事实、社区经验和推断。
12. [`archive/prototypes/README.md`](./archive/prototypes/README.md)：只在需要了解历史尝试时读；**不得作为设计基线**。

## 2. 事实来源优先级

发生冲突时，按以下顺序判断：

1. 用户在 `redesign/source/original-requirements.md` 中的原始表述。
2. 2026-10-26 的需求增补与用户明确确认记录。
3. `DECISIONS.md` 中的 **confirmed** 决策。
4. `redesign/_brief/` 中带证据的设计边界。
5. `DESIGN-BRIEF.md` 中的综合说明。
6. `redesign/_draft/` 中的设计草稿。
7. `redesign/research/` 中的调研与推断。
8. `archive/` 中的历史原型、旧计划和截图。**优先级最低，且不得复活。**

如果两个 confirmed 决策冲突，不要自行裁决；向用户提出具体选项和影响，等待确认。

## 3. 当前状态

- 用户已确认：个人小窝/公开编年史定位、Window/Desk/Workbench 三层、Workbench 默认私有、公开成果显式投影、字段级经济公开、中文首发、MCP 优先、MVP 占位天气、四季 × 天气保留但克制、反 AI 味与自成体系的美学要求。
- 用户已否决：2026-10-27 的组合体验原型；此前所有 HTML 实验原型已一并归档。它们已移入 `archive/prototypes/`。
- 尚未确认：新视觉方向、Workbench 认证/存储/schema、公开投影字段矩阵、写作适配器优先级、玻璃跨浏览器方案、托管/域名/成本、MVP 外围能力。
- 尚未实现：生产代码、真实认证、私有持久化、MCP/API、数据库、服务端 `noindex`、正式 Projection Manifest、Ledger schema、真实天气、四季生产资产。

## 4. 硬性规则

### 4.1 不要复活废案

- 不要把 `archive/prototypes/` 中的 CSS、JS、状态机或视觉布局直接复制到新设计/新工程。
- 不要把 `composed-prototype.html` 当作“已经验证过的架构”或“用户接受的视觉”。
- 内部回归 `370/370` 只证明合成交互自洽，不是用户验收。
- 可以阅读归档来理解“尝试过什么、为什么被否决”，但不能把其中的实现当作默认答案。

### 4.2 不要编造内容

- 不填真实姓名、头像、个人经历、口号、财务金额、私人任务或账号。
- 原型和 fixture 只能使用结构占位或明确标注 `synthetic` 的数据。
- 不把“示例值”写成“真实数据”；不把“设计稿”写成“已上线”。

### 4.3 不要泄露凭据

- 真实 API key、令牌、service-role key、密码、JWT 绝不写入源码、文档、日志、截图文件名或提交。
- 需要凭据时，通过本地环境变量或托管平台 secret 注入；`.env.example` 只保留空占位。
- 旧站源码、旧认证实现和默认管理员密码只存在于工作区外受限归档和 Git 历史中（不在当前工作树），**不得复制回活动仓库**。
- 如果发现疑似密钥，停止提交并先处理，不要在回复中回显。

### 4.4 先设计，后生产

- 当前不进入 Next.js 或其他生产工程。
- 新视觉方向必须先经过用户评审；不要用“功能完整”替代“设计被接受”。
- 改变 IA、技术选型、成本或隐私边界时，先向用户提问并给出 Option A/B/C + 推荐，不要自行拍板。

### 4.5 证据标准

- 每条事实性结论尽量附来源 URL + 核验日期；区分“已核验事实 / 社区经验 / 推断”。
- 设计交付要说明：改了什么、为什么、影响了哪些决策、还有什么未验证。
- 不要用“已完成”代替证据；截图、日志、构建输出、可复现步骤都算证据。
- 不要复用第三方模板/代码/截图而不核验授权。

### 4.6 语言与文件

- 文档用中文；技术名词保留英文原文。
- 文件名和代码用英文。
- 一个变更一个清晰主题；不要把无关重构混进设计提交。

## 5. 下一步建议

下一轮工作的正确顺序：

1. **重新对齐设计方向**：基于 `DECISIONS.md` 和 `DESIGN-BRIEF.md`，先向用户确认新视觉方向、参考站取舍和“反 AI 味”的具体标准。
2. **做新的设计提案**：可以是静态样张、关键页面 HTML 或设计系统草案；明确标注哪些是 confirmed、哪些是 proposed。
3. **用户评审通过后**，再冻结视觉 token、内容契约、MCP 能力契约、Workbench 权限/投影契约和 Ledger Snapshot schema。
4. **最后**才进入生产工程和真实数据接入。

不要跳过第 1、2 步直接写生产代码。

## 6. 归档与历史

- 原型归档：`archive/prototypes/`，入口 [`archive/prototypes/README.md`](./archive/prototypes/README.md)。
- 旧计划说明：`archive/legacy-planning/README.md`。旧 `docs/`、旧 `DECISIONS.md`、旧 `TASKS.md` 不在当前树中，但仍可从 Git 历史和工作区外受限归档查看。
- 第三方参考站截图不进入仓库；研究文档保留 URL、核验日期和结论。
- 归档内容只用于理解历史，不构成当前约束。
