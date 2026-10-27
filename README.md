# openblog

陈子杰的个人博客重构项目。当前仓库是**设计资产与决策仓库**，不是生产应用。

> **当前状态（2026-10-27）**：设计探索已完成一轮；组合体验原型未通过用户评审，全部 HTML 原型已移入 [`archive/prototypes/`](./archive/prototypes/) 作为废案证据。已确认的产品方向、设计定性和风格规划保留在本仓库根部，供后续设计/开发 Agent 使用。

## 先读什么

1. [`DECISIONS.md`](./DECISIONS.md)：已确认决策、推荐项、待决问题、已否决项。
2. [`DESIGN-BRIEF.md`](./DESIGN-BRIEF.md)：产品定性、体验模型、视觉与风格规划。
3. [`AGENTS.md`](./AGENTS.md)：后续 Agent 的工作规则和阅读顺序。
4. [`TASKS.md`](./TASKS.md)：当前没有生产任务；列出等待用户输入的事项。
5. [`redesign/source/original-requirements.md`](./redesign/source/original-requirements.md)：用户原始需求，唯一权威需求源。
6. [`redesign/README.md`](./redesign/README.md)：设计轨道索引、设计门和待验证项。

## 当前结论

### 已确认

- **定位**：个人小窝式的长期公开记录站，“一个普通人在 AI 浪潮中的公开编年史”，不是作品集或模板化数字花园。
- **体验**：Window（公开情绪/窗景）+ Desk（公开信息/阅读）+ Workbench（私有工作层）；公开站仍只有 Window 和 Desk 两个页面家族。
- **内容**：随笔/思考、生活、经济规划、人生规划、问答、学习笔记、观点演化；写作工具可替换。
- **Agent**：作者交稿，私人助理 Agent 整理、修改、审阅、发布；操作应 Agent 原生。
- **隐私**：Workbench 默认私有；公开成果必须显式投影；经济数据字段级显式公开；原始财务数据不进站点仓库。
- **风格**：四季 × 天气保留但克制；反 AI 味、反模板、反粗糙；字号、间距、配色必须自成体系。
- **国际化**：全球可访问、中文首发，英文后续上线。

### 尚未确认

- 下一轮视觉方向（组合原型被否决后需重新对齐）。
- Workbench 认证、私有存储、任务/项目 schema。
- 公开投影字段矩阵、自动投影范围。
- 写作适配器优先级（Obsidian / Notion）。
- 托管、域名、成本、英文上线节奏。
- 评论、搜索、Newsletter、广告、视频是否排除在 MVP 外。

完整列表见 [`DECISIONS.md`](./DECISIONS.md) §3 和 [`TASKS.md`](./TASKS.md)。

## 仓库结构

```text
.
├── README.md                 本文件
├── DECISIONS.md              仓库级决策索引
├── DESIGN-BRIEF.md           设计定性与风格规划
├── AGENTS.md                 后续 Agent 工作指引
├── TASKS.md                  当前任务与等待用户输入的事项
├── SECURITY.md               密钥与归档安全规则
├── .env.example              仅空占位，不含真实密钥
├── redesign/
│   ├── README.md             设计轨道索引
│   ├── source/               用户原始需求与增补
│   ├── _brief/               共享上下文、视觉方向、Workbench 边界、决策登记、状态矩阵
│   ├── _draft/               设计草稿（未确认内容不是契约）
│   └── research/             调研与技术预研（参考站截图在仓库外）
└── archive/
    ├── README.md             归档政策
    ├── prototypes/           已否决的 HTML 原型、fixture、验证记录
    └── legacy-planning/      旧 docs/、DECISIONS.md、TASKS.md 的处置说明
```

## 明确不在这里

- 生产应用代码、数据库、认证、MCP/API、部署配置。
- 原型、fixture 或公开页面中的真实个人资料、财务数据、私人任务、账号或密钥。
- 已确认的生产技术栈。旧计划的 Next.js / Notion / Supabase 选型已随旧文档归档，不再自动生效。

> `redesign/source/original-requirements.md` 是用户提供的需求原文，含个人叙事和一个薪资数字；它只作为需求背景，不得复制到原型、fixture、截图或公开页面。

## 原型废案

所有 HTML 实验原型（包括 `composed-prototype.html`）已于 2026-10-27 移入 [`archive/prototypes/`](./archive/prototypes/)。内部回归 `370/370` 只证明合成交互自洽，**不是用户验收**。不要把归档原型作为下一版视觉或代码基线。

## 安全

- 真实密钥只通过本地环境变量或托管平台 secret 注入，绝不写入仓库、日志、截图文件名或提交。
- 旧站认证实现、默认管理员密码和 service-role 用法只存在于工作区外受限归档和 Git 历史中（不在当前工作树），不得复制回活动仓库。
- 参考站截图不进入仓库；研究文档保留 URL、核验日期和结论。
- 细节见 [`SECURITY.md`](./SECURITY.md)。

## 下一步

下一轮应先与用户重新对齐视觉方向，再制作新的样张/关键页面原型并提交评审；评审通过后才冻结契约、进入生产工程。不要把“功能完整”或“内部测试通过”当成“设计被接受”。
