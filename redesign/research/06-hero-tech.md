# 06 首页「窗」技术可行性与实现方案

> 核验日期：2026-10-23。证据标记：★ 官方规范/文档；◇ 第三方实测或社区经验（注明）；○ 本文推断/未实测。
> 结论先行：**原生 WebGL2 做「一张全屏底图 + 少量图层」；LCP 交给 AVIF 静态底图，WebGL 在 LCP 后接管；液态玻璃优先在 WebGL 内做透镜、DOM 只留语义按钮；天气效果默认强度压低；4K 只做 poster，不上 GPU。**

## 1 渲染引擎选型

### 1.1 需求拆解

首页只需要：1 个全屏 quad、2–3 张底图交叉淡化、4–6 个粒子/雾图层、每帧 6–15 个 uniform、轻微指针视差、一个按钮矩形内的玻璃透镜。**没有场景图、没有相机运镜、没有 glTF、没有光照模型**。这决定了「引擎越大越亏」。

### 1.2 对比（gzip 体积为本机 esbuild 实测或 bundlephobia）

| 方案 | 最小可用体积 | 2026-10 维护状态 | Next.js 16 / React 19 | 适配度 | 结论 |
|---|---|---|---|---|---|
| **原生 WebGL2** | 库 0；自写封装约 6–12 KB（估算） | 浏览器标准，WebGL2：Chrome 56 / Firefox 51 / Safari 15 ★ | 纯 client 模块，无 React 依赖 | 最高：全屏 shader 就是它的主场 | **推荐** |
| **OGL 1.0.11** | **13.8 KB**（最小 triangle+texture，本机实测）；整包 34.2 KB | 1.0.11 发布于 2025-01；仓库最后提交 2025-04；4.7k star；Unlicense | ESM，`'use client'` 直接可用 | 高：Renderer/Program/Mesh 足够 | **备选**（想少写 200 行时） |
| regl 2.1.0 | 37.9 KB | 仓库 2026-10 仍有提交；127 open issues | 直接 | 中：命令式，无场景结构 | 不选 |
| three.js 0.186.1 | **129.6 KB**（最小 renderer+quad，本机实测）；整包 174 KB（0.180，bundlephobia） | 0.186.1（2026-09）；月更，API 漂移 | R3F 9.8.2 peer `react >=19 <19.4` | 低：为 1 个 quad 付整个引擎 | 不选 |
| @react-three/fiber | three 之上再加 reconciler | 活跃，9.8.2 | React 19 一等公民 | 低：声明式对单 canvas 无收益 | 不选 |
| PixiJS 8.x | 225 KB（8.13，bundlephobia） | 活跃（8.22） | 直接 | 低：2D sprite 强，shader 全屏底图非核心 | 不选 |
| Babylon.js 9.32 | **1.81 MB** | 活跃 | 直接 | 极低 | 不选 |
| Unicorn Studio | 运行时约 29–46 KB（第三方实测） | 活跃；Legend $14/月（年付）或 $20/月，商用授权 + JSON 导出 | iframe/脚本嵌入 | 中：做概念验证快，但天气 uniform 控制弱、依赖其运行时 | 只做视觉预演 |
| Spline | **561 KB** 运行时（第三方实测 v2.0.41，2026-09） | 活跃；免费版带水印 | React 组件 | 极低：3D 编辑器，不是全屏摄影底图方案 | 不选 |

来源：bundlephobia（ogl/regl/three/pixi/@babylonjs/core，2026-10-23）；本机 `esbuild --minify` + gzip -9 实测（2026-10-23）；npm registry `three@0.186.1`、`@react-three/fiber@9.8.2`；OGL GitHub API；Unicorn Studio FAQ/定价页与 abduzeedo 2026-03-08（29 KB）；Spline 运行时测量见 lokeshkapoor.com 2026-09-08。

### 1.3 推荐与理由

**主推：原生 WebGL2 + 一个约 300 行的 `hero-renderer.ts`。** 理由：
1. 需求是「全屏后处理式」而非「3D 场景」，three 的最小包实测 129.6 KB，是 OGL 的 9.4 倍、自写封装的 10 倍以上，换不来能力。
2. 原生可精确控制：DPR 上限、半分辨率雾、`preserveDrawingBuffer:false`、context lost 恢复、按帧跳过、纹理及时 `deleteTexture`——这些正是移动端保命项。
3. 无第三方维护风险；OGL 已 18 个月无提交，虽小但仍是依赖。
**为什么不是 OGL**：若团队更看重开发速度，OGL 13.8 KB 是可接受的备选；但它只省渲染器样板，不省 shader 与状态机，收益有限。
**为什么不是 three/R3F**：只有当我们未来要放 3D 物体（小屋模型、树）时才成立；当前摄影底图路线不需要。
**Unicorn Studio**：适合美术在 1 天内试出雨/雾感觉，再照着重写 GLSL；不建议作为生产运行时（商用授权、可控性、离线自托管）。
**Spline**：561 KB 运行时 + 场景文件，直接出局。

### 1.4 Next.js 16 / React 19 集成（SSR 边界）

