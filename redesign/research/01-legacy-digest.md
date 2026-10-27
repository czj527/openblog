# 01 · 旧仓库资料摘要

> 只读盘点，供新设计案取用。路径相对 `D:\openblog\openblog\`；核验日 2026-10-23。
> 引号内为旧文档记录的（转述）用户原话，不是逐字录音。
>
> **2026-10-27 注**：文中引用的旧 `docs/`、旧 `DECISIONS.md`、旧 `TASKS.md` 和旧 `design/` 已从当前工作树移除；历史查看方式见 `archive/legacy-planning/README.md`。本摘要保留原貌，只作历史证据，不代表当前树仍有这些文件。

## 0. 三条总判断

1. 旧站四季×天气是**换肤**，不是**场景**：季节直接覆盖 `--primary/--background`，天气只微调 accent/background；粒子层挂在全站（默认开，浅色模式与总开关可关），另有雨雪与闪电。花哨的根因是「每屏都有 + 对比度不足 + 无令牌」，不是四季本身（`design/legacy-visual-dna.md:59-62,266,294`；`DECISIONS.md:277-278`）。
2. 三轮原型没有一轮拿到用户签字。v1/v2 明确被否；v3/v3.1 无结论；仓库里另有 **v3.2（2026-10-23）** 已把首页改成季节×天气墙纸，但同样无用户评审记录（`design/prototype-v3/DESIGN.md:3-7`）。
3. 旧文档大量结论仍成立，但**技术基线日期停在 2026-10-21**，且 Supabase 变量命名自相矛盾（见 §3）。

## 1. 四季 × 天气：旧站的实际建模

### 1.1 状态与选择

| 项 | 旧站实现 | 证据 |
|---|---|---|
| 状态模型 | `themeMode` 七值：light/dark/realtime/spring/summer/autumn/winter；持久化 `portfolio-settings` | `portfolio/portfolio/src/store/index.ts:5-42` |
| 季节 | 按月份：1–3 春、4–6 夏、7–9 秋、10–12 冬；两处各写一遍 | `store/index.ts:45-51`；`ThemeProvider.tsx:15-22` |
| 时段 | 只分亮/暗：6–17 light，17–6 dark；每 60s 重算 | `ThemeProvider.tsx:29-61,142-153` |
| 天气 | `/api/weather` 取 **wttr.in/Wuhan 硬编码城市**；6 类 + `isWindy`；30min 缓存；失败回退「多云 20°C」 | `hooks/useWeather.ts:6-64`；`app/api/weather/route.ts:75-180` |
| 手动 | 一个图标弹层塞 9 个控件（7 主题 + 粒子 + 天气） | `components/ThemeToggle.tsx:8-17,115-155` |
| 冲突 | 两套解析器：store 里 12–14 点→summer、14–18→light；ThemeProvider 里 17 点才转暗 | `legacy-visual-dna.md:201,246` |

结论：**名义 4×2×7=56 套组合，但没有统一状态机**；季节、亮度、天气由三个来源各自决定，`realtime` 会在会话中自动跳变。

### 1.2 每季调色（`globals.css:238-296`）

| 季节 | 浅色 primary (OKLCH) | 计算 HEX | 浅色 background | accent | 深色 primary / background |
|---|---|---|---|---|---|
| 春 | `0.65 0.16 155` | `#04AB62` | `0.99 0.01 155` | `0.92 0.08 155` | `0.75 0.2 155` / `0.12 0.02 155` |
| 夏 | `0.7 0.18 55` | `#F07900` | `0.99 0.01 55` | `0.88 0.12 230`（蓝） | `0.8 0.22 55` / `0.12 0.03 55` |
| 秋 | `0.7 0.18 50` | `#F37513` | `0.99 0.01 50` | `0.92 0.1 50` | `0.8 0.22 50` / `0.12 0.03 50` |
| 冬 | `0.68 0.12 220` | `#17A9CB` | `0.99 0.005 220` | `0.94 0.06 220` | `0.82 0.15 220` / `0.12 0.02 220` |
| 基础 | `0.55 0.2 250` | `#0071DF` | `0.99 0 0` | `0.94 0.02 200` | 深色 primary `0.922 0 0`（近白，品牌消失） |

HEX 为 `legacy-visual-dna.md:69-74` 的计算值。**关键缺陷**：季节直接换掉 primary/primary-foreground，浅色四季实测仅 **2.63–2.94:1**；灰字用 `/60`、`/70` 透明度后 2.54/3.07:1（同文件 69-82）。

