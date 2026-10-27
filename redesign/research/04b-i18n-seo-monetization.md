# 04b · i18n / SEO / 变现 / 分发 / 搜索 / 分析

> 核验日 2026-10-23；未注明日期的来源均于当日核验。标记：【实】官方文档可核验；【社】社区/第三方经验；【推】我的推断。价格与政策为当日页面口径。

## 0. 结论速览

| 议题 | 结论 | 理由 |
|---|---|---|
| 路由 | zh 在 `/`，en 在 `/en` | 权重集中、一套部署、hreflang 最简单 |
| 翻译 | zh 为源；en 机翻 + 审核标记；观点文默认不翻 | 避免低质批量内容与作者声音失真 |
| 广告 | 不把 AdSense 当主收入，先联盟 + 赞助 | 大陆 RPM 低、脚本被墙、收款麻烦 |
| 分发 | 文章 → videoBrief → HyperFrames → ffmpeg | 一套素材出 16:9 与 9:16 |
| 搜索 | Pagefind 起步，需即时/语义再上 Meilisearch | 构建期零运维，CJK 可用 |
| 分析 | Umami 自托管 + Cloudflare 兜底 | 大陆可达、无 Cookie、成本低 |
| 评论 | Supabase 自建 + Turnstile | agent 可直接审核，不依赖 GitHub |

## 1. i18n

### 1.1 路由
【实】Next.js 官方给出的做法是两种：子路径 `/fr/products` 或域 `my-site.fr/products`；URL 参数不推荐。（nextjs.org/docs/app/guides/internationalization, 2026-06-10）

| 方案 | SEO | 运维 | 适用 |
|---|---|---|---|
| 子路径 `/en` | 权重集中，一个 GSC 资产 | 最简单 | **推荐** |
| 子域 `en.` | 可独立 CDN，权重分散 | 需分别验证 | 需要不同托管 |
| 独立域名 | 品牌/合规隔离，成本最高 | 最重 | 将来做独立英文品牌 |

用 `next-intl`：`localePrefix: 'as-needed'`（zh 无前缀、en 有前缀）、`localeDetection: true`、`localeCookie.maxAge` 设一年。（next-intl.dev/docs/routing/configuration）注意 Next.js 16 中 `middleware.ts` 已改名 `proxy.ts`，仍用 `createMiddleware`，matcher 要排除 `api/_next/带点路径`。

### 1.2 locale 协商与记忆
- 仅对 `/` 做 302 协商（`Accept-Language` 经 `@formatjs/intl-localematcher` 匹配 → 写 `NEXT_LOCALE` Cookie）；**深链绝不自动跳转**。
- 【实】Google 明确"避免按语言自动重定向"，也不要按 IP 改编内容：爬虫多从美国发起且常不带 Accept-Language，自动跳转会让它看不到全部版本；应给显式语言链接。（developers.google.com/search/docs/specialty/international/managing-multi-regional-sites）
- 切换器写 Cookie + 跳对应路径；不要在客户端用 `navigator.language` 二次跳转（闪烁 + CLS）。

### 1.3 hreflang / canonical / sitemap
- 每个语言页自指 canonical；hreflang 互指且**含自身**，用绝对 URL：`zh-CN`、`en`、`x-default`（建议指 `/en`）。
- 三选一：HTML `<link>`、HTTP `Link` 头、sitemap `<xhtml:link>`；不要混用。（developers.google.com/search/docs/specialty/international/localized-versions）
- `sitemap.ts` 的 `alternates.languages` 自动生成 `xhtml:link`；按语言/类型拆分，单文件 ≤5 万 URL。（nextjs.org/docs/app/api-reference/file-conventions/metadata/sitemap, 2026-08-18）
- `robots.ts` 输出 sitemap；`<html lang>` 与 hreflang 一致。

