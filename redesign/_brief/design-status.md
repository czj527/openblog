# Design status matrix

> 更新时间：2026-10-27。状态只描述当前证据，不把草稿语气当作用户确认。

## 状态定义

- **confirmed**：用户原文明确提出，或已有明确的用户拍板记录。
- **recommended**：设计案给出的当前默认方向，仍可被证据或用户决定推翻。
- **pending**：会改变 IA、技术或成本，需要用户拍板或专项验证。
- **archived**：旧方案，仅保留历史参考，不得作为当前约束。

## 用户硬要求（confirmed）

| 项目 | 当前表述 | 证据 |
|---|---|---|
| 定位 | 个人小窝式长期写作与记录站，记录普通人在 AI 浪潮中的经历 | `source/original-requirements.md:16-21` |
| 内容 | 随笔、思考、生活、经济规划、人生规划；希望持续输出并训练论述能力 | `source/original-requirements.md:19-23` |
| 首页 | 空荡欢迎页、极简导航、高清动态视觉、1–2 个入口，不让 UI 遮挡主视觉 | `source/original-requirements.md:25` |
| 主题 | 保留四季 × 天气混合主题，但降低花哨感 | `source/original-requirements.md:25` |
| 质感 | 反粗糙、反模板、反重复的 AI 风格，建立自成体系的字体、间距和配色 | `source/original-requirements.md:25` |
| 二级页 | 回到博客的信息传达，经济/人生规划与文章管理分开考虑 | `source/original-requirements.md:27` |
| 管理 | 需要成熟的文章管理，写作工具不应被过早锁死 | `source/original-requirements.md:27-29` |
| Agent | 作者交稿，私人助理 agent 整理、修改并发布；博客操作应 agent 原生 | `source/original-requirements.md:29-31` |
| 内容策略 | 旧内容清空，先完成框架和样式原型，不用假资料填充 | `source/original-requirements.md:33` |

## 2026-10-26 方案增补（confirmed）

| 项目 | 当前表述 | 证据 |
|---|---|---|
| 三层模型 | Window（公开情绪）/ Desk（公开信息）/ Workbench（私有工作）；公开站仍只有 Window 与 Desk 两个页面家族 | 用户批准方案 2026-10-26 |
| Workbench | 默认私有的作者 + agent 工作层；承载个人任务、每周计划、项目进度、审阅与公开投影；不是第六个公开内容域 | `source/requirements-addendum-20261026.md` §1；`_brief/workbench-boundary.md` |
| 避风港体验 | 低噪声、可恢复、清晰下一步的私有工作空间；安全感来自隐私与秩序，不来自暖色装饰或治愈文案 | `source/requirements-addendum-20261026.md` §2 |
| 执行数据边界 | 任务/周计划/项目是私有执行数据，不是新的文章类型，也不等同于 Plan；经济规划仍由 Ledger Snapshot 提供 | `source/requirements-addendum-20261026.md` §1；`_brief/workbench-boundary.md` §6 |
| 财务数据边界 | 站点只消费版本化公开 Ledger Snapshot；原始财务数据不进仓库；字段级显式公开 | D-005/D-006；`_brief/CONTEXT.md` H6；用户确认 2026-10-26 |
| Agent 接口 | MCP 优先；先冻结能力、权限、审计和幂等语义，再实现工具 | D-009；用户确认 2026-10-26 |
| 公开成果投影 | 只有已批准、命中字段白名单、绑定来源版本的成果才进入 Desk（必要时 Window）；可撤回、可审计；原始任务列表不直接公开 | 用户批准方案 2026-10-26；`_brief/workbench-boundary.md` §5 |
| 域边界 | Workbench 不复制 Editorial / Plan / Ops 的 source of truth；审批与审计仍归 Ops | 用户批准方案 2026-10-26；`_brief/workbench-boundary.md` §6 |
| 参考原则 | StyleKit 仅作系统层参考，URL、核验日期、借鉴/不采用原则已登记 | `_brief/workbench-boundary.md` §10；`https://www.stylekit.top/zh`（核验 2026-10-26） |