### 1.3 天气类型与粒子

| 维度 | 旧站 |
|---|---|
| 天气枚举 | `sunny/cloudy/overcast/rainy/thunderstorm/snowy` + `isWindy`（风速 >30km/h）；CSS 7 个 `weather-*` 类（`route.ts:4,18-24,127`；`globals.css:439-496`） |
| 天气调色 | 只改 accent，部分浅色改 background，**从不改 primary**；深色下几乎无效（`globals.css:429-496`；`legacy-visual-dna.md:50`） |
| 季节粒子 | 每季 5 个 emoji；数量春12/夏10/秋12/冬15；字号 14–28px、透明度 .5–.9、时长 10–25s、`fixed z-50`；默认开，`themeMode='light'` 时整层不渲染（`SeasonParticles.tsx:18-61,217-222`） |
| 雨/雪/雷 | 雨 60 条（0.4–1.2s）、雪 50 点（5–12s）、闪电全屏 z-9999（`SeasonParticles.tsx:93-175,203-212`） |
| 互斥 | 雨/雷隐藏季节 emoji；雪只在冬季保留 emoji（`SeasonParticles.tsx:196-200`） |
| 常驻 Hero | 100 颗星无限闪、两层渐变标题 5s 往返、打字机、3D tilt、60s 轮询日程（`HeroSection.tsx:315-401,471-499,558-596`） |
| 过渡 | 只换 `<html>` class；`*` 全局 0.5s 颜色过渡 + `html` 1s；无底图交叉淡化；无 pre-hydration，夜间首屏闪白（`globals.css:354-360`；`legacy-visual-dna.md:199`） |

### 1.4 哪些是 DNA，哪些造成花哨

| 保留（DNA） | 理由 | 必须改掉的机制 |
|---|---|---|
| 「季节 = 一层很轻的情绪色」 | 用户明确认可四季主题（`DECISIONS.md:261-262`） | 季节覆盖 `--primary` → 阅读对比度随季节漂移 |
| 天气参与氛围（雾/雨/光），而非换肤 | v3.2 的 mood token 已走对方向 | 天气只改 accent/background，深色无效 |
| 中文优先字体栈、细边框、轻阴影、0.4–0.6s 入场 | 旧站最「高级」的部分（`legacy-visual-dna.md:282-287`） | 18 处无限循环、13 种时长、无 reduced-motion |
| 状态卡/行程里的「人味」 | 真实生活感，别处没有 | 9 个控件同层、100 星、双层渐变、3D tilt、玻璃叠玻璃 |
| 真实天气/时间驱动（若要） | 符合 R4/H2 | 两套时间解析器冲突、自动跳变、无兜底说明 |

对照新文档：R3 要「首页空荡、内容全部进二级页」，旧站却把状态卡、问答、最新动态、日程堆在首页；R4 要克制，旧站给的是 56 套换肤 + 每屏装饰。**花哨的三个直接来源**：① 粒子/星星/渐变字跨屏常驻；② 季节换掉 primary 造成高饱和撞色；③ 玻璃/阴影/动效无令牌地叠加（`legacy-visual-dna.md:248-255,292-295`）。

## 2. 三轮原型：否决与验证

| 轮次 | 方向与关键决定 | 评审结论（来源） |
|---|---|---|
| v1 A/B（10-21） | A 冷静编辑：衬线大标题、暖纸白、编号目录、720px 阅读列；B 清爽科技：毛玻璃、一处渐变、白卡、无衬线。各交付首页+文章页，纯静态零外链 | 「过于衬线 / 模板感重」（`DECISIONS.md:179`）；「方向 A/B 未达预期」（`design/prototype-v1/index.html:134`）→ **否决** |
| v2 Glacier（10-21） | 近黑 `#08090a` + 单一冰川青 `#8be9f2` + 左侧 Chapter Rail + ⌘K + 悬浮预览；`--grad` 四色虹彩（`prototype-v2/assets/style.css:14-32`） | 「没有达到惊艳的前端美学」「AI 味太重」，并给 zcode.z.ai / onorca.dev / deepseek.com/en/harness（`DECISIONS.md:232-234`）；D-014 自判四色虹彩+普适光晕是 AI 味主源（`:242`）→ **否决** |
| v3 Aurora（10-22） | 深蓝极光+点阵+噪点，940px 内淡出纯黑；单一冰川青；展示字统一 400；用真实「文章阅读窗」替代抽象图形 | 无用户结论，Gate-1 待复核（`DECISIONS.md:229-249`） |
| v3.1（10-22） | 按 StyleKit 实测校准字号 74/34/18/16/17/19/11；非对称双栏（左标题+右 340px Now 卡）；旧站亮点回收，加三条约束：仅首屏/同类一处/可关；粒子 ≤46、opacity .42、可关 | 无用户结论（`DECISIONS.md:256-280`） |
| v3.2 Portal（10-23） | 首页=全屏季节×天气程序化墙纸（16 组 mood token + 雨/雾 canvas，mood token 约 1s 缓入）+ 哑光细玻璃 + Blog/Essays 双入口 + 长列表折叠；明说「candy-pill mockups are void」 | 无用户结论；`design/index.html` 标为「当前提案」（`prototype-v3/DESIGN.md:3-7`；`TWEAK-NOTES.md:6-14`） |

