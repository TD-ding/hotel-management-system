# 云顶大酒店 - 酒店管理系统

全栈酒店管理系统，包含用户端、管理端和 RESTful API。

## 功能

### 用户端
- 浏览客房列表（支持筛选房型、价格区间）
- 查看房间详情及设施
- 在线预订房间
- 用户注册/登录（JWT 认证）
- 查看个人预订历史、取消预订

### 管理端
- 管理员登录
- 仪表盘数据统计（用户数、预订数、收入等）
- 房间增删改查
- 预订管理（确认/取消/删除）
- 用户管理（编辑/删除/角色分配）

## 技术栈

- **前端**: React 18 + React Router v6 + Axios + Vite
- **后端**: Node.js + Express + JWT + SQLite (better-sqlite3)
- **认证**: bcryptjs 异步加密 + JWT Token

## 快速开始

```bash
# 安装依赖
npm run setup

# 配置环境变量
cp .env.example .env
# 编辑 .env 设置 JWT_SECRET（必填）

# 初始化数据库（含演示数据）
npm run seed

# 启动开发环境（前后端同时运行）
npm run dev
```

- 前端访问: http://localhost:5173
- 后端 API: http://localhost:3001

## 环境变量

| 变量 | 必填 | 说明 |
|------|------|------|
| `JWT_SECRET` | 是 | JWT 签名密钥，未设置则拒绝启动 |
| `CLIENT_ORIGIN` | 否 | 前端地址，默认 http://localhost:5173 |
| `PORT` | 否 | 后端端口，默认 3001 |

## 演示账号

| 角色 | 用户名 | 密码 |
|------|--------|------|
| 管理员 | admin | admin123 |
| 用户 | demo | user123 |

## 项目结构

```
├── .env.example            # 环境变量模板
├── server/                 # 后端
│   ├── src/
│   │   ├── index.js        # Express 入口
│   │   ├── db.js           # SQLite 数据库
│   │   ├── middleware.js    # JWT 认证中间件 + 限流
│   │   ├── seed.js         # 演示数据
│   │   └── routes/         # API 路由
│   │       ├── auth.js     # 认证（注册/登录，含限流）
│   │       ├── rooms.js    # 房间 CRUD
│   │       ├── bookings.js # 预订管理（权限控制）
│   │       ├── users.js    # 用户管理
│   │       └── stats.js    # 统计数据
├── client/                 # 前端
│   ├── src/
│   │   ├── pages/          # 用户页面（含 404）
│   │   ├── admin/          # 管理页面
│   │   ├── components/     # 公共组件
│   │   ├── constants.js    # 类型/状态标签等公共常量
│   │   ├── theme.js        # 主题色和布局常量
│   │   ├── api.js          # Axios 实例
│   │   ├── auth.jsx        # 认证上下文
│   │   └── App.jsx         # 路由配置
│   └── vite.config.js
└── package.json            # 根脚本
```

## 安全特性

- JWT 密钥从环境变量读取，未设置则拒绝启动
- CORS 限制为前端地址，防止跨域滥用
- 登录/注册接口限流（注册 5次/分钟，登录 10次/分钟）
- 服务端密码长度校验（6-128 位）
- bcrypt 异步加密，不阻塞事件循环
- 预订确认仅管理员可操作，普通用户只能取消自己的预订
- 修改预订日期时自动检查冲突

## API 接口

### 认证
- `POST /api/auth/register` — 注册
- `POST /api/auth/login` — 登录
- `GET /api/auth/me` — 获取当前用户

### 房间
- `GET /api/rooms` — 房间列表（支持 type/minPrice/maxPrice 筛选）
- `GET /api/rooms/:id` — 房间详情
- `POST /api/rooms` — 创建房间（管理员）
- `PUT /api/rooms/:id` — 更新房间（管理员）
- `DELETE /api/rooms/:id` — 删除房间（管理员）

### 预订
- `GET /api/bookings` — 所有预订（管理员）
- `GET /api/bookings/my` — 我的预订
- `POST /api/bookings` — 创建预订
- `PUT /api/bookings/:id` — 更新预订（管理员可确认/修改日期，用户仅可取消）
- `DELETE /api/bookings/:id` — 删除预订（管理员）

### 用户管理
- `GET /api/users` — 用户列表（管理员）
- `PUT /api/users/:id` — 更新用户（管理员）
- `DELETE /api/users/:id` — 删除用户（管理员）

### 统计
- `GET /api/stats` — 仪表盘数据（管理员）