```tsx
// app/(home)/hero-shell.tsx  — 服务端组件：只出 poster 与语义 DOM
import Image from 'next/image';
export function HeroShell({ plate, children }) {
  return (
    <section className="hero">
      <Image src={plate} alt="" fill priority fetchPriority="high"
             sizes="100vw" quality={75} placeholder="blur" blurDataURL={LQIP} />
      <HeroCanvasClient />   {/* 客户端薄壳，内部动态 import WebGL */}
      {children}
    </section>
  );
}
```
```tsx
'use client';
const HeroCanvas = dynamic(() => import('./hero-canvas'), { ssr: false });
// 在 useEffect 里等 LCP：requestIdleCallback(() => import('./hero-renderer'), {timeout: 2000})
```
要点：服务端永不 import WebGL 模块；canvas `aria-hidden="true"`；poster 是 LCP 元素，WebGL 是增强层；`next/image` 在 Next 16 默认 `qualities:[75]`、`minimumCacheTTL` 4h（★ Next.js 16 blog，2025-10-21）。Turbopack 与 React Compiler 对 WebGL 模块无特殊影响；`experimental.viewTransition` 已在 16.3 移除，见 §6。

### 1.5 可访问性与失败降级

- `prefers-reduced-motion: reduce` → 只渲染 1 帧静态合成，关闭粒子/视差/闪电。
- 无 WebGL2 / context 创建失败 / `webglcontextlost` → 保留 poster，3 秒后重试一次，永不弹错误。
- `prefers-reduced-transparency` → 玻璃改不透明（Chrome/Edge 118+；Firefox 113 仅 flag；Safari 未支持 ★ BCD）。
- `forced-colors: active` → 玻璃 `background: Canvas; border: 1px solid ButtonText; color: CanvasText`。
- `Save-Data` / `deviceMemory<=4` / 运行时 p95 帧时 >22 ms → 降级（见 §2.3）。注意 `Save-Data` 仅 Chrome/Edge；Safari/Firefox 无 `navigator.connection`（★ BCD）。
- 提供一个「暂停动效」开关，持久化到 localStorage；不依赖电池 API（Chrome 以外不可用）。

## 2 首屏与性能预算

### 2.1 LCP 管线（静态底图 → WebGL 渐进接管）

| 阶段 | 动作 | 预算 |
|---|---|---|
| HTML 到达 | 内联 critical CSS；poster `<img>` 由 HTML 直出，`fetchpriority=high`，`decoding=async` | HTML+CSS ≤ 40 KB gzip |
| 图片解码 | AVIF 2560w（桌面）/1280w（移动），LQIP ≤1 KB 内联；`<img>` 保持可见 | 桌面 ≤240 KB，移动 ≤70 KB |
| LCP 完成 | `PerformanceObserver('largest-contentful-paint')` 触发后，`requestIdleCallback` 动态 import 渲染器 | 不阻塞 LCP |
| 纹理上传 | 用已解码的 `<img>` 做 `texImage2D`，避免二次下载/解码；上传在 `requestIdleCallback` 分帧 | ≤8 ms |
| 接管 | canvas `opacity 0→1` 600–1200 ms；poster 留在下面，失败可回退 | 不引起 CLS |
| 稳态 | 停掉 poster 的合成层？保留（canvas 不透明后不可见，但留作回退） | — |

**为什么不用 blurhash 作为最终图**：blurhash 只是 20–30 字节的占位色彩，无法承担 LCP；用同图 32px 缩略图做 `blurDataURL`，或 ThumbHash，视觉更接近。**为什么不在首屏直接上 WebGL 画底图**：GPU 纹理上传 + shader 编译会把 LCP 推到 3 s 以后，且低端机 shader 编译可能 200–800 ms。

### 2.2 纹理内存与压缩策略（关键结论：4K 不上 GPU）

| 分辨率 | RGBA8 | +mipmap（×1.333） | BC1/ETC2（4bpp） | BC7/ASTC（8bpp） | ETC1S（约 1bpp） |
|---|---|---|---|---|---|
| 3840×2160 | 33.2 MB | **44.2 MB** | 4.1 / 5.5 MB | 8.3 / 11.1 MB | ~1.0 / 1.4 MB |
| 2560×1440 | 14.7 MB | **19.7 MB** | 1.8 / 2.5 MB | 3.7 / 4.9 MB | ~0.5 / 0.6 MB |
| 1920×1080 | 8.3 MB | 11.1 MB | 1.0 / 1.4 MB | 2.1 / 2.8 MB | ~0.3 / 0.4 MB |
| 1280×720 | 3.7 MB | **4.9 MB** | 0.5 / 0.6 MB | 0.9 / 1.2 MB | ~0.1 MB |

- **桌面用 2560×1440 RGBA8（19.7 MB/张），移动用 1280×720（4.9 MB/张）**；4K 只用于 `<img>` poster 与离线母版。交叉淡化时两张同时存在：桌面瞬时 +19.7 MB，移动 +4.9 MB，1.2 s 后删除旧纹理。
- **KTX2/Basis 不适合这张 hero 底图**：4K UASTC 下载约 8 MB（AVIF 仅 0.2–0.5 MB），且要额外 ~300–500 KB 的 transcoder WASM；省的是 GPU 显存，不是首屏。只有「同屏多张 4K 纹理」或「移动端显存吃紧」时才值得。★ Khronos KTX2 规范：UASTC 可转 BC7/ASTC，ETC1S 可转 BC1/BC7/ETC2/ASTC/PVRTC。
- 噪声/雾/位移图用 256–512 px 的 R8/RG8，≤1 MB；不要为噪声存 RGBA8。
- GPU 纹理上限：WebGL2 保证 `MAX_TEXTURE_SIZE ≥ 2048`，主流移动 4096–8192、桌面 16384；4K 能存但没必要。
- `UNPACK_FLIP_Y_WEBGL`、`colorSpace: SRGB8_ALPHA8` 一次性设对，避免每帧转换；底图用 `SRGB8_ALPHA8`，位移/法线用 `RGBA8/RG8` 线性。

