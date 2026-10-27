const nodeDetails = {
  author: {
    kicker: 'AUTHOR / SOURCE', title: '作者原稿', status: 'confirmed', statusLabel: '已确认',
    summary: '写作从作者真实交付开始，站点不要求先把个人资料或口号填满。',
    conclusion: '原稿先进入 raw 保存，再由 agent 处理；原稿本身不被覆盖。',
    evidence: 'source/original-requirements.md:29-33', next: 'D5：用合成 Markdown fixture 演练 raw 与 diff。'
  },
  obsidian: {
    kicker: 'WRITING FRONTEND', title: 'Obsidian / Notion', status: 'recommended', statusLabel: '推荐',
    summary: '写作工具可以替换，站点只依赖稳定的内容契约。',
    conclusion: '优先用 Obsidian fixture 验证；Notion 作为后续适配器，不做运行时唯一 CMS。',
    evidence: '_draft/01-intro-principles-content.md:161-173', next: 'D5：定义转换规则和失败回退。'
  },
  'finance-source': {
    kicker: 'EXTERNAL PROJECT', title: '经济规划项目', status: 'confirmed', statusLabel: '边界已确认',
    summary: '财务原始数据和支付宝同步属于独立项目，本站只消费被批准公开的快照。',
    conclusion: '默认采用字段级显式公开；Ledger Snapshot 仍需补字段和版本契约。',
    evidence: '_brief/CONTEXT.md:48,62; 用户确认 2026-10-26', next: 'D5：定义金额、比例、里程碑和时间序列的可见性 schema。'
  },
  weather: {
    kicker: 'WORLD STATE', title: '占位天气 + 手动预览', status: 'confirmed', statusLabel: 'MVP 已确认',
    summary: 'MVP 先验证 Window 视觉和手动覆盖，不提前绑定作者城市或真实天气 provider。',
    conclusion: '保留可替换 WeatherProvider 接口；真实天气延后，当前使用占位状态。',
    evidence: '用户确认 2026-10-26; research/06-hero-tech.md:280-311', next: 'D4：验证手动状态、降级和 provider 接口，不调用访客定位。'
  },
  raw: {
    kicker: 'IMMUTABLE / VERSION 0', title: 'raw 原稿', status: 'confirmed', statusLabel: '已确认',
    summary: '原稿是作者声音保护的底座，任何整理都应能够回看原文。',
    conclusion: '原稿不可变，每次变更都产生可审阅 diff 与 agent_note。',
    evidence: '_draft/01-intro-principles-content.md:175-191', next: 'D5：验证原稿、草稿和发布版的版本关系。'
  },
  l0l1: {
    kicker: 'AUTOMATION LEVEL 0–1', title: 'L0 / L1 整理', status: 'recommended', statusLabel: '推荐自动',
    summary: '机械校对和结构整理能降低发布摩擦，同时不应改变作者的主张。',
    conclusion: '校对可自动；结构、摘要和标签自动但必须留下 diff。',
    evidence: '_draft/01-intro-principles-content.md:179-184', next: 'D5：为每一种变更定义可审阅输出。'
  },
  l2: {
    kicker: 'DIFF REQUIRED / LEVEL 2', title: 'L2 表达修改', status: 'pending', statusLabel: '待决策 / 待验证',
    summary: '表达层改写最容易改变语气和立场，因此必须把审批边界写成工具权限。',
    conclusion: '默认只出 diff，不直接发布；是否可按内容类型自动化仍待确认。',
    evidence: '_draft/01-intro-principles-content.md:181-190; _brief/CONTEXT.md:61', next: '附录 B：定义审批状态机与权限矩阵。'
  },
  contract: {
    kicker: 'CONTENT CONTRACT', title: 'Markdown + frontmatter', status: 'confirmed', statusLabel: '已确认方向',
    summary: '内容契约是写作工具、agent、展示层之间的稳定边界。',
    conclusion: '站点消费版本化 Markdown/frontmatter 或 MDX，不把某个编辑器写死。',
    evidence: '_draft/01-intro-principles-content.md:147-173', next: '附录 A：补 JSON Schema、MDX 组件和转换规则。'
  },
  preview: {
    kicker: 'REVIEW SURFACE', title: '预览 / 审阅', status: 'recommended', statusLabel: '推荐',
    summary: '人类需要审阅和批准，但不需要维护一个重型后台编辑器。',
    conclusion: 'Studio 是 API 的薄客户端，主要承担 diff、预览、批准和回滚。',
    evidence: '_brief/CONTEXT.md:61,64; _draft/02-visual-ia.md:186-188', next: 'D5：先用 dry-run fixture 验证，不接真实账号。'
  },
  'agent-api': {
    kicker: 'INTERFACE / MCP PRIORITY', title: 'MCP 优先', status: 'confirmed', statusLabel: '方向已确认',
    summary: '私人助理 agent 的第一阶段接口优先面向 MCP，但能力和权限契约要先于具体实现。',
    conclusion: '先定义发布、预览、审批、回滚、审计和幂等语义，再实现 MCP；CLI/REST 后续适配。',
    evidence: '_brief/CONTEXT.md:35; 用户确认 2026-10-26', next: 'D5：写 MCP 工具契约与 dry-run，不连接真实账号。'
  },
  publish: {
    kicker: 'VERSIONED DELIVERY', title: '确认 → Git → 发布', status: 'confirmed', statusLabel: '已确认方向',
    summary: '发布应是可回滚、可审计的版本操作，而不是后台里一次性覆盖。',
    conclusion: '批准后的契约内容进入 Git，构建站点并生成后续分发物。',
    evidence: '_draft/01-intro-principles-content.md:147-173; _draft/04-intl-seo-dist.md:62-73', next: 'D5：验证预览、批准、回滚和发布状态。'
  },
  window: {
    kicker: 'WINDOW / ROUTE /', title: '首页「窗」', status: 'recommended', statusLabel: '推荐 / D1 验证',
    summary: '首页只承担停留和情绪：真实世界状态进入摄影场景，但 UI 不遮挡它。',
    conclusion: '静态 poster 先出 LCP，WebGL2 之后接管；MVP 只保留极简导航和一个入口。',
    evidence: '_draft/02-visual-ia.md:6-45; research/06-hero-tech.md:73-84', next: 'D1：完成 Window 原型并做桌面、手机和降级验证。'
  },
  desk: {
    kicker: 'DESK / SECONDARY PAGES', title: '二级「桌」', status: 'recommended', statusLabel: '推荐 / D2 验证',
    summary: '进入内容页后，视觉表达让位给可读性、定位和持续写作。',
    conclusion: '采用左对齐三栏阅读布局；无内容时保持克制空状态。',
    evidence: '_draft/02-visual-ia.md:80-110,196-205', next: 'D2：完成索引页和文章页的响应式 HTML 原型。'
  },
  workbench: {
    kicker: 'WORKBENCH / PRIVATE DESK', title: '作者工作台', status: 'recommended', statusLabel: '推荐 / D6 验证',
    summary: '作者私有的执行面：本周计划、任务、项目推进和 Agent 审阅队列。它与 Window / Desk 共享版式语言，但不进入访客顶栏，默认不被索引。',
    conclusion: '与 Plan 的区别：Workbench 是私有执行面，Plan 是已批准经济/人生规划快照的公开读模型。与 Ops 的区别：Ops 记录令牌、审计和审批事件，Workbench 只提供作者操作界面，写操作经 Ops 留痕。默认私有，公开只经显式投影与批准。',
    evidence: 'source/requirements-addendum-20261026.md:1-42; prototype/workbench-prototype.html; prototype/composed-prototype.html; 生产认证与权限契约仍待验证', next: 'D6/D7：继续验证四视图、私有默认、公开投影和 Agent 权限边界。'
  },
  editorial: {
    kicker: 'DOMAIN / EDITORIAL', title: 'Editorial', status: 'confirmed', statusLabel: '已确认方向',
    summary: '文章域承载 thought、note、qa、essay、page 等 Editorial 内容。',
    conclusion: 'Git/MDX 管理版本，内容和写作工具解耦。',
    evidence: '_draft/01-intro-principles-content.md:93-114,147-154', next: '附录 A：冻结内容契约前先用 fixture 验证。'
  },
  plan: {
    kicker: 'DOMAIN / PLAN', title: 'Plan', status: 'pending', statusLabel: '透明度待定',
    summary: '规划不是文章流，而是来自独立项目的结构化读模型。',
    conclusion: '展示公开快照、里程碑和人生规划；绝不把原始财务数据直接放进仓库。',
    evidence: '_brief/CONTEXT.md:48,62; _draft/02-visual-ia.md:178-181', next: 'D5：用合成快照做字段可见性和空状态验证。'
  },
  engagement: {
    kicker: 'DOMAIN / ENGAGEMENT', title: 'Engagement', status: 'pending', statusLabel: 'MVP 范围待定',
    summary: '评论、留言、反应会带来互动价值，也会引入审核、隐私和运维成本。',
    conclusion: '它们不是当前硬要求，暂不应成为首页或文章闭环的前置依赖。',
    evidence: '_draft/01-intro-principles-content.md:155; _draft/04-intl-seo-dist.md:35-58', next: '用户确认是否排除 MVP；之后再设计 Supabase/RLS。'
  },
  distribution: {
    kicker: 'DOMAIN / DERIVED OUTPUT', title: 'Distribution', status: 'recommended', statusLabel: '后续阶段',
    summary: 'OG、视频、newsletter 等是已发布内容的派生物，不应反过来绑架写作闭环。',
    conclusion: '字段可在内容契约中预留，实际管线放到后续阶段。',
    evidence: '_draft/04-intl-seo-dist.md:75-99', next: 'D5 只验证字段边界，不实现视频或邮件服务。'
  },
  ops: {
    kicker: 'DOMAIN / OPERATIONS', title: 'Ops', status: 'recommended', statusLabel: '推荐',
    summary: '令牌、审计、审批记录和配置属于运营域，不能散落在展示层。',
    conclusion: '与 Editorial、Plan 分开，服务 Agent 治理和可追溯发布。',
    evidence: '_draft/01-intro-principles-content.md:156-159; _brief/CONTEXT.md:61', next: '附录 B：定义审计事件、幂等键和保留期限。'
  },
  'legacy-docs': {
    kicker: 'ARCHIVED / REFERENCE ONLY', title: '旧规划与契约', status: 'archived', statusLabel: '已归档',
    summary: '旧 docs、决策日志和任务板记录了上一轮路线，但与当前 redesign 存在冲突。',
    conclusion: '只用于理解历史和迁移风险，不能作为当前实现约束。',
    evidence: 'D:\\openblog\\_archive\\openblog-legacy-20261026\\ARCHIVE-MANIFEST.md', next: '出现历史问题时先回到当前状态矩阵，不恢复旧约束。'
  },
  'legacy-site': {
    kicker: 'ARCHIVED / REFERENCE ONLY', title: '旧站与视觉原型', status: 'archived', statusLabel: '已归档',
    summary: '旧站副本和 v1–v3 原型保留设计演进证据，但旧站曾包含不安全 demo 鉴权和历史凭据样式。',
    conclusion: '活动仓库不再包含旧站源码；如需查看，只能访问受限本地归档。',
    evidence: 'D:\\openblog\\_archive\\openblog-legacy-20261026\\ARCHIVE-MANIFEST.md', next: '不得把旧站复制回活动仓库；新原型需通过 D0–D5 重新验证。'
  }
};

