# AI Task Hub — TODO

## 已完成

- [x] Phase 1: 数据库 + Prisma 基础设施（PostgreSQL, User/Task/Transaction 表）
- [x] Phase 2: 用户认证（NextAuth.js, GitHub/Google/邮箱密码, 路由保护 proxy.ts）
- [x] Phase 3: 核心业务逻辑（服务端余额扣费, 失败退款, 任务持久化, 定价调整）
- [x] Phase 4: 支付集成（Stripe 国际支付 + 支付宝国内支付, Webhook, 充值套餐）
- [x] Phase 5: 生产加固（API 限流, 安全头, 404/error 页面, 隐私/条款, SEO, Docker 部署）

## 待办 — 部署上线前

- [ ] 配置 `.env` 生产环境变量（OPENAI_API_KEY, OAuth, Stripe, 支付宝密钥）
- [ ] 部署 PostgreSQL 到云服务器，运行 `npx prisma db push` 建表
- [ ] 配置域名 + HTTPS（SSL 证书）
- [ ] 配置 Stripe Webhook 端点（指向生产域名）
- [ ] 申请支付宝开放平台应用（需企业资质）
- [ ] 配置 GitHub/Google OAuth 回调 URL 为生产域名
- [ ] Docker 部署或 PM2 部署到云服务器
- [ ] ICP 备案（如果使用国内域名/服务器）

## 待办 — 上线后优化

- [ ] 图片存储持久化（上传到 OSS/S3，替换 DALL-E 临时 URL）
- [ ] Redis 替换内存限流（多实例部署场景）
- [ ] 错误监控接入（Sentry）
- [ ] 日志系统（结构化日志）
- [ ] E2E 测试（Playwright）
- [ ] 管理后台（用户管理、交易查询、数据统计）
- [ ] 邮件通知（注册验证、充值成功）
- [ ] 多标签页余额同步（BroadcastChannel）
- [ ] API 接口文档（供开发者调用）
