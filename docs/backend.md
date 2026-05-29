# 后端 API 文档

## 基础信息

- 基础路径：`/api`
- 认证方式：`Authorization: Bearer <JWT>`
- Content-Type：`application/json`（上传除外）
- 端口：默认 3001

## 通用响应格式

**成功（列表）**

```json
{
  "data": [...],
  "total": 42,
  "page": 1,
  "limit": 20,
  "totalPages": 3
}
```

**成功（单条）**

```json
{ "id": 1, "name": "...", ... }
```

**错误**

```json
{ "error": "错误信息" }
```

| HTTP 状态码 | 含义 |
|-------------|------|
| 400 | 请求参数错误 |
| 401 | 未认证 / 令牌无效 |
| 403 | 无权限 |
| 404 | 资源不存在 |
| 409 | 冲突（重复用户名/邮箱/评价/日期冲突） |
| 429 | 请求过于频繁 |
| 500 | 服务器内部错误 |

## 中间件

| 中间件 | 说明 |
|--------|------|
| `auth` | 从 `Authorization` Header 提取 JWT，验证后挂载 `req.user`（`{ id, username, role }`） |
| `adminOnly` | 检查 `req.user.role === 'admin'`，否则 403 |
| `rateLimit({ windowMs, max })` | 基于 IP+路径 的内存限流，超限返回 429 |

---

## 认证 `/api/auth`

### POST /register

注册新用户，含限流（5 次/分钟）。

**请求**

| 字段 | 类型 | 必填 | 校验 |
|------|------|------|------|
| username | string | 是 | 不能与已有用户名/邮箱重复 |
| email | string | 是 | 不能与已有邮箱重复 |
| password | string | 是 | 长度 6-128 |

**成功 201**

```json
{
  "token": "eyJ...",
  "user": { "id": 3, "username": "new", "email": "new@test.com", "role": "user" }
}
```

**错误**

| 状态码 | error |
|--------|-------|
| 400 | 请填写所有必填字段 / 密码长度至少6位 / 密码长度不能超过128位 |
| 409 | 用户名或邮箱已存在 |
| 500 | 注册失败，请稍后再试 |

### POST /login

登录，含限流（10 次/分钟）。

**请求**

| 字段 | 类型 | 必填 |
|------|------|------|
| username | string | 是 |
| password | string | 是 |

**成功 200**

```json
{
  "token": "eyJ...",
  "user": { "id": 1, "username": "admin", "email": "admin@test.com", "role": "admin" }
}
```

**错误**

| 状态码 | error |
|--------|-------|
| 400 | 请输入用户名和密码 |
| 401 | 用户名或密码错误 |
| 500 | 登录失败，请稍后再试 |

### GET /me

获取当前用户信息，需认证。

**请求头**：`Authorization: Bearer <token>`

**成功 200**

```json
{ "id": 1, "username": "admin", "email": "admin@test.com", "role": "admin", "created_at": "2025-01-01 00:00:00" }
```

---

## 房间 `/api/rooms`

### GET /

房间列表，公开接口，含评分统计。

**查询参数**

| 参数 | 类型 | 必填 | 说明 |
|------|------|------|------|
| type | string | 否 | 房型：standard/deluxe/suite/presidential/family/business |
| minPrice | number | 否 | 最低价格 |
| maxPrice | number | 否 | 最高价格 |
| capacity | number | 否 | 最小容纳人数 |
| available | 0\|1 | 否 | 是否可预订 |
| search | string | 否 | 按名称模糊搜索 |
| page | number | 否 | 页码，默认 1，最小 1 |
| limit | number | 否 | 每页条数，默认 50，范围 1-100 |

**成功 200**

```json
{
  "data": [
    { "id": 1, "name": "...", "type": "suite", "price": 800, "capacity": 4, "avgRating": 4.5, "reviewCount": 12, ... }
  ],
  "total": 15, "page": 1, "limit": 50, "totalPages": 1
}
```

### GET /:id

房间详情，公开接口。

**成功 200**

```json
{ "id": 1, "name": "...", "type": "suite", "price": 800, "avgRating": "4.5", "reviewCount": 12, ... }
```

**错误**：404 `房间不存在`

### GET /:id/booked-dates

获取房间某月已预订日期，公开接口。