## 2026-10-27 用户评审结论（confirmed）

| 项目 | 结论 | 证据 |
|---|---|---|
| 组合原型验收 | **未通过**。用户明确表示原型“并不能符合我的要求”。 | 用户 2026-10-27 评审 |
| 原型处置 | 所有 HTML 实验原型、验证记录和 fixture 移入 `archive/prototypes/`，只作历史参考 | `archive/prototypes/README.md` |
| 决策有效性 | 已确认的产品定位、三层模型、隐私/投影边界、字段级经济公开和美学要求**不因原型否决而失效** | `DECISIONS.md`；用户 2026-10-27 指示 |
| 下一轮起点 | 先重新对齐视觉方向和新样张，再进入设计评审；不得把归档原型当作视觉基线 | `DESIGN-BRIEF.md` §9；`TASKS.md` |

## 当前推荐（recommended）

| 方向 | 默认方案 | 依据 | 需要验证 |
|---|---|---|---|
| 下一轮视觉方向 | 组合原型被否决后，需要重新提出首页窗景、Desk 版式和设计系统样张，并提交用户评审 | `DECISIONS.md` §3；`DESIGN-BRIEF.md` §3 | 用户对视觉方向、参考取舍和“反 AI 味”标准的确认 |
| 内容契约 | Markdown + frontmatter/MDX；Obsidian、Notion 是可替换写作前端（D-025 已确认工具可替换） | `_draft/01-intro-principles-content.md:161-173` | fixture 转换演练、写作适配器优先级 |
| 首页渲染 | 静态 poster 先承担 LCP，原生 WebGL2 在 LCP 后渐进增强；不默认引入 Three.js | `research/06-hero-tech.md:4-37,73-84` | D1/D4 移动端和跨浏览器 |
| Agent 流程 | raw 不可变；L0/L1 可自动，L2 出 diff 待批准，L3 扩写默认禁止（D-008） | `_draft/01-intro-principles-content.md:175-191` | 批准粒度、dry-run、审计字段 |
| Desk 版式 | 左对齐三栏阅读布局；无衬线为主；发丝线；冷中性色；一个强调色（D-033） | `_draft/02-visual-ia.md` §4.5–§4.7；`DESIGN-BRIEF.md` §3 | 参考站实测、字体授权、用户评审 |
| Workbench 四视图 | 本周 / 任务 / 项目 / 审阅作为首版 IA 提案（D-034） | `source/requirements-addendum-20261026.md` §1；`_brief/workbench-boundary.md` §3 | 用户确认是否全部进入首版、Plan/Ops 只读范围 |
| 页面视觉边界 | 四季 × 天气是窗内场景，不是全站换肤；Window 负责情绪，Desk 负责信息，Workbench 负责私有操作 | `_draft/02-visual-ia.md` §4.1 | 需新一轮用户评审（旧原型已归档） |

## 待决策或待验证（pending）