### 1.4 RSS 按语言
`/rss.xml`（zh）、`/en/rss.xml`（en），各自 `<language>` 与 `<atom:link rel="self">`；文章页加 `<link rel="alternate" type="application/rss+xml" hreflang="...">`。不混语言；可另出 `/feed/all.xml` 供聚合。

### 1.5 slug
- 两语言共用**英文语义 slug**（中文标题意译），如 `/posts/ai-and-the-ordinary-person`；中文直接进 URL 分享时是一长串 `%E4...`。
- slug 不可变；`legacySlugs[]` 生成 301。拼音仅兜底（`pinyin-pro`），可读性不如意译。
- 静态页可用 `pathnames` 本地化；**文章不要**按语言改路径，避免 hreflang 配对错乱。

### 1.6 翻译工作流
frontmatter：`locale, translationOf, sourceHash, translationStatus(machine|reviewed|stale), translator, reviewer, reviewedAt`。
- 流程：zh 发布 → agent 按术语表翻译 → 校验术语/数字/引语 → `machine` 并在页首显示"机器翻译，欢迎指正" → 人工审 → `reviewed`；源文改动令 `sourceHash` 变化 → `stale`，只重译 diff 段。
- 术语表入库（人名、产品、固定译法）；段落级翻译记忆，避免整篇重译。
- 观点类风险【推】：反讽/语气/文化语境丢失，引语误归属，立场被"润色"得更绝对，政治法律敏感度不同。做法：只翻解释性/常青文；观点文要么作者审过再发，要么只保留 zh；禁止 agent 改立场；保留 hedge。不要为 SEO 批量机翻——Google 的 scaled content abuse 政策针对低价值批量页。

### 1.7 字体与排版
- 拉丁：单一可变 grotesque（Inter/Geist），subset `latin,latin-ext`，约 30–60KB。
- 中文：思源黑体/Noto Sans SC，用 `cn-font-split`（Apache-2.0, v7）切 unicode-range 分片按需加载；绝不整包（5–20MB）。（github.com/KonghaYao/cn-font-split）
- `next/font/local` 自托管 + `display:swap` + `adjustFontFallback`；首屏字体 ≤120KB/语言。（nextjs.org/docs/app/api-reference/components/font, 2026-09-24）
- 中文 17px、行高 1.8、段距 1em、`letter-spacing:.01em`、两端对齐；英文 18px/1.6/左对齐；中英混排给拉丁字体单独 family；数字 `tabular-nums`。
- Windows 只有 400/700：设计只用这两档，`font-synthesis-weight:none` 防伪粗体。
- OG 图也需中文字体，但 `ImageResponse` 整包 ≤500KB（含字体），必须子集化或构建期预生成。（nextjs.org/docs/app/api-reference/functions/image-response, 2026-08-06）

## 2. SEO

### 2.1 三引擎
| 引擎 | 要点 |
|---|---|
| Google | 可抓取、内链、文本化、结构化数据与可见内容一致；无 AI 专用文件（developers.google.com/search/docs/appearance/ai-features） |
| Bing | 支持 IndexNow（Amazon/Bing/Naver/Seznam/Yandex/Yep）；sitemap 仍要交（indexnow.org/faq） |
| 百度 | 站点验证长期保留；普通收录 sitemap + API 推送（单次 2000 条、日配额以后台为准）（ziyuan.baidu.com/college/courseinfo?id=267） |

- 百度可抓境外主机但慢；【社】百度联盟要求 ICP 备案 + 大陆服务器，个人站基本无门。
- Bing Webmaster Tools 可 import GSC；IndexNow 一推多引擎。

### 2.2 JSON-LD
- `BlogPosting`：headline、datePublished/Modified、author(Person, url/sameAs)、image(16:9/4:3/1:1, ≥50K px)、inLanguage、mainEntityOfPage、publisher、isPartOf、keywords、wordCount。
- `Person`：name、url、sameAs、jobTitle、description、knowsLanguage。`BreadcrumbList`：首页→专题→文章。
- 【实】Article 系列无必填项，按适用项填；作者只写人名，职位/敬称放别处。（developers.google.com/search/docs/appearance/structured-data/article, 2026-09-08）