### 2.3 分级画质（运行时自适应，不迷信 detect-gpu）

| Tier | 触发 | 分辨率/DPR | 帧率 | 效果 |
|---|---|---|---|---|
| 0 静态 | 无 WebGL2 / reduced-motion / Save-Data / 用户暂停 | poster | 0 | CSS 玻璃、无粒子 |
| 1 低 | 移动端 / deviceMemory≤4 / 首 60 帧 p95>28 ms | 1280×720，DPR 1 | 30 | 雨或雪 1 层 + 轻雾；无光束/闪电 |
| 2 中 | 普通笔记本/手机旗舰 | 1920×1080，DPR≤1.25 | 30–60 | 2 层雨/雪 + 半分辨率雾 + 云影 |
| 3 高 | 桌面独显 / 首 60 帧 p95<14 ms | 2560×1440，DPR≤1.5 | 60 | 全效果 + 视差 + 玻璃透镜 + 丁达尔 |

`detect-gpu` 的 benchmark 数据源 gfxbench 已于 2025-12 停止更新（★ @pmndrs/detect-gpu README），且要额外拉取数据；**建议只用 `screen`、`devicePixelRatio`、`deviceMemory` 做初始猜测，再用前 60 帧的 p95 做真实分档**。滚动/隐藏时 `document.visibilityState` + `IntersectionObserver` 暂停 rAF；移动端 30 fps 用「跳帧累加器」而不是 `setTimeout`。

### 2.4 量化预算（桌面 / 移动，gzip）

| 项 | 桌面 | 移动 | 说明 |
|---|---|---|---|
| HTML + critical CSS | 40 KB | 40 KB | 内联首屏样式 |
| 字体（中文子集 2 字重） | 80 KB | 60 KB | 只 preload 首屏用到的字重 |
| poster AVIF | 240 KB | 70 KB | 2560 / 1280 宽 |
| LQIP | 1 KB | 1 KB | 内联 |
| 启动 JS（主题/天气/玻璃 DOM） | 25 KB | 25 KB | 不含 WebGL |
| WebGL chunk（OGL 或自写 + shader） | 45 KB | 45 KB | LCP 后加载 |
| 天气 JSON | 3 KB | 3 KB | 服务端缓存 |
| **首屏合计（不含 WebGL）** | **≤350 KB** | **≤190 KB** | 4G 下 LCP ≤2.0 / ≤2.5 s |
| GPU 纹理常驻 | ≤45 MB | ≤12 MB | 含过渡双张与噪声 |
| 帧时间（GPU） | ≤6 ms @60fps | ≤12 ms @30fps | 中端集显/手机 |
| 主线程 JS/帧 | ≤2 ms | ≤2 ms | 粒子更新用 GPU，CPU 只更新 uniform |

LCP 门槛：good ≤2.5 s、INP ≤200 ms、CLS ≤0.1（★ web.dev Core Web Vitals）。以上为预算而非实测；必须用真机 4G 档验证。

### 2.5 测量方法

- LCP/CLS/INP：`web-vitals` + PerformanceObserver；对比「禁用 WebGL」与「启用」两组，确认 WebGL 不抢 LCP。
- 帧时间：`requestAnimationFrame` 记录 delta，输出 p50/p95/掉帧率；GPU 时间用 Chrome 的 `EXT_disjoint_timer_query_webgl2`（Safari/Firefox 不可用），再用 DevTools Performance 的 GPU track 交叉验证。
- 纹理显存：按上表估算（WebGL 不暴露显存）；Chrome `performance.measureUserAgentSpecificMemory()` 需 cross-origin isolation，只能看 JS 堆。
- 真实设备矩阵至少：Windows 集显笔记本、iPhone 12/13、Android 中端（骁龙 7 系）、iPad。

## 3 天气与窗玻璃技法

