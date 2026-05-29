# Hotel Management System Implementation Plan

**Goal:** Build a full-stack hotel management system with public-facing site, admin panel, and REST API.

**Architecture:** Monorepo with three packages — `server` (Express+SQLite), `client` (React public site + admin panel via route separation). Frontend communicates with backend via REST+JWT auth.

**Tech Stack:** React 18, React Router v6, Axios, Node.js, Express, jsonwebtoken, better-sqlite3, bcryptjs

---

## File Structure

```
hotel-management-system/
├── server/
│   ├── package.json
│   ├── src/
│   │   ├── index.js              # Express entry, middleware, routes mount
│   │   ├── db.js                 # SQLite init + schema
│   │   ├── middleware.js         # JWT auth middleware, admin guard
│   │   ├── routes/
│   │   │   ├── auth.js           # POST /register, POST /login
│   │   │   ├── rooms.js          # GET/POST/PUT/DELETE /rooms
│   │   │   ├── bookings.js       # GET/POST/PUT/DELETE /bookings
│   │   │   ├── users.js          # GET/PUT/DELETE /users (admin)
│   │   │   └── stats.js          # GET /stats (admin dashboard)
│   │   └── seed.js               # Demo data seeder
├── client/
│   ├── package.json
│   ├── public/index.html
│   ├── src/
│   │   ├── index.js              # React entry
│   │   ├── App.js                # Router setup
│   │   ├── api.js                # Axios instance with interceptors
│   │   ├── components/
│   │   │   ├── Navbar.js
│   │   │   ├── PrivateRoute.js
│   │   │   └── AdminRoute.js
│   │   ├── pages/
│   │   │   ├── Home.js           # Landing + featured rooms
│   │   │   ├── Rooms.js          # Room listing with filters
│   │   │   ├── RoomDetail.js     # Single room + booking form
│   │   │   ├── Booking.js        # Booking confirmation
│   │   │   ├── Login.js
│   │   │   ├── Register.js
│   │   │   └── Profile.js        # User bookings history
│   │   └── admin/
│   │       ├── Dashboard.js      # Stats overview
│   │       ├── AdminRooms.js      # Room CRUD
│   │       ├── AdminBookings.js   # Booking management
│   │       ├── AdminUsers.js      # User management
│   │       └── AdminLogin.js
│   └── vite.config.js            # Vite config with proxy
├── package.json                   # Root scripts (dev, build)
└── README.md
```

## Tasks

### Task 1: Backend — Project setup, DB schema, seed data
- Init server package, install deps, create SQLite schema (users, rooms, bookings tables), seed demo data

### Task 2: Backend — Auth routes
- POST /api/auth/register, POST /api/auth/login with JWT + bcrypt

### Task 3: Backend — Room routes
- Public GET list/detail, admin CRUD with image/type/price/availability

### Task 4: Backend — Booking routes
- User creates bookings, admin sees all, status updates

### Task 5: Backend — User admin routes + Stats route
- Admin user list/update/delete, dashboard stats aggregation

### Task 6: Frontend — Project setup, routing, API layer
- Vite + React, React Router with public/admin layout, Axios instance

### Task 7: Frontend — Auth pages (Login, Register)
- Forms with validation, JWT storage, auth context

### Task 8: Frontend — Public pages (Home, Rooms, RoomDetail, Booking)
- Room browsing, detail view, booking form, confirmation

### Task 9: Frontend — Admin panel (Dashboard, Rooms, Bookings, Users)
- Admin login, CRUD tables, stats cards

### Task 10: Root scripts, README, final integration test
- Concurrent dev scripts, README with setup instructions, smoke test
