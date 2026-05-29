# 云顶大酒店 - 酒店管理系统

全栈酒店管理系统，包含用户端、管理端和 RESTful API。

## 功能

### 用户端
- 浏览客房列表（支持筛选房型、价格区间，分页浏览）
- 查看房间详情及设施
- 预订日历：可视化查看房间可订/已订日期
- 在线预订房间（实时计算总晚数和总价）
- 房间评价打分（1-5星 + 评语，每用户每房间限一次）
- 用户注册/登录（JWT 认证，登录后跳回之前页面）
- 个人中心：查看预订历史、修改个人信息、修改密码
- 站内消息通知（预订状态变更自动推送，30秒轮询未读数）
- 移动端适配，折叠导航菜单

### 管理端
- 管理员登录
- 仪表盘数据统计（用户数、预订数、收入等，含入住/退房统计）
- 房间增删改查（支持图片上传、搜索、分页）
- 预订管理（确认/入住/退房/取消/删除，支持搜索分页和CSV导出）
- 用户管理（编辑/删除/角色分配，支持搜索分页和CSV导出）
- 数据导出：预订、用户、房间CSV导出（UTF-8 BOM 兼容 Excel）
- 表格横向滚动适配移动端

## 技术栈

- **前端**: React 18 + React Router v6 + Axios + Vite
- **后端**: Node.js + Express + JWT + SQLite (better-sqlite3)
- **认证**: bcryptjs 异步加密 + JWT Token
- **文件上传**: Multer（5MB 限制）
- **数据导出**: CSV 流式输出（UTF-8 BOM）

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
│   ├── uploads/            # 上传图片目录
│   ├── src/
│   │   ├── index.js        # Express 入口（含 multer 上传）
│   │   ├── db.js           # SQLite 数据库（5表：users/rooms/bookings/reviews/notifications）
│   │   ├── middleware.js    # JWT 认证中间件 + 限流
│   │   ├── seed.js         # 演示数据
│   │   └── routes/         # API 路由
│   │       ├── auth.js     # 认证（注册/登录，含限流）
│   │       ├── rooms.js    # 房间 CRUD（含搜索分页、评分统计）
│   │       ├── bookings.js # 预订管理（权限控制、入住/退房状态、通知推送）
│   │       ├── users.js    # 用户管理（含搜索分页、个人信息修改、密码修改）
│   │       ├── stats.js    # 统计数据
│   │       ├── notifications.js # 通知（日历已订日期、站内消息）
│   │       ├── reviews.js  # 房间评价（评分+评语，一人一间限一次）
│   │       └── export.js   # CSV 数据导出
├── client/                 # 前端
│   ├── src/
│   │   ├── pages/          # 用户页面（Home, Rooms, RoomDetail, Login, Register, Profile, Notifications, NotFound）
│   │   ├── admin/          # 管理页面（Dashboard, AdminRooms, AdminBookings, AdminUsers, AdminLogin）
│   │   ├── components/     # 公共组件（Navbar, Toast, Loading, Pagination, PrivateRoute, AdminRoute）
│   │   ├── constants.js    # 类型/状态标签等公共常量
│   │   ├── theme.js        # 主题色和布局常量
│   │   ├── utils.js        # 日期格式化、晚数计算等工具函数
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
- 预订确认/入住/退房仅管理员可操作，普通用户只能取消自己的预订
- 修改预订日期时自动检查冲突
- 图片上传限制 5MB

## 用户体验

- 移动端响应式适配（折叠导航、表格滚动、卡片布局）
- 预订时实时显示总晚数和总价
- 预订日历：直观展示房间已订/可订日期
- Toast 弹窗通知（操作成功/失败）
- 加载中动画提示
- 登录后跳回之前的页面
- 日期格式化显示
- 房间图片渲染（有图片时显示，无图片时渐变色占位）
- 管理员上传房间图片
- 房间评分星级展示
- 通知未读数徽章

## API 接口

### 认证
- `POST /api/auth/register` — 注册
- `POST /api/auth/login` — 登录
- `GET /api/auth/me` — 获取当前用户

### 房间
- `GET /api/rooms` — 房间列表（支持 type/minPrice/maxPrice/search/page/limit 筛选分页，含评分统计）
- `GET /api/rooms/:id` — 房间详情（含评分统计）
- `POST /api/rooms` — 创建房间（管理员）
- `PUT /api/rooms/:id` — 更新房间（管理员）
- `DELETE /api/rooms/:id` — 删除房间（管理员）

### 预订
- `GET /api/bookings` — 所有预订（管理员，支持 status/search/page/limit 搜索分页）
- `GET /api/bookings/my` — 我的预订
- `POST /api/bookings` — 创建预订
- `PUT /api/bookings/:id` — 更新预订（管理员可确认/入住/退房/修改日期，用户仅可取消）
- `DELETE /api/bookings/:id` — 删除预订（管理员）

### 通知
- `GET /api/notifications/room/:roomId` — 房间已订日期日历
- `GET /api/notifications/my` — 我的通知列表
- `GET /api/notifications/my/unread` — 未读通知数
- `PUT /api/notifications/my/read` — 全部标记已读
- `POST /api/notifications` — 发送通知（管理员）

### 评价
- `GET /api/reviews/room/:roomId` — 房间评价列表（含平均评分）
- `POST /api/reviews` — 提交评价（需登录，每人每房间限一次）

### 用户管理
- `GET /api/users` — 用户列表（管理员，支持 search/page/limit 搜索分页）
- `PUT /api/users/me` — 修改个人信息
- `PUT /api/users/me/password` — 修改密码
- `PUT /api/users/:id` — 更新用户（管理员）
- `DELETE /api/users/:id` — 删除用户（管理员）

### 统计
- `GET /api/stats` — 仪表盘数据（管理员）

### 数据导出
- `GET /api/export/bookings` — 导出预订CSV（管理员）
- `GET /api/export/users` — 导出用户CSV（管理员）
- `GET /api/export/rooms` — 导出房间CSV（管理员）

### 文件上传
- `POST /api/upload` — 上传图片（管理员，multer，5MB限制）