| 技法 | 原理 | 成本（1080p，推断） | 风险 | 参考/备注 |
|---|---|---|---|---|
| **雨滴窗（Heartfelt 类）** | 两层下落水滴 + 静态水珠；由高度场求法线，UV 偏移采样底图；雾用 mip LOD 模糊，水痕清空雾 | 2.5–4 ms；6–10 次采样 | **许可**：Heartfelt 是 Shadertoy `ltffzl`（BigWings, 2017）；若源码头未显式声明其他许可，适用 Shadertoy 默认 CC BY-NC-SA 3.0，含广告的站属商用，**采用前必须核对源码头**；动效过强易晕 | 自研参数化版本：水滴密度/速度/折射率可调；用 `dFdx/dFdy` 求法线，避免解析法线 |
| 雨丝 | 实例化细长 quad，沿风向倾斜，近层快/远层慢 | <1 ms，2k 实例 | 与底图雨感重复；过密显假 | 只在「雨」且底图无雨丝时叠加 |
| 三层视差雪 | 3 组点精灵，按深度给尺寸/速度/模糊；近层 2–3 px 运动模糊 | <1 ms，1.5k 点 | 过绘（overdraw）在移动端贵；近层太大挡字 | 近层限制在画面下 2/3，避开导航 |
| 高度雾/体积雾 | fbm 3–5 octave 噪声 × 高度衰减，半分辨率渲染后双线性合成 | 全分辨率 2–3 ms；半分辨率 0.8 ms | 4K 全屏 fbm 会爆；雾太浓会洗掉底图 | 半分辨率 + 深度/高度权重；每帧只更新 2 个 uniform |
| 云影滚动 | 一张 tileable fbm 噪声，UV 缓慢平移，乘到底图亮度 | <0.3 ms | 与底图云方向不一致会假 | 方向取天气 API 的风向 |
| 丁达尔光束 | 从太阳屏幕位置做径向模糊（16–32 次采样，半分辨率） | 1–2 ms | 太阳位置/底图光源不匹配会穿帮 | 只在晴/薄云 + 太阳高度<25° 时开 |
| 闪电 | 全屏短促加色 + 分支纹理/噪声；2–3 帧衰减 | <0.5 ms | **光敏性癫痫**；>3 Hz 闪烁违规 | 限制每分钟 ≤2 次，`prefers-reduced-motion` 关闭 |
| 落叶/花瓣/萤火虫 | 实例化 quad/point；萤火虫加色 + 轻微 bloom | <0.5 ms，200–600 个 | 萤火虫只在夏夜；花瓣春季；误用会「花哨」 | 粒子数按季节/天气表驱动 |
| 霜冻爬边 | 屏幕边缘距离场 × fbm 阈值，生成半透明白霜；随时间缓慢推进 | <0.2 ms | 边缘过白会像遮罩 | 只在冬季 + 低温/雪 |
| 起雾擦拭 | 512×512 ping-pong RT 存雾 mask，指针拖尾擦除，随时间重新起雾 | 0.5 ms | 可玩但会挡内容；触屏误触 | 仅桌面 hover；30 s 无操作自动复原 |
| 遮罩微动 | 树叶/水面/天空 mask + UV 位移 1–3 px | 0.3 ms | mask 边缘 halo；位移大像果冻 | 见 §3.1 |
| 深度视差 | 深度图 → UV 偏移，指针/陀螺仪驱动 | 0.2 ms | 遮挡洞、薄结构撕裂 | 见 §3.2 |

参考实现（◇ 社区/公开资料）：雨滴窗看 Shadertoy `ltffzl`（BigWings）与其单文件 WebGL2 移植（CSDN 2026-07，仅学结构）；雾/云影用 IQ 的 fbm 组合；丁达尔用 GPU Gems 3 的 radial blur；雨丝/雪/花瓣用 instanced quad；液态玻璃看 Aave《Building Glass for the Web》与 §4 的三个库 README。所有实现建议重写而非复制，原因见 §9。

### 3.1 遮罩驱动的微动（让摄影底图「活起来」）

离线流程（一次性，产出进仓库）：
1. 4K 母版 → SAM 2（Apache-2.0）文本/点提示分割出 `foliage`、`water`、`sky` 三类；同场景四季图复用提示点。
2. mask 后处理：去除 <0.1% 面积碎片、闭运算、8–16 px 羽化；边缘按亮度做 1–2 px 收缩，避免 halo。
3. 打包：三张 8-bit alpha mask 合成一张 RGBA（R=foliage, G=water, B=sky, A=1），2560×1440，WebP/PNG；运行时一次上传。
4. shader：`uv += mask * vec2(sin(t*0.7+uv.y*8), cos(t*0.5+uv.x*6)) * amplitude`；树叶 amplitude 1.5–2.5 px、水面 1–2 px、天空 0.5–1 px；**位移必须小于纹理像素的 2–3 倍**，否则边缘撕裂。
5. 风险：摄影图的树叶没有真实视差，微动只是「呼吸」；不要做大幅摇摆。水面可另加一层法线扰动的反光，比位移更可信。

### 3.2 深度图视差

- 模型：**Depth Anything V2 Small（Apache-2.0；Base/Large 为 CC-BY-NC-4.0，商用站只能用 Small）**；单张 4K 推理在消费级 GPU 约 1–3 s（○，随硬件）。
- 流程：母版 → 深度图（16-bit PNG 或 8-bit 抖动）→ 双边/导向滤波去噪 → 与底图同分辨率打包（或半分辨率深度）→ shader 用 `uv += (depth-0.5)*parallax` 采样。
- 伪影：天空/云被估成近景、细树枝与电线断裂、透明水面、深度不连续处的「拉丝」。缓解：天空 mask 强制 depth=1；边缘 3×3 中值；视差幅度 ≤1–2% 屏宽；只在指针移动时开，静止回 0。
- 结论：**v1 不做深度视差**，先做 mask 微动；深度视差放到 v2 作为「彩蛋」，默认关闭。

## 4 液态玻璃按钮/导航

### 4.1 三方案对比

| 方案 | 原理 | 折射 | 成本 | 浏览器 | 适用 |
|---|---|---|---|---|---|
| A 纯 CSS | `backdrop-filter: blur() saturate() brightness()` + 内阴影/边框高光 | 无（只有模糊+染色） | 最低；合成器完成 | Chrome 76 / Edge 79 / Safari 9(-webkit) / Firefox 103 ★ | 所有降级路径、桌页 |
| B CSS+SVG | `backdrop-filter: url(#feDisplacementMap) blur()`，位移图由 canvas/SVG 生成 | 真折射（Chromium） | 中；小面积可 60fps | **仅 Chromium**；Safari/Firefox 静默忽略 `url()` | 桌面 Chromium 增强 |
| C WebGL | 在 hero canvas 内按按钮矩形画透镜：圆角 SDF + 法线 + 色散 + 高光；DOM 透明按钮覆盖 | 真折射，且与底图同源、零同步 | 低（hero 已在渲染；小面积 8–12 次采样） | 所有 WebGL2 浏览器 | **首页首选** |

