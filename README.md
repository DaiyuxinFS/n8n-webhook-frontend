# n8n Webhook Frontend (Next.js on Zeabur)

## 🔐 简单登录认证

本项目使用简单的用户名/密码认证来保护你的爬虫界面。

### 默认登录信息

**用户名：** `admin` (可通过 AUTH_USERNAME 环境变量修改)  
**密码：** 通过 AUTH_PASSWORD 环境变量设置（必需）

### 配置密码

在 Zeabur 的 Environment Variables 中添加：
```
AUTH_PASSWORD=你的安全密码
```

可选：修改用户名
```
AUTH_USERNAME=你的用户名
```

### 安全建议

1. **修改默认密码**：部署前请务必修改默认密码
2. **使用强密码**：至少8位，包含字母、数字和特殊字符
3. **定期更换**：建议定期更换密码
4. **HTTPS**：确保你的Zeabur域名使用HTTPS

### 登录流程

1. 访问应用时会自动跳转到登录页面
2. 输入用户名和密码
3. 登录成功后可正常使用爬虫功能
4. 点击"退出登录"可安全退出

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