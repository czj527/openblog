# T5 · 经济规划页 + 合规页

> 状态：`待开工`
> 负责人：开发 Agent
> 验收人：陈
> 所属项目：openblog
>
> ⚠️ 执行前必读：`docs/README.md` 的硬性规则 + `docs/02-contracts/design-system.md`

---

**目标**：补上经济规划可视化页与 AdSense 必需合规页。

**范围**

**新增页面**
```
src/app/economy/page.tsx          — 五年经济规划展示
src/components/economy/*.tsx      — 可视化组件
src/app/privacy/page.tsx          — 隐私政策
src/app/contact/page.tsx          — 联系方式
```

**要求**

**经济规划页**
1. 数据源：Notion「Economy Plan」库（`NOTION_ECONOMY_DATA_SOURCE_ID`）
2. 展示形式（复用现有视觉体系）：
   - 五年时间轴（Timeline）
   - 分类进度条（储蓄/投资/支出/保障）
   - 目标 vs 当前对比图（用已有 `recharts`）
   - 卡片网格（按 `Priority` 分组）
3. 遵循 `DESIGN.md`：oklch 色彩、`rounded-xl` 卡片、Framer Motion 入场动画
4. 响应式：移动端单列、桌面端网格
5. 缓存 `revalidate = 3600`

**隐私政策页**
1. 必须包含：收集哪些数据（评论/留言的 IP、内容）、Cookie 使用（主题偏好、管理员会话）、第三方（Google AdSense、Vercel Analytics）、用户权利、联系方式、更新日期
2. AdSense 专用条款：Google 可能使用 Cookie 投放个性化广告，附 Google 广告设置退出链接
3. 用现有排版组件，`max-w-3xl`，可读性优先

**联系方式页**
1. 邮箱（防爬：简单 obfuscation 或图片）
2. GitHub / 其他社交链接
3. 可选：简单留言引导（跳 `/guestbook`）

**验收标准**
- [ ] `/economy` 正常显示 Notion 数据，图表正确
- [ ] `/privacy`、`/contact` 可访问，导航栏有入口
- [ ] 三页视觉风格与全站一致（陈验收）
- [ ] 移动端布局正常
- [ ] 隐私政策含 AdSense 必需条款

**依赖**：T4 完成 + 陈在 Notion 建好 Economy Plan 库。

---

---

## 执行记录

| 日期 | 状态变更 | 说明 |
|---|---|---|
| — | 待开工 | — |

## 验收证据

> 交付时在此粘贴：构建日志、页面截图、curl 返回示例。

（待填）
