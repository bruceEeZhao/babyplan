# 技术栈采用 Next.js 全栈 + PostgreSQL

单人 AI 辅助开发、熟悉后端（Node/Python）、自有服务器/云账号。采用 Next.js 全栈方案：React + TypeScript 前端、Next.js API Routes 作为后端、PostgreSQL 数据库、Prisma ORM、Auth.js 认证、Docker Compose 单机部署。

选型依据：全栈 TypeScript 减少语言切换成本，AI 辅助开发所需上下文最小；Prisma schema 即领域模型的可执行版本；响应式 Web 形态与 Next.js 匹配度最高。备选的 FastAPI + React 前后端分离方案被否决，因其跨两套语言与代码库，单人 + AI 开发心智负担翻倍。后续若需推送或桌面图标，基于 PWA 渐进增强即可。
