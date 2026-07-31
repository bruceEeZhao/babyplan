# BabyPlan — 婴儿互动助手

> 帮助新手爸妈（0~36 个月）按月龄获取互动活动，每日清单打卡跟踪，并追踪发育里程碑。国内家庭场景，中文界面，响应式 Web（手机优先）。

## ✨ 功能特性

- **按月龄推荐活动**：0~12 个月按月、13~36 个月按季，共 20 个阶段，54 个核心活动跨阶段复用
- **每日清单**：系统按发育状态加权推荐（未达成领域加重、已达成减量），可替换个别项目，生成即快照固化
- **里程碑追踪**：111 个发育里程碑（含国家卫健委《心理行为发育标志自评表》官方校准条目），累计次数达阈值建议确认，新婴儿自动初始化
- **历史记录**：每日清单快照回看，活动库变更不影响历史
- **家庭共享**：双人账号邀请码绑定，数据实时同步；多婴儿支持（双胞胎/二胎）
- **权威内容**：活动与里程碑基于 CDC、AAP 及国家卫健委指南整理，含安全提示与免责声明

## 🛠 技术栈

| 层 | 技术 |
|----|------|
| 前端/后端 | Next.js 16.2（App Router + Turbopack）+ React 19 + TypeScript |
| 数据库 | PostgreSQL 15 + Prisma 6 |
| 认证 | Auth.js v5（Credentials + JWT + bcrypt） |
| 样式 | Tailwind CSS 4 |
| 部署 | Docker Compose（app + PostgreSQL + Nginx） |

## 🚀 快速开始

### 开发环境

```bash
# 1. 启动 PostgreSQL（Docker）
docker run -d --name babyplan-db -e POSTGRES_USER=postgres -e POSTGRES_PASSWORD=postgres \
  -e POSTGRES_DB=babyplan -p 5433:5432 -v babyplan-pgdata:/var/lib/postgresql/data \
  --restart unless-stopped postgres:15-alpine

# 2. 配置环境变量（.env）
# DATABASE_URL="postgresql://postgres:postgres@localhost:5433/babyplan"
# AUTH_SECRET=$(openssl rand -base64 32)

# 3. 安装依赖、迁移、填充内容
npm install
npm run db:migrate
npm run db:seed

# 4. 启动开发服务器
npm run dev        # 固定端口 3100
```

### 演示账号

| 账号 | 密码 | 角色 |
|------|------|------|
| 13800000001 | 123456 | 妈妈（家庭创建者） |
| 13800000002 | 123456 | 爸爸 |

演示婴儿「小星星」（4 月龄）。

### 生产部署

```bash
cp .env.production.example .env   # 设置 POSTGRES_PASSWORD / AUTH_SECRET / NEXTAUTH_URL
docker compose up -d --build      # 详见 DEPLOYMENT.md
```

首次启动自动完成：建表迁移 → 内容库加载（54 活动 / 111 里程碑）→ 应用启动。生产环境无演示账号。

## 📁 项目结构

```
src/
├── app/                  # 页面 + Server Actions
│   ├── actions.ts        # 清单/打勾/替换/里程碑/婴儿
│   ├── auth-actions.ts   # 注册/家庭/邀请码/解绑/改密
│   ├── page.tsx          # 今日清单
│   └── milestones/ history/ babies/ onboarding/ login/ register/
├── components/           # 客户端交互组件（useActionState）
├── lib/
│   ├── checklist.ts      # 清单生成算法（加权抽取 + 快照）
│   ├── date.ts           # 时区安全日期工具
│   └── session.ts        # 会话守卫
├── auth.ts               # Auth.js 配置
prisma/
├── schema.prisma         # 数据模型（11 张表）
├── seed.ts               # 内容库 + 演示数据（幂等）
└── migrations/           # 数据库迁移
db-seed/01-content.sql    # 生产内容库（pg_dump 导出）
docs/                     # CONTEXT.md + 11 条 ADR + 内容参考文献
```

## 📚 文档

- [`CONTEXT.md`](CONTEXT.md) — 领域术语表
- [`docs/adr/`](docs/adr/) — 架构决策记录（11 条）
- [`docs/活动内容与参考文献.md`](docs/活动内容与参考文献.md) — 内容来源与全量活动表
- [`DEPLOYMENT.md`](DEPLOYMENT.md) — 生产部署指南
- [`AGENTS.md`](AGENTS.md) — 开发者/AI 代理项目指南

## ⚠️ 免责声明

本项目内容为育儿知识整理与参考，**不构成医疗诊断或治疗建议**。里程碑为「多数儿童可达」的参考区间，个体发育存在差异。若担心宝宝发育情况，请咨询儿科医生或儿童保健机构。
