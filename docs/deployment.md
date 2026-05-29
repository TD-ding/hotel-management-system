# 部署文档

## 前置条件

| 依赖 | 最低版本 | 说明 |
|------|----------|------|
| Node.js | 20 | 推荐 LTS 版本 |
| npm | 9+ | 随 Node.js 安装 |
| Docker（可选） | 20+ | 容器化部署 |
| Docker Compose（可选） | v2+ | 编排多容器 |

## 本地开发

### 1. 安装依赖

```bash
# 在项目根目录执行，同时安装前后端依赖
npm run setup
```

等价于：

```bash
cd server && npm install && cd ../client && npm install
```

### 2. 配置环境变量

```bash
cp .env.example .env
```

编辑 `.env`：

| 变量 | 必填 | 默认值 | 说明 |
|------|------|--------|------|
| `JWT_SECRET` | **是** | — | JWT 签名密钥，生产环境务必使用强随机字符串 |
| `CLIENT_ORIGIN` | 否 | `http://localhost:5173` | 前端地址，CORS 白名单 |
| `PORT` | 否 | `3001` | 后端监听端口 |

> 未设置 `JWT_SECRET` 时后端拒绝启动并退出。

### 3. 初始化数据库

```bash
npm run seed
```

创建 SQLite 数据库文件 `server/hotel.db` 并插入演示数据（2 个用户 + 6 个房间 + 示例预订/评价）。

演示账号：

| 角色 | 用户名 | 密码 |
|------|--------|------|
| 管理员 | admin | admin123 |
| 用户 | demo | user123 |

### 4. 启动开发服务器

```bash
npm run dev
```

使用 `concurrently` 同时启动前后端：

| 服务 | 地址 | 说明 |
|------|------|------|
| 前端 | http://localhost:5173 | Vite 开发服务器，HMR |
| 后端 | http://localhost:3001 | Express API |

前端通过 Vite proxy 将 `/api` 请求转发到后端（`vite.config.js` 中配置）。

### 5. 单独启动

```bash
# 仅后端（支持 --watch 热重启）
npm run dev:server

# 仅前端
npm run dev:client

# 后端生产模式
npm start
```

## 生产构建

### 手动构建

```bash
# 构建前端（输出到 client/dist/）
npm run build

# 启动后端
cd server && node src/index.js
```

生产环境需要配置反向代理（Nginx 等）：

- `/` → 前端静态文件（`client/dist/`）
- `/api` → 后端（默认 `localhost:3001`）
- `/uploads` → 后端静态文件或直接映射 `server/uploads/`

### Nginx 配置示例

```nginx
server {
    listen 80;
    server_name example.com;

    # 前端静态文件
    location / {
        root /var/www/hotel/client/dist;
        try_files $uri $uri/ /index.html;
    }

    # API 反向代理
    location /api/ {
        proxy_pass http://127.0.0.1:3001;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
    }

    # 上传文件
    location /uploads/ {
        proxy_pass http://127.0.0.1:3001;
    }
}
```

## Docker 部署

### 构建

```bash
# 构建后端镜像
docker build -f server.Dockerfile -t hotel-server ./server

# 构建前端镜像
docker build -f client.Dockerfile -t hotel-client ./client
```

两个镜像均采用多阶段构建：

| 阶段 | 基础镜像 | 说明 |
|------|----------|------|
| build | `node:20-alpine` | 安装依赖 + 构建 |
| runtime | `node:20-alpine` | 仅复制产物，非 root 用户运行 |

安全特性：
- 运行时使用 `appuser`（非 root）
- `HEALTHCHECK` 指令定期检测服务可用性

### Docker Compose

```bash
# 设置环境变量
export JWT_SECRET=your-strong-secret

# 启动
docker compose up -d

# 查看日志
docker compose logs -f

# 停止
docker compose down
```

`docker-compose.yml` 配置：

| 服务 | 端口 | 依赖 | 存储 |
|------|------|------|------|
| server | 3001:3001 | — | `uploads` volume（持久化上传文件） |
| client | 5173:5173 | server (healthy) | — |

环境变量通过 `docker compose` 传入：

```yaml
environment:
  - JWT_SECRET=${JWT_SECRET}
  - CLIENT_ORIGIN=${CLIENT_ORIGIN:-http://localhost:5173}
  - PORT=3001
```

## CI/CD

### CI — Pull Request 检查

文件：`.github/workflows/ci.yml`

触发条件：向 `main` 分支提交 PR

| 步骤 | 命令 | 说明 |
|------|------|------|
| Install | `npm install` (root + server + client) | 安装依赖 |
| Lint | `npm run lint` | ESLint 检查 |
| Test | `npm run test` | Jest 后端测试（需设置 `JWT_SECRET`） |
| Build | `npm run build` | 前端生产构建 |

### CD — Docker 构建验证

文件：`.github/workflows/cd.yml`

触发条件：推送到 `main` 分支

| 步骤 | 说明 |
|------|------|
| Build server image | `docker build -f server.Dockerfile` |
| Build client image | `docker build -f client.Dockerfile` |

## 测试

### 后端测试

```bash
# 运行全部测试（7 套件，55 测试用例）
cd server && npm test

# 或从根目录
npm run test
```

测试框架：Jest + Supertest

| 测试文件 | 覆盖模块 |
|----------|----------|
| auth.test.js | 注册、登录、获取当前用户 |
| rooms.test.js | 房间列表、详情、创建、删除 |
| bookings.test.js | 创建预订、权限控制、状态变更、删除 |
| reviews.test.js | 评价列表、提交评价、重复评价、权限 |
| notifications.test.js | 通知列表、未读数、标记已读、发送通知 |
| users.test.js | 用户列表、更新资料、改密码、删除 |
| export.test.js | CSV 导出、统计接口、上传接口 |

每个测试文件使用独立的内存 SQLite 数据库（通过 `jest.mock` 替换 `../db`），测试间互不干扰。

### 完整验证

```bash
# Lint + Build + Test
npm run test:all
```

## 常见问题

### JWT_SECRET 未设置

后端启动失败，日志输出 `FATAL: JWT_SECRET environment variable is not set`。设置 `.env` 中的 `JWT_SECRET` 后重启。

### 端口被占用

后端自动尝试 `PORT + 1`，若 3001 被占则监听 3002。需要同步修改 Vite proxy 配置。

### 数据库锁定

SQLite 使用 WAL 模式减少锁冲突。如遇锁定，确认没有多个进程同时写入同一 `hotel.db` 文件。

### 上传目录权限

Docker 环境中 `uploads` 目录使用 named volume 持久化。手动部署时确保 `server/uploads/` 目录对运行用户可写。
