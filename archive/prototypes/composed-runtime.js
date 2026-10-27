(() => {
  'use strict';

  const ROUTES = new Set(['window', 'writing', 'article', 'plan', 'workbench']);
  const ROLE_LABELS = { visitor: '访客', author: '作者', agent: 'Agent' };
  const ROLE_IDS = new Set(Object.keys(ROLE_LABELS));
  const VIEW_LABELS = { week: '本周', tasks: '任务', projects: '项目', review: '审阅' };
  const TASK_STATUS_LABELS = { all: '全部', todo: '待开始', doing: '进行中', waiting: '等待', blocked: '阻塞', done: '已完成' };
  const PROJECT_STATUS_LABELS = { active: '进行中', waiting: '等待', paused: '暂停', done: '已结束' };
  const REVIEW_STATUS_LABELS = {
    none: '未生成', needs_draft: '待生成 draft', pending: '待审', approved: '已批准', returned: '已退回', superseded: '已替代'
  };
  const RELEASE_STATUS_LABELS = { published: '已发布', superseded: '已替代', rolled_back: '已回滚' };
  const PROJECTION_STATUS_LABELS = { active: 'ACTIVE', stale: 'STALE / REPROJECT', withdrawn: 'WITHDRAWN', superseded: 'SUPERSEDED', none: 'NO PROJECTION' };
  const LEDGER_LABELS = {
    monthlyIncome: '月收入',
    savingsRate: '储蓄率',
    emergencyFund: '应急金里程碑',
    netWorth: '净资产',
    fiveYearTarget: '五年目标'
  };
  const SEASON_LABELS = ['春', '夏', '秋', '冬'];
  const WEATHER_LABELS = ['晴', '阴', '雨', '雾'];
  const windowStateKey = 'openblog-window-preview';
  const reducedMotion = matchMedia('(prefers-reduced-motion: reduce)');
  const reducedTransparency = matchMedia('(prefers-reduced-transparency: reduce)');

  const $ = (selector, root = document) => root.querySelector(selector);
  const $$ = (selector, root = document) => [...root.querySelectorAll(selector)];
  const clone = (value) => JSON.parse(JSON.stringify(value));
  const escapeHtml = (value) => String(value ?? '').replace(/[&<>'"]/g, (char) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', "'": '&#39;', '"': '&quot;' }[char]));
  const normalize = (value) => String(value ?? '').trim();
  const nowIso = () => new Date().toISOString();

  const FIXTURE = {
    views: [
      { id: 'week', label: '本周', number: '01' },
      { id: 'tasks', label: '任务', number: '02' },
      { id: 'projects', label: '项目', number: '03' },
      { id: 'review', label: '审阅', number: '04' }
    ],
    week: {
      range: '本周结构占位',
      focusTaskIds: ['task-fixture-01', 'task-fixture-03', 'task-fixture-04', 'task-fixture-06'],
      days: [
        { id: 'mon', label: '周一', slot: '安排位置', taskId: null },
        { id: 'tue', label: '周二', slot: '安排位置', taskId: null },
        { id: 'wed', label: '周三', slot: '安排位置', taskId: null },
        { id: 'thu', label: '周四', slot: '安排位置', taskId: null },
        { id: 'fri', label: '周五', slot: '安排位置', taskId: null },
        { id: 'sat', label: '周六', slot: '安排位置', taskId: null },
        { id: 'sun', label: '周日', slot: '安排位置', taskId: null }
      ]
    },
    tasks: [
      { id: 'task-fixture-01', code: 'T-0001', title: '任务标题位置 A', projectId: 'project-fixture-01', status: 'doing', owner: '角色占位', due: '日期占位', priority: '优先级位置', nextStep: '下一步位置', acceptance: '验收标准位置', blockedReason: '', archived: false },
      { id: 'task-fixture-02', code: 'T-0002', title: '任务标题位置 B', projectId: 'project-fixture-01', status: 'todo', owner: '角色占位', due: '日期占位', priority: '优先级位置', nextStep: '下一步位置', acceptance: '验收标准位置', blockedReason: '', archived: false },
      { id: 'task-fixture-03', code: 'T-0003', title: '任务标题位置 C', projectId: 'project-fixture-02', status: 'waiting', owner: '角色占位', due: '日期占位', priority: '优先级位置', nextStep: '下一步位置', acceptance: '验收标准位置', blockedReason: '', archived: false },
      { id: 'task-fixture-04', code: 'T-0004', title: '任务标题位置 D', projectId: 'project-fixture-02', status: 'blocked', owner: '角色占位', due: '日期占位', priority: '优先级位置', nextStep: '下一步位置', acceptance: '验收标准位置', blockedReason: '阻塞原因位置', archived: false },
      { id: 'task-fixture-05', code: 'T-0005', title: '任务标题位置 E', projectId: 'project-fixture-03', status: 'done', owner: '角色占位', due: '日期占位', priority: '优先级位置', nextStep: '下一步位置', acceptance: '验收标准位置', blockedReason: '', archived: false },
      { id: 'task-fixture-06', code: 'T-0006', title: '任务标题位置 F', projectId: 'project-fixture-03', status: 'doing', owner: '角色占位', due: '日期占位', priority: '优先级位置', nextStep: '下一步位置', acceptance: '验收标准位置', blockedReason: '', archived: false },
      { id: 'task-fixture-07', code: 'T-0007', title: '任务标题位置 G', projectId: 'project-fixture-01', status: 'todo', owner: '角色占位', due: '日期占位', priority: '优先级位置', nextStep: '下一步位置', acceptance: '验收标准位置', blockedReason: '', archived: false },
      { id: 'task-fixture-08', code: 'T-0008', title: '任务标题位置 H', projectId: 'project-fixture-04', status: 'waiting', owner: '角色占位', due: '日期占位', priority: '优先级位置', nextStep: '下一步位置', acceptance: '验收标准位置', blockedReason: '', archived: false }
    ],
    projects: [
      { id: 'project-fixture-01', code: 'P-0001', name: '项目名称位置 A', status: 'active', owner: '角色占位', phase: '阶段位置', nextStep: '下一节点位置', summary: '项目摘要位置', archived: false },
      { id: 'project-fixture-02', code: 'P-0002', name: '项目名称位置 B', status: 'waiting', owner: '角色占位', phase: '阶段位置', nextStep: '下一节点位置', summary: '项目摘要位置', archived: false },
      { id: 'project-fixture-03', code: 'P-0003', name: '项目名称位置 C', status: 'active', owner: '角色占位', phase: '阶段位置', nextStep: '下一节点位置', summary: '项目摘要位置', archived: false },
      { id: 'project-fixture-04', code: 'P-0004', name: '项目名称位置 D', status: 'paused', owner: '角色占位', phase: '阶段位置', nextStep: '下一节点位置', summary: '项目摘要位置', archived: false }
    ],
    reviews: [
      { id: 'review-fixture-01', code: 'R-0001', title: '审阅条目位置 A', projectId: 'project-fixture-01', kind: '内容变更', submitter: '角色占位', summary: '变更摘要位置', status: 'pending', reason: '', decidedBy: null },
      { id: 'review-fixture-02', code: 'R-0002', title: '审阅条目位置 B', projectId: 'project-fixture-02', kind: '结构变更', submitter: '角色占位', summary: '变更摘要位置', status: 'pending', reason: '', decidedBy: null },
      { id: 'review-fixture-03', code: 'R-0003', title: '审阅条目位置 C', projectId: 'project-fixture-03', kind: '发布', submitter: '角色占位', summary: '变更摘要位置', status: 'pending', reason: '', decidedBy: null },
      { id: 'review-fixture-04', code: 'R-0004', title: '审阅条目位置 D', projectId: 'project-fixture-04', kind: '回滚', submitter: '角色占位', summary: '变更摘要位置', status: 'approved', reason: '', decidedBy: 'author' },
      { id: 'review-fixture-05', code: 'R-0005', title: '审阅条目位置 E', projectId: 'project-fixture-01', kind: '内容变更', submitter: '角色占位', summary: '变更摘要位置', status: 'returned', reason: '退回原因位置', decidedBy: 'author' }
    ],
    ledgerFields: [
      { id: 'monthlyIncome', unit: 'CNY', value: '结构值占位', visibility: 'private' },
      { id: 'savingsRate', unit: 'percent', value: '结构值占位', visibility: 'public' },
      { id: 'emergencyFund', unit: 'milestone', value: '结构值占位', visibility: 'public' },
      { id: 'netWorth', unit: 'CNY', value: '结构值占位', visibility: 'private' },
      { id: 'fiveYearTarget', unit: 'milestone', value: '结构值占位', visibility: 'public' }
    ]
  };

  const SEASON_TONES = {
    春: { filter: 'saturate(1.16) hue-rotate(18deg) brightness(1.04)', alt: '春日山谷、湖面与远山，一间小屋的窗户透出微弱暖光' },
    夏: { filter: 'saturate(1.24) hue-rotate(38deg) brightness(1.08)', alt: '夏日山谷、湖面与远山，一间小屋的窗户透出微弱暖光' },
    秋: { filter: 'saturate(1.12) hue-rotate(-18deg) sepia(.15) brightness(.98)', alt: '秋日山谷、湖面与远山，一间小屋的窗户透出微弱暖光' },
    冬: { filter: 'saturate(.82) hue-rotate(0deg) brightness(.94)', alt: '雪后的山谷、湖面与远山，一间小屋的窗户透出微弱暖光' }
  };

  function nextSlug(title, articles) {
    const base = normalize(title).toLowerCase().replace(/[^a-z0-9\u4e00-\u9fff]+/g, '-').replace(/^-+|-+$/g, '').slice(0, 38) || 'synthetic-note';
    let slug = base;
    let index = 2;
    while (articles.some((article) => article.slug === slug)) slug = `${base}-${index++}`;
    return slug;
  }

  function makeRevisionId(kind, seq) { return `${kind}-${String(seq).padStart(3, '0')}`; }
  function makeHash(kind, seq) { return `${kind}-hash-${String(seq).padStart(3, '0')}`; }

  function makeArticle(id, title = '未命名合成文章', slug = 'synthetic-note') {
    const raw = {
      id: 'raw-001', kind: 'raw', revision: 'raw-001', hash: 'raw-hash-001', parentId: null,
      title, slug, question: '这篇文章要回答什么问题？',
      thesis: '这里填写一条经过作者确认的合成论点。',
      body: '这里是合成原稿正文。作者可以在工作台中替换标题、问题、论点和正文，再交给 Agent 生成结构草稿。\n\n当前内容只用于验证编辑、审阅和公开投影的关系。',
      createdBy: 'author', createdAt: nowIso(), immutable: true
    };
    return {
      id,
      slug,
      archived: false,
      currentRawId: raw.id,
      currentDraftId: null,
      currentReleaseId: null,
      currentProjectionId: null,
      revisions: [raw],
      releases: [],
      projections: [],
      review: { status: 'none', boundDraftHash: null, actor: null, reason: '', sourceRevision: null },
      createdAt: raw.createdAt,
      updatedAt: raw.createdAt
    };
  }

  function makeInitialStore() {
    const article = makeArticle('article-fixture-001');
    return {
      synthetic: true,
      meta: { schema: 'composed-prototype/v2', seed: 'synthetic-only', sequence: 100 },
      role: 'visitor',
      route: 'window',
      routeSlug: null,
      window: { season: '冬', weather: '晴', intensity: 42, paused: false, source: 'manual' },
      articles: [article],
      selectedArticleId: article.id,
      plan: {
        snapshot: { id: 'snapshot-001', revision: 'ledger-001', asOf: '合成时间点', fields: clone(FIXTURE.ledgerFields) },
        snapshotHistory: [{ id: 'snapshot-001', revision: 'ledger-001', policyRevision: 'policy-001', asOf: '合成时间点', fields: clone(FIXTURE.ledgerFields) }],
        policyRevision: 'policy-001',
        projections: [],
        currentProjectionId: null
      },
      workbench: {
        view: 'week', taskFilter: 'all', reviewSubview: 'article',
        tasks: clone(FIXTURE.tasks), projects: clone(FIXTURE.projects),
        week: clone(FIXTURE.week), reviews: clone(FIXTURE.reviews),
        selectedTaskId: null, selectedProjectId: null
      },
      audit: [],
      ui: {
        drawerOpen: false,
        focusReturn: null,
        diffOpen: false,
        articleEditor: 'current',
        selectedReleaseId: null,
        planDraftValues: null,
        transient: { articleReturnReason: '', queueReasons: {}, forms: {} },
        focusSelector: null,
        resetScroll: false,
        skipTransientCapture: false,
        lastRenderedView: null,
        toast: ''
      }
    };
  }

  let store = makeInitialStore();
  const windowFx = { canvas: $('#fxCanvas'), gl: null, program: null, vao: null, uniforms: null, raf: 0, running: false, lost: false, startTime: 0 };

  function parseHash() {
    const raw = location.hash.replace(/^#/, '');
    const parts = raw.split('/').filter(Boolean);
    const route = ROUTES.has(parts[0]) ? parts[0] : 'window';
    let slug = null;
    if (route === 'article' && parts[1]) {
      try { slug = decodeURIComponent(parts[1]); } catch (_) { slug = null; }
    }
    return { route, slug };
  }

  function hashFor(route, slug = null) {
    return route === 'article' && slug ? `#article/${encodeURIComponent(slug)}` : `#${route}`;
  }

  function setHash(route, slug = null, replace = false) {
    const next = hashFor(route, slug);
    if (location.hash === next) return;
    if (replace) history.replaceState({ route, slug }, '', next); else history.pushState({ route, slug }, '', next);
  }

  function routeIsDesk(route) { return ['writing', 'article', 'plan'].includes(route); }
  function routeIsSurface(route) { return routeIsDesk(route) || route === 'workbench'; }

  function navigate(route, options = {}) {
    const next = ROUTES.has(route) ? route : 'window';
    const slug = next === 'article' ? (options.slug || null) : null;
    const previous = store.route;
    if (!options.fromHash) setHash(next, slug, Boolean(options.replace));
    store.route = next;
    store.routeSlug = slug;
    renderApp(previous);
  }

  function announce(message) {
    const node = $('#announcer');
    if (!node) return;
    node.textContent = '';
    window.setTimeout(() => { node.textContent = message; }, 20);
  }

  function toast(message) {
    const node = $('#toast');
    if (!node) return;
    node.textContent = message;
    node.classList.add('is-visible');
    window.clearTimeout(toast.timer);
    toast.timer = window.setTimeout(() => node.classList.remove('is-visible'), 2800);
  }

  function record(action, target, result, detail, sourceRevision = '', before = null, after = null) {
    store.audit.unshift({ id: `audit-${store.audit.length + 1}`, at: nowIso(), actor: store.role, action, target, result, sourceRevision, detail, before, after });
  }

  function statusChip(status, label = status) { return `<span class="state state-${escapeHtml(status)}">${escapeHtml(label)}</span>`; }
  function projectById(id) { return store.workbench.projects.find((project) => project.id === id); }
  function taskById(id) { return store.workbench.tasks.find((task) => task.id === id); }
  function fixtureSequence(list, prefix, field) {
    return list.reduce((max, item) => {
      const match = String(item[field] || '').match(new RegExp(`^${prefix}-(\\d+)$`));
      return match ? Math.max(max, Number(match[1])) : max;
    }, 0);
  }
  function articleById(id) { return store.articles.find((article) => article.id === id); }
  function selectedArticle() {
    if (store.ui?.articleEditor === 'new') return null;
    return articleById(store.selectedArticleId) || store.articles.find((article) => !article.archived) || null;
  }
  function currentRaw(article) { return article?.revisions.find((revision) => revision.id === article.currentRawId) || null; }
  function currentDraft(article) { return article?.revisions.find((revision) => revision.id === article.currentDraftId && revision.kind === 'draft') || null; }
  function activeProjection(article) { return article?.projections.find((projection) => projection.id === article.currentProjectionId && projection.status === 'active') || null; }
  function selectedPlanProjection() { return store.plan.projections.find((projection) => projection.id === store.plan.currentProjectionId) || null; }
  function publicArticleBySlug(slug) {
    return store.articles.find((article) => article.slug === slug && !article.archived && activeProjection(article));
  }
  function currentRelease(article) {
    return article?.releases.find((release) => release.id === article.currentReleaseId) || null;
  }
  function latestProjection(article) {
    return article?.projections.find((projection) => projection.id === article.currentProjectionId)
      || article?.projections[article.projections.length - 1]
      || null;
  }
  function previousPublishedRelease(article, projection = activeProjection(article)) {
    if (!article || !projection) return null;
    const index = article.releases.findIndex((release) => release.id === projection.releaseId);
    if (index < 0) return null;
    return article.releases.slice(0, index).reverse().find((release) => release.status === 'published') || null;
  }
  function currentDraftIsApproved(article = selectedArticle()) {
    const draft = currentDraft(article);
    return Boolean(draft && article.review.status === 'approved' && article.review.boundDraftHash === draft.hash);
  }
  function publicArticlePayload(source) {
    return {
      title: normalize(source?.title),
      question: normalize(source?.question),
      thesis: normalize(source?.thesis),
      body: normalize(source?.body),
      revision: normalize(source?.revision || source?.id)
    };
  }
  function articleProjectionStale(article) {
    const projection = activeProjection(article);
    if (!projection) return false;
    const release = currentRelease(article);
    const draft = currentDraft(article);
    const releaseAhead = release && projection.sourceRevision !== release.hash;
    const draftAhead = draft && article.review.status === 'approved' && projection.sourceRevision !== draft.hash;
    return Boolean(releaseAhead || draftAhead);
  }
  function articleIsPublic(article) { return Boolean(activeProjection(article)); }
  function planProjectionStatus() {
    const projection = selectedPlanProjection();
    if (!projection) return 'none';
    if (projection.status !== 'active') return projection.status;
    const currentPublic = store.plan.snapshot.fields.filter((field) => field.visibility === 'public');
    const currentAllowlist = currentPublic.map((field) => field.id);
    const sameAllowlist = JSON.stringify(currentAllowlist) === JSON.stringify(projection.fieldAllowlist);
    const currentPayload = currentPublic.filter((field) => projection.fieldAllowlist.includes(field.id));
    const samePayload = JSON.stringify(currentPayload) === JSON.stringify(projection.payload);
    const sameRevision = projection.sourceRevision === store.plan.snapshot.revision && projection.policyRevision === store.plan.policyRevision;
    return sameRevision && sameAllowlist && samePayload ? 'active' : 'stale';
  }
  function planProjectionHasRevokedField(projection = selectedPlanProjection()) {
    if (!projection) return false;
    return projection.fieldAllowlist.some((id) => {
      const field = store.plan.snapshot.fields.find((item) => item.id === id);
      return field && field.visibility !== 'public';
    });
  }
  function publicPlanPayload() {
    const projection = selectedPlanProjection();
    if (!projection) return [];
    const visible = new Set(store.plan.snapshot.fields.filter((field) => field.visibility === 'public').map((field) => field.id));
    return (projection.payload || []).filter((field) => visible.has(field.id));
  }
  function planIsPublic() {
    return ['active', 'stale'].includes(planProjectionStatus()) && publicPlanPayload().length > 0;
  }
  function reviewPendingCount() {
    const articlePending = store.articles.filter((article) => ['pending'].includes(article.review.status)).length;
    const queuePending = store.workbench.reviews.filter((review) => review.status === 'pending').length;
    return articlePending + queuePending;
  }
  function countTasks(filter = 'all') {
    const tasks = store.workbench.tasks.filter((task) => !task.archived);
    return filter === 'all' ? tasks.length : tasks.filter((task) => task.status === filter).length;
  }
  function projectProgress(projectId) {
    const tasks = store.workbench.tasks.filter((task) => !task.archived && task.projectId === projectId);
    return { done: tasks.filter((task) => task.status === 'done').length, total: tasks.length };
  }
  function nextSequence() { store.meta.sequence += 1; return store.meta.sequence; }
  function nextRevision(kind) { const seq = nextSequence(); return { revision: makeRevisionId(kind, seq), hash: makeHash(kind, seq) }; }

  function can(action) {
    const roles = {
      'article.edit': ['author'], 'article.archive': ['author'], 'draft.prepare': ['agent'], 'draft.edit': ['agent'],
      'review.approve': ['author'], 'review.return': ['author'], 'release.publish': ['author', 'agent'],
      'projection.article': ['author'], 'projection.article.withdraw': ['author'], 'article.rollback': ['author'],
      'task.write': ['author'], 'project.write': ['author'], 'week.write': ['author'], 'review.queue': ['author'],
      'plan.write': ['author'], 'plan.project': ['author'], 'plan.withdraw': ['author']
    };
    return (roles[action] || []).includes(store.role);
  }

  function deny(action, target, detail) {
    record(action, target, 'denied', detail);
    toast(`已拒绝：${detail}`);
    announce(`操作被拒绝：${detail}`);
    renderApp(store.route);
  }

  function updateWindowState() {
    const scene = $('#sceneLayer');
    const sill = $('#sceneSill');
    const poster = $('#poster');
    if (!scene) return;
    scene.dataset.season = store.window.season;
    scene.dataset.weather = store.window.weather;
    scene.dataset.paused = String(store.window.paused);
    if (poster) {
      poster.style.filter = SEASON_TONES[store.window.season]?.filter || '';
      poster.alt = SEASON_TONES[store.window.season]?.alt || poster.alt;
    }
    if (sill) sill.dataset.season = store.window.season;
    const season = $('#seasonLabel');
    const weather = $('#weatherLabel');
    const pause = $('#pauseButton');
    const sillLabel = $('#sillLabel');
    const env = $('#deskEnvChip');
    const time = $('#timeLabel');
    if (season) season.textContent = store.window.season;
    if (weather) weather.textContent = store.window.weather;
    if (pause) {
      pause.textContent = reducedMotion.matches ? '系统已暂停动效' : store.window.paused ? '继续动效' : '暂停动效';
      pause.disabled = reducedMotion.matches;
      pause.setAttribute('aria-pressed', String(store.window.paused));
    }
    if (sillLabel) sillLabel.textContent = `WINDOW / ${store.window.season} · ${store.window.weather} · ${store.window.source === 'manual' ? '手动预览' : '默认预览'}`;
    if (env) env.textContent = `WINDOW / ${store.window.season} · ${store.window.weather}`;
    if (time) time.textContent = `${new Date().toLocaleTimeString('zh-CN', { hour: '2-digit', minute: '2-digit' })} · ${store.window.source === 'manual' ? '手动预览' : '默认预览'}`;
    $$('[data-season]').forEach((button) => button.setAttribute('aria-pressed', String(button.dataset.season === store.window.season)));
    $$('[data-weather]').forEach((button) => button.setAttribute('aria-pressed', String(button.dataset.weather === store.window.weather)));
    const range = $('#intensity');
    if (range) { range.value = String(store.window.intensity); const value = $('#intensityValue'); if (value) value.textContent = `${store.window.intensity}%`; }
    const renderLabel = $('#renderLabel');
    if (renderLabel && !windowFx.running) renderLabel.textContent = store.window.paused ? 'poster ready · motion paused' : 'poster ready · static season preview';
    syncWindowFx();
  }

  function loadWindowState() {
    try {
      const saved = JSON.parse(localStorage.getItem(windowStateKey) || '{}');
      if (SEASON_LABELS.includes(saved.season)) store.window.season = saved.season;
      if (WEATHER_LABELS.includes(saved.weather)) store.window.weather = saved.weather;
      if (Number.isFinite(saved.intensity)) store.window.intensity = Math.max(0, Math.min(100, saved.intensity));
      if (saved.paused === true) store.window.paused = true;
      store.window.source = saved.source || 'manual';
    } catch (_) { /* local preview is optional */ }
  }

  function saveWindowState() {
    try { localStorage.setItem(windowStateKey, JSON.stringify(store.window)); } catch (_) { /* optional */ }
  }

  function ensureDrawerControls() {
    const drawer = $('#demoDrawer');
    if (!drawer || $('#windowPreviewControls')) return;
    const section = document.createElement('section');
    section.className = 'drawer-section';
    section.id = 'windowPreviewControls';
    section.innerHTML = `<span class="drawer-label">窗外预览</span>
      <div class="preview-control"><strong>季节</strong><div class="preview-options">${SEASON_LABELS.map((season) => `<button class="role-option preview-option" type="button" data-season="${season}" aria-pressed="false">${season}</button>`).join('')}</div></div>
      <div class="preview-control"><strong>天气</strong><div class="preview-options">${WEATHER_LABELS.map((weather) => `<button class="role-option preview-option" type="button" data-weather="${weather}" aria-pressed="false">${weather}</button>`).join('')}</div></div>
      <label class="preview-range" for="intensity"><span><strong>动态强度</strong><output id="intensityValue">42%</output></span><input id="intensity" type="range" min="0" max="100" step="1" value="42"></label>
      <button class="drawer-button" type="button" data-action="reset-window">恢复默认预览</button>`;
    const finalSection = drawer.querySelector('.drawer-section:last-of-type');
    if (finalSection) finalSection.before(section); else drawer.append(section);
  }

  function syncDrawerBackground(open) {
    const sceneLayer = $('#sceneLayer');
    const deskLayer = $('#deskLayer');
    const skipLink = $('.skip-link');
    if (sceneLayer) sceneLayer.inert = open || routeIsSurface(store.route);
    if (deskLayer) deskLayer.inert = open || !routeIsSurface(store.route);
    if (skipLink) skipLink.inert = open;
  }

  function renderDrawer() {
    const drawer = $('#demoDrawer');
    if (!drawer) return;
    const open = store.ui.drawerOpen;
    drawer.classList.toggle('is-open', open);
    drawer.setAttribute('aria-hidden', String(!open));
    drawer.inert = !open;
    syncDrawerBackground(open);
    $('#drawerBackdrop')?.classList.toggle('is-open', open);
    $$('[data-action="open-drawer"]').forEach((trigger) => trigger.setAttribute('aria-expanded', String(open)));
    $('#drawerState').textContent = `${store.route}${store.routeSlug ? `/${store.routeSlug}` : ''} · ${ROLE_LABELS[store.role]} · 页面内存（窗外预览例外）`;
    const workbenchButton = $('#drawerWorkbenchButton');
    if (workbenchButton) workbenchButton.hidden = store.role === 'visitor';
    $('#drawerFlow').innerHTML = store.role === 'visitor'
      ? '<strong>访客路径</strong><br>窗 → 写作 → 公开文章 / 空状态 → 规划（若已投影）'
      : store.role === 'author'
        ? '<strong>作者路径</strong><br>编辑 raw → 维护任务与周计划 → 批准 → 投影公开成果'
        : '<strong>Agent 路径</strong><br>读取 raw → 生成 draft → diff → 获批后发布 release';
    $$('.role-option[data-role]', drawer).forEach((button) => button.setAttribute('aria-pressed', String(button.dataset.role === store.role)));
    updateWindowState();
  }

  function openDrawer(event) {
    event?.preventDefault();
    if (!store.ui.drawerOpen) store.ui.focusReturn = document.activeElement;
    store.ui.drawerOpen = true;
    renderDrawer();
    const drawer = $('#demoDrawer');
    (drawer?.querySelector('.drawer-close') || drawer)?.focus();
  }

  function drawerReturnFallback() {
    if (store.route === 'window') return $('#sceneTopbar [data-action="open-drawer"]');
    if (store.route === 'workbench') return $('#workbenchContent [data-action="open-drawer"]');
    return $('#deskTopbar [data-action="open-drawer"]');
  }

  function closeDrawer() {
    const returnTarget = store.ui.focusReturn;
    store.ui.drawerOpen = false;
    renderDrawer();
    const candidates = [returnTarget, drawerReturnFallback()];
    const focusTarget = candidates.find((node) => node
      && node !== document.body && node !== document.documentElement
      && document.contains(node) && typeof node.focus === 'function'
      && !node.closest('[inert]'));
    focusTarget?.focus();
    store.ui.focusReturn = null;
  }

  function drawerFocusables() {
    const drawer = $('#demoDrawer');
    if (!drawer) return [];
    return $$('button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])', drawer)
      .filter((node) => !node.disabled && node.getClientRects().length > 0);
  }

  function trapDrawerFocus(event) {
    if (!store.ui.drawerOpen || event.key !== 'Tab') return;
    const drawer = $('#demoDrawer');
    if (!drawer) return;
    const focusables = drawerFocusables();
    if (!focusables.length) { event.preventDefault(); drawer.focus(); return; }
    const first = focusables[0];
    const last = focusables[focusables.length - 1];
    const active = document.activeElement;
    if (!drawer.contains(active)) { event.preventDefault(); (event.shiftKey ? last : first).focus(); return; }
    if (event.shiftKey && active === first) { event.preventDefault(); last.focus(); }
    else if (!event.shiftKey && active === last) { event.preventDefault(); first.focus(); }
  }

  function resetDemo() {
    const savedWindow = clone(store.window);
    store = makeInitialStore();
    store.window = savedWindow;
    setHash('window', null, true);
    renderApp('workbench');
    closeDrawer();
    toast('合成状态已重置；窗外预览保留');
    announce('合成状态已恢复到初始值');
  }

  function renderStatusLabel(status) {
    return REVIEW_STATUS_LABELS[status] || RELEASE_STATUS_LABELS[status] || PROJECTION_STATUS_LABELS[status] || String(status).toUpperCase();
  }

  function bodyBlocks(body) {
    return escapeHtml(body).split(/\n{2,}/).filter(Boolean).map((block) => `<p>${block.replace(/\n/g, '<br>')}</p>`).join('');
  }

  function renderPublicRoute() {
    const root = $('#primaryContent');
    if (!root) return;
    if (store.route === 'writing') root.innerHTML = renderWriting();
    else if (store.route === 'article') root.innerHTML = renderArticle();
    else if (store.route === 'plan') root.innerHTML = renderPlan();
    else root.innerHTML = renderWriting();
    root.className = `public-content ${store.route === 'writing' ? 'is-index' : ''}`;
  }

  function renderWriting() {
    const publicArticles = store.articles.filter((article) => !article.archived && articleIsPublic(article));
    return `<div class="content-grid is-index">
      <aside class="rail" aria-label="写作索引说明"><span class="kicker">DESK / CONTENT</span><h1>信息先于装饰</h1><p class="rail-sub">窗沿把此刻带到桌面，内容从这里开始。</p><div class="rail-note"><b>写作索引</b>只列已完成公开投影的内容。草稿、审阅和私有规划不会出现在这里。</div></aside>
      <section class="content" aria-labelledby="writingHeading"><header class="index-header"><div><div class="breadcrumb">/writing · DESK</div><h2 id="writingHeading">写作</h2></div><p>索引使用排版行，不用缩略图卡片网格。窗景已经退到窗沿，信息在桌上展开。</p></header>
      ${publicArticles.length ? `<div class="writing-list">${publicArticles.map((article) => { const projection = activeProjection(article); const payload = projection.payload; const href = `#article/${encodeURIComponent(article.slug)}`; return `<a class="writing-row" href="${escapeHtml(href)}" data-route="article" data-slug="${escapeHtml(article.slug)}"><time>${escapeHtml(payload.revision || projection.sourceRevision)}</time><div><strong class="row-title">${escapeHtml(payload.title)}</strong><p>${escapeHtml(payload.thesis)} · 来源 ${escapeHtml(projection.sourceRevision)}${articleProjectionStale(article) ? ' · 当前有更新' : ''}</p></div><small>ESSAY</small></a>`; }).join('')}</div><div class="projection-note">公开内容来自已批准的投影；Desk 只读取冻结快照，不回写 Workbench。</div>` : `<div class="index-empty"><div class="empty-inner"><div class="empty-mark" aria-hidden="true">∅</div><h3>暂无已发布文章</h3><p>这里没有草稿、审阅或私有任务。等一份内容通过批准并完成公开投影后，排版行会从这里开始。</p></div></div>`}
      </section></div>`;
  }

  function renderArticle() {
    const article = publicArticleBySlug(store.routeSlug);
    if (!article) {
      return `<div class="content-grid is-index"><aside class="rail"><span class="kicker">DESK / ARTICLE</span><h1>文章尚未公开</h1><p class="rail-sub">公开页只读取已激活的投影。</p></aside><section class="content" aria-labelledby="articleEmptyHeading"><header class="index-header"><div><div class="breadcrumb">/writing/${escapeHtml(store.routeSlug || '[slug]')} · DESK</div><h2 id="articleEmptyHeading">暂无可见文章</h2></div><p>草稿和审阅状态属于私有工作层，不会因为猜测路由而泄漏。</p></header><div class="index-empty"><div class="empty-inner"><div class="empty-mark" aria-hidden="true">∅</div><h3>公开投影尚未激活</h3><p><a href="#writing" data-route="writing">返回写作索引</a>，或由作者在私有工作台完成批准与投影。</p></div></div></section></div>`;
    }
    const projection = activeProjection(article);
    const payload = projection.payload;
    const stale = articleProjectionStale(article);
    return `<div class="content-grid"><aside class="rail" aria-label="文章目录"><span class="kicker">DESK / ARTICLE</span><h1>文章结构</h1><ol class="toc-list"><li><button class="toc-link is-active" type="button" data-anchor="articleIntro" aria-current="location"><span class="tab-number">01</span><span>问题与论点</span></button></li><li><button class="toc-link" type="button" data-anchor="articleBody"><span class="tab-number">02</span><span>正文排版</span></button></li><li><button class="toc-link" type="button" data-anchor="articleRevision"><span class="tab-number">03</span><span>修订与引用</span></button></li></ol><div class="rail-note"><b>版本绑定</b>公开页面读取 ${escapeHtml(projection.sourceRevision)}，不会静默跟随私有草稿变化。</div></aside>
      <section class="content" aria-labelledby="articleHeading"><header class="content-header" id="articleIntro"><div class="breadcrumb">/writing/${escapeHtml(article.slug)} · DESK</div><div class="question">${escapeHtml(payload.question)}</div><h2 id="articleHeading">${escapeHtml(payload.title)}</h2><p class="thesis">${escapeHtml(payload.thesis)}</p><div class="meta-row"><span>PUBLIC PROJECTION</span><span>${escapeHtml(projection.sourceRevision)}</span><span>合成阅读结构</span><span>${stale ? '公开版本仍可读 · 有待重投影更新' : '已批准版本'}</span></div><div class="fixture-strip"><i class="dot" aria-hidden="true"></i><span>SYNTHETIC PUBLIC PROJECTION</span><span>只展示冻结公开快照；不包含 raw、agent_note 或私有备注。</span></div></header><article class="article-body" id="articleBody">${bodyBlocks(payload.body)}<div class="callout">公开边界：release 与 Desk projection 分开记录；这条页面只读取已批准、已投影的版本。</div><h3 id="articleRevision">修订、引用与回看</h3><p>当前公开版本：${escapeHtml(payload.revision || projection.sourceRevision)}。后续修订会先进入私有审阅，再由作者显式投影。</p></article></section>
      <aside class="context" aria-label="文章语境"><div class="context-group"><h3>THESIS</h3><p>${escapeHtml(payload.thesis)}</p></div><div class="context-group"><h3>QUESTION</h3><p>${escapeHtml(payload.question)}</p></div><div class="context-group"><h3>MATURITY</h3>${statusChip(stale ? 'stale' : 'approved', stale ? '公开版本待更新' : '已批准版本')}</div><div class="context-group"><h3>REVISION</h3><p>${escapeHtml(projection.sourceRevision)} · 来源版本绑定</p></div><div class="context-group"><h3>BACKLINKS</h3><p>暂无公开引用数据。</p></div></aside></div>`;
  }

  function renderPlan() {
    const projection = selectedPlanProjection();
    const status = planProjectionStatus();
    if (!projection || !['active', 'stale'].includes(status)) {
      const wording = status === 'withdrawn' ? '公开规划已撤回' : status === 'superseded' ? '公开规划已被新快照替代' : '暂无公开规划快照';
      return `<div class="content-grid is-index"><aside class="rail"><span class="kicker">DESK / PLAN</span><h1>规划</h1><p class="rail-sub">只展示已批准快照。</p></aside><section class="content" aria-labelledby="planHeading"><header class="index-header"><div><div class="breadcrumb">/plan · DESK</div><h2 id="planHeading">规划</h2></div><p>经济与人生规划仍由独立来源域提供，公开面只读取字段级投影。</p></header><div class="index-empty"><div class="empty-inner"><div class="empty-mark" aria-hidden="true">∅</div><h3>${wording}</h3><p>私有字段、原始金额和审阅备注不会出现在这里。</p></div></div></section></div>`;
    }
    const fields = publicPlanPayload().filter((field) => {
      const source = store.plan.snapshot.fields.find((item) => item.id === field.id);
      return source?.visibility === 'public';
    });
    if (!fields.length) {
      return `<div class="content-grid is-index"><aside class="rail"><span class="kicker">DESK / PLAN</span><h1>规划</h1><p class="rail-sub">公开字段已撤回。</p></aside><section class="content" aria-labelledby="planHeading"><header class="index-header"><div><div class="breadcrumb">/plan · DESK</div><h2 id="planHeading">规划</h2></div><p>当前公开 allowlist 已没有可见字段。</p></header><div class="index-empty"><div class="empty-inner"><div class="empty-mark" aria-hidden="true">∅</div><h3>公开字段已撤回</h3><p>作者需要重新选择字段并生成新的 projection。</p></div></div></section></div>`;
    }
    return `<div class="content-grid is-index"><aside class="rail"><span class="kicker">DESK / PLAN</span><h1>规划</h1><p class="rail-sub">字段级显式公开的只读快照。</p><div class="rail-note"><b>版本绑定</b>${escapeHtml(projection.sourceRevision)} · 只读公开投影</div></aside><section class="content" aria-labelledby="planHeading"><header class="index-header"><div><div class="breadcrumb">/plan · DESK</div><h2 id="planHeading">规划</h2></div><p>这里显示公开字段，不展示原始财务记录，也不把 Workbench 的任务和周计划混入规划。</p></header><div class="plan-list">${fields.map((field) => `<div class="plan-row"><div><strong>${escapeHtml(LEDGER_LABELS[field.id])}</strong><small>unit: ${escapeHtml(field.unit)} · source: ${escapeHtml(projection.sourceRevision)}</small></div><div class="plan-value">${escapeHtml(field.value)}</div></div>`).join('')}</div><div class="projection-note">FIELD-EXPLICIT PROJECTION · ${fields.length} 个字段 · 来源版本 ${escapeHtml(projection.sourceRevision)}${status === 'stale' ? ' · 当前策略已有更新，公开仍读取旧快照' : ''}</div></section></div>`;
  }

  function workbenchHeader(route, question, title, lede, meta) {
    return `<header class="content-header"><div class="breadcrumb">/workbench/${route} · WORKBENCH</div><div class="question">${escapeHtml(question)}</div><h2 id="workbenchHeading">${escapeHtml(title)}</h2><p class="lede">${escapeHtml(lede)}</p><div class="meta-row">${meta.map((item) => `<span>${escapeHtml(item)}</span>`).join('')}</div></header>`;
  }

  function renderWorkbench() {
    const root = $('#workbenchContent');
    if (!root) return;
    if (!ROLE_IDS.has(store.role) || store.role === 'visitor') {
      root.innerHTML = `<div class="desk-shell"><div class="denied-panel" aria-labelledby="deniedHeading"><span class="kicker">WORKBENCH / PRIVATE</span><h1 id="deniedHeading">需要私有角色</h1><p>这是一个结构化的鉴权拒绝状态。访客不会收到任务、周计划、项目、草稿、审阅或审计内容。</p><div class="denied-rule"></div><p class="drawer-copy">当前为模拟角色，不是真实登录。打开“演示”切换为作者或 Agent，继续验证工作流边界。</p><button class="action-button primary" type="button" data-action="open-drawer">打开演示角色</button></div></div>`;
      return;
    }
    const tabs = FIXTURE.views.map((view) => {
      const meta = view.id === 'week' ? countTasks('doing') + countTasks('waiting') + countTasks('blocked') : view.id === 'tasks' ? countTasks() : view.id === 'projects' ? store.workbench.projects.filter((project) => !project.archived).length : reviewPendingCount();
      return `<button class="workbench-tab" type="button" data-workbench-view="${view.id}" aria-current="${store.workbench.view === view.id}"><span class="tab-number">${view.number}</span><span>${view.label}</span><span class="tab-meta">${meta}</span></button>`;
    }).join('');
    root.innerHTML = `<div class="desk-shell"><header class="workbench-topbar"><button class="brand" type="button" data-route="window" aria-label="回到 Window 首页"><span class="brand-mark" aria-hidden="true"><i></i><i></i><i></i><i></i></span>OPENBLOG <span class="workbench-label">/ WORKBENCH</span></button><div class="workbench-tools"><span class="private-badge">PRIVATE / SIMULATED ROLE</span><button class="desk-tool" type="button" data-action="open-drawer">演示</button></div></header><div class="workbench-layout"><aside class="rail" aria-label="工作台导航"><span class="kicker">DESK / WORKBENCH</span><h1>工作台</h1><p class="rail-sub">${ROLE_LABELS[store.role]} · 结构 fixture · 页面内存</p><nav class="workbench-nav" aria-label="工作台视图">${tabs}</nav><div class="rail-note"><b>读法</b>左侧切换视图，主列使用发丝线排版；右侧只放边界、内存状态和操作记录。</div></aside><section class="content">${renderWorkbenchPanel()}</section><aside class="context" aria-label="私有边界与内存状态">${renderContextMarkup()}</aside></div></div>`;
  }

  function renderWorkbenchPanel() {
    if (store.workbench.view === 'week') return renderWeekPanel();
    if (store.workbench.view === 'tasks') return renderTasksPanel();
    if (store.workbench.view === 'projects') return renderProjectsPanel();
    return renderReviewPanel();
  }

  function renderWeekPanel() {
    const tasks = store.workbench.tasks.filter((task) => !task.archived);
    const focus = store.workbench.week.focusTaskIds.map((id) => taskById(id)).filter(Boolean);
    const days = store.workbench.week.days;
    return `${workbenchHeader('week', '本周需要先看什么？', '本周', '周区间、焦点和日程都可以在这里调整；任务状态变化会回写到项目进度。', [store.workbench.week.range, `${focus.length} FOCUS TASKS`, 'MEMORY ONLY'])}<div class="metrics"><div class="metric"><b>${tasks.filter((task) => task.status === 'doing').length}</b><span>进行中任务</span></div><div class="metric"><b>${tasks.filter((task) => task.status === 'waiting').length}</b><span>等待任务</span></div><div class="metric"><b>${tasks.filter((task) => task.status === 'blocked').length}</b><span>阻塞任务</span></div><div class="metric"><b>${reviewPendingCount()}</b><span>待审条目</span></div></div><section class="block"><div class="block-head"><h3>本周焦点</h3><span>FOCUS / EDITABLE</span></div><div class="focus-toolbar"><select data-focus-add aria-label="选择要加入本周焦点的任务" ${store.role === 'author' ? '' : 'disabled'}><option value="">选择任务加入焦点</option>${tasks.filter((task) => !store.workbench.week.focusTaskIds.includes(task.id)).map((task) => `<option value="${task.id}">${escapeHtml(task.code)} · ${escapeHtml(task.title)}</option>`).join('')}</select><button class="action-button" type="button" data-action="add-focus" ${store.role === 'author' ? '' : 'disabled'}>加入焦点</button></div><div class="focus-list">${focus.length ? focus.map((task, index) => `<article class="focus-row"><div class="focus-index">${String(index + 1).padStart(2, '0')}</div><div><h3>${escapeHtml(task.title)}</h3><p>${escapeHtml(projectById(task.projectId)?.name || '未关联项目')} · ${escapeHtml(task.nextStep || task.acceptance)}</p></div>${statusChip(task.status, TASK_STATUS_LABELS[task.status])}<button class="icon-action" type="button" data-focus-remove="${task.id}" aria-label="移出焦点" ${store.role === 'author' ? '' : 'disabled'}>−</button></article>`).join('') : '<div class="empty-state">尚未设置本周焦点。</div>'}</div></section><section class="block"><div class="block-head"><h3>一周结构</h3><span>RANGE / STRUCTURE</span></div><div class="week-grid">${days.map((day) => `<div class="week-day"><b>${escapeHtml(day.label)}</b><select data-day-assign="${day.id}" aria-label="${escapeHtml(day.label)}安排" ${store.role === 'author' ? '' : 'disabled'}><option value="">${escapeHtml(day.slot)}</option>${tasks.map((task) => `<option value="${task.id}" ${day.taskId === task.id ? 'selected' : ''}>${escapeHtml(task.code)} · ${escapeHtml(task.title)}</option>`).join('')}</select>${day.taskId && taskById(day.taskId) ? `<span class="day-task">${escapeHtml(taskById(day.taskId).code)} · ${escapeHtml(taskById(day.taskId).title)}</span>` : '<span class="day-empty">未安排</span>'}</div>`).join('')}</div><p class="block-note">日槽只引用私有任务，不会把任务标题或项目进度投影到公开 Desk。</p></section>`;
  }

  function renderTaskForm(task) {
    const isNew = !task;
    const item = task || { id: '', title: '', projectId: store.workbench.projects.find((project) => !project.archived)?.id || '', status: 'todo', owner: '角色占位', due: '日期占位', priority: '中', nextStep: '', acceptance: '', blockedReason: '' };
    if (store.role !== 'author') {
      return `<div class="read-only-source"><div class="form-heading"><div><span class="kicker">TASK / READ ONLY</span><h3>${escapeHtml(item.title || '未选择任务')}</h3></div><button class="icon-action" type="button" data-action="close-task-editor" aria-label="关闭任务详情">×</button></div><p>${escapeHtml(projectById(item.projectId)?.name || '未关联项目')} · ${escapeHtml(item.nextStep || '暂无下一步')}</p><p class="source-note">Agent 可以读取任务结构，但不能直接改变私有执行状态。</p></div>`
    }
    const selectedProject = projectById(item.projectId);
    const projectOptions = store.workbench.projects.filter((project) => !project.archived || project.id === item.projectId).map((project) => `<option value="${project.id}" ${project.id === item.projectId ? 'selected' : ''} ${project.archived ? 'aria-disabled="true"' : ''}>${escapeHtml(project.code)} · ${escapeHtml(project.name)}${project.archived ? ' · 已归档' : ''}</option>`).join('');
    return `<form class="editor-form" data-form="task" data-form-key="task-${escapeHtml(item.id || 'new')}"><div class="form-heading"><div><span class="kicker">${isNew ? 'NEW TASK' : escapeHtml(item.code)}</span><h3>${isNew ? '新建任务' : '编辑任务'}</h3></div><button class="icon-action" type="button" data-action="close-task-editor" aria-label="关闭任务编辑">×</button></div><input type="hidden" name="id" value="${escapeHtml(item.id)}"><div class="form-grid"><label><span>任务标题</span><input name="title" value="${escapeHtml(item.title)}" required></label><label><span>所属项目</span><select name="projectId">${projectOptions}</select>${selectedProject?.archived ? '<small class="source-note">当前任务仍关联已归档项目；请先恢复项目或重新分配后保存。</small>' : ''}</label><label><span>状态</span><select name="status">${Object.entries(TASK_STATUS_LABELS).filter(([key]) => key !== 'all').map(([key, label]) => `<option value="${key}" ${key === item.status ? 'selected' : ''}>${label}</option>`).join('')}</select></label><label><span>优先级</span><input name="priority" value="${escapeHtml(item.priority)}"></label><label><span>期限</span><input name="due" value="${escapeHtml(item.due)}"></label><label><span>负责人</span><input name="owner" value="${escapeHtml(item.owner)}"></label><label class="full"><span>下一步</span><input name="nextStep" value="${escapeHtml(item.nextStep)}"></label><label class="full"><span>验收标准</span><textarea name="acceptance" rows="3">${escapeHtml(item.acceptance)}</textarea></label><label class="full"><span>阻塞原因（阻塞状态必填）</span><textarea name="blockedReason" rows="2">${escapeHtml(item.blockedReason)}</textarea></label></div><div class="form-actions"><button class="action-button primary" type="submit">保存任务</button>${isNew ? '' : `<button class="action-button danger" type="button" data-action="archive-task" data-task-id="${escapeHtml(item.id)}">归档任务</button>`}</div></form>`;
  }

  function renderTasksPanel() {
    const filter = store.workbench.taskFilter;
    const tasks = store.workbench.tasks.filter((task) => !task.archived);
    const visible = filter === 'all' ? tasks : tasks.filter((task) => task.status === filter);
    const selected = store.workbench.selectedTaskId ? taskById(store.workbench.selectedTaskId) : null;
    const counts = Object.fromEntries(Object.keys(TASK_STATUS_LABELS).map((key) => [key, countTasks(key)]));
    return `${workbenchHeader('tasks', '哪些任务需要先处理？', '任务', '任务可以编辑、推进、阻塞和归档；项目进度与周计划从同一份私有任务集合派生。', [`${tasks.length} TASKS`, '6 FILTER STATES', 'MEMORY ONLY'])}<div class="panel-toolbar"><button class="action-button primary" type="button" data-action="new-task" ${store.role === 'author' ? '' : 'disabled'}>新建任务</button>${selected ? '<span class="selection-note">正在编辑选中任务</span>' : '<span class="selection-note">选择一行查看详情</span>'}</div><div class="filter-bar">${Object.entries(TASK_STATUS_LABELS).map(([key, label]) => `<button class="filter" type="button" data-task-filter="${key}" aria-pressed="${filter === key}">${label}<span class="filter-count">${counts[key]}</span></button>`).join('')}</div><p class="filter-summary">显示 ${visible.length} / ${tasks.length} 条任务 · 筛选只改内存</p><div class="task-list">${visible.length ? visible.map((task) => `<article class="task-row ${selected?.id === task.id ? 'is-selected' : ''}"><button class="entity-select" type="button" data-task-select="${task.id}" aria-label="查看 ${escapeHtml(task.code)}"><span class="task-id">${escapeHtml(task.code)}</span></button><div><button class="entity-title" type="button" data-task-select="${task.id}"><h3>${escapeHtml(task.title)}</h3></button><p>${escapeHtml(projectById(task.projectId)?.name || '未关联项目')} · ${escapeHtml(task.nextStep || task.acceptance)}</p>${projectById(task.projectId) ? `<button class="inline-button project-jump" type="button" data-project-select="${escapeHtml(task.projectId)}" aria-label="打开 ${escapeHtml(projectById(task.projectId).name)} 项目详情">查看项目</button>` : ''}</div><dl class="task-meta"><div><dt>负责</dt><dd>${escapeHtml(task.owner)}</dd></div><div><dt>期限</dt><dd>${escapeHtml(task.due)}</dd></div><div><dt>优先级</dt><dd>${escapeHtml(task.priority)}</dd></div></dl><div class="task-state-cell">${statusChip(task.status, TASK_STATUS_LABELS[task.status])}</div></article>`).join('') : '<div class="empty-state">当前筛选下没有任务。</div>'}</div>${selected || store.ui.taskEditor === 'new' ? renderTaskForm(store.ui.taskEditor === 'new' ? null : selected) : ''}`;
  }

  function renderProjectForm(project) {
    const isNew = !project;
    const item = project || { id: '', name: '', summary: '', phase: '', nextStep: '', owner: '角色占位', status: 'active' };
    if (store.role !== 'author') {
      const progress = project ? projectProgress(project.id) : { done: 0, total: 0 };
      return `<div class="read-only-source"><div class="form-heading"><div><span class="kicker">PROJECT / READ ONLY</span><h3>${escapeHtml(item.name || '未选择项目')}</h3></div><button class="icon-action" type="button" data-action="close-project-editor" aria-label="关闭项目详情">×</button></div><p>${escapeHtml(item.phase || '')} · ${escapeHtml(item.nextStep || '')}</p><p>${escapeHtml(item.summary || '')} · 完成 ${progress.done} / ${progress.total} 个关联任务</p><p class="source-note">Agent 可以读取项目结构，但不能改变私有执行状态。</p></div>`;
    }
    if (item.archived) return `<div class="read-only-source"><div class="form-heading"><div><span class="kicker">PROJECT / ARCHIVED</span><h3>${escapeHtml(item.name || '已归档项目')}</h3></div><button class="icon-action" type="button" data-action="close-project-editor" aria-label="关闭项目详情">×</button></div><p>${escapeHtml(item.summary || '')}</p><p class="source-note">该项目已归档，不能继续编辑或挂载新任务。</p></div>`;
    return `<form class="editor-form" data-form="project" data-form-key="project-${escapeHtml(item.id || 'new')}"><div class="form-heading"><div><span class="kicker">${isNew ? 'NEW PROJECT' : escapeHtml(item.code)}</span><h3>${isNew ? '新建项目' : '编辑项目'}</h3></div><button class="icon-action" type="button" data-action="close-project-editor" aria-label="关闭项目编辑">×</button></div><input type="hidden" name="id" value="${escapeHtml(item.id)}"><div class="form-grid"><label><span>项目名称</span><input name="name" value="${escapeHtml(item.name)}" required></label><label><span>状态</span><select name="status">${Object.entries(PROJECT_STATUS_LABELS).map(([key, label]) => `<option value="${key}" ${key === item.status ? 'selected' : ''}>${label}</option>`).join('')}</select></label><label><span>阶段</span><input name="phase" value="${escapeHtml(item.phase)}"></label><label><span>负责人</span><input name="owner" value="${escapeHtml(item.owner)}"></label><label class="full"><span>下一节点</span><input name="nextStep" value="${escapeHtml(item.nextStep)}"></label><label class="full"><span>摘要</span><textarea name="summary" rows="3">${escapeHtml(item.summary)}</textarea></label></div><div class="form-actions"><button class="action-button primary" type="submit">保存项目</button>${isNew ? '' : `<button class="action-button danger" type="button" data-action="archive-project" data-project-id="${escapeHtml(item.id)}">归档项目</button>`}</div></form>`;
  }

  function renderProjectsPanel() {
    const projects = store.workbench.projects.filter((project) => !project.archived);
    const selected = store.workbench.selectedProjectId ? projectById(store.workbench.selectedProjectId) : null;
    return `${workbenchHeader('projects', '哪些项目需要继续推进？', '项目', '项目阶段和下一节点可以编辑，进度由关联任务完成数派生，不使用假百分比。', [`${projects.length} PROJECTS`, 'DERIVED PROGRESS', 'MEMORY ONLY'])}<div class="panel-toolbar"><button class="action-button primary" type="button" data-action="new-project" ${store.role === 'author' ? '' : 'disabled'}>新建项目</button>${selected ? '<span class="selection-note">正在编辑选中项目</span>' : '<span class="selection-note">选择一行查看详情</span>'}</div><div class="project-list">${projects.map((project) => { const progress = projectProgress(project.id); return `<article class="project-row ${selected?.id === project.id ? 'is-selected' : ''}"><button class="entity-select" type="button" data-project-select="${project.id}" aria-label="查看 ${escapeHtml(project.code)}"><span class="project-id">${escapeHtml(project.code)}</span></button><div><button class="entity-title" type="button" data-project-select="${project.id}"><h3>${escapeHtml(project.name)}</h3></button><p>${escapeHtml(project.summary)} · 下一步：${escapeHtml(project.nextStep)}</p><div class="project-scale" role="img" aria-label="已完成 ${progress.done} / ${progress.total} 个关联任务">${Array.from({ length: Math.max(progress.total, 1) }, (_, index) => `<i class="${index < progress.done ? 'is-filled' : ''}"></i>`).join('')}</div><span class="project-scale-note">PROGRESS / ${progress.done} OF ${progress.total} TASKS</span></div><dl class="project-meta"><div><dt>阶段</dt><dd>${escapeHtml(project.phase)}</dd></div><div><dt>负责</dt><dd>${escapeHtml(project.owner)}</dd></div><div><dt>任务</dt><dd>${progress.total} 条关联任务</dd></div></dl><div class="project-state-cell">${statusChip(project.status, PROJECT_STATUS_LABELS[project.status])}</div></article>`; }).join('')}</div>${selected || store.ui.projectEditor === 'new' ? renderProjectForm(store.ui.projectEditor === 'new' ? null : selected) : ''}<p class="block-note">项目进度显示关联任务完成数 / 总任务数；原始任务不会进入公开 Desk。</p>`;
  }

  function articleSelectMarkup() {
    const isNew = store.ui.articleEditor === 'new';
    return `<label class="compact-field"><span>当前文章</span><select data-article-select ${isNew ? 'disabled' : ''}>${isNew ? '<option>新文章草稿</option>' : store.articles.filter((article) => !article.archived).map((article) => `<option value="${article.id}" ${article.id === store.selectedArticleId ? 'selected' : ''}>${escapeHtml(article.slug)} · ${escapeHtml(currentRaw(article)?.title || '未命名')}</option>`).join('')}</select></label><button class="action-button" type="button" data-action="new-article" ${store.role === 'author' ? '' : 'disabled'}>新建文章</button>${isNew ? '<button class="action-button" type="button" data-action="cancel-new-article">取消新建</button>' : ''}`;
  }

  function renderArticleEditor(article, raw) {
    if (store.role !== 'author') return `<div class="read-only-source"><span class="kicker">RAW / READ ONLY</span><p>${escapeHtml(raw?.title || '暂无 raw')}</p><p class="source-note">作者负责修改 raw；Agent 只能基于当前 raw 生成 draft。</p></div>`;
    if (store.ui.articleEditor === 'new') raw = { title: '', question: '', thesis: '', body: '' };
    return `<form class="editor-form" data-form="article" data-form-key="article-${store.ui.articleEditor === 'new' ? 'new' : escapeHtml(article?.id || 'current')}"><div class="form-heading"><div><span class="kicker">${store.ui.articleEditor === 'new' ? 'NEW ARTICLE' : 'RAW / IMMUTABLE REVISION'}</span><h3>${store.ui.articleEditor === 'new' ? '新建文章' : '编辑当前 raw'}</h3></div></div><input type="hidden" name="id" value="${store.ui.articleEditor === 'new' || !article ? '' : escapeHtml(article.id)}"><div class="form-grid"><label class="full"><span>标题</span><input name="title" value="${escapeHtml(raw?.title)}" required></label><label class="full"><span>问题</span><input name="question" value="${escapeHtml(raw?.question)}"></label><label class="full"><span>论点</span><textarea name="thesis" rows="2">${escapeHtml(raw?.thesis)}</textarea></label><label class="full"><span>正文</span><textarea name="body" rows="9" required>${escapeHtml(raw?.body)}</textarea></label></div><div class="form-actions"><button class="action-button primary" type="submit">${store.ui.articleEditor === 'new' ? '创建 raw' : '保存新 raw revision'}</button>${store.ui.articleEditor !== 'new' && article ? `<button class="action-button danger" type="button" data-action="archive-article" data-article-id="${article.id}" ${activeProjection(article) ? 'disabled' : ''}>归档文章</button>` : ''}</div><p class="form-note">保存不会覆盖历史 raw；每次保存会生成新的不可变 revision，并要求 Agent 重新生成 draft。</p></form>`;
  }

  function renderDraftEditor(article, draft) {
    if (store.role !== 'agent') return '';
    if (!draft) return '<div class="empty-state">尚未生成 draft。Agent 可以从当前 raw 生成 L0/L1 结构草稿。</div>';
    return `<form class="editor-form" data-form="draft" data-form-key="draft-${escapeHtml(article?.id || 'current')}"><div class="form-heading"><div><span class="kicker">DRAFT / L0-L1</span><h3>Agent 草稿编辑</h3></div><span class="source-note">绑定 raw：${escapeHtml(draft.parentHash || '')}</span></div><div class="form-grid"><label class="full"><span>标题</span><input name="title" value="${escapeHtml(draft.title)}" required></label><label class="full"><span>问题</span><input name="question" value="${escapeHtml(draft.question)}"></label><label class="full"><span>论点</span><textarea name="thesis" rows="2">${escapeHtml(draft.thesis)}</textarea></label><label class="full"><span>正文</span><textarea name="body" rows="8" required>${escapeHtml(draft.body)}</textarea></label><label class="full"><span>Agent note</span><textarea name="agentNote" rows="2">${escapeHtml(draft.agentNote)}</textarea></label></div><div class="form-actions"><button class="action-button primary" type="submit">保存 draft revision</button></div></form>`;
  }

  function renderGateNote(article) {
    const draft = currentDraft(article);
    const release = currentRelease(article);
    const projection = activeProjection(article);
    const status = article.review.status;
    const latest = latestProjection(article);
    if (!draft) {
      if (status === 'needs_draft' && latest?.status === 'withdrawn') return '门禁：公开投影已撤回；需要 Agent 生成新的 draft revision，重新审阅后才能发布下一版。';
      return status === 'needs_draft' ? '门禁：当前公开版本已回滚或原稿已更新，需要 Agent 生成新的 draft revision。' : '门禁：尚未生成 draft。Agent 需要先提交 L0/L1 结构整理。';
    }
    if (status === 'pending') return '门禁：L2 尚未批准。尝试发布只会记录阻断 audit，不生成 release。';
    if (status === 'returned') return `门禁：当前 draft 已退回。${escapeHtml(article.review.reason || '需要补充修改')}；必须生成新的 draft revision 后重新审阅。`;
    if (status === 'needs_draft') return '门禁：当前 raw 已更新，旧 draft 不再有效。需要新的 draft revision。';
    if (!currentDraftIsApproved(article)) return '门禁：批准绑定与当前 draft hash 不一致，发布被阻断。';
    if (release && !projection) return `release ${escapeHtml(release.id)} 已存在，但尚未投影到 Desk。公开内容仍不可见。`;
    if (projection) return `已公开：${escapeHtml(projection.sourceRevision)} 已投影到 Desk${articleProjectionStale(article) ? '；当前有更新版本，公开仍读取旧冻结快照' : ''}。`;
    return '门禁：L2 已批准。Agent 可以发布 release，作者可以继续投影到 Desk。';
  }

  function renderArticlePipeline() {
    const article = selectedArticle();
    if (!article) {
      return `<section class="review-detail"><header class="review-detail-header"><div><h3>内容链</h3><p>先由作者创建 raw，再进入 Agent 草稿与作者审阅。</p></div>${statusChip('none', 'NO ARTICLE')}</header><div class="review-detail-body"><div class="article-selector">${articleSelectMarkup()}</div>${renderArticleEditor(null, null)}</div></section>`;
    }
    const raw = currentRaw(article);
    const draft = currentDraft(article);
    const release = currentRelease(article);
    const projection = activeProjection(article);
    const stale = articleProjectionStale(article);
    const review = article.review;
    const canApprove = can('review.approve') && Boolean(draft) && review.status === 'pending';
    const canPublish = can('release.publish') && currentDraftIsApproved(article);
    const selectedRelease = store.ui.selectedReleaseId ? article.releases.find((item) => item.id === store.ui.selectedReleaseId) || release : release;
    const canProject = can('projection.article') && selectedRelease?.status === 'published' && review.status !== 'needs_draft';
    const canRollback = can('article.rollback') && Boolean(projection && previousPublishedRelease(article, projection));
    const returnReason = store.role === 'author' ? `<label class="reason-field"><span>退回理由（作者退回时必填）</span><textarea data-article-return-reason rows="2" placeholder="说明需要 Agent 重新生成什么"></textarea></label>` : '';
    return `<section class="review-detail" aria-labelledby="reviewDetailHeading"><header class="review-detail-header"><div><h3 id="reviewDetailHeading">${escapeHtml(article.id)} · 内容链</h3><p>raw → L0/L1 draft → L2 批准 → release → Desk projection</p></div><div class="status-stack">${statusChip(review.status, REVIEW_STATUS_LABELS[review.status])}${release ? statusChip(release.status, RELEASE_STATUS_LABELS[release.status]) : ''}${projection ? statusChip(stale ? 'stale' : projection.status, PROJECTION_STATUS_LABELS[stale ? 'stale' : projection.status]) : statusChip('none', 'NO PROJECTION')}</div></header><div class="review-detail-body"><div class="article-selector">${articleSelectMarkup()}</div>${renderArticleEditor(article, raw)}${renderDraftEditor(article, draft)}${draft ? `<div class="revision-grid"><div class="revision-card"><h4>RAW / IMMUTABLE</h4><p>revision: ${escapeHtml(raw.revision)}<br>hash: ${escapeHtml(raw.hash)}<br>内容不可覆盖</p></div><div class="revision-card"><h4>DRAFT / ${escapeHtml(draft.revision)}</h4><p>hash: ${escapeHtml(draft.hash)}<br>parent: ${escapeHtml(draft.parentHash || raw.hash)}<br>agent_note: ${escapeHtml(draft.agentNote)}</p></div></div><div class="diff-box ${store.ui.diffOpen ? 'is-open' : ''}"><header><span>PREVIEW / DIFF</span><button class="inline-button" type="button" data-action="preview-diff">${store.ui.diffOpen ? '收起 diff' : '打开 diff'}</button></header>${store.ui.diffOpen ? `<pre><span class="minus">- ${escapeHtml(draft.diff.removed)}</span>\n<span class="plus">+ ${escapeHtml(draft.diff.added)}</span>\n<span class="plus">+ agent_note: ${escapeHtml(draft.agentNote)}</span></pre>` : '<p class="diff-closed">diff 默认折叠，打开后查看当前 draft 与 raw 的变化。</p>'}</div>` : ''}<div class="gate-note ${review.status === 'approved' && !release ? 'approved' : review.status === 'returned' || review.status === 'needs_draft' ? 'blocked' : release ? 'published' : ''}">${renderGateNote(article)}</div><div class="detail-actions">${store.role === 'agent' ? `<button class="action-button primary" type="button" data-action="prepare-draft">${draft ? '生成新 draft' : '生成 L0/L1 draft'}</button>` : ''}${store.role === 'author' ? `<button class="action-button primary" type="button" data-action="approve-review" ${canApprove ? '' : 'disabled'}>批准 L2</button><button class="action-button danger" type="button" data-action="return-review" ${draft && review.status === 'pending' ? '' : 'disabled'}>退回</button>` : '<button class="action-button" type="button" disabled>Agent 不能批准 L2</button>'}<button class="action-button primary" type="button" data-action="publish-release" ${can('release.publish') && draft ? '' : 'disabled'}>发布 release</button><label class="compact-field release-picker"><span>投影版本</span><select data-release-select ${article.releases.length ? '' : 'disabled'}>${article.releases.length ? article.releases.map((item) => `<option value="${item.id}" ${selectedRelease?.id === item.id ? 'selected' : ''} ${item.status === 'published' ? '' : 'disabled'}>${escapeHtml(item.revisionId)} · ${RELEASE_STATUS_LABELS[item.status]}</option>`).join('') : '<option>暂无 release</option>'}</select></label><button class="action-button primary" type="button" data-action="project-article" ${canProject && selectedRelease?.status === 'published' ? '' : 'disabled'}>投影到 Desk</button><button class="action-button danger" type="button" data-action="withdraw-article" ${can('projection.article.withdraw') && projection ? '' : 'disabled'}>撤回文章投影</button><button class="action-button danger" type="button" data-action="rollback-article" ${canRollback ? '' : 'disabled'}>${projection && previousPublishedRelease(article, projection) ? '回滚到上一版本' : '没有上一版本可回滚'}</button></div>${returnReason}<p class="review-help">${stale ? '当前有更新版本，但公开面仍保留旧冻结投影；作者可以选择重新投影。' : '角色切换只改变能力，不改变状态。Agent 可以生成与发布；L2 批准和公开投影需要作者。'}</p></div></section>`;
  }

  function renderReviewQueue() {
    return `<section class="block"><div class="block-head"><h3>结构审阅队列</h3><span>AUTHOR DECISION / FIXTURE</span></div><div class="review-list">${store.workbench.reviews.map((item) => { const project = projectById(item.projectId); const canDecide = can('review.queue') && item.status === 'pending'; return `<article class="review-row"><div class="review-id">${escapeHtml(item.code)}</div><div><div class="review-head"><h3>${escapeHtml(item.title)}</h3>${statusChip(item.status, REVIEW_STATUS_LABELS[item.status])}</div><p>${escapeHtml(project?.name || '未关联项目')} · ${escapeHtml(item.summary)}</p><p class="review-kind">类型：${escapeHtml(item.kind)} · 来源：${escapeHtml(item.id)} · 决定人：${escapeHtml(item.decidedBy || '待决定')}</p>${item.status === 'returned' ? `<p class="review-kind return-note">退回理由：${escapeHtml(item.reason || '未填写')}</p>` : ''}</div><div class="review-actions">${store.role === 'author' && item.status === 'pending' ? `<textarea class="queue-reason" data-review-reason="${item.id}" rows="2" aria-label="${escapeHtml(item.code)} 退回理由" placeholder="退回理由（退回时必填）"></textarea>` : ''}<button class="decision" type="button" data-review-id="${item.id}" data-review-decision="approved" ${canDecide ? '' : 'disabled'} aria-pressed="${item.status === 'approved'}">批准</button><button class="decision" type="button" data-review-id="${item.id}" data-review-decision="returned" ${canDecide ? '' : 'disabled'} aria-pressed="${item.status === 'returned'}">退回</button></div></article>`; }).join('')}</div><p class="review-help">结构队列属于作者终审；Agent 可以读取，但所有批准与退回决定都由作者完成。</p></section>`;
  }

  function renderLedgerPanel() {
    const projection = selectedPlanProjection();
    const status = planProjectionStatus();
    const canEdit = can('plan.write');
    const publicFields = store.plan.snapshot.fields.filter((field) => field.visibility === 'public');
    const note = status === 'withdrawn' ? '上一个 Plan projection 已撤回，重新投影会生成新记录。' : '投影前先检查 allowlist；私有字段不会进入公开 DOM。';
    return `<section class="ledger-panel" aria-labelledby="ledgerHeading"><header class="ledger-header"><div><h3 id="ledgerHeading">Ledger Snapshot / ${escapeHtml(store.plan.snapshot.id)}</h3><p>字段级显式公开。这里只演示版本、可见性和投影边界，不保存真实财务数据。</p></div>${statusChip(status, PROJECTION_STATUS_LABELS[status])}</header><div class="ledger-body"><div class="ledger-meta">source revision: ${escapeHtml(store.plan.snapshot.revision)} · policy: ${escapeHtml(store.plan.policyRevision)}</div><form class="plan-editor" data-form="plan">${store.plan.snapshot.fields.map((field) => `<div class="ledger-field"><div><strong>${escapeHtml(LEDGER_LABELS[field.id])}</strong><small>unit: ${escapeHtml(field.unit)} · ${field.visibility === 'public' ? '当前公开' : '当前私密'}</small></div>${canEdit ? `<input class="ledger-value-input" name="${field.id}" value="${escapeHtml(field.value)}" aria-label="${escapeHtml(LEDGER_LABELS[field.id])}值">` : `<span class="ledger-value">${field.visibility === 'public' ? escapeHtml(field.value) : '私密字段'}</span>`}<button class="visibility-button ${field.visibility === 'public' ? 'public' : ''}" type="button" data-ledger-toggle="${field.id}" aria-pressed="${field.visibility === 'public'}" ${canEdit ? '' : 'disabled'}>${field.visibility === 'public' ? '公开' : '私密'}</button></div>`).join('')}<div class="form-actions"><button class="action-button primary" type="submit" ${canEdit ? '' : 'disabled'}>保存快照字段</button></div></form><div class="projection-preview"><div class="block-head"><h3>公开 allowlist 预览</h3><span>${publicFields.length} FIELDS</span></div>${publicFields.length ? `<ul>${publicFields.map((field) => `<li><strong>${escapeHtml(LEDGER_LABELS[field.id])}</strong><span>${escapeHtml(field.value)}</span></li>`).join('')}</ul>` : '<p class="empty-state">当前没有公开字段，不能生成 projection。</p>'}</div><div class="snapshot-history"><div class="block-head"><h3>快照历史</h3><span>${store.plan.snapshotHistory.length} SNAPSHOTS</span></div><ul>${store.plan.snapshotHistory.slice().reverse().slice(0, 6).map((snapshot) => `<li><strong>${escapeHtml(snapshot.revision)}</strong><span>${escapeHtml(snapshot.policyRevision)} · ${snapshot.fields.filter((field) => field.visibility === 'public').length} 个公开字段</span></li>`).join('')}</ul></div><div class="ledger-note">${note}</div><div class="projection-actions"><button class="action-button primary" type="button" data-action="project-plan" ${can('plan.project') && publicFields.length ? '' : 'disabled'}>生成 Plan projection</button><button class="action-button danger" type="button" data-action="withdraw-plan" ${can('plan.withdraw') && projection && ['active', 'stale'].includes(status) ? '' : 'disabled'}>撤回 Plan projection</button></div>${projection && ['active', 'stale'].includes(status) ? `<div class="gate-note ${status === 'stale' ? 'blocked' : 'approved'}">当前公开字段：${projection.fieldAllowlist.map((id) => LEDGER_LABELS[id]).join('、')} · frozen source：${escapeHtml(projection.sourceRevision)}</div>` : ''}</div></section>`;
  }

  function renderReviewPanel() {
    const subview = store.workbench.reviewSubview;
    return `${workbenchHeader('review', '哪些变更需要作者决定？', '审阅与投影', '这里把文章编辑、Agent 草稿、发布门禁和 Plan 快照放在同一条私有状态链上。', [`${reviewPendingCount()} PENDING`, `ACTOR / ${ROLE_LABELS[store.role].toUpperCase()}`, 'NO FILES WRITTEN'])}<div class="workbench-subnav"><button class="subnav-button" type="button" data-review-subview="article" aria-pressed="${subview === 'article'}">内容审阅</button><button class="subnav-button" type="button" data-review-subview="ledger" aria-pressed="${subview === 'ledger'}">规划投影</button></div>${subview === 'ledger' ? renderLedgerPanel() : `${renderArticlePipeline()}${renderReviewQueue()}`}`;
  }

  function renderContextMarkup() {
    const article = selectedArticle();
    const projection = article ? activeProjection(article) : null;
    const last = store.audit[0];
    return `<div class="context-group"><h3>FIXTURE BOUNDARY</h3><span class="context-badge">PRIVATE STRUCTURE FIXTURE</span><p>NO REAL DATA / 不连接账号、项目、审阅或文件系统。</p><p class="context-note">角色：${ROLE_LABELS[store.role]} · route：${store.route}${store.routeSlug ? `/${escapeHtml(store.routeSlug)}` : ''}</p></div><div class="context-group"><h3>LIVE STATE</h3><div class="live-row"><span>当前视图</span><b>${VIEW_LABELS[store.workbench.view]}</b></div><div class="live-row"><span>任务筛选</span><b>${TASK_STATUS_LABELS[store.workbench.taskFilter]}</b></div><div class="live-row"><span>文章审阅</span><b>${article ? REVIEW_STATUS_LABELS[article.review.status] : '无文章'}</b></div><div class="live-row"><span>文章公开</span><b>${projection ? (articleProjectionStale(article) ? 'stale' : 'active') : 'none'}</b></div><div class="live-row"><span>Plan 投影</span><b>${planProjectionStatus()}</b></div><div class="live-row"><span>审计事件</span><b>${store.audit.length} 条</b></div><div class="live-row"><span>最近操作</span><b>${last ? `${escapeHtml(last.action)} · ${escapeHtml(last.result)}` : '尚无'}</b></div></div><div class="context-group"><h3>AUDIT / MEMORY</h3><ol class="audit">${store.audit.length ? store.audit.slice(0, 10).map((entry) => `<li><b>${escapeHtml(entry.actor)}</b> · ${escapeHtml(entry.action)} · ${escapeHtml(entry.result)}<br>${escapeHtml(entry.detail)}</li>`).join('') : '<li>尚无内存操作</li>'}</ol></div><div class="context-group"><h3>KEYBOARD / A11Y</h3><p>Tab 聚焦，Enter 或空格触发；状态变化通过 announcer 播报。</p><p>所有主要按钮与输入控件保持可见焦点和 44px 触达区。</p></div>`;
  }

  function focusDescriptor(element) {
    if (!element || !element.closest('#workbenchContent')) return null;
    const form = element.closest('form[data-form]');
    if (form) return { key: 'form', formKey: form.dataset.formKey || form.dataset.form, name: element.name || null };
    const keys = ['workbenchView', 'taskFilter', 'taskSelect', 'projectSelect', 'focusRemove', 'reviewSubview', 'ledgerToggle', 'reviewDecision', 'articleSelect', 'releaseSelect', 'dayAssign', 'focusAdd'];
    for (const key of keys) {
      if (element.dataset[key] !== undefined) return { key, value: element.dataset[key] };
    }
    if (element.dataset.action) return { key: 'action', value: element.dataset.action, taskId: element.dataset.taskId || null, projectId: element.dataset.projectId || null };
    return null;
  }

  function restoreWorkbenchFocus() {
    const descriptor = store.ui.focusSelector;
    if (!descriptor) return;
    const root = $('#workbenchContent');
    if (!root) return;
    let target = null;
    if (descriptor.key === 'form' || descriptor.key === 'formField') {
      const form = $$('form[data-form]', root).find((item) => (item.dataset.formKey || item.dataset.form) === descriptor.formKey);
      target = form && (descriptor.name ? form.elements[descriptor.name] : form.querySelector('input, select, textarea, button'));
    } else if (descriptor.key === 'action') {
      target = $$('[data-action]', root).find((item) => item.dataset.action === descriptor.value && (!descriptor.taskId || item.dataset.taskId === descriptor.taskId) && (!descriptor.projectId || item.dataset.projectId === descriptor.projectId));
    } else {
      const selector = {
        workbenchView: '[data-workbench-view]', taskFilter: '[data-task-filter]', taskSelect: '[data-task-select]',
        projectSelect: '[data-project-select]', focusRemove: '[data-focus-remove]', reviewSubview: '[data-review-subview]',
        ledgerToggle: '[data-ledger-toggle]', reviewDecision: '[data-review-decision]', articleSelect: '[data-article-select]',
        releaseSelect: '[data-release-select]', dayAssign: '[data-day-assign]', focusAdd: '[data-focus-add]'
      }[descriptor.key];
      if (selector) target = $$(selector, root).find((item) => descriptor.value === undefined || item.dataset[descriptor.key] === descriptor.value);
    }
    if (target && !target.disabled && typeof target.focus === 'function') target.focus({ preventScroll: true });
    store.ui.focusSelector = null;
  }

  function clearTransientForms() {
    store.ui.transient = { articleReturnReason: '', queueReasons: {}, forms: {} };
  }

  function clearTransientForm(formKey) {
    if (formKey && store.ui.transient?.forms) delete store.ui.transient.forms[formKey];
    store.ui.skipTransientCapture = true;
  }

  function captureTransientForms() {
    if (store.route !== 'workbench' || store.ui.skipTransientCapture) {
      store.ui.skipTransientCapture = false;
      return;
    }
    const root = $('#workbenchContent');
    if (!root) return;
    const forms = store.ui.transient?.forms || {};
    $$('form[data-form]', root).forEach((form) => {
      const key = form.dataset.formKey || form.dataset.form;
      forms[key] = Object.fromEntries(new FormData(form).entries());
    });
    const articleReason = $('[data-article-return-reason]', root);
    if (articleReason) store.ui.transient.articleReturnReason = articleReason.value;
    const queueReasons = store.ui.transient.queueReasons || {};
    $$('[data-review-reason]', root).forEach((field) => { queueReasons[field.dataset.reviewReason] = field.value; });
    store.ui.transient.forms = forms;
    store.ui.transient.queueReasons = queueReasons;
  }

  function restoreTransientForms() {
    const root = $('#workbenchContent');
    if (!root || !store.ui.transient) return;
    const forms = store.ui.transient.forms || {};
    $$('form[data-form]', root).forEach((form) => {
      const values = forms[form.dataset.formKey || form.dataset.form];
      if (!values) return;
      Object.entries(values).forEach(([name, value]) => {
        const field = form.elements[name];
        if (field && typeof field.value !== 'undefined') field.value = value;
      });
    });
    const articleReason = $('[data-article-return-reason]', root);
    if (articleReason && Object.prototype.hasOwnProperty.call(store.ui.transient, 'articleReturnReason')) articleReason.value = store.ui.transient.articleReturnReason;
    $$('[data-review-reason]', root).forEach((field) => {
      if (Object.prototype.hasOwnProperty.call(store.ui.transient.queueReasons || {}, field.dataset.reviewReason)) field.value = store.ui.transient.queueReasons[field.dataset.reviewReason];
    });
  }

  function renderApp(previousRoute = '', previousSlug = null) {
    const isSurface = routeIsSurface(store.route);
    const isWorkbench = store.route === 'workbench';
    const deskLayer = $('#deskLayer');
    const sceneLayer = $('#sceneLayer');
    const routeChanged = store.route !== previousRoute || store.routeSlug !== previousSlug;
    const preserveWorkbench = isWorkbench && previousRoute === 'workbench';
    const viewChanged = isWorkbench && store.ui.lastRenderedView !== null && store.ui.lastRenderedView !== store.workbench.view;
    if (preserveWorkbench) store.ui.focusSelector = focusDescriptor(document.activeElement);
    captureTransientForms();
    if (isSurface && sceneLayer.contains(document.activeElement)) document.activeElement.blur();
    if (!isSurface && deskLayer.contains(document.activeElement)) document.activeElement.blur();
    deskLayer.classList.toggle('is-open', isSurface);
    deskLayer.classList.toggle('is-workbench', isWorkbench);
    deskLayer.setAttribute('aria-hidden', String(!isSurface));
    deskLayer.inert = !isSurface;
    sceneLayer.classList.toggle('is-muted', isSurface && !isWorkbench);
    sceneLayer.setAttribute('aria-hidden', String(isSurface));
    sceneLayer.inert = isSurface;
    $('#sillLabel').hidden = isWorkbench;
    $('#sceneSill').hidden = isWorkbench;
    $('#deskTopbar').hidden = isWorkbench;
    $('#workbenchContent').hidden = !isWorkbench;
    $('#primaryContent').hidden = isWorkbench;
    if (isWorkbench) {
      renderWorkbench();
      restoreTransientForms();
    } else {
      renderPublicRoute();
      const privateRoot = $('#workbenchContent');
      if (privateRoot) {
        privateRoot.innerHTML = '';
        privateRoot.className = 'workbench-content';
      }
      store.ui.transient = { articleReturnReason: '', queueReasons: {}, forms: {} };
      store.ui.lastRenderedView = null;
    }
    if (routeChanged && isSurface) deskLayer.scrollTop = 0;
    if (isWorkbench && (routeChanged || viewChanged)) deskLayer.scrollTop = 0;
    updatePublicNav();
    renderDrawer();
    updateWindowState();
    if (isWorkbench) store.ui.lastRenderedView = store.workbench.view;
    document.title = ({ window: 'Openblog / Window', writing: 'Openblog / Desk / Writing', article: 'Openblog / Desk / Article', plan: 'Openblog / Desk / Plan', workbench: 'Openblog / Workbench / Private demo' })[store.route];
    if (isWorkbench && preserveWorkbench) {
      window.setTimeout(() => restoreWorkbenchFocus(), 0);
    } else if (isSurface && routeChanged) {
      window.setTimeout(() => focusRouteHeading(), isWorkbench ? 30 : reducedMotion.matches ? 0 : 240);
    } else if (store.route === 'window' && previousRoute && previousRoute !== 'window') {
      window.setTimeout(() => focusSceneHeading(), reducedMotion.matches ? 0 : 200);
    }
  }

  function focusRouteHeading() {
    if (store.ui.drawerOpen) return;
    const root = store.route === 'workbench' ? $('#workbenchContent') : $('#primaryContent');
    if (!root || root.hidden) return;
    const selectors = ['.index-header h2', '.content-header h2', '.denied-panel h1', '.rail h1'];
    const heading = selectors.map((selector) => root.querySelector(selector)).find(Boolean);
    if (heading) { heading.setAttribute('tabindex', '-1'); heading.focus({ preventScroll: true }); }
  }

  function focusSceneHeading() {
    if (store.ui.drawerOpen) return;
    const heading = $('#heroTitle');
    if (heading) { heading.setAttribute('tabindex', '-1'); heading.focus({ preventScroll: true }); }
  }

  function updatePublicNav() {
    const planVisible = planIsPublic();
    $('#scenePlanNav').hidden = !planVisible;
    $('#deskPlanNav').hidden = !planVisible;
    $$('[data-public-nav], #sceneTopbar [data-route="writing"], #sceneTopbar [data-route="plan"]').forEach((button) => {
      const current = button.dataset.route === store.route || (store.route === 'article' && button.dataset.route === 'writing');
      button.setAttribute('aria-current', current ? 'page' : 'false');
    });
  }

  function saveArticleForm(form) {
    if (!can('article.edit')) return deny('article.edit', form.elements.id.value || 'new', '只有作者可以编辑 raw');
    const values = Object.fromEntries(new FormData(form).entries());
    const title = normalize(values.title);
    const body = normalize(values.body);
    if (!title || !body) { toast('标题和正文不能为空'); return; }
    if (!values.id) {
      const id = `article-${String(nextSequence()).padStart(3, '0')}`;
      const article = makeArticle(id, title, nextSlug(title, store.articles));
      const raw = currentRaw(article);
      const rawIds = nextRevision('raw');
      Object.assign(raw, {
        id: rawIds.revision,
        revision: rawIds.revision,
        hash: rawIds.hash,
        title,
        question: normalize(values.question),
        thesis: normalize(values.thesis),
        body
      });
      article.currentRawId = raw.id;
      store.articles.push(article);
      store.selectedArticleId = id;
      store.ui.articleEditor = 'current';
      record('article.create', id, 'accepted', `created ${article.slug}`, raw.hash, null, clone(raw));
      toast('文章 raw 已创建');
    } else {
      const article = articleById(values.id);
      if (!article) return;
      const oldRaw = currentRaw(article);
      const ids = nextRevision('raw');
      const raw = { id: ids.revision, kind: 'raw', revision: ids.revision, hash: ids.hash, parentId: oldRaw.id, title, slug: article.slug, question: normalize(values.question), thesis: normalize(values.thesis), body, createdBy: 'author', createdAt: nowIso(), immutable: true };
      article.revisions.push(raw);
      article.currentRawId = raw.id;
      article.currentDraftId = null;
      article.review = { status: 'needs_draft', boundDraftHash: null, actor: null, reason: 'raw 已更新', sourceRevision: raw.hash };
      article.updatedAt = raw.createdAt;
      record('article.raw.update', article.id, 'accepted', `new immutable ${raw.revision}`, raw.hash, oldRaw.hash, raw.hash);
      toast(`已保存 ${raw.revision}；需要 Agent 重新生成 draft`);
    }
    store.workbench.view = 'review';
    clearTransientForm(form.dataset.formKey || form.dataset.form);
    renderApp('workbench');
  }

  function saveDraftForm(form) {
    if (!can('draft.edit')) return deny('draft.edit', selectedArticle()?.id || 'none', '只有 Agent 可以编辑 draft');
    const article = selectedArticle();
    const raw = currentRaw(article);
    const values = Object.fromEntries(new FormData(form).entries());
    if (!normalize(values.title) || !normalize(values.body)) { toast('draft 标题和正文不能为空'); return; }
    const oldDraft = currentDraft(article);
    const ids = nextRevision('draft');
    const draft = { id: ids.revision, kind: 'draft', revision: ids.revision, hash: ids.hash, parentId: oldDraft?.id || raw.id, parentHash: oldDraft?.hash || raw.hash, title: normalize(values.title), question: normalize(values.question), thesis: normalize(values.thesis), body: normalize(values.body), agentNote: normalize(values.agentNote), createdBy: 'agent', createdAt: nowIso(), immutable: true, diff: { removed: oldDraft ? oldDraft.body : raw.body, added: normalize(values.body) } };
    article.revisions.push(draft);
    article.currentDraftId = draft.id;
    article.review = { status: 'pending', boundDraftHash: null, actor: null, reason: '', sourceRevision: raw.hash };
    store.ui.diffOpen = false;
    record('content.draft.update', article.id, 'accepted', `saved ${draft.revision}`, draft.hash, oldDraft?.hash || raw.hash, draft.hash);
    toast(`已保存 ${draft.revision}，等待作者审阅`);
    clearTransientForm(form.dataset.formKey || form.dataset.form);
    renderApp('workbench');
  }

  function prepareDraft() {
    if (!can('draft.prepare')) return deny('content.prepare', selectedArticle()?.id || 'none', '只有 Agent 可以生成 L0/L1 draft');
    const article = selectedArticle();
    if (!article) return deny('content.prepare', 'none', '没有可用文章，请先由作者创建 raw');
    const raw = currentRaw(article);
    if (!raw) return deny('content.prepare', article.id, '没有可用 raw');
    const ids = nextRevision('draft');
    const draft = { id: ids.revision, kind: 'draft', revision: ids.revision, hash: ids.hash, parentId: raw.id, parentHash: raw.hash, title: raw.title, question: raw.question, thesis: raw.thesis, body: raw.body, agentNote: '未改变原稿主张，仅整理结构。', createdBy: 'agent', createdAt: nowIso(), immutable: true, diff: { removed: raw.body, added: raw.body } };
    article.revisions.push(draft);
    article.currentDraftId = draft.id;
    article.review = { status: 'pending', boundDraftHash: null, actor: null, reason: '', sourceRevision: raw.hash };
    store.ui.diffOpen = false;
    record('content.prepare', article.id, 'accepted', `生成 ${draft.revision} · raw 保持不可变`, draft.hash);
    toast(`已生成 ${draft.revision}，等待作者审阅`);
    renderApp('workbench');
  }

  function previewDiff() {
    const article = selectedArticle();
    if (!article) return deny('content.preview', 'none', '没有可预览的文章');
    if (!currentDraft(article)) return deny('content.preview', article.id, '没有可预览的 draft');
    store.ui.diffOpen = !store.ui.diffOpen;
    record('content.preview', article.id, store.ui.diffOpen ? 'shown' : 'hidden', store.ui.diffOpen ? 'diff opened' : 'diff collapsed', currentDraft(article).hash);
    toast(store.ui.diffOpen ? 'diff 已展开' : 'diff 已收起');
    renderApp('workbench');
  }

  function approveReview() {
    const article = selectedArticle();
    if (!article) return deny('content.approve', 'none', '没有可批准的文章');
    if (!can('review.approve')) return deny('content.approve', article.id, 'Agent 不能批准 L2，当前角色不是作者');
    const draft = currentDraft(article);
    if (!draft) return deny('content.approve', article.id, '没有 draft 可批准');
    if (article.review.status === 'returned' || article.review.status === 'needs_draft') return deny('content.approve', article.id, '当前 draft 已退回或 raw 已更新，需要新的 draft revision');
    if (article.review.status === 'approved' && article.review.boundDraftHash === draft.hash) { record('content.approve', article.id, 'idempotent', 'same draft already approved', draft.hash); toast('当前 draft 已批准'); renderApp('workbench'); return; }
    if (article.review.status !== 'pending') return deny('content.approve', article.id, '当前没有待审 draft');
    article.review = { status: 'approved', boundDraftHash: draft.hash, actor: 'author', reason: '', sourceRevision: draft.hash };
    record('content.approve', article.id, 'accepted', `L2 accepted · bound ${draft.hash}`, draft.hash);
    toast('L2 已批准；发布门禁已打开');
    renderApp('workbench');
  }

  function returnReview() {
    const article = selectedArticle();
    if (!article) return deny('content.return', 'none', '没有可退回的文章');
    if (!can('review.return')) return deny('content.return', article.id, '只有作者可以退回 L2 审阅');
    const draft = currentDraft(article);
    const reason = normalize($('[data-article-return-reason]')?.value);
    if (!draft) return deny('content.return', article.id, '没有 draft 可退回');
    if (article.review.status !== 'pending') return deny('content.return', article.id, '当前 draft 不在待审状态，不能重复退回');
    if (!reason) { toast('请填写退回理由'); $('[data-article-return-reason]')?.focus(); return; }
    article.review = { status: 'returned', boundDraftHash: null, actor: 'author', reason, sourceRevision: draft.hash };
    record('content.return', article.id, 'returned', `draft returned · ${reason}`, draft.hash);
    toast('draft 已退回；需要新的 draft revision');
    renderApp('workbench');
  }

  function publishRelease() {
    const article = selectedArticle();
    if (!article) return deny('content.publish', 'none', '没有可发布的文章');
    if (!can('release.publish')) return deny('content.publish', article.id, '当前角色不能发布 release');
    const draft = currentDraft(article);
    if (!draft) return deny('content.publish', article.id, '没有 draft 可发布');
    if (!currentDraftIsApproved(article)) {
      record('content.publish.blocked', article.id, 'blocked', 'L2 approval required · no release written', draft.hash);
      toast('已阻断：当前 draft 尚未获得作者批准');
      renderApp('workbench');
      return;
    }
    const same = article.releases.find((release) => release.revisionId === draft.id && release.status === 'published');
    if (same) {
      article.currentReleaseId = same.id;
      store.ui.selectedReleaseId = same.id;
      record('content.publish', article.id, 'idempotent', `release ${same.id} already current`, draft.hash);
      toast('重复发布按 release revision 幂等处理');
      renderApp('workbench');
      return;
    }
    const ids = nextRevision('release');
    const release = { id: ids.revision, revisionId: draft.id, hash: draft.hash, status: 'published', approvedHash: article.review.boundDraftHash, payload: publicArticlePayload(draft), createdBy: store.role, createdAt: nowIso() };
    article.releases.push(release);
    article.currentReleaseId = release.id;
    store.ui.selectedReleaseId = release.id;
    record('content.publish', article.id, 'published', `release ${release.id} created · projection unchanged`, draft.hash);
    toast('release 已生成；公开面仍由作者显式投影');
    renderApp('workbench');
  }

  function projectArticle() {
    const article = selectedArticle();
    if (!article) return deny('projection.article', 'none', '没有可投影的文章');
    if (!can('projection.article')) return deny('projection.article', article.id, '只有作者可以把文章投影到 Desk');
    const selectedId = store.ui.selectedReleaseId || article.currentReleaseId;
    const release = article.releases.find((item) => item.id === selectedId && item.status === 'published');
    if (!release) return deny('projection.article', article.id, '没有可投影的已发布 release');
    if (article.review.status === 'needs_draft') return deny('projection.article', article.id, '回滚后需要新的 draft 和作者批准，不能重复投影旧 release');
    const existing = activeProjection(article);
    if (existing && existing.releaseId === release.id) { record('projection.article', article.id, 'idempotent', 'same release + desk target already active', release.hash); toast('文章投影已是当前版本'); renderApp('workbench'); return; }
    if (existing) existing.status = 'superseded';
    const ids = nextRevision('projection');
    const projection = { id: ids.revision, target: 'desk', route: `/writing/${article.slug}`, releaseId: release.id, sourceRevision: release.hash, status: 'active', payload: publicArticlePayload(release.payload), approvedBy: 'author', createdAt: nowIso() };
    article.projections.push(projection);
    article.currentProjectionId = projection.id;
    record('projection.article', article.id, 'active', `release ${release.id} projected to Desk`, release.hash);
    toast('文章已投影到 Desk；访客现在可以阅读');
    renderApp('workbench');
  }

  function withdrawArticle() {
    const article = selectedArticle();
    if (!article) return deny('projection.article.withdraw', 'none', '没有可撤回的文章');
    const projection = activeProjection(article);
    if (!can('projection.article.withdraw')) return deny('projection.article.withdraw', article.id, '只有作者可以撤回文章投影');
    if (!projection) return deny('projection.article.withdraw', article.id, '没有 active 文章投影');
    projection.status = 'withdrawn';
    projection.withdrawnAt = nowIso();
    record('projection.article.withdraw', article.id, 'withdrawn', 'public article route withdrawn', projection.sourceRevision);
    toast('文章投影已撤回；公开索引不再显示');
    renderApp('workbench');
  }

  function rollbackArticle() {
    const article = selectedArticle();
    if (!article) return deny('content.rollback', 'none', '没有可回滚的文章');
    const projection = activeProjection(article);
    if (!can('article.rollback')) return deny('content.rollback', article.id, '只有作者可以回滚公开版本');
    if (!projection) return deny('content.rollback', article.id, '没有 active 公开投影可回滚');
    const previous = previousPublishedRelease(article, projection);
    const rolledBackRelease = article.releases.find((release) => release.id === projection.releaseId);
    if (!previous) return deny('content.rollback', article.id, '没有上一条已发布版本；请使用“撤回文章投影”完成独立撤回');
    projection.status = 'superseded';
    if (rolledBackRelease) rolledBackRelease.status = 'rolled_back';
    article.currentReleaseId = previous.id;
    article.currentDraftId = null;
    store.ui.selectedReleaseId = previous.id;
    const ids = nextRevision('projection');
    const restored = { id: ids.revision, target: 'desk', route: `/writing/${article.slug}`, releaseId: previous.id, sourceRevision: previous.hash, status: 'active', payload: publicArticlePayload(previous.payload), approvedBy: 'author', createdAt: nowIso(), rollbackOf: projection.releaseId };
    article.projections.push(restored);
    article.currentProjectionId = restored.id;
    article.review = { status: 'needs_draft', boundDraftHash: null, actor: null, reason: '回滚后需要新的 draft', sourceRevision: null };
    record('content.rollback', article.id, 'rolled_back', `restored release ${previous.id}; new approval required for later release`, previous.hash);
    toast(`已回滚到 ${previous.revisionId}；后续发布需要新的批准`);
    renderApp('workbench');
  }

  function appendPlanHistory() {
    const index = store.plan.snapshotHistory.length + 1;
    store.plan.snapshotHistory.push({
      id: `snapshot-${String(index).padStart(3, '0')}`,
      revision: store.plan.snapshot.revision,
      policyRevision: store.plan.policyRevision,
      asOf: '合成时间点',
      fields: clone(store.plan.snapshot.fields)
    });
  }

  function savePlanForm(form) {
    if (!can('plan.write')) return deny('plan.write', store.plan.snapshot.id, '只有作者可以编辑 Plan 快照');
    const values = Object.fromEntries(new FormData(form).entries());
    const before = clone(store.plan.snapshot);
    let changed = false;
    store.plan.snapshot.fields.forEach((field) => {
      if (values[field.id] !== undefined && normalize(values[field.id]) !== field.value) { field.value = normalize(values[field.id]); changed = true; }
    });
    if (!changed) { toast('Plan 字段没有变化'); return; }
    const seq = Number(store.plan.snapshot.revision.split('-')[1] || '1') + 1;
    store.plan.snapshot.revision = `ledger-${String(seq).padStart(3, '0')}`;
    store.plan.policyRevision = `policy-${String(seq).padStart(3, '0')}`;
    appendPlanHistory();
    record('plan.snapshot.update', store.plan.snapshot.id, 'accepted', `new snapshot ${store.plan.snapshot.revision}`, store.plan.snapshot.revision, before.revision, store.plan.snapshot.revision);
    toast(`已保存 ${store.plan.snapshot.revision}；相关 projection 会标记 stale`);
    clearTransientForm(form.dataset.formKey || form.dataset.form);
    renderApp('workbench');
  }

  function toggleLedger(id) {
    if (!can('plan.write')) return deny('plan.visibility.update', id, 'Agent 不能改变 Plan 字段公开策略');
    const field = store.plan.snapshot.fields.find((item) => item.id === id);
    if (!field) return;
    const before = field.visibility;
    field.visibility = before === 'public' ? 'private' : 'public';
    const seq = Number(store.plan.policyRevision.split('-')[1] || '1') + 1;
    store.plan.policyRevision = `policy-${String(seq).padStart(3, '0')}`;
    appendPlanHistory();
    record('plan.visibility.update', id, field.visibility, `${LEDGER_LABELS[id]} → ${field.visibility}`, store.plan.snapshot.revision, before, field.visibility);
    toast(`${LEDGER_LABELS[id]}：${field.visibility === 'public' ? '公开' : '私密'}；相关 projection 将标记 stale`);
    renderApp('workbench');
  }

  function projectPlan() {
    if (!can('plan.project')) return deny('projection.plan', store.plan.snapshot.id, 'Plan 字段投影必须由作者批准');
    const allowlist = store.plan.snapshot.fields.filter((field) => field.visibility === 'public').map((field) => field.id);
    if (!allowlist.length) return deny('projection.plan', store.plan.snapshot.id, '没有公开字段，无法生成 projection');
    const current = selectedPlanProjection();
    const status = planProjectionStatus();
    if (current && ['active', 'stale'].includes(status) && current.sourceRevision === store.plan.snapshot.revision && current.policyRevision === store.plan.policyRevision && JSON.stringify(current.fieldAllowlist) === JSON.stringify(allowlist)) {
      record('projection.plan', store.plan.snapshot.id, 'idempotent', 'same source revision + allowlist already active', store.plan.snapshot.revision);
      toast('Plan projection 已是当前版本');
      renderApp('workbench');
      return;
    }
    if (current && current.status === 'active') current.status = 'superseded';
    const ids = nextRevision('plan-projection');
    const payload = clone(store.plan.snapshot.fields.filter((field) => allowlist.includes(field.id)));
    const projection = { id: ids.revision, target: 'desk', sourceRevision: store.plan.snapshot.revision, policyRevision: store.plan.policyRevision, fieldAllowlist: allowlist, payload, status: 'active', createdAt: nowIso(), approvedBy: 'author' };
    store.plan.projections.push(projection);
    store.plan.currentProjectionId = projection.id;
    record('projection.plan', store.plan.snapshot.id, 'active', `allowlist ${allowlist.join(',')}`, store.plan.snapshot.revision);
    toast('Plan projection 已激活；访客只看到冻结白名单字段');
    renderApp('workbench');
  }

  function withdrawPlan() {
    const projection = selectedPlanProjection();
    const status = planProjectionStatus();
    if (!can('plan.withdraw')) return deny('projection.plan.withdraw', store.plan.snapshot.id, '只有作者可以撤回 Plan projection');
    if (!projection || !['active', 'stale'].includes(status)) return deny('projection.plan.withdraw', store.plan.snapshot.id, '没有可撤回的 active/stale Plan projection');
    projection.status = 'withdrawn';
    projection.withdrawnAt = nowIso();
    record('projection.plan.withdraw', store.plan.snapshot.id, 'withdrawn', 'public Plan route withdrawn', projection.sourceRevision);
    toast('Plan projection 已撤回；公开字段不再可见');
    renderApp('workbench');
  }

  function saveTaskForm(form) {
    if (!can('task.write')) return deny('task.write', 'task', '只有作者可以维护任务');
    const values = Object.fromEntries(new FormData(form).entries());
    const title = normalize(values.title);
    if (!title) { toast('任务标题不能为空'); return; }
    if (!Object.prototype.hasOwnProperty.call(TASK_STATUS_LABELS, values.status) || values.status === 'all') {
      return deny('task.update', values.id || 'new', '任务状态无效');
    }
    if (values.status === 'blocked' && !normalize(values.blockedReason)) { toast('阻塞状态必须填写原因'); form.elements.blockedReason.focus(); return; }
    if (values.status === 'done' && !normalize(values.acceptance)) { toast('已完成任务必须有验收标准'); form.elements.acceptance.focus(); return; }
    const project = projectById(values.projectId);
    if (!project || project.archived) return deny('task.project.assign', values.id || 'new', '任务必须关联未归档项目');
    if (project.status === 'done') return deny('task.project.assign', values.id || 'new', '已结束项目不能继续挂载任务');
    let task = values.id ? taskById(values.id) : null;
    if (values.id && (!task || task.archived)) return deny('task.update', values.id, '任务不存在或已归档');
    const before = task ? clone(task) : null;
    if (!task) {
      const seq = nextSequence();
      task = { id: `task-${String(seq).padStart(3, '0')}`, code: `T-${String(seq).padStart(4, '0')}`, archived: false };
      store.workbench.tasks.push(task);
    }
    Object.assign(task, { title, projectId: project.id, status: values.status, priority: normalize(values.priority), due: normalize(values.due), owner: normalize(values.owner), nextStep: normalize(values.nextStep), acceptance: normalize(values.acceptance), blockedReason: normalize(values.blockedReason) });
    record(values.id ? 'task.update' : 'task.create', task.id, 'accepted', `${task.code} · ${task.status}`, '', before, clone(task));
    store.workbench.selectedTaskId = task.id;
    store.ui.taskEditor = null;
    toast(values.id ? '任务已更新' : '任务已创建');
    clearTransientForm(form.dataset.formKey || form.dataset.form);
    renderApp('workbench');
  }

  function archiveTask(id) {
    if (!can('task.write')) return deny('task.archive', id, '只有作者可以归档任务');
    const task = taskById(id);
    if (!task) return;
    task.archived = true;
    store.workbench.week.focusTaskIds = store.workbench.week.focusTaskIds.filter((item) => item !== id);
    store.workbench.week.days.forEach((day) => { if (day.taskId === id) day.taskId = null; });
    record('task.archive', id, 'archived', `${task.code} archived`);
    store.workbench.selectedTaskId = null;
    store.ui.taskEditor = null;
    toast('任务已归档');
    renderApp('workbench');
  }

  function saveProjectForm(form) {
    if (!can('project.write')) return deny('project.write', 'project', '只有作者可以维护项目');
    const values = Object.fromEntries(new FormData(form).entries());
    if (!normalize(values.name)) { toast('项目名称不能为空'); return; }
    if (!Object.prototype.hasOwnProperty.call(PROJECT_STATUS_LABELS, values.status)) {
      return deny('project.update', values.id || 'new', '项目状态无效');
    }
    const current = values.id ? projectById(values.id) : null;
    if (values.id && (!current || current.archived)) return deny('project.update', values.id, '项目不存在或已归档');
    if (values.status === 'done' && current && projectProgress(current.id).done < projectProgress(current.id).total) {
      return deny('project.status', current.id, '仍有未完成关联任务，项目不能直接结束');
    }
    const before = current ? clone(current) : null;
    const project = current || (() => { const seq = nextSequence(); const created = { id: `project-${String(seq).padStart(3, '0')}`, code: `P-${String(seq).padStart(4, '0')}`, archived: false }; store.workbench.projects.push(created); return created; })();
    Object.assign(project, { name: normalize(values.name), status: values.status, phase: normalize(values.phase), owner: normalize(values.owner), nextStep: normalize(values.nextStep), summary: normalize(values.summary) });
    record(current ? 'project.update' : 'project.create', project.id, 'accepted', `${project.code} · ${project.status}`, '', before, clone(project));
    store.workbench.selectedProjectId = project.id;
    store.ui.projectEditor = null;
    toast(current ? '项目已更新' : '项目已创建');
    clearTransientForm(form.dataset.formKey || form.dataset.form);
    renderApp('workbench');
  }

  function archiveProject(id) {
    if (!can('project.write')) return deny('project.archive', id, '只有作者可以归档项目');
    const project = projectById(id);
    if (!project || project.archived) return deny('project.archive', id, '项目不存在或已归档');
    if (store.workbench.tasks.some((task) => !task.archived && task.projectId === id)) return deny('project.archive', id, '项目仍有关联任务，不能归档；请先处理任务');
    project.archived = true;
    record('project.archive', id, 'archived', `${project.code} archived`);
    store.workbench.selectedProjectId = null;
    store.ui.projectEditor = null;
    toast('项目已归档');
    renderApp('workbench');
  }

  function addFocus() {
    if (!can('week.write')) return deny('week.focus.add', 'week', '只有作者可以维护周计划');
    const id = $('[data-focus-add]')?.value;
    const task = taskById(id);
    if (!task || task.archived) return deny('week.focus.add', id || 'none', '焦点任务不存在或已归档');
    if (store.workbench.week.focusTaskIds.includes(id)) return;
    store.workbench.week.focusTaskIds.push(id);
    record('week.focus.add', id, 'accepted', 'task added to current week focus');
    toast('任务已加入本周焦点');
    renderApp('workbench');
  }

  function removeFocus(id) {
    if (!can('week.write')) return deny('week.focus.remove', id, '只有作者可以维护周计划');
    if (!store.workbench.week.focusTaskIds.includes(id)) return deny('week.focus.remove', id, '任务不在本周焦点中');
    store.workbench.week.focusTaskIds = store.workbench.week.focusTaskIds.filter((item) => item !== id);
    record('week.focus.remove', id, 'accepted', 'task removed from current week focus');
    renderApp('workbench');
  }

  function assignDay(dayId, taskId) {
    if (!can('week.write')) return deny('week.day.assign', dayId, '只有作者可以维护周计划');
    const day = store.workbench.week.days.find((item) => item.id === dayId);
    if (!day) return deny('week.day.assign', dayId, '日槽不存在');
    if (taskId) {
      const task = taskById(taskId);
      if (!task || task.archived) return deny('week.day.assign', dayId, '不能安排不存在或已归档任务');
    }
    store.workbench.week.days.forEach((item) => { if (item.id !== dayId && item.taskId === taskId && taskId) item.taskId = null; });
    day.taskId = taskId || null;
    record('week.day.assign', dayId, 'accepted', taskId ? `assigned ${taskId}` : 'day cleared', '', null, taskId || null);
    toast(taskId ? `${day.label} 已安排任务` : `${day.label} 已清空`);
    renderApp('workbench');
  }

  function decideFixtureReview(id, decision) {
    if (!can('review.queue')) return deny('review.decide', id, 'Agent 不能决定作者终审队列');
    const item = store.workbench.reviews.find((review) => review.id === id);
    if (!item || item.status !== 'pending') return;
    const reason = decision === 'returned' ? normalize($(`[data-review-reason="${id}"]`)?.value) : '';
    if (decision === 'returned' && !reason) { toast('退回需要理由'); return; }
    const before = item.status;
    item.status = decision;
    item.reason = reason;
    item.decidedBy = store.role;
    record(decision === 'approved' ? 'review.approve' : 'review.return', id, decision, reason || `review → ${REVIEW_STATUS_LABELS[decision]}`, '', before, decision);
    toast(decision === 'approved' ? '审阅条目已批准' : '审阅条目已退回');
    renderApp('workbench');
  }

  function windowFallback(message) {
    const fallback = $('#fallback');
    const canvas = windowFx.canvas;
    if (fallback) {
      fallback.classList.add('is-visible');
      const label = fallback.querySelector('span');
      if (label) label.textContent = message || '已使用静态 poster · 动态增强不可用';
    }
    canvas?.classList.add('is-static');
    windowFx.lost = true;
    windowFx.running = false;
    if ($('#renderLabel')) $('#renderLabel').textContent = message || 'poster ready · static fallback';
  }

  function windowEnhancementReady() {
    $('#fallback')?.classList.remove('is-visible');
    windowFx.canvas?.classList.remove('is-static');
    windowFx.lost = false;
  }

  function compileWindowShader(type, source) {
    const gl = windowFx.gl;
    const shader = gl.createShader(type);
    gl.shaderSource(shader, source);
    gl.compileShader(shader);
    if (!gl.getShaderParameter(shader, gl.COMPILE_STATUS)) {
      throw new Error(gl.getShaderInfoLog(shader) || 'window shader error');
    }
    return shader;
  }

  function setupWindowFx() {
    const canvas = windowFx.canvas;
    if (!canvas || reducedTransparency.matches || reducedMotion.matches) {
      windowFallback(reducedTransparency.matches ? '已使用静态 poster · 透明度已降低' : '已使用静态 poster · reduced motion');
      return;
    }
    try {
      windowFx.gl = canvas.getContext('webgl2', { alpha: true, antialias: false, depth: false, stencil: false, preserveDrawingBuffer: false });
      if (!windowFx.gl) return windowFallback('已使用静态 poster · WebGL2 不可用');
      const gl = windowFx.gl;
      const vertex = `#version 300 es\nprecision highp float;\nout vec2 uv;\nvoid main(){vec2 p=vec2((gl_VertexID<<1)&2,gl_VertexID&2);uv=p;gl_Position=vec4(p*2.0-1.0,0.0,1.0);}`;
      const fragment = `#version 300 es\nprecision highp float;\nin vec2 uv;out vec4 color;uniform vec2 uResolution;uniform float uTime;uniform float uIntensity;uniform float uWeather;float hash21(vec2 p){p=fract(p*vec2(123.34,456.21));p+=dot(p,p+45.32);return fract(p.x*p.y);}float streak(vec2 p,float scale,float speed,float seed){p.x*=uResolution.x/uResolution.y;vec2 s=p*vec2(scale,scale*.32);s.y+=uTime*speed;vec2 cell=floor(s),f=fract(s)-.5;float n=hash21(cell+seed);float line=smoothstep(.034,0.,abs(f.x+sin(f.y*5.+n*8.)*.03));float gate=step(.70,n)*smoothstep(.48,.05,abs(f.y));return line*gate;}void main(){vec2 p=uv-.5;float strength=uIntensity*.0105;float rain=(streak(p,72.,1.4,2.3)+streak(p+.37,104.,2.,7.1))*strength;float fog=hash21(floor((p+uTime*.008)*vec2(8.,5.)));float weatherMix=smoothstep(.15,.75,uWeather);float alpha=mix(rain,rain+fog*.12,weatherMix)*(.35+.65*smoothstep(.1,.95,uv.y));color=vec4(vec3(.82,.9,.89),clamp(alpha,0.,.22));}`;
      const program = gl.createProgram();
      gl.attachShader(program, compileWindowShader(gl.VERTEX_SHADER, vertex));
      gl.attachShader(program, compileWindowShader(gl.FRAGMENT_SHADER, fragment));
      gl.linkProgram(program);
      if (!gl.getProgramParameter(program, gl.LINK_STATUS)) throw new Error(gl.getProgramInfoLog(program) || 'window program error');
      windowFx.program = program;
      windowFx.uniforms = {
        resolution: gl.getUniformLocation(program, 'uResolution'),
        time: gl.getUniformLocation(program, 'uTime'),
        intensity: gl.getUniformLocation(program, 'uIntensity'),
        weather: gl.getUniformLocation(program, 'uWeather')
      };
      windowFx.vao = gl.createVertexArray();
      gl.bindVertexArray(windowFx.vao);
      gl.enable(gl.BLEND);
      gl.blendFunc(gl.SRC_ALPHA, gl.ONE_MINUS_SRC_ALPHA);
      windowEnhancementReady();
      resizeWindowFx();
    } catch (error) {
      console.error(error);
      windowFallback('已使用静态 poster · shader fallback');
    }
  }

  function resizeWindowFx() {
    const { gl, canvas } = windowFx;
    if (!gl || !canvas || windowFx.lost) return;
    const dpr = Math.min(devicePixelRatio || 1, 1.25);
    const width = Math.max(1, Math.round(innerWidth * dpr));
    const height = Math.max(1, Math.round(innerHeight * dpr));
    if (canvas.width !== width || canvas.height !== height) { canvas.width = width; canvas.height = height; }
    gl.viewport(0, 0, width, height);
  }

  function weatherValue() {
    return store.window.weather === '雨' ? 1 : store.window.weather === '雾' ? .85 : store.window.weather === '阴' ? .55 : .15;
  }

  function drawWindowFx(now) {
    const { gl, canvas, program, vao, uniforms } = windowFx;
    if (!windowFx.running || !gl || !program || windowFx.lost) return;
    windowFx.raf = requestAnimationFrame(drawWindowFx);
    gl.useProgram(program);
    gl.bindVertexArray(vao);
    gl.uniform2f(uniforms.resolution, canvas.width, canvas.height);
    gl.uniform1f(uniforms.time, (now - windowFx.startTime) / 1000);
    gl.uniform1f(uniforms.intensity, store.window.intensity / 100 * (store.window.weather === '晴' ? .22 : 1));
    gl.uniform1f(uniforms.weather, weatherValue());
    gl.clearColor(0, 0, 0, 0);
    gl.clear(gl.COLOR_BUFFER_BIT);
    gl.drawArrays(gl.TRIANGLES, 0, 3);
  }

  function startWindowFx() {
    if (!windowFx.gl || !windowFx.program || windowFx.lost || reducedMotion.matches || reducedTransparency.matches || store.window.paused || store.route !== 'window' || windowFx.running) return;
    windowFx.running = true;
    windowFx.startTime = performance.now();
    windowFx.canvas?.classList.remove('is-paused');
    if ($('#renderLabel')) $('#renderLabel').textContent = 'webgl2 enhancement · running';
    windowFx.raf = requestAnimationFrame(drawWindowFx);
  }

  function stopWindowFx(reason = 'poster ready · paused') {
    windowFx.running = false;
    cancelAnimationFrame(windowFx.raf);
    windowFx.canvas?.classList.add('is-paused');
    if ($('#renderLabel')) $('#renderLabel').textContent = reason;
  }

  function syncWindowFx() {
    if (store.route === 'window' && !store.window.paused && !reducedMotion.matches && !reducedTransparency.matches) startWindowFx();
    else stopWindowFx(store.route === 'window' && reducedMotion.matches ? 'poster ready · reduced motion' : 'poster ready · static fallback');
  }

  function syncWindowPreferenceFx() {
    updateWindowState();
    if (reducedTransparency.matches) windowFallback('已使用静态 poster · 透明度已降低');
    else if (reducedMotion.matches) windowFallback('已使用静态 poster · reduced motion');
    else { setupWindowFx(); syncWindowFx(); }
  }

  function bindWindowFx() {
    const canvas = windowFx.canvas;
    if (!canvas) return;
    canvas.addEventListener('webglcontextlost', (event) => {
      event.preventDefault();
      stopWindowFx('poster ready · WebGL context lost');
      windowFx.lost = true;
      canvas.classList.add('is-static');
    });
    canvas.addEventListener('webglcontextrestored', () => {
      windowFx.gl = null;
      windowFx.program = null;
      windowFx.vao = null;
      setupWindowFx();
      syncWindowFx();
    });
    window.addEventListener('resize', resizeWindowFx, { passive: true });
    window.addEventListener('orientationchange', resizeWindowFx, { passive: true });
    document.addEventListener('visibilitychange', () => {
      if (document.hidden) stopWindowFx('poster ready · tab hidden');
      else syncWindowFx();
    });
  }

  function renderWindowStaticState() {
    setupWindowFx();
    bindWindowFx();
    syncWindowFx();
  }

  function installStyles() {
    if ($('#composed-runtime-style')) return;
    const style = document.createElement('style');
    style.id = 'composed-runtime-style';
    style.textContent = `
      .scene-layer[data-season="春"] .poster { filter: saturate(1.16) hue-rotate(18deg) brightness(1.04); }
      .scene-layer[data-season="夏"] .poster { filter: saturate(1.24) hue-rotate(38deg) brightness(1.08); }
      .scene-layer[data-season="秋"] .poster { filter: saturate(1.12) hue-rotate(-18deg) sepia(.15) brightness(.98); }
      .scene-layer[data-season="冬"] .poster { filter: saturate(.82) brightness(.94); }
      .scene-layer[data-weather="雾"] .scene-scrim { opacity: .92; }
      .scene-layer[data-weather="雨"] .scene-scrim { opacity: .80; }
      .scene-layer[data-paused="true"] .poster { filter: saturate(.82) brightness(.94); }
      .focus-toolbar, .panel-toolbar, .article-selector, .form-actions, .status-stack { display:flex; flex-wrap:wrap; align-items:center; gap:8px; }
      .focus-toolbar, .panel-toolbar, .article-selector { padding:12px 0; border-bottom:1px solid var(--desk-line); }
      .focus-toolbar select, .compact-field select, .form-grid input, .form-grid textarea, .form-grid select, .plan-editor input, .preview-range input { min-height:44px; border:1px solid var(--desk-line-strong); border-radius:3px; padding:9px 10px; background:var(--desk-surface); color:var(--desk-ink); }
      .focus-toolbar select, .compact-field select { min-width:240px; }
      .form-heading { display:flex; align-items:start; justify-content:space-between; gap:16px; margin-bottom:14px; }
      .form-heading h3 { margin:5px 0 0; color:var(--desk-ink); font-size:17px; }
      .editor-form { margin-top:18px; border:1px solid var(--desk-line-strong); padding:17px 18px; background:var(--desk-surface); }
      .form-grid { display:grid; grid-template-columns:repeat(2,minmax(0,1fr)); gap:12px; }
      .form-grid label, .reason-field, .compact-field, .preview-range { display:grid; gap:5px; color:var(--desk-muted); font-size:11px; }
      .form-grid label.full { grid-column:1 / -1; }
      .form-grid label > span, .reason-field > span, .compact-field > span, .preview-range > span { color:var(--desk-muted); font:10px var(--font-mono); }
      .form-grid textarea { resize:vertical; line-height:1.55; }
      .form-note, .source-note, .selection-note { color:var(--desk-muted); font-size:11px; }
      .icon-action, .inline-button, .entity-select, .entity-title { border:0; background:transparent; color:var(--desk-muted); cursor:pointer; }
      .icon-action { min-width:44px; min-height:44px; border:1px solid var(--desk-line); border-radius:3px; font-size:18px; }
      .inline-button { display:inline-flex; align-items:center; min-height:44px; padding:8px 6px; }
      .entity-select { min-height:44px; text-align:left; }
      .entity-title { display:flex; align-items:center; min-height:44px; padding:0; text-align:left; }
      .queue-reason { min-height:44px; }
      .task-row.is-selected, .project-row.is-selected { background:rgba(215,236,231,.35); }
      .day-task { display:block; margin-top:10px; color:var(--desk-accent); font:10px/1.5 var(--font-mono); }
      .day-empty { display:block; margin-top:10px; color:var(--desk-muted); font:10px var(--font-mono); }
      .week-day select { width:100%; min-height:44px; margin-top:12px; border:1px solid var(--desk-line); background:var(--desk-surface); color:var(--desk-ink); font:10px var(--font-mono); }
      .project-scale i.is-filled { background:var(--desk-accent); border-color:var(--desk-accent); }
      .status-stack { justify-content:flex-end; align-items:flex-start; }
      .release-picker { min-width:190px; }
      .reason-field { margin-top:14px; }
      .reason-field textarea { border:1px solid var(--desk-line); padding:9px; background:var(--desk-surface); color:var(--desk-ink); resize:vertical; }
      .diff-closed { margin:0; padding:12px; color:var(--desk-muted); font-size:11px; }
      .diff-box.is-open pre { display:block; }
      .diff-box:not(.is-open) pre { display:none; }
      .read-only-source { margin-top:18px; border-left:3px solid var(--desk-line-strong); padding:12px; color:var(--desk-muted); background:var(--desk-surface); }
      .ledger-meta { margin-bottom:10px; color:var(--desk-muted); font:10px var(--font-mono); }
      .projection-preview { margin-top:18px; padding-top:14px; border-top:1px solid var(--desk-line); }
      .projection-preview ul { margin:12px 0 0; padding:0; list-style:none; }
      .projection-preview li { display:flex; justify-content:space-between; gap:12px; padding:8px 0; border-bottom:1px dotted var(--desk-line); color:var(--desk-muted); font-size:12px; }
      .projection-preview li strong { color:var(--desk-ink); }
      .snapshot-history { margin-top:18px; padding-top:14px; border-top:1px solid var(--desk-line); }
      .snapshot-history ul { margin:12px 0 0; padding:0; list-style:none; }
      .snapshot-history li { display:flex; justify-content:space-between; gap:12px; padding:8px 0; border-bottom:1px dotted var(--desk-line); color:var(--desk-muted); font:10px var(--font-mono); }
      .snapshot-history li strong { color:var(--desk-ink); }
      .preview-control { margin-top:12px; }
      .preview-options { display:grid; grid-template-columns:repeat(4,minmax(0,1fr)); gap:6px; margin-top:6px; }
      .preview-option { min-height:44px; }
      .preview-range { margin-top:12px; }
      .preview-range > span { display:flex; justify-content:space-between; }
      .preview-range input { width:100%; padding:0; }
      .demo-drawer { max-height:calc(100vh - 20px); max-height:calc(100dvh - 20px); overflow-y:auto; overscroll-behavior:contain; }
      .focus-row { grid-template-columns:38px minmax(0,1fr) auto 44px; }
      .workbench-topbar { flex-wrap:wrap; }
      .private-badge { white-space:normal; }
      @media (max-width:620px) { .form-grid { grid-template-columns:1fr; } .form-grid label.full { grid-column:auto; } .preview-options { grid-template-columns:repeat(2,minmax(0,1fr)); } .workbench-topbar { align-items:flex-start; } .workbench-tools { margin-left:auto; } }
      @media (forced-colors:active) { .scene-layer[data-season] .poster { filter:none !important; } .project-scale i.is-filled { background:CanvasText; } }
    `;
    document.head.append(style);
  }

  function handleSubmit(event) {
    const form = event.target.closest('form[data-form]');
    if (!form) return;
    event.preventDefault();
    const type = form.dataset.form;
    if (type === 'article') saveArticleForm(form);
    else if (type === 'draft') saveDraftForm(form);
    else if (type === 'task') saveTaskForm(form);
    else if (type === 'project') saveProjectForm(form);
    else if (type === 'plan') savePlanForm(form);
  }

  function handleClick(event) {
    const target = event.target.closest('button, a, [data-action], [data-route], [data-role], [data-workbench-view], [data-task-filter], [data-task-select], [data-project-select], [data-focus-remove], [data-review-decision], [data-ledger-toggle], [data-review-subview], [data-season], [data-weather], [data-anchor]');
    if (!target) return;
    if (target.classList.contains('skip-link')) {
      event.preventDefault();
      const destination = store.route === 'window'
        ? $('#heroTitle')
        : store.route === 'workbench' ? $('#workbenchContent') : $('#primaryContent');
      if (!destination) return;
      if (!destination.hasAttribute('tabindex') && !/^(A|BUTTON|INPUT|SELECT|TEXTAREA)$/.test(destination.tagName)) destination.setAttribute('tabindex', '-1');
      destination.focus();
      return;
    }
    if (target.dataset.role) {
      event.preventDefault();
      const previous = store.role;
      const nextRole = target.dataset.role;
      if (!ROLE_IDS.has(nextRole)) return deny('demo.role.switch', nextRole, '未知演示角色');
      if (previous !== nextRole) clearTransientForms();
      store.role = nextRole;
      if (store.route === 'workbench' && store.role === 'visitor') {
        closeDrawer();
        navigate('writing');
      } else if (store.route === 'workbench') {
        renderApp(store.route);
        closeDrawer();
      } else {
        renderApp(store.route);
        renderDrawer();
      }
      toast(`演示角色已切换为${ROLE_LABELS[store.role]}（不是认证）`);
      announce(`当前角色：${ROLE_LABELS[store.role]}`);
      if (previous !== store.role) record('demo.role.switch', store.route, 'accepted', `${ROLE_LABELS[previous]} → ${ROLE_LABELS[store.role]}`);
      return;
    }
    if (target.dataset.route) {
      event.preventDefault();
      navigate(target.dataset.route, { slug: target.dataset.slug || null });
      return;
    }
    if (target.dataset.workbenchView) { event.preventDefault(); store.workbench.view = target.dataset.workbenchView; store.ui.taskEditor = null; store.ui.projectEditor = null; renderApp('workbench'); announce(`已切换到${VIEW_LABELS[store.workbench.view]}视图`); return; }
    if (target.dataset.taskFilter) { event.preventDefault(); store.workbench.taskFilter = target.dataset.taskFilter; renderApp('workbench'); announce(`已筛选${TASK_STATUS_LABELS[target.dataset.taskFilter]}任务`); return; }
    if (target.dataset.taskSelect) { event.preventDefault(); store.workbench.selectedTaskId = target.dataset.taskSelect; store.ui.taskEditor = 'current'; renderApp('workbench'); return; }
    if (target.dataset.projectSelect) { event.preventDefault(); store.workbench.view = 'projects'; store.workbench.selectedProjectId = target.dataset.projectSelect; store.ui.projectEditor = 'current'; store.ui.taskEditor = null; renderApp('workbench'); announce('已打开关联项目详情'); return; }
    if (target.dataset.focusRemove) { event.preventDefault(); removeFocus(target.dataset.focusRemove); return; }
    if (target.dataset.reviewDecision) { event.preventDefault(); decideFixtureReview(target.dataset.reviewId, target.dataset.reviewDecision); return; }
    if (target.dataset.ledgerToggle) { event.preventDefault(); toggleLedger(target.dataset.ledgerToggle); return; }
    if (target.dataset.reviewSubview) { event.preventDefault(); store.workbench.reviewSubview = target.dataset.reviewSubview; renderApp('workbench'); return; }
    if (target.dataset.anchor) {
      event.preventDefault();
      const root = $('#primaryContent');
      const links = root ? $$('.toc-link', root) : [];
      links.forEach((item) => {
        item.classList.toggle('is-active', item === target);
        item.setAttribute('aria-current', item === target ? 'location' : 'false');
      });
      const destination = document.getElementById(target.dataset.anchor);
      if (destination) {
        if (!destination.hasAttribute('tabindex')) destination.setAttribute('tabindex', '-1');
        destination.scrollIntoView({ behavior: reducedMotion.matches ? 'auto' : 'smooth', block: 'start' });
        destination.focus({ preventScroll: true });
      }
      return;
    }
    if (target.dataset.season) { event.preventDefault(); store.window.season = target.dataset.season; store.window.source = 'manual'; saveWindowState(); updateWindowState(); toast(`已切换到${target.dataset.season}预览`); return; }
    if (target.dataset.weather) { event.preventDefault(); store.window.weather = target.dataset.weather; store.window.source = 'manual'; saveWindowState(); updateWindowState(); toast(`已切换到${target.dataset.weather}预览`); return; }
    const action = target.dataset.action;
    if (!action) return;
    event.preventDefault();
    if (action === 'open-drawer') openDrawer(event);
    else if (action === 'close-drawer') closeDrawer();
    else if (action === 'go-workbench') { closeDrawer(); navigate('workbench'); }
    else if (action === 'reset') resetDemo();
    else if (action === 'reset-window') { store.window = { season: '冬', weather: '晴', intensity: 42, paused: false, source: 'manual' }; saveWindowState(); updateWindowState(); syncWindowFx(); toast('已恢复默认窗外预览'); }
    else if (action === 'pause') { if (reducedMotion.matches) { toast('系统偏好已暂停动效'); return; } store.window.paused = !store.window.paused; saveWindowState(); updateWindowState(); syncWindowFx(); toast(store.window.paused ? '动效已暂停' : '动效已继续'); }
    else if (action === 'new-article') { if (can('article.edit')) { store.selectedArticleId = null; store.ui.articleEditor = 'new'; store.ui.selectedReleaseId = null; renderApp('workbench'); } }
    else if (action === 'cancel-new-article') { store.ui.articleEditor = 'current'; store.selectedArticleId = store.articles.find((article) => !article.archived)?.id || null; renderApp('workbench'); }
    else if (action === 'archive-article') archiveArticle(target.dataset.articleId);
    else if (action === 'prepare-draft') prepareDraft();
    else if (action === 'preview-diff') previewDiff();
    else if (action === 'approve-review') approveReview();
    else if (action === 'return-review') returnReview();
    else if (action === 'publish-release') publishRelease();
    else if (action === 'project-article') projectArticle();
    else if (action === 'withdraw-article') withdrawArticle();
    else if (action === 'rollback-article') rollbackArticle();
    else if (action === 'project-plan') projectPlan();
    else if (action === 'withdraw-plan') withdrawPlan();
    else if (action === 'new-task') { if (can('task.write')) { store.ui.taskEditor = 'new'; store.workbench.selectedTaskId = null; renderApp('workbench'); } }
    else if (action === 'close-task-editor') { store.ui.taskEditor = null; store.workbench.selectedTaskId = null; renderApp('workbench'); }
    else if (action === 'archive-task') archiveTask(target.dataset.taskId);
    else if (action === 'new-project') { if (can('project.write')) { store.ui.projectEditor = 'new'; store.workbench.selectedProjectId = null; renderApp('workbench'); } }
    else if (action === 'close-project-editor') { store.ui.projectEditor = null; store.workbench.selectedProjectId = null; renderApp('workbench'); }
    else if (action === 'archive-project') archiveProject(target.dataset.projectId);
    else if (action === 'add-focus') addFocus();
  }

  function archiveArticle(id) {
    const article = articleById(id);
    if (!article) return;
    if (!can('article.archive')) return deny('article.archive', id, '只有作者可以归档文章');
    if (activeProjection(article)) return deny('article.archive', id, '公开投影仍 active，请先撤回文章投影');
    if (store.articles.filter((item) => !item.archived).length <= 1) return deny('article.archive', id, '至少保留一篇可编辑文章；请先新建另一篇');
    article.archived = true;
    record('article.archive', id, 'archived', `${article.slug} archived`);
    if (store.selectedArticleId === id) {
      store.selectedArticleId = store.articles.find((item) => !item.archived)?.id || null;
      store.ui.selectedReleaseId = null;
    }
    toast('文章已归档');
    renderApp('workbench');
  }

  function handleChange(event) {
    const target = event.target;
    if (target.matches('[data-season]')) { store.window.season = target.dataset.season; store.window.source = 'manual'; saveWindowState(); updateWindowState(); toast(`已切换到${target.dataset.season}预览`); return; }
    if (target.matches('[data-weather]')) { store.window.weather = target.dataset.weather; store.window.source = 'manual'; saveWindowState(); updateWindowState(); toast(`已切换到${target.dataset.weather}预览`); return; }
    if (target.id === 'intensity') { store.window.intensity = Number(target.value); store.window.source = 'manual'; saveWindowState(); updateWindowState(); return; }
    if (target.matches('[data-article-select]')) { store.selectedArticleId = target.value; store.ui.articleEditor = 'current'; store.ui.diffOpen = false; store.ui.selectedReleaseId = null; renderApp('workbench'); return; }
    if (target.matches('[data-release-select]')) { store.ui.selectedReleaseId = target.value; renderApp('workbench'); return; }
    if (target.matches('[data-day-assign]')) { assignDay(target.dataset.dayAssign, target.value); return; }
    if (target.matches('[data-review-subview]')) { store.workbench.reviewSubview = target.dataset.reviewSubview; renderApp('workbench'); return; }
    if (target.matches('[data-focus-add]')) return;
  }

  function applyLocation() {
    const next = parseHash();
    if (next.route === store.route && next.slug === store.routeSlug) return;
    const previousRoute = store.route;
    const previousSlug = store.routeSlug;
    store.route = next.route;
    store.routeSlug = next.slug;
    renderApp(previousRoute, previousSlug);
  }

  function bindGlobalEvents() {
    document.addEventListener('click', handleClick);
    document.addEventListener('submit', handleSubmit);
    document.addEventListener('change', handleChange);
    document.addEventListener('input', (event) => {
      if (event.target?.id === 'intensity') handleChange(event);
    });
    document.addEventListener('keydown', (event) => {
      if (!store.ui.drawerOpen) return;
      if (event.key === 'Escape') { event.preventDefault(); closeDrawer(); return; }
      if (event.key === 'Tab') trapDrawerFocus(event);
    });
    window.addEventListener('hashchange', applyLocation);
    window.addEventListener('popstate', applyLocation);
    reducedMotion.addEventListener?.('change', (event) => { syncWindowPreferenceFx(); });
    reducedTransparency.addEventListener?.('change', syncWindowPreferenceFx);
  }

  installStyles();
  ensureDrawerControls();
  loadWindowState();
  bindGlobalEvents();
  renderWindowStaticState();
  const initial = parseHash();
  store.route = initial.route;
  store.routeSlug = initial.slug;
  if (!location.hash || !ROUTES.has(initial.route)) setHash(initial.route, initial.slug, true);
  renderApp('');
})();
