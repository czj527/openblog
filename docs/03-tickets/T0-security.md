# T0 · 安全基线（在 openblog 实现，不修 portfolio）

> 状态：`待开工`
> 负责人：开发 Agent
> 验收人：陈
> 所属项目：**openblog**
> 依赖：**T-1 完成**（openblog 骨架已就绪）
>
> ⚠️ 执行前必读：`docs/README.md` 硬性规则 + `docs/02-contracts/design-system.md`

---

## 重要说明（与旧版 T0 的区别）

旧版 T0 要求「重写 `portfolio` 的 `src/lib/auth.ts`、删除 `/api/supabase`、`/api/clear-data`」。

**这个前提已经不成立**：
- `portfolio` 不再开发，只作只读基线（D-004）
- `openblog` 全新开始，那些文件本来就不存在，**不需要删，只需要「不要创建」**

所以本工单的目标从「止血」改为 **「从第一行代码起就把安全基线做对」**。

---

## 为什么还要单独一个安全工单

因为这三件事如果后期补，改动面会扩散到全站：

1. 鉴权实现错了 → 所有后台接口都要跟着改
2. 环境变量校验缺失 → 部署到 Vercel 才炸
3. 公开写入没有校验 → 数据库被灌垃圾后要清洗

**在写业务代码之前定下来，成本最低。**

---

## 任务 A：鉴权（新建，非修改）

新建 `src/lib/auth/`，**不要**照搬 portfolio 的 `src/lib/auth.ts`（那版有验证绕过漏洞：只检查 token 是否以 `"admin:"` 开头）。

**要求**

| # | 项 | 具体做法 |
|---|---|---|
| A1 | 密码存储 | `ADMIN_PASSWORD_HASH`，bcrypt cost ≥ 12 |
| A2 | 会话 token | `HMAC-SHA256(payload, AUTH_SECRET)` 签名，payload 含 `exp`（7 天） |
| A3 | 比较方式 | `crypto.timingSafeEqual`，防时序攻击 |
| A4 | Cookie | `HttpOnly; Secure; SameSite=Lax; Path=/; Max-Age=604800` |
| A5 | 环境变量 | `AUTH_SECRET`（≥32 字节）、`ADMIN_PASSWORD_HASH` 缺失时**进程启动即退出** |
| A6 | 登出 | 服务端清除 cookie，token 侧记录失效时间（可选） |

**禁止**

- ❌ 硬编码任何默认密码
- ❌ token 只做 base64 编码不签名
- ❌ 用 `===` 直接比较 token
- ❌ 环境变量缺失时静默降级为「开发模式免密」

## 任务 B：登录限流

⚠️ **不能用进程内 Map**。Vercel 函数会冷启动、扩缩容、并行多实例，内存计数在实例间不共享，等于没限流。

**要求**（任选其一，在工单执行记录里写明选了哪个）

| 方案 | 说明 |
|---|---|
| A. Upstash Redis | 免费额度够用，`@upstash/ratelimit` 开箱即用 |
| B. Vercel KV | 与 Vercel 集成最顺 |
| C. Supabase 表 | 建 `login_attempts` 表，记录 IP 哈希 + 时间窗口 |

**策略**：同一 IP 连续失败 5 次 → 锁定 15 分钟。

## 任务 C：环境变量校验

新建 `scripts/check-env.mjs`，在 `next.config.ts` 或应用启动时调用。

```
必需变量（缺失则 throw）：
  AUTH_SECRET              ≥32 字节
  ADMIN_PASSWORD_HASH      以 $2a$/$2b$ 开头
  NEXT_PUBLIC_SUPABASE_URL
  NEXT_PUBLIC_SUPABASE_ANON_KEY
  SUPABASE_SERVICE_ROLE_KEY

可选变量（缺失只警告）：
  NOTION_TOKEN
  NOTION_BLOG_DATA_SOURCE_ID
  NOTION_ECONOMY_DATA_SOURCE_ID
  NOTION_WEBHOOK_SECRET
```

