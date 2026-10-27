# Decision register

> 更新时间：2026-10-27。此表只登记会改变设计、技术或成本的事项。用户未拍板前，相关节点必须保持 pending。
>
> **2026-10-27 用户评审**：组合体验原型 D-020 未通过，已归档；其余 confirmed 决策继续有效。新增 D-021–D-036，从用户原始需求、增补和本次评审中提炼，与根级 `DECISIONS.md` 保持一致。

| ID | 决策 | 当前推荐 | 为什么不是其他选项 | 证据/验证 | 状态 |
|---|---|---|---|---|---|
| D-001 | 页面组织 | ~~Window 首页 + Desk 二级页；Workbench 作为私有层另立（见 D-014）~~ | 单一视觉模板会让首页情绪和文章阅读互相妥协；该方向已被 D-014 吸收为提高层级的 confirmed:plan | `_draft/02-visual-ia.md` §4.1; D1/D2 原型；D-014 | **superseded by D-014** |
| D-002 | 站点内容边界 | Git + Markdown/frontmatter 作为展示契约，写作工具可替换（工具可替换已由 D-025 确认） | 直接绑定 Notion 会把编辑、缓存和迁移耦合在一起 | `_draft/01-intro-principles-content.md:161-173`; D5 fixture；D-025 | recommended; tool replaceability confirmed by D-025 |
| D-003 | 首页渲染 | poster 先行 + 原生 WebGL2 渐进增强 | Three.js 为当前单 quad 需求带来不必要体积；纯 CSS 无法承载完整天气层 | `research/06-hero-tech.md:10-37,73-84`; D4 | recommended |
| D-004 | 首页玻璃 | WebGL 透镜 + 透明语义 DOM；CSS 作为降级 | SVG `backdrop-filter:url()` 在 Safari/Firefox 不可靠；纯 CSS 没有折射 | `research/06-hero-tech.md:172-195`; D4 | pending |
| D-005 | 财务数据 | 站点消费版本化公开快照，字段显式公开；原始数据不进仓库 | 将原始支付宝数据放在站点会扩大隐私和迁移风险 | `_brief/CONTEXT.md` H6; R7 | confirmed:user boundary |
| D-006 | 经济透明粒度 | **字段级显式公开**；金额、比例、里程碑分别进入可见性矩阵 | “完全透明”和“默认私密”是两个不同的产品边界，不能用一句口号替代 | R7 vs `_draft/01-intro-principles-content.md:64,75,154`; 用户确认 2026-10-26 | confirmed:user; field matrix pending |
| D-007 | 国际站节奏 | **全球可访问、中文首发**；架构第一天 i18n-ready，英文内容后续上线 | 立即双语会把翻译质量和发布摩擦引入首个闭环；只做国内站又违背国际可访问目标 | `_draft/04-intl-seo-dist.md:10-20`; 用户确认 2026-10-26 | confirmed:user |
| D-008 | Agent 发布治理 | raw 不可变；L0/L1 默认自动；L2 diff 批准；L3 扩写默认禁止 | 完全自动改写会损害作者声音；全部人工又无法解决旧站后台繁琐 | `_draft/01-intro-principles-content.md:175-191`; D5 dry-run | recommended |
| D-009 | Agent 接口 | **MCP 优先**；先冻结能力、权限和审计语义，再实现工具 | 先定义能力可避免把审批、回滚和权限绑死在未知平台；CLI/REST 可作为后续适配 | `_brief/CONTEXT.md` H5; 用户确认 2026-10-26；MCP 契约待定义 | confirmed:user; contract pending |
| D-010 | 天气 provider | **MVP 先用占位天气 + 手动预览**；真实 provider 延后，接口仍保持可替换 | 当前优先验证视觉和交互，不提前绑定作者城市或上游许可；未来接真实天气仍可复用主题接口 | `research/06-hero-tech.md:280-311`; 用户确认 2026-10-26; D4 | confirmed:user; provider pending |
| D-011 | 深度视差 | v1 不做，先做 mask 微动；v2 再评估 | 摄影底图在树枝、天空和水面处容易出现伪影，收益小于风险 | `_draft/02-visual-ia.md` §4.4; `research/06-hero-tech.md:165-170` | recommended |
| D-012 | MVP 外围功能 | 评论、留言、搜索、Newsletter、广告、视频先不进入 MVP | 它们会引入合规、运营和性能成本；当前硬目标是写作与阅读闭环 | `_draft/04-intl-seo-dist.md:35-99`; D0/D5 | recommended |
| D-013 | 旧材料处置 | 旧方案移到工作区外归档，不作为当前约束 | 直接删除会丢失设计演进证据；留在活动仓库又会诱导 agent 走旧路线 | `D:\openblog\_archive\openblog-legacy-20261026\ARCHIVE-MANIFEST.md` | confirmed:process |
| D-014 | 三层页面/工作层 | **Window 公开情绪 + Desk 公开信息 + Workbench 私有工作**；公开站仍只有两个页面家族 | 把 Workbench 当第三个公开页面会污染公开阅读；把工作台并入 Desk 又会破坏信息优先 | `_draft/02-visual-ia.md` §4.1、§4.10；`_brief/workbench-boundary.md` §2；用户批准 2026-10-26 | confirmed:plan |
| D-015 | Workbench 可见性 | **默认私有**；工作项默认不可索引、不进公开导航/站点地图；公开成果必须显式投影 | “先公开再隐藏”会泄漏草稿、金额和审计信息；自动同步无法保证字段级边界 | `_brief/workbench-boundary.md` §3–§5；用户批准 2026-10-26 | confirmed:plan; projection matrix pending |
| D-016 | 公开成果投影 | 投影是单向、字段白名单、绑定来源版本、可撤回的公开动作；不是 Workbench 与 Desk 的双向同步 | 双向同步会产生两个 source of truth，并让撤回/修订无法追溯 | `_brief/workbench-boundary.md` §5；D6 | recommended; contract pending |
| D-017 | Workbench 域边界 | Workbench 不是第六个公开内容域；Editorial 管文章、Plan 管版本化快照、Ops 管权限与审计；Workbench 只做聚合视图、私有执行数据和受控动作 | 复制存储会制造冲突；把审批写进 Workbench 会绕过 Ops 审计 | `_brief/workbench-boundary.md` §6；`_draft/01-intro-principles-content.md:147-159`；`source/requirements-addendum-20261026.md` §1 | confirmed:plan; API contract pending |
| D-018 | StyleKit 参考方式 | **仅作系统层参考**；借鉴字号/间距/配色/博客版式的组织方式，不直接复用模板/提示词/代码，不采用衬线 + 暖色编辑模板 | 用户已明确否决模板化衬线和暖色；未核验复用授权，直接复制会有版权与风格风险 | https://www.stylekit.top/zh（核验 2026-10-26）；`source/requirements-addendum-20261026.md` §3；`_brief/workbench-boundary.md` §10 | confirmed:reference; license pending |
| D-019 | Workbench 执行数据 | 任务/周计划/项目是**私有执行数据**，不是新的文章类型，也不等同于 Plan；经济规划仍由 Ledger Snapshot 提供；原始任务列表不直接公开 | 把任务当文章会污染 Editorial；把任务当 Plan 会制造第二套财务/规划口径；自动公开任务列表会泄漏私人节奏 | `source/requirements-addendum-20261026.md` §1；`_brief/workbench-boundary.md` §6 | confirmed:plan; task/project schema pending |
| D-020 | 组合体验原型 | ~~`composed-prototype.html` 作为 Window、Desk、Workbench 和 D5 状态链的单一演示入口~~ | 内部回归只能证明合成交互自洽，不能证明用户接受视觉与体验；用户已否决整体结果 | `archive/prototypes/composed-prototype.html`、`archive/prototypes/composed-runtime.js`；`archive/prototypes/VALIDATION.md` | **rejected:user 2026-10-27; archived** |
| D-021 | 产品定位与叙事 | 个人小窝式长期公开记录站；“一个普通人在 AI 浪潮中的公开编年史”；不是作品集、技术博客或数字花园模板 | 用户原文明确以“普通人记录时代浪潮”为叙事，模板化定位会削弱个人性与长期性 | `source/original-requirements.md:16-21` | confirmed:user |
| D-022 | 公开站职责分工 | 首页负责情绪、场景和视觉冲击；二级页回到信息传达；入口尽量少，不遮挡主视觉 | 单一视觉模板会让首页情绪和文章阅读互相妥协；用户明确要求内容放二级页 | `source/original-requirements.md:25-27` | confirmed:user |
| D-023 | 内容范围 | 随笔/思考、生活、经济规划、人生规划、知乎式问答、学习笔记、观点演化；目标是持续输出并形成自洽世界观 | 用户原文列出这些内容，并把“输出训练”作为核心目的 | `source/original-requirements.md:19-23` | confirmed:user |
| D-024 | 真实性边界 | 旧内容清空；个人资料、介绍、口号、头像不提前编造；原型只用结构占位或合成 fixture | 用户明确要求先搭框架和样式，不随意填充文字 | `source/original-requirements.md:33` | confirmed:user |
| D-025 | 写作工具可替换 | Obsidian、Notion 只是写作前端；站点只认稳定内容契约，不把工具锁进运行时 | 用户尚未决定未来用 Obsidian 还是 Notion，站点不应被绑死 | `source/original-requirements.md:29-31` | confirmed:user |
| D-026 | 成熟文章管理与 Agent 原生 | 作者交稿，私人助理 Agent 整理、修改、审阅、发布；每个博客操作都应有 Agent 等价接口 | 用户明确说所有博客相关操作都可能由私人助理 Agent 执行 | `source/original-requirements.md:29-31` | confirmed:user |
| D-027 | Editorial / Plan 分域 | 经济/人生规划与博客文章在内容管理上分开；规划由独立项目产出版本化快照，本站只消费公开投影 | 把规划当文章会污染 Editorial，也容易把原始财务数据带进站点 | `source/original-requirements.md:23,27`；`_brief/CONTEXT.md` R7 | confirmed:user |
| D-028 | 四季 × 天气主题 | 保留混合主题，但只作为窗内场景和窗沿，不做全站换肤；降低花哨感 | 用户明确要求保留，同时批评旧站“太花哨、华而不实” | `source/original-requirements.md:25` | confirmed:user |
| D-029 | 美学与反 AI 味 | 反模板、反粗糙、反 AI 味；字号、间距、配色自成体系；参考 Linear、DeepSeek、Artificial Analysis、Apple、StyleKit，但不复制模板 | 用户把美学列为重要要求，并明确厌恶重复的衬线 + 暖色模板 | `source/original-requirements.md:25`；`_brief/ART-DIRECTION.md` | confirmed:user |
| D-030 | 原型处置 | 组合原型未通过用户评审；本轮所有 HTML 实验原型按用户指示整体移入 `archive/prototypes/`，只作历史参考，不得作为视觉基线或实现模板 | 用户 2026-10-27 明确表示原型不符合要求 | 用户 2026-10-27 评审；`archive/prototypes/README.md` | confirmed:user 2026-10-27 |
| D-031 | 决策与废案分离 | 已确认的产品、设计、风格决策继续有效；原型代码、视觉稿和验证结果属于废案证据，不等于设计验收 | 用户明确说决策、设计、定性、风格规划是有价值资产，原型是废案 | 用户 2026-10-27 指示；`DECISIONS.md` | confirmed:process 2026-10-27 |
| D-032 | 写作阶梯 | thought → note → qa → essay → page；话题是 frontmatter，不是目录结构；短想法可被晋升为长文 | 按写作意图分型能连成输出训练阶梯，避免按话题切碎内容 | `_draft/01-intro-principles-content.md` §3.1 | recommended |
| D-033 | Desk 视觉系统 | 左对齐三栏阅读布局；无衬线为主；发丝线；冷中性色；一个强调色；排版行而非卡片网格 | 回应用户“太居中、两侧留白过多”和“反 AI 味”的批评 | `_draft/02-visual-ia.md` §4.5–§4.7；`DESIGN-BRIEF.md` §3 | recommended |
| D-034 | Workbench 四视图 | 首版为本周、任务、项目、审阅四视图；低噪声、可恢复、清晰下一步 | 增补要求包含这些能力；四视图能覆盖执行与审阅闭环 | `source/requirements-addendum-20261026.md` §1；`_brief/workbench-boundary.md` §3 | recommended |
| D-035 | 首页资产策略 | 按 (季节, 昼夜) 取底图，天气由着色器叠加；同一场景全年复用；先做最小资产集 | 避免 56 套组合失控；资产量和一致性可控 | `_draft/02-visual-ia.md` §4.3–§4.4；`_brief/ART-DIRECTION.md` | recommended |
| D-036 | 公开站非目标 | 不做通用 CMS、多作者平台、社交网络、站内编辑器 | 复杂度是预算；旧站后台繁琐的根因是后台想做太多 | `_draft/01-intro-principles-content.md` §2.4 | recommended |

