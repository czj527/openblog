# 决策记录 / Decision register

> 最后更新：2026-10-27
> 地位：仓库级决策索引。已确认决策是后续设计与开发的约束；推荐项仍可被证据或用户决定推翻；已否决项不得复活。
> 详细论证、证据和待决问题见 [`redesign/_brief/decision-register.md`](./redesign/_brief/decision-register.md)。

## 0. 怎么读这份文件

- **confirmed**：用户已明确表达或拍板。开发 agent 不得自行改写；要变更必须重新向用户确认。
- **recommended**：当前设计案的默认方向，尚未成为契约。可以实现为原型或方案，但不能冒充已确认决策。
- **pending**：会改变 IA、技术、成本或隐私边界，必须等用户拍板或专项验证。
- **rejected / archived**：已否决或已归档。只能作为历史证据，不得作为当前设计基线。

规则：决策只追加、不改写。被推翻的决策保留原文并标注 `superseded`；不要用新实现悄悄覆盖旧决定。

---

## 1. 已确认的产品决策

| ID | 决策 | 状态 | 依据 |
|---|---|---|---|
| D-021 | **产品定位**：个人小窝式的长期公开记录站，叙事是“一个普通人在 AI 浪潮中的公开编年史”；不是作品集、技术博客或数字花园模板 | confirmed:user | `redesign/source/original-requirements.md:16-21` |
| D-022 | **公开站职责分工**：首页负责情绪、场景和视觉冲击；二级页回到信息传达；入口尽量少，不遮挡主视觉 | confirmed:user | `redesign/source/original-requirements.md:25-27` |
| D-023 | **内容范围**：随笔/思考、生活、经济规划、人生规划、知乎式问答、学习笔记、观点演化；目标是持续输出并形成自洽的世界观 | confirmed:user | `redesign/source/original-requirements.md:19-23` |
| D-024 | **真实性边界**：旧内容全部清空；个人资料、介绍、口号、头像不提前编造；原型只使用结构占位或合成 fixture | confirmed:user | `redesign/source/original-requirements.md:33` |
| D-025 | **写作工具可替换**：Obsidian、Notion 都只是写作前端；站点只认稳定的内容契约，不把某个工具锁进运行时 | confirmed:user | `redesign/source/original-requirements.md:29-31` |
| D-026 | **成熟文章管理 + Agent 原生**：作者交稿，私人助理 Agent 负责整理、修改、审阅和发布；每个博客操作都应有 Agent 可用的等价接口 | confirmed:user | `redesign/source/original-requirements.md:29-31` |
| D-027 | **Editorial 与 Plan 分域**：经济/人生规划与博客文章在内容管理上分开；规划由独立项目产出版本化快照，本站只消费公开投影 | confirmed:user | `redesign/source/original-requirements.md:23,27`; `_brief/CONTEXT.md` R7 |
| D-028 | **四季 × 天气主题保留但克制**：作为窗内场景和窗沿，不做全站换肤；不能回到旧站“花哨、华而不实”的方向 | confirmed:user | `redesign/source/original-requirements.md:25` |
| D-029 | **美学要求**：反 AI 味、反模板、反粗糙；字号、间距、配色必须自成体系；参考 Linear、DeepSeek、Artificial Analysis、Apple、StyleKit，但不复制模板 | confirmed:user | `redesign/source/original-requirements.md:25`; `_brief/ART-DIRECTION.md` |
| D-005 | **财务数据边界**：站点只消费版本化的公开快照；原始财务数据不进入站点仓库 | confirmed:user boundary | `_brief/CONTEXT.md` H6; `redesign/source/original-requirements.md:23` |
| D-006 | **经济透明粒度**：字段级显式公开；金额、比例、里程碑分别进入可见性矩阵，不做“全公开”或“全私密”的二选一 | confirmed:user; field matrix pending | 用户确认 2026-10-26；`_brief/decision-register.md` |
| D-007 | **国际站节奏**：全球可访问、中文首发；架构第一天 i18n-ready，英文内容后续上线，不伪造英文内容 | confirmed:user | 用户确认 2026-10-26；`_draft/04-intl-seo-dist.md` §9.1 |
| D-009 | **Agent 接口**：MCP 优先；先冻结能力、权限、审计和幂等语义，再实现工具；CLI/REST 作为后续适配 | confirmed:user; contract pending | 用户确认 2026-10-26；`_brief/CONTEXT.md` H5；MCP 契约待定义 |
| D-010 | **天气 provider**：MVP 先用占位天气 + 手动预览；真实 provider 延后，接口保持可替换 | confirmed:user; provider pending | 用户确认 2026-10-26；`research/06-hero-tech.md:280-311` |
| D-014 | **三层模型**：Window（公开情绪）+ Desk（公开信息）+ Workbench（私有工作）；公开站仍然只有 Window 与 Desk 两个页面家族 | confirmed:plan | 用户批准方案 2026-10-26；`_brief/workbench-boundary.md` §2 |
| D-015 | **Workbench 默认私有**：不进入公开导航、sitemap、`llms.txt` 和公开搜索；公开成果必须显式投影 | confirmed:plan; projection matrix pending | 用户批准方案 2026-10-26；`_brief/workbench-boundary.md` §3–§5 |
| D-017 | **Workbench 域边界**：不是第六个公开内容域；Editorial 管文章、Plan 管版本化快照、Ops 管权限与审计；Workbench 只做聚合视图、私有执行数据和受控动作 | confirmed:plan; API contract pending | 用户批准方案 2026-10-26；`_brief/workbench-boundary.md` §6 |
| D-019 | **Workbench 执行数据**：任务、周计划、项目是私有执行数据，不是新的文章类型，也不等同于 Plan；原始任务列表不直接公开 | confirmed:plan; schema pending | `source/requirements-addendum-20261026.md` §1；`_brief/workbench-boundary.md` §6 |
| D-018 | **StyleKit 参考方式**：只借鉴系统层方法（字号、间距、配色、组件状态组织），不复制模板、提示词、代码或未核验 token；不采用衬线 + 暖色编辑模板 | confirmed:reference; license pending | `_brief/workbench-boundary.md` §10；核验 2026-10-26 |
| D-013 | **旧材料处置**：旧方案移到工作区外受限归档，不作为当前约束；旧站源码和旧认证实现不得复制回活动仓库 | confirmed:process | 用户批准清理；`_archive/openblog-legacy-20261026` |
| D-030 | **原型处置**：组合原型未通过用户评审；本轮所有 HTML 实验原型按用户指示整体移入 `archive/prototypes/`，只作历史参考，不得作为视觉基线或实现模板 | confirmed:user, 2026-10-27 | 用户 2026-10-27 评审结论 |
| D-031 | **决策与废案分离**：已确认的产品、设计、风格决策继续有效；原型代码、视觉稿和验证结果属于废案证据，不等于设计验收 | confirmed:process, 2026-10-27 | 用户 2026-10-27 指示 |