const statusLabels = {
  confirmed: '已确认',
  recommended: '推荐',
  pending: '待决策 / 待验证',
  archived: '已归档'
};

const nodes = [...document.querySelectorAll('[data-node]')];
const filterButtons = [...document.querySelectorAll('[data-filter]')];
const detailEmpty = document.querySelector('.detail-empty');
const detailContent = document.querySelector('.detail-content');

function linkify(text) {
  return text.replace(/(source\/[^;]+|_brief\/[^;]+|_draft\/[^;]+|research\/[^;]+|D:\\[^;]+)/g, '<a href="#" data-evidence="$1">$1</a>');
}

function showDetails(id) {
  const data = nodeDetails[id];
  if (!data) return;
  detailEmpty.hidden = true;
  detailContent.hidden = false;
  detailContent.dataset.status = data.status;
  detailContent.querySelector('.detail-kicker').textContent = data.kicker;
  detailContent.querySelector('h2').textContent = data.title;
  const status = detailContent.querySelector('.detail-status');
  status.textContent = data.statusLabel || statusLabels[data.status];
  status.className = `detail-status detail-status-${data.status}`;
  detailContent.querySelector('.detail-summary').textContent = data.summary;
  detailContent.querySelector('[data-field="conclusion"]').textContent = data.conclusion;
  detailContent.querySelector('[data-field="evidence"]').innerHTML = linkify(data.evidence);
  detailContent.querySelector('[data-field="next"]').textContent = data.next;
  detailContent.querySelectorAll('[data-evidence]').forEach((anchor) => {
    anchor.addEventListener('click', (event) => event.preventDefault());
    anchor.title = '路径记录：活动仓库中的证据索引';
  });
}

function applyFilter(filter) {
  nodes.forEach((node) => {
    const visible = filter === 'all' || node.dataset.status === filter;
    node.classList.toggle('is-filtered-out', !visible);
    node.setAttribute('aria-hidden', String(!visible));
  });
  filterButtons.forEach((button) => {
    const active = button.dataset.filter === filter;
    button.classList.toggle('is-active', active);
    button.setAttribute('aria-pressed', String(active));
  });
}

function updateFilterCounts() {
  const counts = { all: nodes.length, confirmed: 0, recommended: 0, pending: 0, archived: 0 };
  nodes.forEach((node) => {
    const status = node.dataset.status;
    if (Object.hasOwn(counts, status)) counts[status] += 1;
  });
  filterButtons.forEach((button) => {
    const count = button.querySelector('span');
    if (count) count.textContent = String(counts[button.dataset.filter] ?? 0);
  });
}

nodes.forEach((node) => node.addEventListener('click', () => showDetails(node.dataset.node)));
filterButtons.forEach((button) => button.addEventListener('click', () => applyFilter(button.dataset.filter)));

updateFilterCounts();
applyFilter('all');
