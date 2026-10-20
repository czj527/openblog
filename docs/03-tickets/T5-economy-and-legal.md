# T5 · 经济规划页（脱敏公开版）+ 合规页

> 状态：`待开工`
> 负责人：开发 Agent
> 验收人：陈
> 所属项目：**openblog**
> 依赖：**T4 完成** + 陈建好「Economy Public」脱敏库
>
> ⚠️ 执行前必读：`docs/README.md` 硬性规则 + `docs/02-contracts/design-system.md`

---

## ⚠️ 本工单因 Q3 决策重写

**2026-10-20 陈的决定**：经济规划页**需要公开的脱敏版**。

这与原方案冲突。原文写的是「`/economy` 直连 Notion `Economy Plan` 库，展示收入/存款/投资/支出」。如果照做，**你的私人财务数据会公开在 czj527.xyz 上，任何人可见**。

所以本工单改成：**公开页只读脱敏库，原始财务数据永不离开私人 Notion**。

---

## 🚨 数据分层的硬边界

```
┌─────────────────────────────┐
│  Notion「Economy Plan」      │  ← 私人库，只有陈能看
│  收入 / 存款 / 投资 / 支出    │     永远不进代码、不进 Supabase、不进页面
│  账户 / 余额 / 备注原文       │
└─────────────────────────────┘
              ↓  陈手工维护（或脚本生成脱敏快照）
┌─────────────────────────────┐
│  Notion「Economy Public」    │  ← 新建，公开数据源
│  阶段名 / 进度% / 里程碑状态   │     只有这里的数据能上页面
└─────────────────────────────┘
              ↓  NOTION_ECONOMY_PUBLIC_DATA_SOURCE_ID
┌─────────────────────────────┐
│  /economy 页面（公开）        │
└─────────────────────────────┘
```

### 字段白名单（只有这些能公开）

| ✅ 允许公开 | ❌ 禁止公开 |
|---|---|
| 阶段名称（如「储蓄积累期」） | 具体金额 |
| 时间节点（年份、季度） | 账户号、平台名 |
| 进度百分比（「完成 42%」） | 绝对数值（42 万） |
| 里程碑状态（已完成 / 进行中 / 未开始） | 备注原文 |
| 目标描述（文字） | 任何可反推真实数字的比率 |

> ⚠️ **「进度百分比」需谨慎**：如果目标金额和百分比同时可推，等于泄露绝对值。只保留百分比，不提供目标金额。

---

## 任务 A：Notion 脱敏库结构

陈需在 Notion 新建「Economy Public」库（与私人库分开），建议字段：

| 字段名 | 类型 | 说明 |
|---|---|---|
| `Phase` | Title | 阶段名，如「储蓄积累期」 |
| `Year Start` | Number | 起始年份 |
| `Year End` | Number | 结束年份 |
| `Progress` | Number | **0-100 的百分比**，不是金额 |
| `Status` | Select | `未开始` / `进行中` / `已完成` |
| `Description` | Rich Text | **文字描述**，不得含金额 |
| `Milestones` | Rich Text | 里程碑，一行一个 |
| `Order` | Number | 排序 |

> 🚫 **不要**加 `Target Amount`、`Current Amount`、`Balance`、`Note` 这类字段。加了就等于把泄露入口留在库里。

---

## 任务 B：页面实现

```
src/app/economy/page.tsx          — 公开页（Server Component）
src/lib/notion/economy.ts         — 读 Economy Public 库
src/components/economy/*.tsx      — 可视化组件
```

**要求**

1. 数据源：**只能**读 `NOTION_ECONOMY_PUBLIC_DATA_SOURCE_ID`，**禁止**引用私人库 ID
2. 展示形式（复用现有视觉体系）：
   - 五年时间轴 / 阶段进度
   - 进度条（百分比）
   - 里程碑 checklist 样式
   - 卡片网格（按 `Order` 排序）
3. 遵循 `design-system.md`：oklch 色彩、`rounded-xl` 卡片、Framer Motion 入场动画
4. 响应式：移动端单列、桌面端网格
5. 缓存：`'use cache'` + `cacheLife('hours')` + `cacheTag('economy')`
6. 页面顶部加一行说明：「本页为脱敏进度展示，不含具体金额」

---

## 任务 C：环境变量校验

在 `scripts/check-env.mjs` 增加：

```
必需：
  NOTION_ECONOMY_PUBLIC_DATA_SOURCE_ID

禁止出现（若配置了直接报错退出）：
  NOTION_ECONOMY_PRIVATE_DATA_SOURCE_ID
  NOTION_ECONOMY_DATA_SOURCE_ID     ← 旧变量名，指私人库
```

> 「禁止出现」是**主动防御**：避免有人图省事把私人库 ID 配进去。

---

## 任务 D：隐私政策页

`src/app/privacy/page.tsx`，必须包含：

1. 收集哪些数据（评论/留言的 IP 哈希、内容）
2. Cookie 使用（主题偏好、管理员会话）
3. 第三方服务（Google AdSense、Vercel Analytics、Notion）
4. 用户权利
5. 联系方式
6. 更新日期
7. **AdSense 专用条款**：Google 可能使用 Cookie 投放个性化广告，附 Google 广告设置退出链接

## 任务 E：联系方式页

`src/app/contact/page.tsx`：

1. 邮箱（防爬：简单 obfuscation 或图片）
2. GitHub 等社交链接
3. 可选：引导到 `/guestbook`

---

## 交付物

- [ ] `/economy` 页面（读脱敏库）
- [ ] `/privacy`、`/contact` 页面
- [ ] `scripts/check-env.mjs` 更新（含禁止变量检查）
- [ ] 页面截图（移动端 + 桌面端）

---

## 验收标准

| # | 检查项 | 方法 |
|---|---|---|
| E1 | `/economy` 正常显示脱敏数据 | 浏览器实测 |
| E2 | **页面源码中无任何金额** | `curl czj527.xyz/economy \| grep -E "[0-9]{4,}"` 无财务数字 |
| E3 | **无私人库 ID 泄漏** | 全仓 grep `NOTION_ECONOMY_DATA_SOURCE_ID` 只在「禁止」列表 |
| E4 | 进度条、时间轴显示正确 | 陈验收 |
| E5 | 移动端 / 桌面端布局正常 | 截图对比 |
| E6 | 视觉与全站一致 | 陈验收 |
| E7 | `/privacy` 含 AdSense 条款 | 人工检查 |
| E8 | `/contact` 可访问，邮箱防爬生效 | 查看源码，邮箱不应是明文可点击 |
| E9 | 环境变量校验：配了私人库 ID → 启动失败 | 手工测试 |

---

## 依赖

**T4 完成** + 陈建好「Economy Public」库并提供 Data Source ID。

## 阻塞项

| # | 事项 | 谁 |
|---|---|---|
| 1 | 建 Notion「Economy Public」脱敏库 | 陈 |
| 2 | 填入脱敏数据（阶段/百分比/里程碑） | 陈 |
| 3 | Connect 到 Integration，提供 Data Source ID | 陈 |

---

## 执行记录

| 日期 | 状态变更 | 说明 |
|---|---|---|
| 2026-10-20 | 重写 | Q3 改为「公开脱敏版」，原直连私人库方案作废 |

## 验收证据

（待填）
