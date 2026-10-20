# T0 · 安全止血（🔴 最高优先级 · 独立可做）

> 状态：`待开工`
> 负责人：开发 Agent
> 验收人：陈
> 所属项目：openblog
>
> ⚠️ 执行前必读：`docs/README.md` 的硬性规则 + `docs/02-contracts/design-system.md`

---

**目标**：在不影响其他功能的前提下，先堵住三个致命漏洞。

**范围**
- `src/lib/auth.ts` —— 重写鉴权逻辑
- `src/app/api/clear-data/route.ts` —— 删除
- `src/app/api/supabase/route.ts` —— 删除
- `src/app/api/auth/login/route.ts`、`logout/route.ts`、`auth/route.ts` —— 适配新鉴权

**要求**
1. 移除硬编码默认密码 `'「旧默认密码」'`
2. 引入 `ADMIN_PASSWORD_HASH`（bcrypt ≥ 12）+ `AUTH_SECRET`（≥32字节）
3. 会话 token 改为 `HMAC-SHA256` 签名 + `exp`（7天）+ `timingSafeEqual` 比较
4. Cookie 设置 `HttpOnly; Secure; SameSite=Lax; Path=/`
5. 环境变量缺失时**应用拒绝启动**（不得静默降级）
6. 登录接口加 IP 限流（5 次失败锁 15 分钟）
7. 删除 `/api/supabase`、`/api/clear-data`
8. 提供 `scripts/hash-password.mjs` 生成密码哈希

**交付物**
- 上述代码改动
- `scripts/hash-password.mjs`
- 一份 `SECURITY.md`（简述鉴权设计，不含任何密钥）

**验收标准**（对应 `05-验收清单.md` 的 S1-S12）
- [ ] S1 伪造 cookie 被拒
- [ ] S5 全局 grep `「旧默认密码」` 无结果
- [ ] S6 缺 `AUTH_SECRET` 启动报错
- [ ] S8 两个危险接口返回 404
- [ ] S9 登录限流生效
- [ ] 陈能正常登录后台

**依赖**：无。**可立即开始。**

---

---

## 执行记录

| 日期 | 状态变更 | 说明 |
|---|---|---|
| — | 待开工 | — |

## 验收证据

> 交付时在此粘贴：构建日志、页面截图、curl 返回示例。

（待填）