**令牌与首页结构对照**（实际 CSS，非文档愿景）：

| 版本 | 底色 / 强调 | 字体与字号 | 首页结构 |
|---|---|---|---|
| v1 A | `#faf9f5` / `#17181c`；青蓝 | Serif 大标题 + 无衬线正文 17px/1.9 | 细线页头 → 左 8 栏 Hero → 编号文章目录 → 项目/近况 → 页脚 |
| v1 B | `#f4f8fb` / `#101828`；`#0d7488` + `#12b4c8` | 全无衬线，正文 17px/1.85，标题 750 | 毛玻璃吸顶 → 居中 Hero + 一处渐变字 → 2 列文章卡 → 项目卡 → 三入口 |
| v2 | `#08090a`（浅 `#f7f8fa`）/ 冰川青 `#8be9f2`（浅 `#077a8c`） | Segoe UI Variable + Noto Sans SC；正文 17px/1.9 | 左 76px Chapter Rail → 8/4 Hero → 悬浮预览文章索引 → Bento 项目 |
| v3.2 | 墙纸 mood token（季节×天气）；哑光玻璃 | 同 v3.1；Display `clamp(2.35–4.65rem)` / 400 | 全屏墙纸 → 细玻璃顶栏 → mood line → Blog/Essays 双入口 → 折叠写作列表 → 页脚 |

**已被否决清单**：衬线+暖纸的编辑模板；毛玻璃+渐变+白卡的科技模板；近黑+四色虹彩+Chapter Rail；厚描边糖果玻璃（`prototype-v3/DESIGN.md:7`）；旧站全站常驻粒子/天气换肤/100 星/双层渐变/3D tilt（`legacy-visual-dna.md:290-301`）。

**已验证有效清单**（有明确证据，非用户签字）：

- 单一强调色；季节只改强调色（`prototype-v1/BRIEF.md:59`；`legacy-visual-dna.md:307`）
- 中文优先、零网络字体；正文 16.5–17px/1.85–1.9；阅读列 660–720px（`BRIEF.md:90,118`；`legacy-visual-dna.md:284,321`）
- 展示级 400 字重（Windows 中文只有 400/700，中间字重跳粗）（`DECISIONS.md:243-244`）
- 非居中窄栏、非对称版式（`DECISIONS.md:269-270`）
- 无无限循环、装饰 ≤3、全站 reduced-motion（`BRIEF.md:144`；`legacy-visual-dna.md:326-337`）
- 纯静态 HTML 原型、零外部请求、离线可开（`BRIEF.md:117-120`）
- 真实界面替代抽象图形（`DECISIONS.md:245`）

## 3. 仍然成立的技术基线（保留原日期）