### 2.3 OG 图
`opengraph-image.tsx` + `ImageResponse`，1200×630，按 slug 生成，长标题两行截断，CJK 子集字体。更稳：构建期用 satori/resvg 预生成到 CDN，避开运行时冷启动与 500KB 限制；配 `twitter:card=summary_large_image`。

### 2.4 站内链接 / 系列
`/series/[slug]` 有序目录 + 上/下一篇 + "第 N / M 篇"；`/topics/[tag]` 主题枢纽；"Start here" 页。相关文章 = 标签 + 构建期 embedding 取 3–5 篇；首段内链 1–2 条，禁止页脚堆链接；面包屑同时出 UI 与 JSON-LD。

### 2.5 CWV 预算（首页含重型 WebGL）
【实】LCP ≤2.5s、INP ≤200ms、CLS ≤0.1（75 分位，移动/桌面分开）。（web.dev/articles/vitals, 2024-10-31）

| 指标 | 目标 | 做法 |
|---|---|---|
| LCP | ≤1.8s 目标 / 2.5s 上限 | LCP 元素=静态海报 AVIF/WebP ≤180KB，`preload` + `fetchpriority=high`，固定尺寸 |
| INP | ≤150 / 200ms | 首屏 JS ≤170KB gz；shader 库 ≤40KB；无 >50ms 长任务；粒子分档 |
| CLS | ≤0.05 / 0.1 | 图片/广告/嵌入全用 `aspect-ratio` 或 `min-height`；字体 metric override |
| TTFB | ≤0.8s | 静态化 + CDN；只在边缘做协商 |

- WebGL 渐进增强：`load` 后 `requestIdleCallback` 初始化；canvas `fixed;inset:0;z-index:-1;pointer-events:none`；DPR ≤1.5；`visibilitychange` 暂停；低端设备/`prefers-reduced-motion` 直接静态图。
- 【实】广告是 CLS 最大来源之一：预留位、空位不塌陷、注入内容靠下。（web.dev/articles/optimize-cls）
- 广告脚本在 LCP 后加载；文章页最多 2–3 位；首页不放广告。

### 2.6 robots / sitemap / IndexNow
`robots.ts` 允许抓取，屏蔽 `/api`、`/studio`、`/draft`，声明 sitemap。发布即 POST IndexNow（key 文件放根，8–128 位，批量上限 10,000 URL）；Google 不在参与名单，仍需 sitemap + 内链。百度走普通收录 API；上线 `ads.txt`。
薄页治理：站内搜索结果页、<3 篇的标签页、分页第 2 页以后 `noindex,follow`；`lastmod` 只在正文实质变化时更新，别每次构建都刷新。

### 2.7 AI 搜索 / llms.txt
- 【实】Google：AI Overviews/AI Mode **无额外要求**，不需要新文件或特殊 schema；可抓取、文本化、结构化数据一致即可。`Google-Extended` 只控 Gemini 训练/grounding，不影响收录。
- 【实】llms.txt 是 2024-09 提案，v2 改于 2026-08-10；自称"数千站点"，Mintlify/GitBook/Yoast/AIOSEO 会生成；**Google 明确不用**，多数 AI 搜索未消费，OpenAI 爬虫会访问。低成本可选项，别当排名杠杆。（llmstxt.org）
- 真正有效：可抓取 HTML、清晰标题层级、作者与日期、可引用事实段、FAQ 段、稳定 `.md` 版本 + `rel=alternate`。
- 训练与引用分开决策：不想被训练就拒 GPTBot/ClaudeBot/Google-Extended；想被引用就放行 OAI-SearchBot/PerplexityBot。

## 3. 变现

