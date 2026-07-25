# LeadDesk Mini

A full-stack lead capture and management application built as a **Digital Heroes Training Task**. Allows visitors to submit project inquiries via a public form and provides administrators with a secure dashboard to view, search, and manage leads.

---

## Table of Contents

- [Tech Stack](#tech-stack)
- [Project Structure](#project-structure)
  - [Backend (`/backend`)](#backend-backend)
  - [Frontend (`/frontend`)](#frontend-frontend)
- [Key Features](#key-features)
- [How It Works (Data Flow)](#how-it-works-data-flow)
- [Setup & Running](#setup--running)
- [API Reference](#api-reference)
- [Environment Variables](#environment-variables)

---

## Tech Stack

| Layer       | Technology                                                        |
| ----------- | ----------------------------------------------------------------- |
| **Frontend** | React 19, React Router 7, Axios, Tailwind CSS 3, Vite 8          |
| **Backend**  | Node.js, Express 5, Mongoose 9, JWT, bcryptjs, Cookie Parser     |
| **Database** | MongoDB (via Mongoose ODM)                                        |
| **Auth**     | JWT stored in httpOnly cookies + Bearer token in localStorage     |

---

## Project Structure

```
leadcapture/
├── backend/                     # Express API server
│   ├── controller/
│   │   ├── authController.js    # Admin login, logout, get current user
│   │   └── userController.js    # Lead submission, CRUD, search
│   ├── db/
│   │   └── db.js                # MongoDB connection setup
│   ├── middleware/
│   │   └── authMw.js            # JWT verification + admin role check
│   ├── model/
│   │   └── userModel.js         # Mongoose schema (name, email, budget, etc.)
│   ├── routes/
│   │   ├── authRoutes.js        # POST /login, GET /me, POST /logout
│   │   └── userRoutes.js        # POST /submit, GET /admin, PATCH /admin/:id/status
│   ├── index.js                 # Express app entry point
│   ├── package.json
│   └── seed.js                  # (optional) seed script for admin user
│
├── frontend/                    # React SPA (Vite)
│   ├── src/
│   │   ├── api/
│   │   │   └── client.js        # Axios instance + all API call functions
│   │   ├── components/
│   │   │   ├── Footer.jsx       # Reusable footer with credit line
│   │   │   └── ProtectedRoute.jsx  # Route guard for admin pages
│   │   ├── context/
│   │   │   └── AuthContext.jsx   # Auth state, login/logout, session persistence
│   │   ├── pages/
│   │   │   ├── Landing.jsx      # Public lead capture form + success state
│   │   │   ├── AdminLogin.jsx   # Admin sign-in with password visibility toggle
│   │   │   └── AdminDashboard.jsx # Leads table with search, stats, status toggle
│   │   ├── App.jsx              # React Router setup (3 routes)
│   │   ├── main.jsx             # React DOM entry point
│   │   └── index.css            # Tailwind directives + global styles
│   ├── index.html               # HTML shell
│   ├── vite.config.js           # Vite config with API proxy to backend
│   ├── tailwind.config.js
│   ├── postcss.config.js
│   └── package.json
│
└── README.md                    # You are here
```

---

## Key Features

### Public Landing Page (`/`)
- **Lead capture form** with fields: Full Name, Email, Budget Range, Message
- **Client-side validation** with inline error messages
- **Budget range selector** with predefined brackets ($1k–$50k+)
- **Success state** with a green checkmark animation and "Submit Another" button
- **Server-side validation** mirrors client rules; duplicate email detection
- **Responsive design** with gradient background, sticky nav, and footer

### Admin Login (`/admin/login`)
- Secure sign-in form with email/password fields
- **Password visibility toggle** (eye icon)
- **Demo credentials** displayed in an info box
- JWT-based authentication with httpOnly cookies
- Redirects authenticated users to the dashboard automatically

### Admin Dashboard (`/admin`)
- **Protected route** — unauthenticated users are redirected to login
- **Stats bar** showing Total Leads, Contacted, and Closed counts
- **Search bar** with 300ms debounce — searches by name, email, message, or status
- **Leads table** with columns: Name, Email, Budget, Message, Status, Date, Action
- **Status toggle button** cycles through: New → Contacted → Closed → New
- **Responsive table** — columns hide on smaller screens
- **Loading spinner** and **empty state** placeholder
- **Error state** with retry button
- **Sign-out** button in the top nav bar

### Shared Footer
- Displays **"Built for Digital Heroes Training Task"** linked to [digitalheroesco.com](https://digitalheroesco.com)
- Consistent across all three pages (Landing, Admin Login, Admin Dashboard)

---

## How It Works (Data Flow)

```
User fills form → POST /api/user/submit → Mongoose validates + saves to MongoDB
                                                      ↓
                                            Admin logs in → POST /api/auth/login
                                                      ↓
                                            JWT cookie issued + stored in localStorage
                                                      ↓
                                            GET /api/user/admin (with JWT) → fetches all leads
                                                      ↓
                                            Admin searches → GET /api/user/admin/search?q=...
                                                      ↓
                                            Admin toggles status → PATCH /api/user/admin/:id/status
```

### Authentication Flow
1. Admin enters credentials → `POST /api/auth/login`
2. Server verifies email + password, checks `role === "admin"`
3. JWT is sent as an httpOnly cookie AND returned in the response body
4. Frontend stores the token in `localStorage` under `leaddesk_token`
5. On page reload, `AuthContext` checks for existing token and verifies it via `GET /api/auth/me`
6. All admin API routes are protected by the `protectAdmin` middleware
7. On 401 responses, the Axios interceptor clears local state and redirects to login

---

## Setup & Running

### Prerequisites
- Node.js 18+
- MongoDB (local or Atlas URI)

### 1. Clone & Install Dependencies

```bash
# Install backend dependencies
cd backend
npm install

# Install frontend dependencies
cd ../frontend
npm install
```

### 2. Configure Environment Variables

Create a `.env` file in the `backend/` directory:

```env
PORT=5000
DB_URL=mongodb+srv://<user>:<password>@cluster.mongodb.net/leaddesk?retryWrites=true&w=majority
JWT_SECRET=your-super-secret-key-change-in-production
JWT_EXPIRES_IN=7d
CLIENT_URL=http://localhost:5173
```

### 3. Seed an Admin User (Optional)

If a seed script exists:
```bash
cd backend
npm run seed
```

Or insert an admin user directly into MongoDB:
```js
db.users.insertOne({
  name: "Admin",
  email: "admin@gmail.com",
  password: "121",
  role: "admin"
})
```

### 4. Start the Application

```bash
# Terminal 1 — Backend (http://localhost:5000)
cd backend
npm run dev

# Terminal 2 — Frontend (http://localhost:5173)
cd frontend
npm run dev
```

### 5. Open in Browser
- **Landing page:** [http://localhost:5173](http://localhost:5173)
- **Admin login:** [http://localhost:5173/admin/login](http://localhost:5173/admin/login)
- **Admin dashboard:** [http://localhost:5173/admin](http://localhost:5173/admin)

---

## API Reference

### Public Endpoints

| Method | Endpoint              | Description                       |
| ------ | --------------------- | --------------------------------- |
| `GET`  | `/`                   | Health check (`"API is running"`) |
| `POST` | `/api/user/submit`    | Submit a new lead                 |

### Auth Endpoints

| Method | Endpoint           | Auth Required | Description            |
| ------ | ------------------ | ------------- | ---------------------- |
| `POST` | `/api/auth/login`  | No            | Admin login            |
| `GET`  | `/api/auth/me`     | Yes (admin)   | Get current admin user |
| `POST` | `/api/auth/logout` | Yes (admin)   | Logout (clear cookie)  |

### Admin Lead Endpoints

| Method  | Endpoint                        | Auth Required | Description                   |
| ------- | ------------------------------- | ------------- | ----------------------------- |
| `GET`   | `/api/user/admin`               | Yes (admin)   | Get all leads (sorted newest) |
| `GET`   | `/api/user/admin/search?q=...`  | Yes (admin)   | Search leads by query         |
| `GET`   | `/api/user/admin/:id`           | Yes (admin)   | Get a single lead by ID       |
| `PATCH` | `/api/user/admin/:id/status`    | Yes (admin)   | Update lead status            |

### Lead Submission Payload

```json
{
  "name": "John Doe",
  "email": "john@example.com",
  "budget": 10000,
  "message": "I'd like help building a SaaS platform."
}
```

---

## Environment Variables

| Variable         | Description                        | Default                    |
| ---------------- | ---------------------------------- | -------------------------- |
| `PORT`           | Backend server port                | `5000`                     |
| `DB_URL`         | MongoDB connection string          | *(required)*               |
| `JWT_SECRET`     | Secret key for signing JWT tokens  | *(required)*               |
| `JWT_EXPIRES_IN` | Token expiration duration          | `7d`                       |
| `CLIENT_URL`     | Frontend URL for CORS              | `http://localhost:5173`    |

---

## Built For

[Digital Heroes Training Task](https://digitalheroesco.com)
