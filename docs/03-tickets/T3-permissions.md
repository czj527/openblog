# T3 · 权限重构（完整落地）

> 状态：`待开工`
> 负责人：开发 Agent
> 验收人：陈
> 所属项目：openblog
>
> ⚠️ 执行前必读：`docs/README.md` 的硬性规则 + `docs/02-contracts/design-system.md`

---

**目标**：把 T0 的止血版本，落地为完整的权限矩阵。

**范围**
- 按 `03-权限管理方案.md` 第 2.2 节实现接口权限矩阵
- 新建专用接口，替代已删除的通用接口：
  - `PATCH /api/comments/[id]`（审核）
  - `DELETE /api/comments/[id]`
  - `DELETE /api/guestbook/[id]`
  - `POST/PUT/DELETE /api/friend-links`
  - `GET/POST/PATCH/DELETE /api/tasks`、`/api/schedules`、`/api/projects`
- 公开写接口加防护（长度校验、频率限制、strip HTML）
- `/admin` 后台适配新接口

**要求**
- 所有写接口必须 `verifyAdmin` 先行
- 所有公开写接口必须 strip HTML（防 XSS）
- 频率限制用内存 Map 或 Upstash（个人站点内存足够）
- 错误响应不泄露内部信息

**验收标准**
- 对应 `05-验收清单.md` S1-S12 全部通过
- 新增专项：
  - [ ] 匿名 `POST /api/tasks` → 401
  - [ ] 匿名 `DELETE /api/comments/xxx` → 401
  - [ ] 管理员增删改任务/日程/项目/友链全部正常
  - [ ] 评论提交后为待审核状态，管理员审核后前台可见
  - [ ] 同 IP 1 分钟内提交 4 条评论 → 第 4 条被限流

**依赖**：T2 完成。

---

---

## 执行记录

| 日期 | 状态变更 | 说明 |
|---|---|---|
| — | 待开工 | — |

## 验收证据

> 交付时在此粘贴：构建日志、页面截图、curl 返回示例。

（待填）