---

## 2. 推荐方向（尚未成为契约）

这些是当前设计案认为最合理的默认值。可以据此做新的设计提案，但不要把“推荐”写成“已确认”。

| ID | 推荐 | 仍需验证 |
|---|---|---|
| D-002 | Git + Markdown/frontmatter 作为展示契约；Obsidian、Notion 可替换（工具可替换已由 D-025 确认） | 具体内容契约、写作适配器优先级、fixture 转换演练 |
| D-003 | 首页采用 poster 先行 + 原生 WebGL2 渐进增强；不默认引入 Three.js | 跨浏览器、移动端帧时、真机 GPU |
| D-008 | raw 不可变；L0/L1 默认自动，L2 出 diff 待批准，L3 扩写默认禁止 | 批准粒度、Agent 能力矩阵、审计字段 |
| D-011 | v1 不做深度视差，先做遮罩微动；v2 再评估 | 真实资产上的伪影与性能 |
| D-012 | 评论、留言、搜索、Newsletter、广告、视频不进入 MVP | 用户对 MVP 范围的最终确认 |
| D-016 | 公开投影是单向、字段白名单、来源版本绑定、可撤回的动作；不是双向同步 | 正式 Projection Manifest 与撤回缓存策略 |
| D-032 | 写作阶梯：thought → note → qa → essay → page；话题是 frontmatter，不是目录 | 用户对内容类型和发布节奏的确认 |
| D-033 | Desk 使用左对齐三栏阅读布局、无衬线为主、发丝线、冷中性色、一个强调色 | 参考站实测、字体授权、用户评审 |
| D-034 | Workbench 首版四视图：本周、任务、项目、审阅；低噪声、可恢复、清晰下一步 | 用户对 Plan/Ops 是否只读、任务/项目 schema 的确认 |
| D-035 | 首页资产按 (季节, 昼夜) 取底图，天气由着色器叠加；同一场景全年复用 | 四季资产生产、文字安全区、真机性能 |
| D-036 | 公开站非目标：不做通用 CMS、多作者平台、社交网络、站内编辑器 | 用户确认 |

---

## 3. 待决问题

以下问题会改变 IA、技术、成本或隐私边界，未拍板前不得写成契约：