**关键判断**：首页本来就是 WebGL 画布，把玻璃做进同一个 shader，等于「窗玻璃上的物件」的字面实现；不存在 DOM 与 canvas 同步问题，也绕开 Safari/Firefox 不支持 `backdrop-filter:url()` 的死结。DOM 按钮保持透明、可聚焦、可读屏。桌页没有 WebGL 时用 A；Chromium 桌面可加 B 作为点缀。

### 4.2 支持矩阵（2026-10，★ MDN BCD + 社区）

| 特性 | Chrome/Edge | Safari (macOS/iOS) | Firefox | 备注 |
|---|---|---|---|---|
| `backdrop-filter: blur()` | 76 / 79 | 9（-webkit）/ 18（标准） | 103 | Baseline 2024 |
| `backdrop-filter: url(#svg)` | 支持 | **不支持**（WebKit bug 245510，静默忽略） | **不支持**（静默忽略） | 多个 2026 库 README 一致：Chromium-only |
| `prefers-reduced-transparency` | 118 | **不支持** | 113 仅 flag | WebKit bug 175497 |
| `forced-colors` | 89 | 16 | 89 | 可做高对比降级 |
| View Transition（同文档） | 111 | 18 | 144 | 见 §6 |
| View Transition（跨文档） | 126 | 18.2 | **未支持** | — |

来源：MDN browser-compat-data（2026-10-23 拉取）；W3C public-svg-issues #1142（2026-06-24）；samasante/liquid-glass、liquid-glass-backdrop-react、glassfx、murano 等 README（2026-04~09）。

### 4.3 最小实现

**A 纯 CSS（全浏览器）**
```css
.glass {
  position: relative; isolation: isolate;
  border-radius: 999px;
  background: linear-gradient(135deg, rgba(255,255,255,.18), rgba(255,255,255,.06));
  -webkit-backdrop-filter: blur(14px) saturate(160%) brightness(1.06);
  backdrop-filter: blur(14px) saturate(160%) brightness(1.06);
  border: 1px solid rgba(255,255,255,.28);
  box-shadow: inset 0 1px 0 rgba(255,255,255,.55),
              inset 0 -1px 0 rgba(255,255,255,.12),
              0 8px 32px rgba(0,0,0,.28);
  color: #fff; min-height: 44px;
}
@media (prefers-reduced-transparency: reduce) {
  .glass { background: #1b1f24; backdrop-filter: none; -webkit-backdrop-filter: none; }
}
@media (forced-colors: active) {
  .glass { background: Canvas; color: CanvasText; border: 1px solid ButtonText; box-shadow: none; }
}
```

**B Chromium 折射（渐进增强，Safari/Firefox 自动退回 A）**
```html
<svg width="0" height="0" aria-hidden="true">
  <filter id="lg" x="-30%" y="-30%" width="160%" height="160%" color-interpolation-filters="sRGB">
    <feImage id="lgmap" result="map" preserveAspectRatio="none"/>
    <feDisplacementMap in="SourceGraphic" in2="map" scale="26"
      xChannelSelector="R" yChannelSelector="G"/>
  </filter>
</svg>
```
```js
// 128×128 径向位移图：R/G 编码 ±位移，边缘为 0
const c = document.createElement('canvas'); c.width = c.height = 128;
const ctx = c.getContext('2d'), img = ctx.createImageData(128, 128);
for (let y = 0; y < 128; y++) for (let x = 0; x < 128; x++) {
  const dx = (x - 63.5) / 64, dy = (y - 63.5) / 64, r = Math.hypot(dx, dy);
  const k = Math.max(0, 1 - r) ** 1.6, i = (y * 128 + x) * 4;
  img.data[i] = 128 + dx * k * 127; img.data[i+1] = 128 + dy * k * 127;
  img.data[i+2] = 255; img.data[i+3] = 255;
}
ctx.putImageData(img, 0, 0);
document.getElementById('lgmap').setAttribute('href', c.toDataURL());
// 仅当真正支持时启用；不要用 CSS.supports 判断，Safari 会返回 true
if (/Chrome|Edg/.test(navigator.userAgent))
  document.documentElement.style.setProperty('--lg-filter', 'url(#lg)');
```
```css
.glass--refract { backdrop-filter: var(--lg-filter, none) blur(6px) saturate(170%); }
```
注意：`CSS.supports('backdrop-filter','url(#x)')` 在 Safari 也可能为 true，必须用 UA/特性渲染探测；`feImage` 的 data URL 只生成一次，移动端不要每帧重建。

