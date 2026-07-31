<!-- BEGIN:nextjs-agent-rules -->
# This is NOT the Next.js you know

This version has breaking changes — APIs, conventions, and file structure may all differ from your training data. Read the relevant guide in `node_modules/next/dist/docs/` before writing any code. Heed deprecation notices.
<!-- END:nextjs-agent-rules -->

# BabyPlan — 婴儿互动指导应用

帮助新手爸妈（0~36 个月）按月龄获取互动活动，以每日清单打卡跟踪，并追踪发育里程碑。国内家庭场景，中文界面，响应式 Web（手机优先）。

## 技术栈

| 层 | 技术 | 备注 |
|----|------|------|
| 前端/后端 | Next.js 16.2.12（App Router + Turbopack）+ React 19 + TS | Server Actions 做数据变更 |
| 数据库 | PostgreSQL 15 + Prisma 6 | 容器 `babyplan-db`（宿主 5433） |
| 认证 | Auth.js v5（Credentials + JWT + bcrypt） | `AUTH_SECRET` 必配 |
| 样式 | Tailwind CSS 4 | 无组件库 |
| 部署 | Docker Compose（app + db + nginx） | 见 `DEPLOYMENT.md` |

## 先读这些（踩过的坑）

1. **Next.js 16 breaking changes**：`params`/`cookies`/`headers` 必须 `await`；`middleware` 已改名 `proxy`；`PageProps` 是默认导出。写代码前查 `node_modules/next/dist/docs/`。
2. **时区陷阱（重要）**：Prisma 写 PG `date` 列按 UTC 转换，`new Date().setHours(0,0,0,0)` 会在 CST 晚上错位一天。**所有日期操作必须用 `src/lib/date.ts` 的 `localDateKey` / `dateKeyToDate`**。
3. **快照机制**：`DailyChecklist`/`ChecklistItem` 冗余复制活动字段（title/description/image/次数/标签），`activityId` 为弱引用（无外键）。修改内容库不影响历史记录——**禁止改成实时关联**。
4. **`MonthStage.id` 是 Int**（非字符串），查询/Map key 注意类型。
5. **npm registry**：本项目 lock 用官方 registry 生成；若改依赖后 `npm ci` 报 `Missing: @emnapi/*`，是 npmmirror 镜像缺陷，需 `rm -rf node_modules package-lock.json && npm_config_registry=https://registry.npmjs.org npm install` 重建。

## 目录结构

```
src/
├── app/                  # 页面 + Server Actions
│   ├── actions.ts        # 清单/打勾/替换/里程碑/婴儿
│   ├── auth-actions.ts   # 注册/家庭/邀请码/解绑/改密
│   ├── page.tsx          # 今日清单
│   ├── milestones/ history/ babies/ onboarding/ login/ register/
│   └── api/auth/         # Auth.js 路由
├── components/           # 客户端交互组件（useActionState 模式）
├── lib/
│   ├── checklist.ts      # 清单生成算法 + initBabyMilestones
│   ├── date.ts           # 时区安全日期工具（必用）
│   ├── session.ts        # 会话 + requireFamilyContext 守卫
│   ├── current-baby.ts   # 当前婴儿（cookie + 归属校验）
│   └── prisma.ts         # Prisma 单例
├── auth.ts               # Auth.js 配置（trustHost: true）
└── types/next-auth.d.ts
prisma/
├── schema.prisma         # 领域模型映射
├── seed.ts               # 内容库 + 演示数据（幂等）
├── test-flow.ts          # 核心业务集成测试
└── migrations/
db-seed/01-content.sql    # 生产内容库（pg_dump 导出，勿手改）
scripts/migrate.sh        # 生产迁移 + 内容加载
docs/                     # CONTEXT.md + adr/ + 内容参考文献 + 部署
```

## 领域模型（完整术语见 `CONTEXT.md`）

- **月龄阶段**：20 个（0~12 个月按月、13~36 个月按季），`MonthStage` 表
- **活动**：54 个，跨阶段复用（多对多）；标签 = 能力领域（6 类）/ 场景 / 所需道具；`dailyTargetCount` 固定不变
- **里程碑**：111 个，显式关联活动（`Milestone.activities`）+ 累计次数阈值；含 30 条官方《心理行为发育标志自评表》校准条目（`gov` 前缀）
- **每日清单**：加权抽取生成（ADR-0008：未达成领域 ×1.5 / 已达成 ×0.6），生成即固化为快照；每日目标次数固定，未完成次日原样出现（不递增）
- **里程碑联动**：关联活动累计完成次数 ≥ 阈值 → App 建议确认 → 父母手动确认（不自动认定）→ 确认后该领域权重降低
- **家庭**：2 名父母（创建者 + 成员），6 位邀请码（7 天有效、一次性）；`leaveFamily` 保留个人数据

## 常用命令

```bash
npm run dev              # 开发（端口 3000；被占用用 PORT=3100）
npm run build / start    # 生产构建/启动
npm run db:seed          # 重置内容库 + 演示数据（幂等）
npm run db:migrate       # 开发迁移
npm run db:reset         # 重建数据库
npx tsx prisma/test-flow.ts  # 核心业务集成测试
docker compose up -d --build  # 生产部署（见 DEPLOYMENT.md）
```

## 演示数据

| 账号 | 密码 | 角色 |
|------|------|------|
| 13800000001 | 123456 | 妈妈（家庭创建者） |
| 13800000002 | 123456 | 爸爸 |

演示婴儿「小星星」（4 月龄）。生产环境（Docker）**无演示账号**。

## 内容维护流程

1. 修改 `prisma/seed.ts`（活动/里程碑/阶段数据）
2. `npm run db:seed` 本地验证
3. **重新导出生产内容库**：`docker exec babyplan-db pg_dump -U postgres -d babyplan --data-only --column-inserts -t '"MonthStage"' -t '"Activity"' -t '"Milestone"' -t '"_ActivityToMonthStage"' -t '"_ActivityToMilestone"' > db-seed/01-content.sql`
4. 提交（seed.ts + 01-content.sql 必须同步）

## 文档索引

- `CONTEXT.md` — 领域术语表（改概念先看这里）
- `docs/adr/` — 11 条架构决策（改行为前先查对应 ADR）
- `docs/活动内容与参考文献.md` — 内容来源、参考文献、全量活动表
- `DEPLOYMENT.md` — 生产部署指南
