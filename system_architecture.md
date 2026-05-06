# Cấu trúc hệ thống RealtimeChat

## Tech Stack

| Layer | Công nghệ |
|---|---|
| **Frontend** | React + Vite + TypeScript |
| **State Management** | Zustand |
| **HTTP Client** | Axios |
| **UI Components** | shadcn/ui + Tailwind CSS |
| **Backend** | Node.js + Express.js |
| **Database** | MongoDB + Mongoose |
| **Auth** | JWT (access token) + Crypto (refresh token) |
| **Notifications** | Sonner (toast) |

---

## BACKEND — `/backend/src`

```
src/
├── server.js              ← Entry point: khởi tạo Express, CORS, middleware, routes
├── libs/
│   └── db.js              ← Kết nối MongoDB
├── models/
│   ├── User.js            ← Schema User (userName, email, password, displayName, avatar...)
│   └── Session.js         ← Schema Session (lưu refreshToken, tự xóa khi hết hạn qua TTL index)
├── controllers/
│   ├── authController.js  ← signUp / signIn / signOut
│   └── userController.js  ← authMe (trả thông tin user hiện tại)
├── middlewares/
│   └── authMiddleware.js  ← Xác thực JWT từ header Authorization: Bearer <token>
└── routes/
    ├── authRoute.js       ← POST /api/auth/signup, /signin, /signout  (public)
    └── userRoute.js       ← GET  /api/user/me                         (protected)
```

### Luồng request backend

```
Incoming Request
    → express.json()       (parse body)
    → cookieParser()       (parse cookies)
    → cors()               (cho phép frontend gọi)
    → /api/auth/*          (public — không cần token)
    → authMiddleware       (verify JWT)
    → /api/user/*          (private — cần Bearer token)
```

### Cơ chế Auth (Dual Token)

| Token | Loại | TTL | Nơi lưu |
|---|---|---|---|
| Access Token | JWT (signed) | 30 phút | Response body → RAM (Zustand) |
| Refresh Token | Random hex | 14 ngày | HttpOnly Cookie |

---

## FRONTEND — `/frontend/src`

```
src/
├── main.tsx               ← React entry point
├── App.tsx                ← Router chính (BrowserRouter + Routes)
│
├── pages/
│   ├── SignInPage.tsx     ← Trang đăng nhập
│   ├── SignUpPage.tsx     ← Trang đăng ký
│   └── ChatAppPage.tsx   ← Trang chat chính (protected)
│
├── components/
│   ├── auth/
│   │   ├── protectedRoute.tsx  ← Guard: redirect về /signin nếu không có accessToken
│   │   ├── signin-form.tsx     ← Form đăng nhập
│   │   ├── signup-form.tsx     ← Form đăng ký
│   │   └── signout.tsx         ← Nút đăng xuất
│   └── ui/                     ← shadcn/ui components (button, card, input, label...)
│
├── stores/
│   └── useAuthStore.ts    ← Zustand store: lưu accessToken + user, xử lý signIn/signOut/fetchMe
│
├── service/
│   └── authService.ts     ← Wrapper gọi API backend (signUp/signIn/signOut/fetchMe)
│
├── lib/
│   ├── axios.ts           ← Axios instance + interceptor tự động gắn Bearer token
│   └── utils.ts
│
└── types/
    ├── stores.ts          ← Interface AuthState (định nghĩa shape của Zustand store)
    └── user.ts            ← Interface User
```

---

## Sơ đồ luồng đăng nhập

```
[User nhập username/password]
        ↓
[signin-form.tsx] → useAuthStore.signIn()
        ↓
[authService.signIn()] → POST /api/auth/signin
        ↓
[Backend] xác thực → tạo accessToken (JWT) + refreshToken (hex)
        ↓
Response: { accessToken }  +  Set-Cookie: refreshToken (HttpOnly)
        ↓
[useAuthStore] → set({ accessToken }) → gọi fetchMe()
        ↓
[authService.fetchMe()] → GET /api/user/me
  axios interceptor tự gắn: Authorization: Bearer <accessToken>
        ↓
[authMiddleware] verify JWT → req.user = User từ DB
        ↓
[userController.authMe()] → res.json({ user })
        ↓
[useAuthStore] → set({ user }) → điều hướng vào ChatAppPage
```

---

## Sơ đồ bảo vệ route

```
URL: /  (ChatAppPage)
        ↓
[ProtectedRoute]
    accessToken có trong store?
        ├── CÓ  → render <Outlet /> → ChatAppPage hiển thị
        └── KHÔNG → <Navigate to="/signin" />
```

---

## Những gì chưa được implement

- **Refresh token flow**: Khi access token hết hạn (30 phút), chưa có cơ chế tự động dùng refresh token để lấy token mới → user sẽ bị đăng xuất sau 30 phút.
- **Persist login**: Khi refresh trang, Zustand bị reset → mất accessToken → bị đẩy về /signin (cần implement endpoint `/api/auth/refresh`).
- **Chat functionality**: ChatAppPage chưa có nội dung (phần core của ứng dụng).
- **Socket.io**: Chưa thấy tích hợp WebSocket cho realtime messaging.