**查询参数**

| 参数 | 类型 | 必填 | 说明 |
|------|------|------|------|
| month | number | 否 | 月份 1-12，默认当前月 |
| year | number | 否 | 年份，默认当前年 |

**成功 200**

```json
{ "bookedDates": ["2025-06-01", "2025-06-02"], "month": 6, "year": 2025 }
```

### POST /

创建房间，管理员。

**请求**

| 字段 | 类型 | 必填 | 说明 |
|------|------|------|------|
| name | string | 是 | — |
| type | string | 是 | — |
| price | number | 是 | — |
| capacity | number | 是 | — |
| description | string | 否 | 默认空 |
| image | string | 否 | 默认空 |
| amenities | string | 否 | 逗号分隔，默认空 |
| available | 0\|1 | 否 | 默认 1 |

**成功 201**：`{ "id": 10, "message": "房间创建成功" }`

**错误**：400 `请填写所有必填字段`

### PUT /:id

更新房间，管理员。未传字段保留原值。

**成功 200**：`{ "message": "房间更新成功" }`

**错误**：404 `房间不存在`

### DELETE /:id

删除房间，管理员。级联删除该房间的评价和预订。

**成功 200**：`{ "message": "房间删除成功" }`

**错误**：404 `房间不存在`

---

## 预订 `/api/bookings`

### GET /

所有预订列表，管理员。

**查询参数**

| 参数 | 类型 | 必填 | 说明 |
|------|------|------|------|
| status | string | 否 | pending/confirmed/checked_in/checked_out/cancelled |
| search | string | 否 | 搜索用户名或房间名 |
| page | number | 否 | 页码，默认 1 |
| limit | number | 否 | 每页条数，默认 20 |

**成功 200**

```json
{
  "data": [{ "id": 1, "username": "demo", "room_name": "豪华大床房", "check_in": "2025-06-01", ... }],
  "total": 10, "page": 1, "limit": 20, "totalPages": 1
}
```

### GET /my

我的预订，需认证。

**成功 200**：`[{ "id": 1, "room_name": "...", "room_image": "...", ... }]`

### POST /

创建预订，需认证。

**请求**

| 字段 | 类型 | 必填 | 说明 |
|------|------|------|------|
| room_id | number | 是 | — |
| check_in | string | 是 | YYYY-MM-DD |
| check_out | string | 是 | YYYY-MM-DD，必须晚于 check_in |
| guests | number | 否 | 默认 1 |

**成功 201**

```json
{ "id": 5, "total_price": 1600, "nights": 2, "message": "预订成功" }
```

**错误**

| 状态码 | error |
|--------|-------|
| 400 | 请填写所有必填字段 / 退房日期必须晚于入住日期 |
| 404 | 房间不存在或不可用 |
| 409 | 该日期房间已被预订 |

### PUT /:id

更新预订，需认证。

**权限规则**

| 操作 | 角色 |
|------|------|
| 确认 confirmed | 管理员 |
| 入住 checked_in | 管理员 |
| 退房 checked_out | 管理员 |
| 取消 cancelled | 预订本人 或 管理员 |

**请求**

| 字段 | 类型 | 必填 | 说明 |
|------|------|------|------|
| status | string | 否 | pending/confirmed/checked_in/checked_out/cancelled |
| check_in | string | 否 | 修改入住日期 |
| check_out | string | 否 | 修改退房日期 |
| guests | number | 否 | 修改人数 |

状态变更时自动推送站内通知给预订用户。

**成功 200**：`{ "message": "预订更新成功" }`

**错误**

| 状态码 | error |
|--------|-------|
| 400 | 无效的状态 / 退房日期必须晚于入住日期 |
| 403 | 只有管理员才能执行此操作 / 用户只能取消预订 / 无权操作此预订 |
| 404 | 预订不存在 |
| 409 | 修改后的日期与已有预订冲突 |

### DELETE /:id

删除预订，管理员。

**成功 200**：`{ "message": "预订删除成功" }`

---

## 评价 `/api/reviews`

### GET /room/:roomId

房间评价列表，公开接口。

**成功 200**

```json
{
  "reviews": [{ "id": 1, "username": "demo", "rating": 5, "comment": "很好", "created_at": "..." }],
  "average": "4.5",
  "count": 12
}
```

