# MandiKart Logistics Backend API

Enterprise-grade REST API backend powering the MandiKart Delivery Partner application.

## Directory Structure
```
backend/
├── src/
│   ├── config/
│   │   └── db.js                 # Modular database / repository store
│   ├── controllers/
│   │   ├── authController.js     # Pure Mobile OTP & driver onboarding
│   │   ├── driverController.js   # Profile, vehicle, online status
│   │   └── deliveryController.js # Active routes, orders, POD submission
│   ├── middlewares/
│   │   ├── authMiddleware.js     # JWT verification
│   │   └── errorMiddleware.js    # Global error handler
│   ├── routes/
│   │   ├── authRoutes.js         # /api/auth/*
│   │   ├── driverRoutes.js       # /api/driver/*
│   │   ├── deliveryRoutes.js     # /api/deliveries/*
│   │   └── index.js              # Master router & health check
│   ├── services/
│   │   └── otpService.js         # Crypto 4-digit OTP engine & SMS gateway interface
│   └── server.js                 # Express server entry point
├── .env.example
├── .env
├── package.json
└── README.md
```

## Available API Endpoints

### 1. Authentication (`/api/auth`)
- `POST /api/auth/send-login-otp`: Send OTP to registered driver mobile number.
- `POST /api/auth/verify-login-otp`: Verify OTP and receive JWT session token.
- `POST /api/auth/send-register-otp`: Send verification code for registration.
- `POST /api/auth/verify-register-otp`: Verify mobile number during registration.
- `POST /api/auth/register`: Complete partner onboarding with Aadhaar, PAN, Vehicle clear photo, Plate photo, Driving license, and Bank IFSC details.

### 2. Driver Partner (`/api/driver`) [Requires Bearer JWT]
- `GET /api/driver/profile`: Fetch current driver profile and vehicle details.
- `PUT /api/driver/profile`: Update driver profile details.
- `PUT /api/driver/status`: Toggle driver status (`ONLINE` / `OFFLINE`).

### 3. Deliveries & Routing (`/api/deliveries`) [Requires Bearer JWT]
- `GET /api/deliveries/assigned`: List assigned active orders.
- `PUT /api/deliveries/:id/status`: Update order status (`ASSIGNED`, `PICKED_UP`, `IN_TRANSIT`, `DELIVERED`).
- `POST /api/deliveries/:id/pod`: Submit Proof of Delivery (recipient name, signature, photo).

### 4. Smart Logistics & Route Intelligence (`/api/logistics`)
- `POST /api/logistics/dispatch/find-drivers`: Proximity, rating & vehicle capacity driver matching.
- `POST /api/logistics/dispatch/assign`: Assign order with 30s countdown acceptance window.
- `POST /api/logistics/fare/quote`: Dynamic pricing (base fare, per-KM, weight surcharge, surge).
- `GET /api/logistics/incentives/daily`: Daily milestone bonus progress tracker.
- `POST /api/logistics/route/optimize`: Multi-drop route sequence optimization with 14-min ETA.
- `POST /api/logistics/geofence/check-arrival`: 75m customer arrival geofence detection.
- `POST /api/logistics/pod/verify-handover`: Customer handover OTP verification & driver wallet crediting.

## Getting Started

1. Navigate to backend:
   ```bash
   cd backend
   ```
2. Install dependencies:
   ```bash
   npm install
   ```
3. Start the server:
   ```bash
   npm start
   # or development mode:
   npm run dev
   ```
4. Check health endpoint:
   `http://localhost:5000/api/health`