| 事实 | 日期 / 来源 | 处理 |
|---|---|---|
| 旧站 Next 16.1.1 / React 19.2.3 / Tailwind v4 oklch / shadcn+Radix / Framer 12；253 文件 1.5MB | 2026-10-20 `docs/05-migration/legacy-audit.md:15-25` | 仅对照；文中写「14 个路由」但表列 15 条 |
| 旧站鉴权可绕过、双库并存、SQLite on Vercel 丢数据、AI 写作 35 文件/1500 行 | 2026-10-20 同上 `:51-123` | 仍然成立的教训 |
| 旧站无 Footer、双 H1、`.prose` 是空类（无 typography 插件）、导航补偿 4 套 padding | 2026-10-21 `design/legacy-visual-dna.md:241-255` | 仍然成立 |
| Windows 中文仅 400/700，中间字重跳粗 → 中文必须 Web 字体+子集化 | 2026-10-22 `DECISIONS.md:243-244` | 保留 |
| Supabase 新 key 名 publishable/secret，旧 anon/service_role 2026 年底弃用 | 2026-10-21 `DECISIONS.md:220` | **需重验**；2026-10-23 时 `SECURITY.md`/`.env.example` 仍写 ANON/SERVICE_ROLE，2026-10-27 活动仓库已改为空占位并移除旧变量名 |
| Notion 需显式 `notionVersion:'2026-03-11'` | 2026-10-21 `DECISIONS.md:221` | **需重验** SDK 支持 |
| Next 16 `'use cache'` 需 `cacheComponents:true`，启用后禁路由段 revalidate | 2026-10-21 `DECISIONS.md:222` | **需重验** |
| Supabase 新表默认 grants 可能给 anon 写权限 → REVOKE + RLS | 2026-10-21 `DECISIONS.md:223` | **需重验** |
| Notion 限流 180 req/min（Free/Plus）；图片 URL 约 1h 过期，需存 block_id 代理；块分页 100/次 | 2026-10-21 `docs/01-spec/architecture.md:199,241-258,285` | **需按官方文档重验** |
| AdSense 需 Privacy/About/Contact；「20-30 篇」等不是官方硬门槛 | 2026-10-20 `legacy-audit.md:129`；`06-review/2026-10-20-plan-review.md:164-166` | 政策需按当前 Google 政策重验 |
| 旧域名 czj527.xyz，Vercel 部署；备案状态未知 | `README.md`、`portfolio/portfolio/AGENT.md`；`CONTEXT.md` §3 | 保留，待确认 |

另：`legacy-visual-dna.md:225-230` 已指出旧审计数量错误（globals 13.7→14.3KB、UI 70→53、effects 9→10）——引用旧数字先以此为准。

## 4. 工程资产

| 可复用（路径 + 用途） | 取舍 |
|---|---|
| `portfolio/portfolio/src/lib/utils.ts` | `cn()`，唯一生产 util |
| `.../components/ui/button.tsx`、`input.tsx` | 实际 import 闭包只有这两个；复用结构、重绑令牌（`legacy-visual-dna.md:208-212`） |
| `.../src/app/globals.css` | 只作令牌分层/季节写法参考，不可照抄色值 |
| `.../components/Navigation.tsx` | fixed + backdrop-blur + 1px 底边的形式语言（重写） |
| `.../components/ThemeProvider.tsx` | class 挂载思路（重写，删双解析器与天气/粒子挂载） |
| `.../src/hooks/useWeather.ts` + `src/app/api/weather/route.ts` | 30min 缓存与 WWO code→类型映射参考；不复用硬编码 wttr.in/Wuhan |
| `.../components/effects/SeasonParticles.tsx` | 反面参数基线（数量/尺寸/透明度/时长） |
| `.../components/effects/HeroSection.tsx` | 仅「身份块+一句话+主 CTA」骨架 |
| `.../components/effects/AboutSection.tsx` | 时间线语义（重写） |
| `.../public/avatar.jpg` | 78KB，压 1x/2x |
| `.../src/app/{robots,sitemap.xml,rss.xml}` | SEO/RSS 路由骨架 |
| `design/prototype-v3/assets/portal.{css,js}` | v3.2 墙纸/雨雾/心情面板，可作新原型起点（需用户确认） |
| `design/legacy-visual-dna.md` | 旧站审计方法与对比度实测方法 |

**应放弃**：其余 effects（BlogCard/ProjectCards/QnASection/MicroInteractions/PageTransition/PortalHeroSection/index.ts）；`TiptapEditor`、`blog-agent/**`、`use-blog-writer`、`/ai-write`、`/blog/new`；`prisma/**`、`lib/prisma.ts`、`supabase/{workflow,project_logs}*.sql`；`schedule/ScheduleView`、`ProjectCard`、`BlogVersionSelector`；53 个 ui 中除 button/input 外 51 个；7 组 weather token、`--chart-*`/`--sidebar-*`、`.glass`/`.gradient-border`/`.hover-lift`/`.card-hover`/`.animate-*`；`store/index.ts`；旧文章/评论/点赞/留言/友链/任务/日程/项目/配置（D-008/D-012）。

## 5. 旧决策 vs 新需求