### 3.1 AdSense 2026
- 【实】官方无最低流量；要求 18+、自有站点、可访问 HTML、原创且对受众有价值的内容。（support.google.com/adsense/answer/9724）
- 【实】内容广告扣平台费后 publisher 拿 80%；经 Google Ads 购买时约 68% 到手。（answer/180195）
- 【社】实际审核看"低价值内容"：建议 15–25 篇长文 + About/Privacy/Terms/Contact + 明确作者再申请。
- 运营风险：大陆访问 Google 不稳定，脚本/后台常不可用；收款需境外账户/电汇。**不能当大陆流量变现方案**。

### 3.2 CMP
【实】EEA/UK 自 2024-01-16、瑞士自 2024-07-31 起，个性化广告必须用 Google 认证的 IAB TCF CMP，否则只能非个性化/受限广告。（answer/13554116）同意范围含 Cookie 与个性化广告的数据收集/共享，需可撤回、可审计（google.com/about/company/user-consent-policy）。选型：Google 自家 CMP（免费）起步，流量大再上 Usercentrics/Didomi/Sourcepoint。

### 3.3 广告与 CWV
预留 `min-height`、空位不塌陷、`loading=lazy` + `fetchpriority=low`；文内第 2 段后 1 个、文末 1 个；侧栏 sticky 仅桌面；禁自动刷新/弹窗（AdSense 政策也禁）。目标 CLS ≤0.05。

### 3.4 大陆可用选项
| 渠道 | 门槛 | 现状 |
|---|---|---|
| 百度联盟 | ICP 备案 + 大陆服务器【社】 | 个人无备案基本不可行 |
| 淘宝客/京东联盟/多多进宝 | 实名，个人可 | CPS 1–30%，平台扣 5–10% 技术服务费【社】 |
| 公众号流量主 | 公众号 + 粉丝门槛 | 与分发联动时可做 |
| 腾讯优量汇 | 以 App 为主 | 网站不适用 |

### 3.5 其他路径
联盟（Amazon 1–10%，类目差异大【社】）、会员/订阅（Stripe 对大陆个人不友好，可用爱发电/Patreon）、赞助（单篇/整站，需媒体包）、数字产品（模板/电子书）、付费 newsletter。

### 3.6 收入预期（看局限）
| 月 PV | 英文 Tier-1 展示广告 | 中文/大陆流量 | 说明 |
|---|---|---|---|
| 1 万 | $30–100 | $5–30 | AdSense RPM $3–8 vs $0.5–3 |
| 5 万 | $150–500 | $30–150 | Journey 门槛 1k Tier-1 sessions/30 天 |
| 10 万 | $300–1,000 | $60–300 | Raptive 25k PV 可申请 |
| 50 万 | $1,500–5,000 | $300–1,500 | 需多广告位/直客 |

数据来自 2026 行业博客估算，样本自选、地区/品类差 5–10 倍，**只当量级**。联盟在科技/金融类可超过广告；订阅转化约为活跃读者的 1–3%【推】。【社】稳定到 1 万 PV/月通常需 12–18 个月；先把它当"记录 + 作品集"，收入是副产品。

### 3.7 WordPress vs 自建
【实】WordPress 占全站 39.6%、已知 CMS 的 58.3%（w3techs, 2026-10-23），原因是插件生态与"不改代码也能运营"。自建需补齐：

| 能力 | 自建做法 |
|---|---|
| Meta/OG/canonical/sitemap/robots | Metadata API + `sitemap.ts`/`robots.ts` |
| 301 重定向 | `redirects` 表 + 中间件，发布时写 map |
| 广告位管理 | 内容块 `adSlot` + 前台组件 + 开关 |
| 内链推荐 | 构建期标签/embedding 产出 related |
| 表单 | 自建 API + Turnstile + 邮件通知 |
| 媒体 | 上传 → AVIF/WebP 多尺寸 → CDN |
| 版本/回滚/定时发布 | Git + 内容库版本表 |
| 备份/安全 | 托管平台 + 每日导出 |

## 4. 分发

