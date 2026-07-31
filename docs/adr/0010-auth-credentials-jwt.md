# 认证采用 next-auth v5 + Credentials + JWT 会话，页面级守卫

注册/登录采用手机号 + 密码（bcrypt 哈希），会话策略为 JWT（Credentials 登录不支持数据库会话）。Auth.js 配置 `trustHost: true`（非默认端口部署需要）。

路由守卫未使用 Next 16 的 proxy（原 middleware）机制，而是在受保护页面服务端检查会话：未登录 `redirect("/login")`，已登录但无家庭 `redirect("/onboarding")`。Server Actions 内部重复校验归属（操作仅限当前家庭资源）。invite 规则：6 位字符、7 天有效、一次性使用、家庭上限 2 名父母（创建者 + 1 成员）。

选择页面级守卫而非 proxy：规则简单、显式、无代理层调试成本；后续若需全局拦截再迁移 proxy 即可。