1. **新视觉方向**：组合原型被否决后，下一轮首页/Desk 的视觉方向是什么？需要先重新对齐参考、情绪和“反 AI 味”的具体标准。
2. **Workbench 认证与私有存储**：独立私有库、私有 Git，还是 Ops 私有 schema？登录方式和备份/删除路径是什么？
3. **Workbench 首版范围**：Plan/Ops 首版是否只读？任务/周计划/项目字段与状态机如何定义？
4. **公开投影字段矩阵**：Editorial 与 Plan 各自允许公开哪些字段？哪些内容类型可以在预批准策略下自动投影？财务字段是否永远人工批准？
5. **任务/周计划/项目是否允许公开摘要**：首版只公开 Editorial/Plan 成果，还是允许经批准的周报/里程碑摘要？
6. **写作适配器优先级**：先 Obsidian 还是先 Notion？内容契约如何验证转换无损？
7. **玻璃与跨浏览器方案**：WebGL 透镜、CSS 玻璃、SVG 的最终取舍；v1 是否接受不做深度视差。
8. **国际站细节**：英文上线时间点、翻译审校流程、非中文内容的空状态。
9. **托管、域名与成本**：域名/备案、托管平台、月预算、商业化前的成本上限。
10. **MVP 外围能力**：评论、搜索、Newsletter、广告、视频分发是否明确排除在首版之外。

### 已登记但仍有 pending 子项的决策 ID

以下主决策的状态见 §1；这里只列仍未落定的子项。D-004 是完整 pending，其余是 confirmed 决策中的待定契约/矩阵。

| ID | 待决事项 | 详见 |
|---|---|---|
| D-004 | 首页玻璃方案：WebGL 透镜 / CSS / SVG；v1 是否做深度视差 | `redesign/_brief/decision-register.md` |
| D-006 | 经济字段可见性矩阵（金额、比例、里程碑、时间序列） | 同上 |
| D-009 | MCP 能力、权限、审计与幂等契约 | 同上 |
| D-010 | 真实天气 provider、作者城市、商业化后的数据许可 | 同上 |
| D-015 | Workbench 公开投影字段矩阵 | 同上 |
| D-017 | Workbench API 与域边界契约 | 同上 |
| D-018 | StyleKit 复用授权与具体版式核验 | 同上 |
| D-019 | 任务/周计划/项目 schema 与状态机 | 同上 |

---

## 4. 已否决 / 已归档

| 对象 | 处置 | 说明 |
|---|---|---|
| D-001 页面组织（独立推荐项） | **superseded by D-014** | Window / Desk / Workbench 三层模型已由 D-014 以 `confirmed:plan` 确认；不再作为独立推荐项 |
| D-020 组合体验原型 | **rejected:user, 2026-10-27；已归档** | 内部回归 `370/370` 只证明合成交互自洽，不等于用户验收。不得把 `composed-prototype.html` 当作视觉或架构基线 |
| `redesign/prototype/` 下全部 HTML 实验 | **archived** | 移到 `archive/prototypes/`；保留用于理解尝试过什么，不参与新设计 |
| `research/07-design-validation.md` | **archived** | 移到 `archive/prototypes/VALIDATION.md`；保留验证证据，撤销“已通过验收”的表述 |
| 旧根级 `docs/`、旧 `DECISIONS.md`、旧 `TASKS.md` | **removed from current tree** | 旧计划已被 redesign 取代；旧文档含过时鉴权示例和默认密码占位符，不复制回活动仓库。内容仍可从 Git 历史和本地受限归档查看 |
| 旧站认证实现、默认管理员密码、service-role 用法 | **禁止复用** | 仅存在于工作区外受限归档和 Git 历史中（不在当前工作树）；不得作为新实现模板 |
| 旧视觉契约、v1/v2/v3 视觉原型 | **archived** | 用户已否决或未通过；不得作为当前风格基线 |

历史材料查看方式：

- Git 历史：`git log --all -- docs/ DECISIONS.md TASKS.md`
- 本地受限归档：`D:\openblog\_archive\openblog-legacy-20261026\`
- 原型归档：`archive/prototypes/`，入口见 [`archive/prototypes/README.md`](./archive/prototypes/README.md)

---

## 5. 变更协议

1. 新决策先写入 `redesign/_brief/decision-register.md`，再同步到本文件。
2. 改变已确认决策时，必须记录：谁确认、日期、影响面、旧决策如何被替代。
3. 不得用代码实现“事实上的决策变更”。如果实现需要偏离本文件，先停下来向用户确认。
4. 评审未通过的原型、视觉稿和实验，不删除证据，但必须移入 `archive/` 并标注否决原因与日期。
