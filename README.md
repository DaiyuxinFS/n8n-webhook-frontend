# n8n Webhook Frontend (Next.js on Zeabur)

## 本地开发
1. 安装依赖：`npm install`
2. 启动开发：`npm run dev` → 打开 http://localhost:3000
3. 直接调用 API：
   - GET: `http://localhost:3000/api/trigger?name=Alice&email=a@b.com`
   - POST: `curl -X POST http://localhost:3000/api/trigger -H 'content-type: application/json' -d '{"name":"Alice","email":"a@b.com"}'`

> 默认为 `N8N_WEBHOOK_URL` 环境变量，未配置时回落到 `https://wsnb.zeabur.app/webhook-test/7e668ab2-dcdf-421a-88c5-4d2163c6450e`。

## 部署到 Zeabur
1. 推送到 GitHub 仓库
2. Zeabur 新建服务（自动识别 Next.js）
3. 在 Environment 配置：`N8N_WEBHOOK_URL=https://wsnb.zeabur.app/webhook-test/7e668ab2-dcdf-421a-88c5-4d2163c6450e`
4. Redeploy 并访问域名
------测试文字