### 4.1 管线
文章 → `videoBrief`（hook / 6–8 段 / 每段一个观点 + 画面 + 屏显字）→ 分镜 JSON → HyperFrames HTML 合成 → `npx hyperframes render --quality high --output out.mp4`（支持 `--batch rows.json`、`--width/--height`）→ ffmpeg 混音/响度/字幕/多画幅。
配音真人 > TTS；TTS 用 MiniMax/火山/Azure/Edge-TTS，按句生成便于对字幕。竖屏字幕 14–18 字/行、最多 2 行；抖音/小红书/视频号烧录，YouTube 上软字幕。封面：16:9（B站/YouTube）、3:4（小红书）、9:16（抖音/视频号）。

### 4.2 平台规格与引流限制
| 平台 | 画幅/分辨率 | 时长/大小 | 外链与引流（客观） |
|---|---|---|---|
| YouTube | 16:9 1920×1080；Shorts 9:16 | 官方建议 MP4/H.264/48kHz | 简介链接可点；**Shorts 简介与评论的 URL 不可点**（support.google.com/youtube/answer/13748639） |
| B站 | 16:9 1080p+ | 以投稿页为准 | 治理公告打击"未报备站外联系方式、公众号、二维码、小程序码、网址链接" |
| 抖音 | 9:16 1080×1920 | App 单文件约 500MB【社】 | 《诱导第三方》细则禁外链/二维码/联系方式/暗号 |
| 小红书 | 3:4 或 9:16，1080p | ≤500MB、≤15 分钟【社】 | 2025-03-12《交易导流违规管理细则》禁站外链接/微信 |
| 视频号 | 9:16 或 16:9，比例 0.33–3.0 | 手机 3s–60min，≥10Mbps | 可挂公众号文章（站内闭环）；外链不可 |

结论【推】：国内平台不要把"导流"写进视频；用同名账号 + 评论区置顶关键词 + 主页简介做弱引导。规则每季度会变，发布前复查。

### 4.3 内容模型预留字段
`summary`、`keyPoints[]`、`pullQuotes[]`、`cover{16x9,3x4,9x16}`、`ogImage`、`videoBrief{hook, segments[{narration,onScreen,broll}], cta}`、`ttsScript`、`subtitles[]`、`faq[]`、`series`、`translation*`。

### 4.4 Newsletter
| 方案 | 成本 | 优点 | 缺点 |
|---|---|---|---|
| Ghost 内置 | $18/$29 起，0% 交易费 | 博客+会员+邮件一体 | 自托管 bulk **仅支持 Mailgun**（docs.ghost.org/newsletters） |
| Buttondown | 100 订阅内免费；付费订阅 +$9/月 | 简单、API 友好 | 规模大后按订阅计费 |
| Beehiiv | 免费至 2,500 订阅；Lite $49/月 | 增长工具、广告网络 | 贵，绑定生态 |
| Substack | 抽成 10% + Stripe【社，官方页 403 未核验】 | 自带流量/网络效应 | 品牌与数据受制 |
| 自建 + Resend/SES | Resend 免费 3k/月；SES $0.16/千封 | 完全可控、便宜 | 退订/退信/合规全自理 |

大陆送达【社】：Gmail 不可达；QQ/163 对境外批量邮件过滤严。需独立子域 + SPF/DKIM/DMARC + 双重确认 + 纯文本 + 低频预热。大陆订阅者建议走腾讯云 SES/SendCloud 等国内 ESP（通常需实名/备案），与海外名单**分两条发送通道**。

## 5. 站内搜索
| 方案 | 中文 | 双语 | 运行方式 | 结论 |
|---|---|---|---|---|
| Pagefind | 支持 CJK 分词（extended 版默认），无词干 | 按 `<html lang>` 分索引 | 构建期静态 | **首选**，零运维 |
| Orama | `@orama/tokenizers` 普通话分词（实验性） | 可 | 浏览器内存 | 轻量但中文一般 |
| MiniSearch | 需自写 tokenizer（可用 `Intl.Segmenter`） | 可 | 浏览器 | 极轻，功能少 |
| Meilisearch | jieba（Charabia） | 强 | 自托管/云 | 要即时/语义时选 |
| Typesense | 字段级 `locale: zh` | 强 | 自托管/云 | 与 Meili 二选一 |
| Algolia | CJK 词典 | 强 | SaaS | 免费 1 万请求，贵且数据出境 |