**C WebGL 透镜（首页生产方案）**
```glsl
// 在 hero 片元着色器末尾，uRect=按钮屏幕矩形，uRadius=圆角
vec2 p = (uv - uRect.xy) / uRect.zw;          // 0..1
float d = sdRoundedBox(p - .5, vec2(.5) - uRadius/uRect.zw, uRadius);
if (d < 0.0) {
  vec2 n = normalize(p - .5 + 1e-5);           // 简化球面法线
  vec3 col;
  col.r = texture(uPlate, uv + n * 0.012).r;   // 色散：R/G/B 不同偏移
  col.g = texture(uPlate, uv + n * 0.009).g;
  col.b = texture(uPlate, uv + n * 0.006).b;
  col *= 1.06;
  col += pow(1.0 - abs(d) * 40.0, 3.0) * 0.18; // 边缘高光
  fragColor = vec4(mix(fragColor.rgb, col, 0.92), 1.0);
}
```
DOM 侧只放透明按钮（`background: transparent; color: #fff; text-shadow: 0 1px 12px rgba(0,0,0,.45)`），把 rect 每帧或 resize 时传给 shader；焦点环画在按钮外侧，不参与折射。

### 4.4 性能与无障碍

- 玻璃面积每增加 1 倍，`backdrop-filter` 的模糊采样成本近似线性；**半径控制在 12–20 px**，不要动画 `blur()`/`backdrop-filter`，只动画 `transform/opacity`。
- 嵌套 backdrop-filter（玻璃里再放玻璃）在 Safari 上容易整块失效；避免。
- 文本对比度 ≥4.5:1；亮底图（雪/晴空）上必须加顶部/底部 scrim 或按钮自带 8–12% 黑底；不要只靠 `text-shadow`。
- `forced-colors`、`prefers-reduced-transparency`、键盘 `:focus-visible`（2 px 实线，offset 3 px）三件套必做。
- 最小点击区 44×44 px；玻璃按钮的 `aria-label` 用动词，不用「玻璃」。

## 5 数据与主题联动

### 5.1 Open-Meteo：许可与缓存

- 免费层 **仅非商业**；有广告/订阅/商业产品即属商用，必须订阅（Standard 1M calls/月、Professional 5M、Enterprise 50M+；价格页面未列，需询价）。★ open-meteo.com/en/terms、/en/pricing（2026-10-23）。
- 数据许可 **CC BY 4.0**，必须署名（建议页脚「Weather data by Open-Meteo.com」，以官网 license 页为准）。
- 免费层限 10k/日、5k/时、600/分、300k/月，按 IP/应用计；Vercel 共享出口可能更快触顶。
- 缓存策略：服务端 `fetch` 当前天气 + 逐小时，`revalidate: 900`（15 min）；CDN `s-maxage=900, stale-while-revalidate=86400`；客户端 localStorage 30 min；**每 15 min 全站最多 1 次上游请求**，与访客数无关。
- 只取必要字段：`temperature_2m, weather_code, cloud_cover, precipitation, wind_speed_10m, visibility, is_day`；响应 <2 KB。
- 若未来上广告：要么买 Open-Meteo 商用，要么换源（如 MET Norway，需另核许可）；代码里做成 `WeatherProvider` 接口，别把 Open-Meteo 写死。

### 5.2 太阳高度、季节与兜底

- 用 **SunCalc 2.1.1**（BSD-2，2026-10-05 发布，ESM，零依赖）在服务端算作者所在地的 `sunAltitude`；不请求访客定位。
- 时段判定（太阳高度角）：夜 < -12°；蓝调 -12°~-4°；黄金 -4°~6°；白天 6°~50°；正午 >50°。结合 `is_day` 与本地时间做平滑权重，避免整点跳变。
- 气候学兜底：`seed = hash(YYYY-MM-DD + lat + lon)` → mulberry32 PRNG；按月份表给「晴/云/雨/雪」概率与温度区间，生成稳定的 `weatherCode`；同一天刷新不变，跨天平滑过渡。
- 季节：北半球 3–5 春、6–8 夏、9–11 秋、12–2 冬；南半球翻转（若未来支持）。
- 手动覆盖：`?weather=rain&season=autumn&tod=dusk` 与 UI 选择器；只写 localStorage，不上报；覆盖优先于真实数据，清空后回到真实。

### 5.3 映射表草案（season, weather, timeOfDay → uniforms / UI tokens）

| 维度 | 取值 → 参数 |
|---|---|
| season | 春：`uSeason=0, uGreen=0.55, uWarm=0.35`；夏：`1, 0.75, 0.55`；秋：`2, 0.45, 0.8`；冬：`3, 0.15, 0.2` |
| weather | 晴 `uCloud=.15,uRain=0,uSnow=0,uFog=.08`；多云 `.55,0,0,.15`；雨 `.8,.75,0,.45`；雷雨 `.9,.9,0,.5,uFlash=1`；雪 `.7,0,.8,.35`；雾 `.3,0,0,.8` |
| timeOfDay | 夜 `uSunAlt=-1,uExposure=.72`；蓝调 `-.35,.8`；黄金 `-.05,.95`；白天 `.6,1.05`；正午 `.9,1.0` |
| 派生 | `uWind` 取 API 风速归一；`uWet` = 雨/雪后 2h 内 1；`uParticle` = 0 无 / 1 雨 / 2 雪 / 3 落叶 / 4 花瓣 / 5 萤火虫 |
| UI tokens | `--hero-scrim-top` 0.10–0.28；`--hero-scrim-bottom` 0.35–0.55；`--fg` 由底图上部平均亮度决定黑/白；`--glass-tint` 取季节色低饱和 8–12%；`--accent` 仅小屋窗光（冬）或季节高光；`--focus` 始终高对比 |