| 项目 | 当前冲突/未知 | 推荐下一步 |
|---|---|---|
| 经济透明度 | 已选择字段级显式公开；具体字段矩阵仍需由经济规划项目提供 | D5：定义金额、比例、里程碑和时间序列的可见性 schema |
| 国际站定义 | 已确定全球可访问、中文首发；英文路由可以预留但不伪造英文内容 | D5：锁定 i18n 字段和无译文空状态 |
| 内容源优先级 | 用户在 Obsidian 与 Notion 之间未定；当前推荐 Git 契约作为站点边界 | 先用 Obsidian fixture 验证，Notion 作为第二适配器 |
| Agent 接口 | 已选择 MCP 优先；能力、权限、审计和幂等契约仍需定义 | 先列工具契约，再实现 MCP；能力/权限/审计/幂等契约待定 |
| 天气 | MVP 先用占位天气和手动预览；作者城市与真实 provider 延后 | D4：保持 provider 接口，暂不绑定外部天气服务 |
| 玻璃与视差 | D-004 仍 pending：WebGL 透镜、纯 CSS、SVG 以及 v1 是否做深度视差仍需验证 | D4 做跨浏览器对比；v1 默认不做深度视差 |
| MVP 外围能力 | 评论、留言、搜索、Newsletter、广告、视频均不是当前硬要求 | 先排除 MVP，只预留契约字段 |
| 托管与成本 | Vercel、其他托管、备案、月预算尚未冻结 | 在工程启动前补成本与访问性证据 |
| 资产集 | 当前只有少量探索图；四季一致性和文字安全区未通过 | 先做最小 4 季日/夜 manifest，再批量生产 |
| Workbench 首版范围 | 增补要求覆盖任务、每周计划、项目进度和审阅关系；四视图 IA 只是推荐（D-034），是否全部进入首版、Plan/Ops 是否只读仍待确认 | D6：先确认视图范围与权限矩阵 |
| Workbench 任务/项目 schema | 任务状态、周计划节奏、项目阶段/下一节点的字段与存储未定 | D6：结构 fixture + 状态机 + 私有存储方案 |
| Workbench 存储与认证 | 私有数据放独立私有库、私有 Git 还是 Ops 私有 schema 未定；不得进入公开仓库 | D6：给出鉴权、存储、备份、删除路径 |
| 公开投影字段 | Editorial 与 Plan 的白名单字段、自动投影范围未定 | D6：projection manifest、撤回与重投影演练 |
| StyleKit 授权 | 页面未公开复用许可与完整设计 token；不能直接复制模板/代码 | 只作参考；如复用前单独核验授权，数值回到真实页面测量 |

## 验证结论（2026-10-27）

> 以下是**内部探索与合成验证**记录，不是用户验收。组合原型已于 2026-10-27 被用户否决并归档。

- D0–D7 曾完成一轮可直接打开的 HTML 原型和工作区外截图证据；这些原型现已全部归档，不作为当前设计基线。
- D4：半分辨率雾 + DPR≤1.25 后，Edge headless 1440×1000 约 47 FPS；生产默认保持低密度和静态 poster 回退，真机仍待验证。该数据只作为技术线索，不是设计验收。
- D5：合成 raw/diff/approve/publish/rollback 和字段级 public/private 的内部闭环曾通过；未连接真实 MCP、Git、账号或财务数据。
- D6（合成证据）：本周/任务/项目/审阅四视图的合成交互、任务筛选、审阅状态和响应式边界有过第一轮证据；私有入口认证、默认私有的服务端保证、公开投影白名单/撤回、Editorial/Plan/Ops 边界和 agent 对等权限仍待专项验证。
- D7/D7.1（Composition）：active runtime 的内部回归为 `checks=370 passed=370 failed=0`，覆盖文章链、Workbench、Plan、路由、响应式、Drawer、reduced-motion、forced-colors、WebGL fallback/context loss 等。**这只证明合成交互自洽；用户已否决组合原型的整体结果，原型已归档。**
- 工程启动前仍需补：新视觉方向与用户评审、真机/跨浏览器性能、LCP/CWV、正式内容契约、MCP 工具契约、Workbench 权限/投影契约、Ledger Snapshot schema、托管和成本决策。

## 已归档（archived）

- 根仓库旧 `docs/`、旧 `DECISIONS.md`、旧 `TASKS.md`、旧视觉契约。
- `design/prototype-v1`、`design/prototype-v2`、`design/prototype-v3` 及旧视觉审计。
- 旧站 `portfolio/portfolio` 嵌套仓库和临时浏览快照。
- 2026-10-27：`archive/prototypes/` 下的全部 HTML 实验原型、合成 fixture 和验证记录（含 `composed-prototype.html`）。
- 2026-10-27：第三方参考站截图移出仓库，说明见 `redesign/research/refs/README.md`。

归档位置：`D:\openblog\_archive\openblog-legacy-20261026`（旧站材料）与 `archive/prototypes/`（本轮原型）。归档内容只用于理解历史，不得重新成为当前设计约束。