### POST /

提交评价，需认证。

**请求**

| 字段 | 类型 | 必填 | 说明 |
|------|------|------|------|
| room_id | number | 是 | — |
| rating | number | 是 | 1-5 |
| comment | string | 否 | — |

**校验规则**

- 必须有该房间的有效预订（未取消）
- 每用户每房间只能评价一次

**成功 201**：`{ "message": "评价成功" }`

**错误**

| 状态码 | error |
|--------|-------|
| 400 | 请填写房间ID和评分 / 评分范围1-5 |
| 403 | 只有预订过此房间的用户才能评价 |
| 409 | 您已评价过此房间 |

---

## 通知 `/api/notifications`

### GET /my

我的通知列表，需认证。

**成功 200**

```json
[{ "id": 1, "message": "您的预订已确认", "read": 0, "created_at": "..." }]
```

### GET /my/unread

未读通知数，需认证。

**成功 200**：`{ "count": 3 }`

### PUT /my/read

全部标记已读，需认证。

**成功 200**：`{ "message": "已全部标记为已读" }`

### POST /

发送通知，管理员。

**请求**

| 字段 | 类型 | 必填 |
|------|------|------|
| user_id | number | 是 |
| message | string | 是 |

**成功 201**：`{ "message": "通知发送成功" }`

**错误**：400 `请填写用户ID和消息内容`

---

## 用户管理 `/api/users`

### GET /

用户列表，管理员。

**查询参数**

| 参数 | 类型 | 必填 | 说明 |
|------|------|------|------|
| search | string | 否 | 搜索用户名或邮箱 |
| page | number | 否 | 页码，默认 1 |
| limit | number | 否 | 每页条数，默认 20 |

**成功 200**

```json
{
  "data": [{ "id": 1, "username": "admin", "email": "...", "role": "admin", "created_at": "..." }],
  "total": 10, "page": 1, "limit": 20, "totalPages": 1
}
```

### PUT /me

修改个人信息，需认证。

**请求**

| 字段 | 类型 | 必填 |
|------|------|------|
| username | string | 否 |
| email | string | 否 |

**成功 200**

```json
{ "message": "信息更新成功", "user": { "id": 2, "username": "demo_updated", "email": "...", "role": "user" } }
```

**错误**

| 状态码 | error |
|--------|-------|
| 404 | 用户不存在 |
| 409 | 用户名已存在 / 邮箱已存在 |

### PUT /me/password

修改密码，需认证。

**请求**

| 字段 | 类型 | 必填 | 校验 |
|------|------|------|------|
| old_password | string | 是 | 必须与当前密码匹配 |
| new_password | string | 是 | 最少 6 位 |

**成功 200**：`{ "message": "密码修改成功" }`

**错误**

| 状态码 | error |
|--------|-------|
| 400 | 请填写旧密码和新密码 / 新密码至少6位 |
| 401 | 旧密码不正确 |

### PUT /:id

更新用户，管理员。

**请求**

| 字段 | 类型 | 必填 |
|------|------|------|
| username | string | 否 |
| email | string | 否 |
| role | string | 否 |

**成功 200**：`{ "message": "用户更新成功" }`

**错误**：404 `用户不存在`

### DELETE /:id

删除用户，管理员。级联删除通知、评价、预订。无法删除管理员账户。

**成功 200**：`{ "message": "用户删除成功" }`

**错误**

| 状态码 | error |
|--------|-------|
| 403 | 无法删除管理员账户 |
| 404 | 用户不存在 |

---

## 统计 `/api/stats`

### GET /

仪表盘数据，管理员。

**成功 200**

```json
{
  "totalUsers": 10,
  "totalRooms": 8,
  "availableRooms": 6,
  "totalBookings": 25,
  "pendingBookings": 3,
  "confirmedBookings": 10,
  "checkedInBookings": 5,
  "checkedOutBookings": 4,
  "cancelledBookings": 3,
  "totalRevenue": 58000,
  "revenueByType": [
    { "type": "suite", "revenue": 24000, "count": 6 }
  ],
  "recentBookings": [
    { "id": 1, "username": "demo", "room_name": "...", "check_in": "...", "check_out": "...", "total_price": 800, "status": "confirmed" }
  ]
}
```