示例：`(冬, 雪, 夜)` → `uSnow=.8, uFog=.3, uSunAlt=-1, uExposure=.75, uParticle=2`；scrim 顶部 .22、底部 .5；玻璃 tint 冷蓝 8%；唯一暖色留给小屋窗光。`(秋, 雨, 黄金)` → `uRain=.7, uFog=.5, uSunAlt=-.05, uExposure=.9`；scrim 顶部 .18；粒子=雨；玻璃 tint 琥珀 8%。所有强度默认值再乘 0.7 的「克制系数」，由用户偏好可调。

### 5.4 隐私

不调用 `navigator.geolocation`、不做 IP 定位、不把天气查询参数拼进第三方 URL；天气按作者固定坐标服务端获取，全站共享缓存。访客手动覆盖只存 localStorage。若接分析工具，需在隐私页说明并遵守当地法规；这也会触发 Open-Meteo 的商用判定，需一并决策。

## 6 页面切换

### 6.1 2026 状态

| 能力 | Chrome/Edge | Safari | Firefox | 结论 |
|---|---|---|---|---|
| 同文档 `document.startViewTransition` | 111 | 18 | 144 | 可用；Firefox 144 起支持 |
| 跨文档 `@view-transition { navigation: auto }` | 126 | 18.2 | **未支持** | 跨文档只能渐进增强 |
| Next.js 16 `<ViewTransition>` | React 19.3 起内置 | 同左 | 同左 | App Router 无需 flag；据社区迁移记录 `experimental.viewTransition` 已在 16.3 移除（以官方文档为准） |
| class-based `enter/exit` | — | — | — | Next 16.3.4 下不触发 `startViewTransition`（React issue #37614，2026-09-11）；**只用 `name` 共享元素** |

来源：MDN BCD（2026-10-23）；Next.js 16 blog（2025-10-21）；nextjs.org/docs/app/guides/view-transitions；react/react#37614。

### 6.2 「窗 → 桌」过渡方案

1. **共享元素 morph（首选）**：首页 hero 容器 `view-transition-name: hero-window`；桌页顶部窗沿条同名。点击「进入」时，hero 的合成快照（含 canvas 当前帧）缩小、下移到桌页顶部，同时桌页内容淡入 240 ms。Next 16 用 `<ViewTransition name="hero-window">` 包住两端的元素；若 class-based 动画不生效，退回 CSS `::view-transition-*` 伪元素手写。
2. **手动兜底**：`if (!document.startViewTransition) router.push('/desk')`；否则
```js
document.startViewTransition(async () => {
  renderer.renderOnce();          // 确保 canvas 有当前帧
  await router.push('/desk');     // Next 16 的导航在 transition 回调内完成
});
```
3. **降级**：无 VT 或 `prefers-reduced-motion` → 120 ms 交叉淡化 + 4 px 上移；不要横向滑动。
4. **风险**：canvas 快照在 `preserveDrawingBuffer:false` 下通常仍可被合成器捕获，但 Safari 对 WebGL 图层的 VT 快照有已知不稳定（○ 未实测）；上线前在 Safari 26 真机验证；失败则改为「poster 快照 + canvas 立即隐藏」。
5. **性能**：过渡期间暂停 rAF，避免快照与实时渲染打架；过渡结束恢复。

## 7 微型验证（spikes）

按主 agent 2026-10-23 的优先级调整，本轮**先交付报告，spikes 只做 1 个关键项**。

### 7.1 已执行：`spike-rain-glass.html`

- 文件（已归档）：`archive/prototypes/spikes/spike-rain-glass.html`；截图已移到仓库外 `D:\openblog\_archive\prototype-shots-20261027\rain-glass.png`。该 spike 随 2026-10-27 原型归档，仅作技术证据，不是当前设计基线。
- 实现：原生 WebGL2、无依赖；全屏三角形 + 程序化 1600×900 底图（山/湖/小屋暖窗）+ 两层下落水滴/水痕 + 静态微水珠 + fbm 雾 + 纹理 LOD 折射 + 轻微色散；`?plate=URL` 可换真实底图；`?q=low` 降级；`prefers-reduced-motion` 只画 1 帧；隐藏标签页暂停。
- 实测（Edge headless，1600×900，DPR 1，Windows 本机；2026-10-23）：**p50 59.9 fps、p95 59.5 fps，255 帧，0 控制台错误**；降级/静态路径均正常。headless 使用 ANGLE/SwiftShader，**该数字不代表手机 GPU**，只能证明管线与 shader 可运行、桌面满帧。
- 观察：① 雨滴折射与水痕成立，但底图若没有真实摄影细节会显得「塑料」，正式版必须用 AI 摄影底图；② 水滴/水痕过密会压过画面，默认密度应再降 30–40%；③ 亮水滴上放文字不可读，导航区必须避开或加 scrim；④ 全屏 fbm 雾是主要成本，半分辨率是下一步优化点。

### 7.2 未执行（可选）

`spike-snow-fog.html`（三层雪 + 半分辨率雾）与 `spike-liquid-glass.html`（CSS/SVG/WebGL 三栏）未执行；§3 的帧时间仍是预算/推断（○），§4 的 Safari/Firefox 判断来自文档与多个库的 README（◇），需在 Safari 真机复验。

## 8 实施路线图

