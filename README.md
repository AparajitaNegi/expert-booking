# ⚡ ExpertHub — Real-Time Expert Session Booking System

A full-stack expert booking platform with real-time slot updates, race condition prevention, and Socket.io integration.

---

## 🏗 Architecture

```
expert-booking/
├── backend/                 # Node.js + Express + MongoDB
│   ├── config/
│   │   └── db.js            # MongoDB connection
│   ├── controllers/
│   │   ├── expertController.js
│   │   └── bookingController.js
│   ├── middleware/
│   │   └── errorHandler.js
│   ├── models/
│   │   ├── Expert.js
│   │   └── Booking.js
│   ├── routes/
│   │   ├── expertRoutes.js
│   │   └── bookingRoutes.js
│   ├── server.js            # Express + Socket.io server
│   ├── seed.js              # Database seeder (8 experts)
│   └── .env
└── frontend/                # React (web)
    └── src/
        ├── context/
        │   ├── AppContext.js    # Navigation & toast state
        │   └── SocketContext.js # Socket.io client
        ├── pages/
        │   ├── ExpertListPage.js
        │   ├── ExpertDetailPage.js
        │   ├── BookingPage.js
        │   └── MyBookingsPage.js
        └── utils/
            └── api.js           # Axios API client
```

---

## 🚀 Quick Start (Manual)

### Prerequisites
- Node.js 18+
- MongoDB 6+ (running locally or via Atlas)

### 1. Backend Setup
```bash
cd backend
npm install
# Edit .env: set your MONGODB_URI
npm run seed      # Seeds 8 experts with 14-day availability
npm run dev       # Starts on :5000
```

### 2. Frontend Setup
```bash
cd frontend
npm install
npm start         # Starts on :3000
```

### Docker (All-in-one)
```bash
docker-compose up --build
# Backend: http://localhost:5000
# Frontend: http://localhost:3000
# After containers start:
docker exec expert-booking-backend node seed.js
```

---

## 📡 REST API Reference

### Experts

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/experts` | List experts (pagination + search + filter) |
| GET | `/api/experts/:id` | Expert detail with availability |

**Query params for GET /api/experts:**
- `page` (default: 1)
- `limit` (default: 6)
- `search` (name/bio/skills regex)
- `category` (Technology, Business, Design, Marketing, Finance, Health, Legal, Education)

### Bookings

| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | `/api/bookings` | Create booking (race-condition safe) |
| PATCH | `/api/bookings/:id/status` | Update status |
| GET | `/api/bookings?email=` | Bookings by email |

---

## 🔒 Double Booking Prevention

Two-layer protection:

**Layer 1 — Atomic MongoDB findOneAndUpdate:**
Uses `arrayFilters` to atomically find and mark a slot as booked only if `isBooked: false`. If another request beats it, the update returns null → 409 Conflict.

**Layer 2 — MongoDB Unique Partial Index:**
```js
{ expert, date, timeSlot } unique where status in ['Pending', 'Confirmed']
```
Acts as a database-level safety net catching any edge cases that slip past Layer 1.

Both operations run inside a **MongoDB transaction** (session) for full atomicity.

---

## 📡 Real-Time Updates (Socket.io)

### Events Emitted by Server
| Event | Payload | Description |
|-------|---------|-------------|
| `slot-booked` | `{ expertId, date, timeSlot, bookingId }` | When a slot is booked |
| `slot-freed` | `{ expertId, date, timeSlot }` | When a booking is cancelled |

### Client Usage
Clients join expert-specific rooms:
```js
socket.emit('join-expert-room', expertId)
socket.on('slot-booked', ({ date, timeSlot }) => { /* update UI */ })
```

---

## ✅ Validation Rules

| Field | Rules |
|-------|-------|
| clientName | Required, 2–100 chars |
| clientEmail | Required, valid email format |
| clientPhone | Required, 7–20 chars, allows +, spaces, dashes |
| date | Required, YYYY-MM-DD, not in the past |
| timeSlot | Required, HH:MM format |
| notes | Optional, max 500 chars |

---

## 🌱 Seed Data

Running `npm run seed` creates 8 experts across all categories:
- **Technology** — Dr. Arjun Mehta
- **Design** — Priya Krishnan
- **Business** — Rahul Sharma
- **Marketing** — Kavya Nair
- **Finance** — Vikram Patel
- **Health** — Ananya Iyer
- **Legal** — Suresh Venkat
- **Education** — Deepika Rao

Each expert gets 14 days of weekday availability with 8 hourly slots per day.

---

## 🎨 Frontend Features

- **Dark theme** with purple accent (#6366f1)
- **Sora** display font for headings
- Real-time slot updates with visual feedback
- Live indicator on expert detail page (green dot when socket connected)
- Toast notifications for real-time slot changes
- Skeleton loading states
- Responsive grid layout
- Smooth hover transitions