## 仍需用户拍板的问题

已解决、不再重复提问：字段级经济公开（D-006）、全球可访问中文首发（D-007）、MCP 优先（D-009）、MVP 占位天气与手动预览（D-010）、Workbench 默认私有与执行数据边界（D-014/D-015/D-019）。注意：Workbench 的任务/周计划/项目/审阅能力已确认，但“四视图 IA”本身仍是推荐项 D-034，首版是否全部进入需用户确认。

当前最小待决集合：

| # | 问题 | 为什么必须由用户决定 | 建议默认 |
|---|---|---|---|
| 1 | 新视觉方向：首页窗景、Desk 版式、色彩/字体气质 | 组合原型已被否决，不能靠实现细节猜用户审美 | 先出 2–3 个方向样张，再评审；不要直接写生产代码 |
| 2 | Workbench 登录方式与私有存储放哪里（独立私有库 / 私有 Git / Ops 私有 schema） | 直接决定隐私、成本和迁移路径 | 独立私有存储；公开仓库不出现私有工作项 |
| 3 | Workbench 首版视图范围：四视图是否全部进入首版？Plan/Ops 是否只读？ | 决定首版复杂度和 Agent 接口；四视图 IA 只是推荐，不等于用户已确认 | 四视图 + Plan/Ops 首版只读，作为提案请用户确认 |
| 4 | 公开投影字段矩阵；哪些内容类型可自动投影；财务字段是否永远人工批准 | 决定隐私边界和审计责任 | 财务字段永远人工；其余先逐项白名单 |
| 5 | 任务/周计划/项目是否允许公开“周报/里程碑摘要” | 可能把私有执行数据变成公开内容 | 首版只公开 Editorial/Plan 成果，不公开任务摘要 |
| 6 | 写作适配器优先级：Obsidian 还是 Notion | 决定内容契约验证顺序 | 先 Obsidian fixture，Notion 作为第二适配器 |
| 7 | 首页玻璃方案与 v1 是否做深度视差 | 影响跨浏览器兼容、性能和资产生产 | WebGL 透镜 + CSS 降级；v1 不做深度视差 |
| 8 | 英文上线时间点与翻译审校流程 | 影响 i18n 架构和运营成本 | 中文首发，英文路由预留但不伪造内容 |
| 9 | 域名/备案、托管平台、月预算 | 影响合规、成本和部署 | 工程启动前做托管与成本对比 |
| 10 | MVP 是否明确排除评论、留言、搜索、Newsletter、广告、视频 | 决定范围和性能预算 | 首版全部排除，只预留契约字段 |