| 阶段 | 内容 | 产出 | 估时（1 人 + agent） |
|---|---|---|---|
| M0 视觉验证 | 3 个 spike；确定雨/雪/雾参数区间 | HTML + 截图 + 帧时 | 1–2 天 |
| M1 骨架 | Next 16 首页 shell；poster/LCP；主题状态机；天气 provider + 兜底 | 可上线静态首页 | 3–5 天 |
| M2 渲染器 | 原生 WebGL2 全屏管线；交叉淡化；粒子；云影；暂停/降级 | 动态首页 | 5–8 天 |
| M3 质感 | 雨滴窗、玻璃透镜、霜/雾、过渡；Safari/移动真机调优 | 定稿首页 | 5–8 天 |
| M4 打磨 | 无障碍、预算测量、错误恢复、文档 | 验收 | 2–3 天 |

## 9 主要风险

| 风险 | 影响 | 缓解 |
|---|---|---|
| Shadertoy 默认 CC BY-NC-SA | 有广告后侵权 | 只学原理，重写 shader；保留自研代码与许可证 |
| Open-Meteo 商用判定 | 上线广告即违规 | 先买商用或换源；provider 接口隔离 |
| Safari `backdrop-filter:url()` 不支持 | 玻璃在 iPhone 上变平 | 首页用 WebGL 透镜；桌页 CSS 玻璃 |
| 移动端 GPU 显存/发热 | 掉帧、耗电 | 1280 纹理、30fps、隐藏暂停、p95 自适应 |
| 4K 全屏 fbm/雨滴 | 低端机 <20fps | 半分辨率雾、限制 octave、Tier 降级 |
| 动效过量 | 违背「克制、不花哨」 | 全局强度系数 0.7；默认粒子稀疏；提供暂停 |
| VT 在 Next 16 的 class 动画 bug | 过渡不触发 | 只用 `name` morph；手写 CSS 伪元素；兜底 crossfade |

## 10 需用户决策的问题

1. **首页玻璃用哪种？** 推荐 C（WebGL 透镜 + DOM 透明按钮），备选 A（纯 CSS）。C 的跨浏览器最稳、最像「窗玻璃」，但按钮视觉由 canvas 画，调试成本略高。
2. **是否接受「4K 只做 poster、GPU 最高 2560」？** 推荐接受；4K 上 GPU 会多 24.5 MB 显存且肉眼在 16:9 全屏下几乎看不出。
3. **Open-Meteo 是否买商用？** 若确定未来放广告，推荐直接买 Standard 或改用可商用源；若暂不放广告，先用免费层 + provider 抽象。
4. **首页是否要深度视差？** 推荐 v1 不做（只做 mask 微动），v2 再评估；深度伪影在树枝/天空上很容易露馅。
5. **雨滴窗的强度**：推荐默认「中低」（水滴密度 0.5、雾 0.35），并提供用户滑块；强雨会压过底图与文字。
6. **是否保留「手动覆盖天气」入口？** 推荐保留但藏在页脚小按钮；它也是演示与测试的开关。
7. **页面过渡是否接受「共享元素 morph」？** 推荐是；Firefox 跨文档不支持，但 Next 是同文档导航，实际影响小。

## 参考来源（核验日期均为 2026-10-23）

- MDN browser-compat-data：https://github.com/mdn/browser-compat-data（startViewTransition、@view-transition、backdrop-filter、prefers-reduced-transparency、WebGL2、Save-Data）
- Next.js 16 blog：https://nextjs.org/blog/next-16（2025-10-21）
- Next.js View Transitions guide：https://nextjs.org/docs/app/guides/view-transitions
- react/react#37614：https://github.com/react/react/issues/37614（2026-09-11）
- npm registry / bundlephobia：ogl@1.0.11、regl@2.1.0、three@0.186.1、pixi.js@8.22.0、@babylonjs/core@9.32.0、@react-three/fiber@9.8.2
- OGL GitHub：https://github.com/oframe/ogl（最后提交 2025-04-13）
- three.js bundle 讨论：https://github.com/mrdoob/three.js/pull/33880（2026-07-30）
- Unicorn Studio：https://www.unicorn.studio/ 、/docs/faqs/；abduzeedo 2026-03-08（runtime ~29 KB）
- Spline 运行时测量：https://lokeshkapoor.com/blog/spline-pricing（2026-09-08）
- Open-Meteo terms/pricing：https://open-meteo.com/en/terms 、https://open-meteo.com/en/pricing
- SunCalc：https://github.com/mourner/suncalc（2.1.1，2026-10-05，BSD-2）
- detect-gpu：https://github.com/pmndrs/detect-gpu（benchmark 数据源 2025-12 停止更新）
- Khronos KTX2：https://github.khronos.org/KTX-Specification/ktxspec.v2.html
- Shadertoy terms：https://www.shadertoy.com/terms；Heartfelt：https://www.shadertoy.com/view/ltffzl（BigWings, 2017）
- Depth Anything V2：https://github.com/DepthAnything/Depth-Anything-V2（Small Apache-2.0；Base/Large CC-BY-NC-4.0）
- SAM 2：https://github.com/facebookresearch/sam2（Apache-2.0）
- W3C svgwg #1142：https://lists.w3.org/Archives/Public/public-svg-issues/2026Jun/0120.html（2026-06-24）
- 液态玻璃库 README：samasante/liquid-glass、liquid-glass-backdrop-react、glassfx、murano（2026-04~09）
- Core Web Vitals：https://web.dev/articles/vitals
