# 07 设计验证记录（已归档）

> **归档状态：2026-10-27。原型未通过用户评审，本文件只保留验证证据，不构成设计验收。**
>
> 核验日期：2026-10-27。范围：当时的 HTML 原型与已有静态资产。D3 只调用过一次 Amux 图像编辑探针；没有连接真实账号、MCP、Git 发布、Workbench 认证或财务数据。D6 只验证合成原型交互和边界表达，不把 Workbench 占位写成生产能力。内部回归通过不等于用户接受；用户已否决组合原型的整体结果。
>
> 说明：文中的 `prototype/...` 路径均指本目录（归档后位于 `archive/prototypes/`）。

## 1. 验证范围

| 门 | 原型 | 断点 | 结果 |
|---|---|---|---|
| D0 信息架构 | `prototype/ia-prototype.html` | 1440×900、390×844；Window、Writing、Article、Plan | 通过第一轮：入口、空状态、文章结构样例和未上线规划状态可区分 |
| D1 Window | `prototype/window-prototype.html` | 1440×900、390×844、reduced-motion、控制面板 | 通过第一轮：poster 可读，动态增强可关闭，面板不遮挡语义入口 |
| D2 Desk | `prototype/desk-prototype.html` | 1440×900、390×844；索引、文章、空状态 | 通过第二轮：文章页保留三栏；索引隐藏文章语境栏；移动端恢复单栏 |
| 架构图 | `prototype/architecture-map.html` | 1440×1000、390×844、reduced-motion、筛选、节点详情 | 通过：21 个节点、四类状态、筛选计数按 DOM 动态计算、Workbench 边界和详情可用 |
| D4 Effects | `prototype/d4-effects-lab.html` | 1440×1000、390×844、reduced-motion、暂停；优化前后 FPS | 通过视觉与降级验证；全屏雾需半分辨率，默认动态层应保持低密度 |
| D5 Content/Plan | `prototype/d5-content-plan-lab.html` | 1440×1000、390×844；未批准发布阻断、批准、发布、回滚、字段可见性 | 通过合成闭环：未批准发布被阻断并写入 audit；批准后发布和回滚可用；未连接真实 MCP、Git、账号或财务数据 |
| D6 Workbench | `prototype/workbench-prototype.html`；1440×1000、390×844；四视图、任务筛选、审阅批准/退回、reduced-motion、forced-colors | 合成原型通过：视图切换、筛选计数、内存审计和审阅状态变化可用；认证、公开投影与真实 Agent 权限仍未验证 |