**要求**：错误信息只说明「哪个变量缺失」，**不得打印变量值**。

## 任务 D：Supabase client 分离

| 文件 | 用途 | 用哪个 key |
|---|---|---|
| `src/lib/supabase/public.ts` | 公开数据读取 | anon key |
| `src/lib/supabase/admin.ts` | 服务端写入、管理操作 | service_role key |

**硬性要求**

- `admin.ts` 顶部加 `import 'server-only'`，防止被打进客户端 bundle
- **禁止**建立 `/api/supabase` 这类「传表名 + 操作」的通用代理
- 所有数据库操作必须是**具名接口**（如 `/api/comments`），不接受任意表名参数

## 任务 E：密码哈希工具

新建 `scripts/hash-password.mjs`：

```bash
node scripts/hash-password.mjs
# 交互式输入密码，输出 bcrypt hash
# 密码不落盘、不进 shell history
```

---

## 交付物

- [ ] `src/lib/auth/` 完整实现
- [ ] `scripts/check-env.mjs`
- [ ] `scripts/hash-password.mjs`
- [ ] `src/lib/supabase/public.ts`、`admin.ts`
- [ ] 登录接口 `src/app/api/auth/login/route.ts`（含限流）
- [ ] 登出接口 `src/app/api/auth/logout/route.ts`
- [ ] 更新 `SECURITY.md`（说明鉴权设计，**不含任何密钥值**）
- [ ] `EVIDENCE/T0/` 下放 curl 测试记录

---

## 验收标准

> 对应 `docs/04-acceptance/checklist.md` 的 **S1–S12**

| # | 检查项 | 验证方法 |
|---|---|---|
| S1 | 伪造 cookie 被拒 | 手工构造 `admin:xxx` cookie，请求后台应 401 |
| S2 | 过期 token 被拒 | 构造 `exp` 已过的 token，应 401 |
| S3 | 篡改签名被拒 | 改 token 任一字节，应 401 |
| S4 | 正确密码可登录 | 浏览器实测 |
| S5 | 无硬编码默认密码 | `grep -rn "admin123\|password.*=.*['\"]" src/` 无命中 |
| S6 | 缺 `AUTH_SECRET` 启动报错 | 删除环境变量后 `pnpm build` 或 `pnpm dev` 应失败并提示变量名 |
| S7 | 缺 `ADMIN_PASSWORD_HASH` 启动报错 | 同上 |
| S8 | 无通用代理接口 | `ls src/app/api/supabase` 不存在 |
| S9 | 登录限流生效 | 连续 6 次错误密码，第 6 次返回 429 |
| S10 | service_role key 不泄漏到客户端 | `grep -r "SERVICE_ROLE" .next/static/` 无结果 |
| S11 | Cookie 属性正确 | DevTools 检查 `HttpOnly`、`Secure`、`SameSite=Lax` |
| S12 | 陈能正常登录后台 | 陈亲自验收 |

---

## 依赖

**T-1 完成。**

## 阻塞项（需陈准备）

| # | 事项 | 说明 |
|---|---|---|
| 1 | 设定管理员密码并生成 bcrypt hash | **陈本地执行** `node scripts/hash-password.mjs`，不要把密码发给任何 agent |
| 2 | 生成 `AUTH_SECRET` | 陈本地执行 `openssl rand -base64 32` |
| 3 | 轮换泄露的 GitHub token | 旧 token 已在聊天记录暴露，必须撤销重发 |

> 这三项由陈本人完成，agent 只负责「变量缺失时拒绝启动」的代码逻辑。

---

## 执行记录

| 日期 | 状态变更 | 说明 |
|---|---|---|
| — | 待开工 | 等待 T-1 完成 |

## 验收证据

> 交付时在此粘贴：curl 测试输出、限流测试记录、环境变量校验截图。

（待填）