---

## 数据导出 `/api/export`

CSV 导出，管理员。支持通过 query param `token` 传递 JWT（兼容浏览器直接下载）。

### GET /bookings

**查询参数**：`status`、`search`（可选），`token`（必填）

**响应**：`text/csv; charset=utf-8`，UTF-8 BOM，`Content-Disposition: attachment; filename=bookings.csv`

### GET /users

**查询参数**：`token`（必填）

**响应**：同上，`filename=users.csv`

### GET /rooms

**查询参数**：`token`（必填）

**响应**：同上，`filename=rooms.csv`

---

## 文件上传 `/api/upload`

### POST /

上传图片，管理员。`multipart/form-data`。

| 字段 | 类型 | 说明 |
|------|------|------|
| image | file | 仅 jpg/png/gif/webp，最大 5MB |

**成功 200**：`{ "url": "/uploads/abc123.jpg" }`

**错误**

| 状态码 | error |
|--------|-------|
| 400 | 请选择图片 / 只允许上传图片文件 |
| 413 | 超过 5MB（multer 自动拒绝） |

---

## 数据模型

### users

| 列 | 类型 | 约束 | 说明 |
|----|------|------|------|
| id | INTEGER | PK, AUTO | — |
| username | TEXT | NOT NULL, UNIQUE | 用户名 |
| email | TEXT | NOT NULL, UNIQUE | 邮箱 |
| password | TEXT | NOT NULL | bcrypt 哈希 |
| role | TEXT | NOT NULL, DEFAULT 'user' | user / admin |
| created_at | TEXT | DEFAULT datetime('now') | — |

### rooms

| 列 | 类型 | 约束 | 说明 |
|----|------|------|------|
| id | INTEGER | PK, AUTO | — |
| name | TEXT | NOT NULL | 房间名称 |
| type | TEXT | NOT NULL | 房型 |
| price | REAL | NOT NULL | 每晚价格 |
| capacity | INTEGER | NOT NULL | 容纳人数 |
| description | TEXT | — | 描述 |
| image | TEXT | — | 图片路径 |
| amenities | TEXT | — | 设施（逗号分隔） |
| available | INTEGER | DEFAULT 1 | 0=不可订, 1=可订 |
| created_at | TEXT | DEFAULT datetime('now') | — |

### bookings

| 列 | 类型 | 约束 | 说明 |
|----|------|------|------|
| id | INTEGER | PK, AUTO | — |
| user_id | INTEGER | NOT NULL, FK→users.id | — |
| room_id | INTEGER | NOT NULL, FK→rooms.id | — |
| check_in | TEXT | NOT NULL | 入住日期 |
| check_out | TEXT | NOT NULL | 退房日期 |
| guests | INTEGER | NOT NULL, DEFAULT 1 | 入住人数 |
| total_price | REAL | NOT NULL | 总价 |
| status | TEXT | NOT NULL, DEFAULT 'pending' | pending/confirmed/checked_in/checked_out/cancelled |
| created_at | TEXT | DEFAULT datetime('now') | — |

### reviews

| 列 | 类型 | 约束 | 说明 |
|----|------|------|------|
| id | INTEGER | PK, AUTO | — |
| room_id | INTEGER | NOT NULL, FK→rooms.id | — |
| user_id | INTEGER | NOT NULL, FK→users.id | — |
| rating | INTEGER | NOT NULL, CHECK 1-5 | 评分 |
| comment | TEXT | — | 评语 |
| created_at | TEXT | DEFAULT datetime('now') | — |

### notifications

| 列 | 类型 | 约束 | 说明 |
|----|------|------|------|
| id | INTEGER | PK, AUTO | — |
| user_id | INTEGER | NOT NULL, FK→users.id | — |
| message | TEXT | NOT NULL | 消息内容 |
| read | INTEGER | DEFAULT 0 | 0=未读, 1=已读 |
| created_at | TEXT | DEFAULT datetime('now') | — |

### 关系

```
users 1──N bookings
users 1──N reviews
users 1──N notifications
rooms 1──N bookings
rooms 1──N reviews
```

SQLite 启用 `PRAGMA foreign_keys = ON` 和 `PRAGMA journal_mode = WAL`。
