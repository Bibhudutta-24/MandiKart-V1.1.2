# MandiKart

MandiKart is a unified B2B/B2C agricultural commerce platform connecting farmers, buyers, logistics providers, and administrators.

---

## 🏛️ System Architecture

> **One shared Firebase backend + separate frontend for each app + shared contracts + real Firebase data from day one.**

```
             MANDIKART PLATFORM
                    │
          ┌─────────┴─────────┐
          │ SHARED BACKEND    │
          │ + FIREBASE        │
          └─────────┬─────────┘
                    │
       ┌────────────┼────────────┐
       ↓            ↓            ↓
    FARMER        BUYER       LOGISTICS
       │            │            │
       └────────────┼────────────┘
                    ↓
                  ADMIN
```

---

## 📂 Final Project Structure

```
MandiKart/
│
├── apps/
│   ├── farmer-app/
│   │   ├── frontend/
│   │   └── backend/
│   ├── buyer-app/
│   │   ├── frontend/
│   │   └── backend/
│   ├── logistics-app/
│   │   ├── frontend/
│   │   └── backend/
│   └── admin-panel/
│       ├── frontend/
│       └── backend/
│
├── firebase/
│   ├── functions/
│   │   ├── src/
│   │   │   ├── auth/
│   │   │   ├── farmers/
│   │   │   ├── buyers/
│   │   │   ├── fpos/
│   │   │   ├── products/
│   │   │   ├── orders/
│   │   │   ├── logistics/
│   │   │   ├── deliveries/
│   │   │   ├── payments/
│   │   │   ├── notifications/
│   │   │   └── admin/
│   │   ├── package.json
│   │   └── tsconfig.json
│   ├── firestore.rules
│   ├── firestore.indexes.json
│   ├── storage.rules
│   ├── firebase.json
│   └── .firebaserc
│
├── shared/
│   ├── types/
│   ├── constants/
│   ├── validation/
│   └── api-contracts/
│
├── docs/
│   ├── architecture/
│   ├── database/
│   ├── api/
│   └── flows/
│
├── .agents/
│   └── rules/
├── AGENTS.md
├── .gitignore
├── package.json
└── README.md
```

---

## 🌟 The Golden Rule of Screen Development

```
ONE SCREEN
    ↓
UI
    ↓
FRONTEND LOGIC
    ↓
SERVICE
    ↓
BACKEND/API
    ↓
DATABASE
    ↓
REAL DATA
    ↓
VALIDATION
    ↓
SECURITY
    ↓
REAL-TIME SYNC
    ↓
TEST
    ↓
COMPLETE
    ↓
NEXT SCREEN
```

### Non-Negotiable Standards:
- ❌ **NO MOCK DATA**
- ❌ **NO DEMO DATA**
- ❌ **NO HARDCODED BUSINESS DATA**
- ❌ **NO FAKE API**
- ❌ **NO TEMPORARY DATABASE**
- ❌ **NO UI-ONLY FEATURES**
- ❌ **NO BACKEND-LATER APPROACH**
- ❌ **NO DUPLICATE SOURCES OF TRUTH**
- ❌ **NO DIRECT APP-TO-APP COMMUNICATION**

---

## 📦 Firestore Authoritative Collections

- `users`
- `farmers`
- `buyers`
- `fpos`
- `products`
- `orders`
- `orderItems`
- `logistics`
- `deliveries`
- `payments`
- `notifications`
- `adminActions`

---

## 🚀 Development Phases

- **Phase 0 — Foundation**: Repository, directory structure, Firebase config, rules, shared types, status constants, API contracts *(Current)*
- **Phase 1 — Farmer Authentication**: Splash, Login, Register, Session, Role verification
- **Phase 2 — Farmer Profile**: Profile view, Edit profile, Farm details, KYC
- **Phase 3 — Produce Management**: Add produce, My produce, Produce details, Edit produce
- **Phase 4 — Admin Verification**: Pending produce, Approval/Rejection, Real-time sync
- **Phase 5 — Farmer Orders**: Incoming orders, Details, Order timeline
- **Phase 6 — Buyer App**: Browse, Search, Product details, Cart, Checkout, Order placement
- **Phase 7 — Logistics App**: Assignment queue, Pickup, Transit, Delivery verification
- **Phase 8 — Payments**: Payouts, Escrow, Verification, Transactions
- **Phase 9 — Notifications**: Push notifications, Status triggers, Alerts
- **Phase 10 — Admin Panel**: Full back-office operations & analytics
