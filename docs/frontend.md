# 前端架构文档

## 技术栈

| 依赖 | 版本 | 用途 |
|------|------|------|
| React | 18 | UI 框架 |
| React Router | v6 | 客户端路由 |
| Axios | ^1 | HTTP 请求 |
| Vite | ^5 | 构建工具 & 开发服务器 |

## 目录结构

```
client/src/
├── main.jsx              # 入口：挂载 <App /> 到 DOM
├── App.jsx               # 顶层路由配置 + Navbar
├── api.js                # Axios 实例（baseURL /api，自动附带 JWT）
├── auth.jsx              # AuthContext + useAuth（登录/注册/登出/更新用户）
├── theme.js              # 颜色 + 布局常量
├── constants.js          # 房型/状态标签、Badge 样式
├── utils.js              # formatDate、calcNights
├── components/
│   ├── Navbar.jsx        # 全局导航栏（含未读通知轮询）
│   ├── PrivateRoute.jsx  # 登录守卫 → 未登录跳 /login
│   ├── AdminRoute.jsx    # 管理员守卫 → 未登录跳 /admin/login，非管理员跳 /
│   ├── Loading.jsx       # 加载中动画
│   ├── Pagination.jsx    # 通用分页组件
│   └── Toast.jsx         # Toast 通知 Provider + useToast
├── pages/
│   ├── Home.jsx          # 首页
│   ├── Rooms.jsx         # 客房列表
│   ├── RoomDetail.jsx    # 房间详情 + 预订 + 日历 + 评价
│   ├── Login.jsx         # 用户登录
│   ├── Register.jsx      # 用户注册
│   ├── Profile.jsx       # 个人中心
│   ├── Notifications.jsx # 消息通知
│   └── NotFound.jsx      # 404 页面
└── admin/
    ├── AdminLogin.jsx    # 管理员登录
    ├── Dashboard.jsx     # 仪表盘
    ├── AdminRooms.jsx    # 房间管理
    ├── AdminBookings.jsx # 预订管理
    └── AdminUsers.jsx    # 用户管理
```

## 路由表

| 路径 | 组件 | 守卫 | 说明 |
|------|------|------|------|
| `/` | Home | 无 | 首页 |
| `/rooms` | Rooms | 无 | 客房列表 |
| `/rooms/:id` | RoomDetail | 无 | 房间详情 |
| `/login` | Login | 无 | 用户登录 |
| `/register` | Register | 无 | 用户注册 |
| `/profile` | Profile | PrivateRoute | 个人中心 |
| `/notifications` | Notifications | PrivateRoute | 消息通知 |
| `/admin/login` | AdminLogin | 无 | 管理员登录 |
| `/admin` | Dashboard | AdminRoute | 仪表盘 |
| `/admin/rooms` | AdminRooms | AdminRoute | 房间管理 |
| `/admin/bookings` | AdminBookings | AdminRoute | 预订管理 |
| `/admin/users` | AdminUsers | AdminRoute | 用户管理 |
| `*` | NotFound | 无 | 404 |

## 核心模块

### api.js — Axios 实例

- `baseURL`: `/api`（由 Vite proxy 转发到后端）
- 请求拦截器：从 `localStorage` 读取 `token`，附加到 `Authorization: Bearer <token>`
- 响应拦截器：401 时清除 `token`/`user`，跳转 `/login`（避免死循环，已登录页不再跳）

### auth.jsx — AuthContext

| 方法 | 签名 | 说明 |
|------|------|------|
| `login` | `(username, password) → Promise<data>` | 调用 `/auth/login`，存 token+user |
| `register` | `(username, email, password) → Promise<data>` | 调用 `/auth/register`，存 token+user |
| `logout` | `() → void` | 清除 localStorage + state |
| `updateUser` | `(userData) → void` | 更新 localStorage + state |

状态持久化：`user` 从 `localStorage('user')` 初始化，`token` 存于 `localStorage('token')`。

### Toast.jsx — ToastProvider

```jsx
<ToastProvider>      {/* 包裹在 App 外层 */}
  {children}
  <ToastContainer /> {/* fixed 定位在右上角 */}
</ToastProvider>
```

| Hook/方法 | 说明 |
|-----------|------|
| `useToast()` | 返回 `{ show, success, error, info }` |
| `show(message, type)` | type: `'success'` \| `'error'` \| `'info'` |
| 自动 3 秒消失 | — |

