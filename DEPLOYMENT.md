# BabyPlan 部署指南

## 一键部署（Docker Compose）

```bash
# 1. 配置生产环境变量
cp .env.production.example .env
# 编辑 .env：设置强密码 POSTGRES_PASSWORD、生成 AUTH_SECRET、配置 NEXTAUTH_URL

# 2. 构建并启动
docker compose up -d --build

# 3. 查看状态（app/db/nginx 均应 healthy）
docker compose ps
```

访问 `http://服务器IP:8080`（通过 `.env` 的 `PORT` 修改端口）。

## 首次启动自动完成

| 步骤 | 机制 |
|------|------|
| 数据库初始化 | `db` 容器（postgres:15-alpine，数据卷 `babyplan-pgdata`） |
| 表结构迁移 | `app` 容器启动时 `scripts/migrate.sh` 按序执行 `prisma/migrations/*` |
| 内容库加载 | 迁移完成后若 `Activity` 表为空，自动导入 `db-seed/01-content.sql`（54 活动 / 111 里程碑 / 20 阶段） |
| 应用启动 | `node server.js`（Next.js standalone） |

> 生产环境**不包含演示账号**，首次使用请注册新账号并创建家庭。

## 常用操作

```bash
docker compose logs -f app     # 应用日志
docker compose down            # 停止（保留数据）
docker compose down -v         # 停止并删除数据卷（重置数据库）
docker compose up -d --build   # 更新代码后重新部署
```

## 更新内容库

内容（活动/里程碑）在 `prisma/seed.ts` 中维护。更新流程：

1. 开发环境修改 seed 后 `npm run db:seed`
2. 重新导出内容 SQL：`docker exec babyplan-db pg_dump -U postgres -d babyplan --data-only --column-inserts -t '"MonthStage"' -t '"Activity"' -t '"Milestone"' -t '"_ActivityToMonthStage"' -t '"_ActivityToMilestone"' > db-seed/01-content.sql`
3. 提交并重新部署（已有数据库不会重复加载，仅全新部署生效；存量库可在 `app` 容器内手动执行该 SQL）

## 生产注意事项

- **`AUTH_SECRET` 必须设置**（缺失会导致 compose 拒绝启动），用 `openssl rand -base64 32` 生成
- 生产环境建议前置 HTTPS（Nginx 或云负载均衡），`NEXTAUTH_URL` 需与对外域名一致
- 内容库 seed 为幂等设计（仅空表时加载），安全可重复执行
