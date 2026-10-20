# 权限与鉴权方案

> 状态：`草案（待陈确认）`
> 本文档定义权限边界、鉴权方案与实现要求。

> 本文档定义权限边界、鉴权方案与实现要求。

---

## 一、现状漏洞（必须先修）

### 1.1 鉴权完全可绕过 🔴

**位置**：`src/lib/auth.ts`

```ts
export function verifyAdmin(request: NextRequest): boolean {
  const token = request.cookies.get('admin_token')?.value;
  if (token) {
    try {
      const decoded = Buffer.from(token, 'base64').toString('utf-8');
      return decoded.startsWith('admin:');   // ← 只检查前缀
    } catch { return false; }
  }
  const authHeader = request.headers.get('x-admin-token');
  if (authHeader === ADMIN_PASSWORD) { return true; }
  return false;
}
```

**攻击方式**（一行 JS 即可）：
```js
document.cookie = "admin_token=" + btoa("admin:anything") + "; path=/";
```
→ 刷新页面即获得完整管理员权限。

### 1.2 硬编码默认密码 🔴

`src/lib/auth.ts:3`：
```ts
const ADMIN_PASSWORD = process.env.ADMIN_PASSWORD || '「旧默认密码」';
```
默认密码已随源码存在，即使不绕过 cookie 也能直接使用。

### 1.3 攻击面过大 🔴

| 接口 | 风险 |
|---|---|
| `POST /api/supabase` | 通用代理，可对**任意表**做 select/insert/update/delete |
| `DELETE /api/clear-data` | 一键清空数据 |

一旦鉴权失效，等同于**数据库全权限**。

### 1.4 其他

| 问题 | 位置 | 风险 |
|---|---|---|
| 密码明文比对（无哈希） | `auth.ts` | 内存/日志泄露风险，无法做恒定时间比较 |
| Token 无过期、无签名 | `auth.ts` | 可伪造、永久有效 |
| 无速率限制 | `/api/auth/login` | 可暴力破解 |
| 评论/留言无内容校验、无频率限制 | `/api/comments`、`/api/guestbook` | 垃圾评论、XSS 风险 |

---

## 二、重构后的权限边界

### 2.1 三层权限模型

| 层 | 身份 | 能做什么 | 认证方式 |
|---|---|---|---|
| **L0 匿名访客** | 未登录 | 读文章、读规划、看评论、点赞、留言（有频率限制） | 无 |
| **L1 管理员** | 陈本人 | L0 全部 + 评论审核/删除、留言删除、友链管理、任务/日程/项目 CRUD | HMAC 签名会话 |
| **L2 系统** | Vercel 服务端 | 读写 Supabase（service_role）、读 Notion | 环境变量密钥 |

### 2.2 接口权限矩阵

| 接口 | L0 | L1 | 备注 |
|---|---|---|---|
| `GET /api/posts`（列表） | ✅ | ✅ | 只读 Notion（缓存） |
| `GET /api/posts/[slug]` | ✅ | ✅ | 只读 Notion（缓存） |
| `GET /api/categories`、`/api/tags` | ✅ | ✅ | 只读 Notion |
| `GET /api/comments?postId=` | ✅ | ✅ | 只返回已通过审核的 |
| `POST /api/comments` | ✅ | ✅ | 需频率限制 + 内容校验，默认进待审核 |
| `POST /api/likes` | ✅ | ✅ | 按 IP 去重 |
| `POST /api/guestbook` | ✅ | ✅ | 需频率限制 + 内容校验 |
| `GET /api/guestbook` | ✅ | ✅ | |
| `DELETE /api/comments/[id]` | ❌ | ✅ | |
| `PATCH /api/comments/[id]`（审核通过） | ❌ | ✅ | |
| `DELETE /api/guestbook/[id]` | ❌ | ✅ | |
| `/api/friend-links`（POST/PUT/DELETE） | ❌ | ✅ | GET 公开 |
| `/api/tasks`、`/api/schedules`、`/api/projects`、`/api/activity-log` | ❌ | ✅ | 个人管理数据，全部需登录 |
| `/api/revalidate` | ❌ | ❌ | 仅 Webhook，校验 `NOTION_WEBHOOK_SECRET` |
| ~~`POST /api/supabase`~~ | — | — | **删除** |
| ~~`DELETE /api/clear-data`~~ | — | — | **删除** |

**关键变化**：原来的"一个通用接口打通所有表"改为"每个资源一个接口 + 明确权限"。

---

## 三、推荐鉴权方案

### 方案 A · HMAC 签名无状态会话（推荐）

不用建表、不用 session 存储，适合单人管理员场景。

**登录流程**
```
POST /api/auth/login  { password }
  ↓
1. 从 env 读 ADMIN_PASSWORD_HASH
2. bcrypt/argon2 verify(password, hash)      ← 恒定时间比较
3. 失败 → 返回 401，并记录失败次数（按 IP）
4. 成功 → 生成 payload: { sub: 'admin', iat, exp: iat + 7d }
5. token = base64url(payload) + '.' + HMAC-SHA256(payload, AUTH_SECRET)
6. Set-Cookie: admin_session=token; HttpOnly; Secure; SameSite=Lax; Path=/; Max-Age=604800
```

**校验流程**
```
verifyAdmin(request):
  1. cookie.admin_session 存在？
  2. 按 '.' 拆为 payload / sig
  3. 重算 HMAC-SHA256(payload, AUTH_SECRET)
  4. crypto.timingSafeEqual(重算值, sig)     ← 恒定时间
  5. 解析 payload，检查 exp > now
  6. 检查 sub === 'admin'
  全部通过才返回 true
```