截图输出位于工作区外：`D:\openblog\_assets\validation\`。这些文件是本地证据，不进入仓库。

## 2. 关键证据

### D0

- Window → Writing 的入口关系可见；写作为空时显示结构化空状态，不生成虚构标题。
- `/plan` 可以查看“未上线”状态，但不出现在 MVP 顶栏。
- 文章结构样例明确标注“非发布内容”，只验证布局。
- 截图：`ia-window-desktop.png`、`ia-writing-mobile.png`、`ia-article-desktop.png`、`ia-plan-mobile.png`。

### D1

- `a-winter-v1.jpg` 作为 poster 能承载全屏背景和文字安全区；顶部导航、中部入口、左下 HUD 没有与底图关键主体重叠。
- Edge headless 1440×900、DPR 1、等待 1800ms、FPS 2s：约 66.8 FPS，控制台错误 0。该结果只证明本机软件渲染管线可运行，不代表移动端 GPU。
- `prefers-reduced-motion` 下动态 canvas 隐藏，poster 与语义 DOM 仍可读。
- “窗外”面板提供季节/天气预览、强度滑块、暂停和回到默认状态；覆盖值只写 localStorage。
- 截图：`window-desktop.png`、`window-mobile.png`、`window-reduced.png`、`window-panel.png`。

### D2

- 第一版索引曾错误显示文章专属语境栏，导致空索引像有文章内容；已修正为索引隐藏语境栏、文章页保留语境栏。
- 修正后 1440×900 索引展示排版行，文章页展示目录 / 正文 / 语境三栏。
- 修正前手机索引曾出现宽版规则覆盖单栏的回归；已将 `max-width: 900px` 的单栏规则提升为 `.is-index-view .workspace`，修正后空状态完整居中。
- 修正后截图：`desk-index-desktop-v3.png`、`desk-article-desktop-v2.png`、`desk-empty-mobile-v3.png`、`desk-article-mobile-v2.png`；控制台错误均为 0。

### 架构图

- 加入 Workbench 节点后节点状态计数：confirmed 8、recommended 8、pending 3、archived 2，共 21；筛选按钮计数由 DOM 实时计算，避免静态数字与节点状态漂移。
- 站点体验区明确区分 PUBLIC（Window / Desk，访客可见、可索引）和 PRIVATE（Workbench，需认证、不进访客顶栏、默认不被索引）。
- Workbench 详情写明：它是作者私有执行面，不是 Plan 的公开读模型，也不是 Ops 的令牌/审计记录；写操作经 Ops 留痕，公开发布必须显式投影和批准。下一步为 D6 四视图与权限边界验证。
- 桌面三栏、手机纵向堆叠、reduced-motion、筛选和 Workbench 节点详情已截图验证；本轮截图为 `architecture-map-d6-desktop.png`、`architecture-map-d6-mobile.png`、`architecture-map-d6-mobile-site.png`、`architecture-map-d6-reduced.png`，早前决策版为 `architecture-map-decisions.png`。
- 用户决策已写入 `redesign/_brief/decision-register.md`：字段级显式公开、全球可访问中文首发、MCP 优先、MVP 占位天气/手动预览。

### D6 Workbench

- `prototype/workbench-prototype.html` 是无外部依赖的合成结构原型，包含本周、任务、项目、审阅四视图；所有按钮只改变页面内存，不写文件、不请求网络。
- 黑盒交互：四视图可切换；任务筛选可从 8 条切换到单一状态；审阅批准使待审计数从 3 变为 2，并追加内存审计记录；退回会显示退回原因位置。
- 桌面与手机截图：`D:\\openblog\\_assets\\validation\\workbench-desktop-v1.png`、`workbench-mobile-v1.png`；headless 控制台错误 0，390px 无横向溢出。
- 这只证明结构和交互方向成立。D6.1–D6.5 的生产认证、私有存储、公开投影白名单/撤回、来源版本绑定和 Agent 对等权限仍待契约与专项验证。

### Composition / D7

- 新增 `prototype/composed-prototype.html` 作为组合体验入口。它复用 Window poster/WebGL 渐进增强、Desk 左对齐排版和 Workbench 四视图，但由一个内存 `store` 驱动 Window、Desk、Workbench、文章发布和 Plan 投影。
- Window → Desk 黑盒路径通过：点击 Window 的“进入写作”后，Desk 顶部保留同一 poster 的场景切片、暖光锚点、`冬 · 晴 · 手动预览` 状态，纸面层从下方进入；返回品牌回到 Window。桌面 1440×1000 与移动 390×844 均无横向溢出，移动 Desk 窗沿保持 58px 连续切片。
- 角色隔离通过：访客只能看到 Window/Desk；直接进入 `#workbench` 显示结构化私有拒绝状态；作者和 Agent 可进入模拟 Workbench，顶部明确 `PRIVATE / SIMULATED ROLE`，不把模拟角色当成认证。
- Agent/作者内容链通过：Agent 生成 `draft-001`、预览 diff；未批准发布被阻断并追加 `agent · content.publish.blocked · blocked`，不生成 release；作者批准绑定 `draft-hash-001`；Agent 发布 release 后仍不可见；作者显式投影到 Desk 后文章才出现。所有操作只改页面内存。
- 视觉与运行证据：`D:\\openblog\\_assets\\validation\\composed-v6-window.png`、`composed-v6-window-mobile.png`、`composed-v6-desk-mobile.png`、`composed-agent-publish-blocked-v1.png`，以及 earlier desktop Desk/Workbench captures。新打开页面的浏览器错误级控制台输出为 0。
- D7 仍不证明真实认证、私有存储、MCP/API、服务端 `noindex`、正式投影 manifest、来源 revision 持久化或 Safari/Firefox/真机性能；这些继续保持 pending。

### D7.1 Active composition functional closure

- Active entry is `prototype/composed-prototype.html` with external `prototype/composed-runtime.js`; the old inline implementation remains `type="text/plain"` and is not executed.
- Article chain black-box coverage includes raw editing/new article, Agent draft generation/editing, real diff open/close, blocked publish before L2, author approval/return reason, Agent release, author projection, public `#article/<slug>`, withdrawal and rollback guards. Release/projection payloads are field-limited; public Desk reads the frozen projection rather than raw/draft/audit state.
- Workbench coverage includes the week focus/day slots, task filters and validation, derived project progress, project end/archive guards, project navigation, review queue author-only decisions, Agent read-only state, and private-root clearing when leaving Workbench.
- Plan coverage includes synthetic field editing, public/private allowlist preview, frozen projection, snapshot history, stale and withdrawn states, private-field filtering, idempotent re-projection, and public `/plan` rendering. Public stale copy only states that the frozen snapshot remains readable and needs re-projection; it does not expose draft/release/ledger values.
- UI/a11y and runtime coverage includes Window → Desk, history routes, article slug parsing, Drawer dialog/inert/focus trap, route focus and scroll reset, 44px controls, reduced-motion, reduced-transparency, forced-colors, WebGL resize/visibility/context loss and restore, 390px/320px overflow checks, and console/page/request error checks.
- Final regression harness: `_tools/shot/regression-composed.mjs`; the 2026-10-27 internal run completed `checks=370 passed=370 failed=0` (`All checks passed`). Logs: `_assets/validation/regression-20261027-run2-frozen.log` and `_assets/validation/regression-20261027-run2-targeted.log`. **This is internal synthetic evidence, not user acceptance: the user rejected the combined prototype on 2026-10-27 and it is archived.** No real authentication, persistence, MCP/API, database, server `noindex`, formal Projection Manifest, Ledger schema, production asset set, Safari/Firefox or real-device GPU evidence is claimed.