### Pagination 组件

| Prop | 类型 | 说明 |
|------|------|------|
| `page` | number | 当前页 |
| `totalPages` | number | 总页数 |
| `onChange` | `(page) => void` | 翻页回调 |

显示当前页 ±2 页码，首尾页始终可见，中间省略号。

## 数据流

```
localStorage ←→ AuthContext ←→ useAuth()
                   ↓ user
             Navbar / PrivateRoute / AdminRoute
                   ↓
    Pages ←→ api.js ←→ Express API ←→ SQLite
                   ↓
              useState / useEffect
                   ↓
              Toast (操作反馈)
```

1. 页面通过 `useEffect` 调用 `api.get/post/put/delete` 获取数据
2. 数据存入 `useState`，渲染到组件
3. 用户操作（提交表单、点击按钮）触发 API 请求
4. 成功/失败通过 `toast.success()` / `toast.error()` 反馈
5. Auth 状态变化（登录/登出/更新信息）通过 `useAuth()` 全局共享

## 页面与 API 调用

| 页面 | API 调用 |
|------|----------|
| Home | `GET /rooms?available=1&limit=3` |
| Rooms | `GET /rooms?type=&minPrice=&maxPrice=&page=&limit=12&available=1` |
| RoomDetail | `GET /rooms/:id`, `GET /rooms/:id/booked-dates?month=&year=`, `GET /reviews/room/:id`, `POST /bookings`, `POST /reviews` |
| Login | `POST /auth/login`（via useAuth） |
| Register | `POST /auth/register`（via useAuth） |
| Profile | `GET /bookings/my`, `PUT /bookings/:id`, `PUT /users/me`, `PUT /users/me/password` |
| Notifications | `GET /notifications/my`, `PUT /notifications/my/read` |
| Dashboard | `GET /stats`, `GET /api/export/:type?token=`（CSV 下载） |
| AdminRooms | `GET /rooms?page=&limit=10&search=`, `POST /rooms`, `PUT /rooms/:id`, `DELETE /rooms/:id`, `POST /upload` |
| AdminBookings | `GET /bookings?page=&limit=15&status=&search=`, `PUT /bookings/:id`, `DELETE /bookings/:id` |
| AdminUsers | `GET /users?page=&limit=15&search=`, `PUT /users/:id`, `DELETE /users/:id` |

## 事件与交互

| 交互 | 触发 | 行为 |
|------|------|------|
| 登录成功 | Login/AdminLogin | 管理员跳 `/admin`，用户跳 `location.state.from` 或 `/profile` |
| 预订成功 | RoomDetail | Toast 提示，跳转 `/profile` |
| 取消预订 | Profile | 更新本地 state，Toast 提示 |
| 评价成功 | RoomDetail | 刷新评价列表 + 房间评分 |
| 全部已读 | Notifications | 批量更新 state |
| 图片上传 | AdminRooms | FormData → `/upload`，返回 URL 填入表单 |
| CSV 导出 | Dashboard/AdminBookings/AdminUsers | `window.open` 新窗口，URL 带 `token` query param |
| 导航栏未读 | Navbar | 每 30 秒轮询 `/notifications/my/unread`，显示徽章 |

## 安全

| 措施 | 说明 |
|------|------|
| JWT 持久化 | `localStorage('token')`，请求自动附带 |
| 登录守卫 | `PrivateRoute` — 未登录跳 `/login` |
| 管理员守卫 | `AdminRoute` — 非管理员跳 `/` |
| 401 自动登出 | Axios 响应拦截器捕获 401，清 token 跳登录页 |
| 注册前端校验 | 密码 ≥6 位，两次密码一致 |
| 管理员登录校验 | 后端返回角色，前端验证 `role === 'admin'` |
| CSV token 鉴权 | 导出 URL 通过 query param `token` 传递 JWT，避免 Header 方式无法触发浏览器下载 |
| 上传限制 | 仅管理员，仅 jpg/png/gif/webp，5MB |

## 响应式

- Navbar 汉堡菜单（768px 以下折叠）
- 表格 `.table-wrap` 横向滚动
- 房间卡片 `grid-template-columns: repeat(auto-fill, minmax(340px, 1fr))`
- 房间详情 `.detail-layout` 移动端单列（CSS media query）