**为什么不用 JWT 库**：单人场景 payload 极简，手写 HMAC 更少依赖、更易审计。若团队偏好标准，用 `jose`（Next.js 官方示例同款）也可。

### 方案 B · Supabase Auth

把管理员做成 Supabase 的一个用户，用 Supabase 的 session 机制。

**优点**：与其他 Supabase 数据天然联动、RLS 可统一配置
**缺点**：多引入一套 Auth 概念、单人管理员略显重、登录页需适配

### 方案 C · NextAuth (Auth.js) + Credentials Provider

**优点**：生态成熟、扩展性好（将来接 GitHub / Google 登录方便）
**缺点**：为单人场景引入较多配置

### 👉 推荐：**方案 A**

理由：单人管理员、需求简单、零额外依赖、无状态、易审计、7 天有效期足够。

> 若将来需要多作者 / OAuth 登录，再升级到方案 C，届时方案 A 的接口可平滑替换。

---

## 四、实现要求（给开发 Agent 的硬性要求）

### 4.1 密码存储

- ❌ 禁止任何形式的明文密码、硬编码默认值、`|| 'fallback'`
- ✅ 只存 `ADMIN_PASSWORD_HASH`（bcrypt cost ≥ 12 或 argon2id）
- ✅ 环境变量缺失时**应用拒绝启动**（fail fast），不得静默降级
- ✅ 提供一次性脚本生成 hash：`node scripts/hash-password.mjs <password>`（脚本不提交密码）

### 4.2 会话 Token

- ✅ HMAC-SHA256 签名
- ✅ 必须设置 `exp`（默认 7 天）
- ✅ Cookie：`HttpOnly` + `Secure`（生产）+ `SameSite=Lax` + `Path=/`
- ✅ 比较必须用 `crypto.timingSafeEqual`（先比长度，再比内容）
- ✅ 密钥 `AUTH_SECRET` ≥ 32 字节随机值，缺失则拒绝启动

### 4.3 登录接口限流

- ✅ 同一 IP 连续失败 5 次 → 锁定 15 分钟
- ✅ 失败响应统一为 `401 { error: 'Invalid credentials' }`（不区分"密码错"和"用户不存在"）
- ✅ 记录失败日志（时间、IP、UA），不记录密码

### 4.4 公开写接口防护

| 接口 | 保护措施 |
|---|---|
| `POST /api/comments` | 内容长度 5-2000 字；同 IP 每分钟 ≤ 3 条；默认 `approved=false` 待审核；strip HTML |
| `POST /api/likes` | 同 IP 同文章唯一（DB unique 约束）；每分钟 ≤ 10 次 |
| `POST /api/guestbook` | 内容长度 1-500 字；同 IP 每分钟 ≤ 2 条；strip HTML |
| `POST /api/revalidate` | 校验 `NOTION_WEBHOOK_SECRET`（HMAC 或 header 比对） |

### 4.5 数据层权限

- ✅ 所有写操作必须走 `SUPABASE_SERVICE_ROLE_KEY`（仅服务端）
- ✅ 客户端一律用 `NEXT_PUBLIC_SUPABASE_ANON_KEY`，并开启 **RLS**
- ✅ RLS 策略：公开表（comments/guestbook/friend_links/posts_read）允许 `SELECT`；`INSERT` 仅允许特定列；`UPDATE`/`DELETE` 仅 service_role
- ✅ `service_role` key 绝不出现在任何客户端 bundle（构建后 grep 验证）

---

## 五、验收标准（安全专项）

| # | 检查项 | 通过标准 |
|---|---|---|
| S1 | 伪造 cookie 攻击 | 设置 `admin_token=base64("admin:x")` 后访问 `/admin` → **拒绝** |
| S2 | 无 cookie 访问后台 | `/admin` 重定向到登录页 |
| S3 | 过期 token | 手动构造 `exp` 已过去的 token → **拒绝** |
| S4 | 篡改签名 | 修改 payload 保留原签名 → **拒绝** |
| S5 | 硬编码密码 | 全局 grep `「旧默认密码」` → **0 结果** |
| S6 | 环境变量缺失 | 删除 `AUTH_SECRET` 启动 → **应用报错退出**（不静默降级） |
| S7 | service_role 泄露 | 构建产物 grep `service_role` → 仅出现在 server chunk |
| S8 | 通用数据接口 | `/api/supabase`、`/api/clear-data` → **404** |
| S9 | 登录限流 | 连续 6 次错误密码 → 第 6 次返回 429 或锁定提示 |
| S10 | 评论 XSS | 提交 `<script>alert(1)</script>` → 存储为纯文本，渲染不执行 |
| S11 | Webhook 伪造 | 无正确 secret 调用 `/api/revalidate` → **401** |
| S12 | 明文密码入仓 | `git log -p` 与当前文件 grep 密码相关字符串 → 无明文 |

---

## 六、需要陈执行的事项

| 事项 | 操作 | 紧急度 |
|---|---|---|
| 撤销泄露的 GitHub token | https://github.com/settings/tokens → Revoke → 生成新 token | 🔴 今天 |
| 设置新管理员密码 | 告诉我新密码（我生成 hash 写进 env 记录）/ 或你自己在 Vercel 配 | 🟡 Phase 3 前 |
| 生成 `AUTH_SECRET` | `openssl rand -base64 32` | 🟡 Phase 3 前 |
| 检查仓库历史是否含旧密钥 | 若 `ADMIN_PASSWORD` 曾以明文提交，考虑轮换所有相关密钥 | 🟡 Phase 0 |

> 所有凭证我会记录到 `~/.vault/credentials.md`（权限 600）。