### D4 Effects

- 第一版全屏雾 + 粒子在 Edge headless 1440×1000 约 27 FPS；半分辨率雾、DPR≤1.25 后约 47 FPS，控制台错误均为 0。
- 视觉上雪、低透明度雾、poster 与三种玻璃回退仍可读；`prefers-reduced-motion` 和暂停均隐藏动态层，保留静态 poster。
- 结论：生产默认使用低密度粒子 + 半分辨率雾；高密度只作为高 tier 实验，WebGL 透镜和移动端帧时仍需真机验证。
- 截图：`d4-effects-desktop.png`、`d4-effects-desktop-v2.png`、`d4-effects-mobile-v2.png`、`d4-effects-reduced-v2.png`、`d4-effects-paused.png`。

### D5 Content / Plan

- `d5-content-plan-lab.html` 以合成 fixture 验证 raw 不可变、L0/L1 diff、L2 批准、MCP publish、rollback 和 audit 行为。
- 负面门禁：L2 未批准时点击发布，页面状态切换为 `BLOCKED / L2 NOT APPROVED`，audit 追加 `content.publish.blocked`，不生成 release；未发布时点击回滚同样写入 `content.rollback.blocked`。
- 成功路径：批准 L2 → 发布写入合成 `fixture-001` → 回滚恢复 draft；批准状态保留，可再次发布。重复发布按 release-id 幂等处理，不重复写入。
- Ledger tab 以合成字段验证 public/private 切换，绝对金额字段默认隐藏，比例和里程碑可显式公开。
- 桌面/手机/阻断/批准/发布/回滚/字段切换控制台错误均为 0；所有操作只在页面内存中发生，不写 Git、不连接真实 MCP 或财务数据。
- 截图：`d5-publish-desktop.png`、`d5-blocked-desktop.png`、`d5-approved-desktop.png`、`d5-published-audit-desktop.png`、`d5-mobile.png`、`d5-ledger-mobile.png`、`d5-ledger-public-desktop.png`。

## 3. 仍未通过或尚未验证

- 尚未在真实 Android/iPhone GPU 上验证 WebGL 帧时、发热和显存；D4 仅完成桌面 Edge headless 与静态降级验证。
- 尚未完成 Safari/Firefox 真机的玻璃对比、`webglcontextlost` 实机恢复，以及 LCP/CLS/INP 的 4G 网络测量；现有 `shot.mjs` 只提供控制台、截图和粗略 FPS。
- 现有冬季 poster 与春季编辑探针仍是探索图，不是定稿资产；未形成完整四季、昼夜和天气生产集。
- D6 Workbench 的合成四视图、任务筛选、审阅状态和响应式边界已有第一轮证据；认证方式、服务端私有默认、公开投影、任务/项目 schema、Agent 权限和审计保留期仍未验证。当前没有可用的生产后台、数据库或真实任务数据。
- 当前活动仓库的 secret-like 扫描只命中两处历史风险文字（`research/01-legacy-digest.md` 对旧 `service_role` 的记录，以及本文件对该扫描结果的说明），没有命中真实凭据。

## 4. D3 图像编辑探针

- 2026-10-26 使用一次性进程环境变量调用 Amux 编辑接口：输入 `a-winter-v1`，提示词为 `A-edit-spring_day.txt`，请求 `1024x576 / low / retries=0`。
- 结果：HTTP 成功，约 30.7 秒，输出保持湖谷、小屋、右侧树和主要取景关系；春季树叶、草地和水面重绘成立。结果文件是 `D:\\openblog\\_assets\\raw\\a\\a-spring-edit-probe.png`，仅为探索探针，不是批准的生产 plate。
- 兼容性发现：请求参数使用 `output_format=jpeg`，上游实际返回 PNG 内容；已按文件头改名并在 manifest 增加 `format` 字段。生产资产管线必须检查 MIME/文件头后再命名、压缩和派生。
- API 日志位于 `D:\\openblog\\_assets\\raw\\a\\logs\\a-spring-edit-probe.log`，未记录 Authorization 或 API key。密钥未写入仓库。

## 5. 下一步

1. 真机与跨浏览器：Android/iPhone GPU、Safari/Firefox 玻璃、context loss、发热/显存和 4G LCP/CWV。
2. 资产定稿：按 manifest 生成四季 × 日/夜最小集，完成文字安全区、Web 派生图和人工审阅。
3. 契约定稿：把 D5 合成 fixture 提炼为正式内容 schema、MCP 工具契约、Ledger Snapshot schema 和字段可见性矩阵。
4. D6 Workbench：验证本周 / 任务 / 项目 / 审阅四视图、私有默认、公开投影、认证和 Agent 权限；在此之前 Workbench 仍只是推荐架构，不是生产能力。
5. 工程启动决策：域名/备案、托管/成本、MVP 互动与商业化范围冻结后，再搭生产应用。
