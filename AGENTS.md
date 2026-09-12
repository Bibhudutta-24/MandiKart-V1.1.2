# MandiKart Core Project Rules & Architecture Memory

## Authoritative Principle
- **One shared Firebase backend + separate frontend for each app + shared contracts + real Firebase data from day one.**
- Never mix frontend and backend code.
- No direct app-to-app communication. Apps communicate only through Firebase/shared backend.

## Golden Rule of Screen Development
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

## Prohibitions
- NO MOCK DATA
- NO DEMO DATA
- NO HARDCODED BUSINESS DATA
- NO FAKE API
- NO TEMPORARY DATABASE
- NO UI-ONLY FEATURES
- NO BACKEND-LATER APPROACH
- NO DUPLICATE SOURCES OF TRUTH

## ID Rule
Every major entity gets its own unique ID used universally across all apps:
- `uid`
- `farmerId`
- `buyerId`
- `fpoId`
- `productId`
- `orderId`
- `deliveryId`
- `paymentId`
- `notificationId`

## Status Rule
Statuses MUST be imported from `shared/constants/`:
- `PRODUCT_STATUS`: DRAFT, PENDING, APPROVED, REJECTED, SOLD_OUT, INACTIVE
- `ORDER_STATUS`: PENDING, CONFIRMED, PAYMENT_PENDING, PAYMENT_CONFIRMED, LOGISTICS_ASSIGNED, PICKUP_SCHEDULED, PICKED_UP, IN_TRANSIT, DELIVERED, CANCELLED
- `PAYMENT_STATUS`: PENDING, PROCESSING, COMPLETED, FAILED, REFUNDED
- `DELIVERY_STATUS`: ASSIGNED, PICKUP_SCHEDULED, PICKED_UP, IN_TRANSIT, DELIVERED, FAILED
- `USER_STATUS`: ACTIVE, SUSPENDED, PENDING_VERIFICATION, INACTIVE

## Frontend Architecture
- No Firebase business logic directly inside screens.
- Pattern: `Screen -> Zustand Store -> Service -> Firebase SDK / API Contract`

## Backend Architecture
- Authoritative shared backend: `firebase/functions/src/`
- App-specific backend: `apps/*/backend/src/` only for app-specific adapters, contracts, and configuration.