| 决策 | 旧结论 | 冲突/现状 | 建议 |
|---|---|---|---|
| D-001 | 不迁 WordPress | R8 提到 WP、广告、成熟管理；但 R10 要 agent 原生 | **保留结论、重写理由**：以 agent 原生+内容契约为先；广告/编辑体验不足时再评估 headless WP |
| D-002 | 删 AI 写作/站内编辑器 | 与 R10 一致 | **保留** |
| D-003 | Notion 内容源 + Supabase 互动 | R9 写作工具未定；H4 要求解耦；R7 财务在别项目 | **部分作废**：保留「内容/互动分离」，把 Notion 降为可替换适配器 |
| D-004 | 旧库保留、新库独立 | 一致 | **保留** |
| D-005 | 文件为源 | 与用户协作偏好一致 | **保留** |
| D-006 | DeepSeek 搜索（dssearch） | 蓝的平台未知（`CONTEXT.md` §3） | **保留为能力假设**；接口同时覆盖 MCP/CLI/REST |
| D-007 | 删 roadmap/project-logs | 新站无项目管理 | **保留** |
| D-008 | 历史文章全不要 | R11 明确清空 | **保留** |
| D-009 | 经济页公开脱敏，禁金额 | R7 要求「完全透明」记录经济状况 | **待决**：见 §6 |
| D-010 | 原型审批是前端前置 | 一致；Gate-1 至今未签 | **保留** |
| D-011 | 视觉基线更替、T-1 拆分 | v2 被否，`design-system-v2.md` 从未产出；D-015 又回收旧站亮点 | **部分作废**：保留「原型先于前端」；删除「Glacier v2 为契约」；「不迁 effects/天气/粒子」改为「重写、不迁代码」 |
| D-012 | 旧数据全不迁 | 一致 | **保留** |
| D-013 | 技术基线四项 | 已 2 天；变量命名文档自相矛盾 | **保留但 2026-10-23 重验后写死** |
| D-014 | Aurora v3 | v3.2 已换掉首页；深蓝极光未被用户确认 | **部分保留**：单一强调色/展示 400/真实界面；首页以墙纸为准 |
| D-015 | StyleKit 字号 + 回收旧站亮点 | 字号仍有效；「首屏唯一/Now 卡/行程」被 v3.2 取消 | **部分保留**：字号/400 字重；「亮点」从首屏一处升级为整张墙纸的情绪 |

| 旧边界 | 新需求 | 建议 |
|---|---|---|
| 不做多语言（`docs/00-overview.md:30`；`architecture.md:343`） | R8 国际站；H7 en 一等公民 | **作废**，需 i18n |
| 不做全文搜索（同上） | R8 成熟管理；内容量未知 | **保留**，接口预留（先不做） |
| 不装第二个 CMS（`00-overview.md:28`） | R9 工具未定 | **保留原则**：单一权威内容源 |
| 不在站内做编辑器（`00-overview.md:29`） | R10 agent 发布 | **保留** |
| 经济页只公开脱敏（D-009） | R7「完全透明」 | **待决** |
| 公开导航 5 项、任务/日程进 admin（`prototype-v1/BRIEF.md:41`） | R3 顶部极简导航 | **保留** |

## 6. 需用户决策

1. **经济页粒度**：完全透明（含金额）还是脱敏（仅百分比/里程碑）？推荐脱敏为默认、金额分级可见——D-009 的安全理由仍成立，而 R7 的「完全透明」需要明确边界。
2. **天气数据源**：真实 API（Open-Meteo/和风）还是日期+手动？推荐 Open-Meteo（免 key）+ 气候学兜底 + 手动覆盖；旧站 wttr.in/Wuhan 硬编码且无定位，不建议沿用。
3. **天气枚举**：旧站 6 类+风，v3.2 只有晴/阴/雨/雾。推荐 4 主类 + 雪/雷作为季节变体，避免 56 套组合失控。
4. **旧站亮点取舍**：渐变字（v3.2 禁用）、状态卡/行程（v3.2 删除）、粒子（默认关）三项是否保留？推荐只保留「四季×天气墙纸 + 可关粒子」，其余进二级页。
5. **v3.2 的定位**：是否作为新设计案起点？它与 `CONTEXT.md:28` 的「v3/v3.1 复核中」不一致，需确认是「已验证资产」还是「仅参考」。
6. **写作工具与 i18n 首发范围**：Obsidian/Notion 谁先接；en 是否首发。推荐先做工具无关的内容契约，en 先预留不首发。
