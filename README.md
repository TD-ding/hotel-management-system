# 云顶大酒店管理系统

全栈酒店管理系统，包含用户端和管理端。

## 功能特性

- 房间���览、预订、评价
- 管理员后台（仪表盘、房间/预订/用户管理）
- 预订日历可视化
- CSV 数据导出
- 通知系统
- JWT 认证

## 快速开始

```bash
# 安装依赖
npm run setup   # 或手动: cd server && npm i && cd ../client && npm i

# 配置环境变量
cp .env.example .env
# 编辑 .env 设置 JWT_SECRET

# 初始化数据
npm run seed

# 开发模式
npm run dev
```

前端访问 http://localhost:5173，API 地址 http://localhost:3001。

演示账号:

| 角色 | 用户名 | 密码 |
|------|--------|------|
| 管理员 | admin | admin123 |
| 用户 | demo | user123 |

## 项目结构

```
├── server/               # 后端 Express API
│   ├── src/
│   │   ├── index.js       # 入口，路由挂载、multer 上传
│   │   ├── db.js          # SQLite DB 初始化
│   │   ├── middleware.js   # JWT 认证 + 限流
│   │   ├── seed.js        # 种子数据
│   │   └── routes/        # API 路由
│   │       ├── auth.js
│   │       ├── rooms.js
│   │       ├── bookings.js
│   │       ├── users.js
│   │       ├── reviews.js
│   │       ├── notifications.js
│   │       ├── stats.js
│   │       ├── export.js
│   │       └── upload (in index.js)
│   └── seed.js            # 初始化数据
│
├── client/                 # React 前端
│   ├── src/
│   │   ├── App.jsx          # 路由配置
│   │   ├── api.js           # Axios 实例
│   │   ├── auth.jsx         # AuthContext
│   │   ├── theme.js, constants.js, utils.js, etc.
│   │   ├── pages/           # 页面组件
│   │   ├── admin/           # 管理后台页面
│   │   └── components/      # Navbar, Toast, Pagination
│
├── .env.example  # 环境变量模板
├── docker-compose.yml
├── server.Dockerfile
└── client.Dockerfile
```

## 环境变量

| 变量 | 必需 | 默认值 | 说明 |
|-----|------|--------|------|
| `JWT_SECRET`  | ✅ | — | JWT 签名密钥 |
| `PORT` | ✗ | 3001 | 服务端口 |
| `CLIENT_ORIGIN` | �� | http://localhost:5173 | CORS 前端地址 |

## API

完整 API 文档见 [docs/backend.md](docs/backend.md).

| Method | Endpoint                    | Auth  | Description      |
|-------|-----------------------------|-------|------------------|
| POST  | `/api/auth/register`         | ✗     | 用户注册 |
| POST  | `/api/auth/login`            | ✗     | 用户登录 |
| GET   | `/api/rooms`                | ✗     | 房间列表 |
| GET   | `/api/rooms/:id`             | ✗     | 房间详情 |
| POST  | `/api/rooms`                 | ✓     | 创建房间 (admin) |
| GET   | `/api/bookings/mine`         | ✓     | 我的预订 |
| POST  | `/api/bookings`              | ✓     | 创建预订 |
| PUT   | `/api/bookings/:id`          | ✓     | 更新预订 |
| GET   | `/api/stats`                 | ✓     | 统计信息 (admin) |
| ...   | ...                         |       |                   |

## 快速启动 (Docker)

```sh
docker-compose up -d
```

## 许可证

MIT