【实】Pagefind 按 `lang` 建多索引，CJK 用无空格切分（"每個月都"→"每個/月/都"），扩展版默认启用。（pagefind.app/docs/multilingual/）【推】全站 SSG 时，构建后对 `.next/server/app/**/*.html` 跑 Pagefind；动态页多则换 Meilisearch。

## 6. 分析
| 方案 | 大陆可达 | GDPR | 成本 |
|---|---|---|---|
| Plausible | 一般（自托管最好） | 无 Cookie，免同意横幅 | 云 $9/1 万 PV；CE 自托管 AGPL |
| Umami | 自托管可控 | 无 Cookie | 云免费 10 万事件；自托管 $5 VPS |
| CF Web Analytics | 较好 | 无 Cookie/无指纹 | 免费；无自定义事件，原始数据 7 天 |
| Vercel Analytics | 差 | 无 Cookie | Hobby 5 万事件；Pro $0.03/千 |
| GA4 | 差（Google 被墙） | 需同意模式 | 免费 |

【实】GA4 依赖 google-analytics.com，大陆常卡死/不可达（Cato, 2026-06-22）；Vercel 官方也承认大陆访问慢或失败。推荐 Umami 自托管（香港/新加坡）+ CF 兜底；公开统计页只展示 PV/来源国/热门文章，不展示实时访客 IP。

## 7. 评论
| 方案 | 大陆 | 反垃圾 | 审核 | 结论 |
|---|---|---|---|---|
| Supabase 自建 | 好（自选区域） | Turnstile + 频率 + 关键词 | agent 直接调 API | **推荐** |
| Giscus | GitHub 不稳 | GitHub 账号门槛 | 在 GitHub 审 | 技术读者可以 |
| Waline | 好（Docker） | Akismet/违禁词/IP 频率/Turnstile | 后台审核 | 次选，开箱即用 |
| Cusdis | — | 无 | 手工 | **不要用**：2026-07-17 已归档弃用 |

【实】Turnstile 免费、无限验证、20 个 widget（developers.cloudflare.com/turnstile/plans, 2026-08-14）；Giscus 需 GitHub 账号授权（giscus.app）。agent 审核【推】：新评论先 `pending`，agent 按链接数/语言/重复/攻击性分类，低风险自动通过，高风险进人工队列，所有动作写审计表。

## 8. 需用户决策的问题
1. **域名**：继续 `czj527.xyz` 还是为国际站换 `.com`？（推荐先 `.xyz` + `/en`，品牌独立时再迁）
2. **根路径语言**：zh 在 `/`、en 在 `/en`（推荐），还是 en 在 `/`？
3. **观点类是否翻译**：推荐只翻解释/常青类；观点类逐篇确认或只保留中文。
4. **广告**：是否接 AdSense（大陆不可用 + CMP + 收款成本）？推荐先联盟/赞助，过 1 万 PV 再评估。
5. **Newsletter**：Ghost 一体化 vs 自建 + Resend + 国内 ESP 双通道（推荐后者；不想维护则 Ghost）。
6. **评论**：Supabase 自建 + Turnstile（推荐）vs Waline（省事）vs 先不开。
7. **搜索**：Pagefind（推荐起步）vs 直接 Meilisearch。
8. **视频**：TTS 还是真人配音？首发优先级（推荐 YouTube + B站长视频，抖音/小红书做切片）。
9. **ICP 备案**：是否做？（影响百度联盟、国内 ESP、大陆速度；不备案则放弃国内广告）
