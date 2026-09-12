# MandiKart System Architecture

## Architecture Principle
> **One shared Firebase backend + separate frontend for each app + shared contracts + real Firebase data from day one.**

## High Level Overview

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

## Key Rules
1. **Never build a traditional always-running Node server.** Use Firebase Client SDK + Firestore Security Rules for normal authenticated CRUD.
2. **Cloud Functions** are used strictly for privileged business logic:
   - Admin approvals
   - Order creation & price calculations
   - Inventory reservation
   - Payment verification & refunds
   - Role mutations
   - Cross-document transactions
   - Business-triggered notifications
3. **No direct screen-to-Firestore queries.** Use Zustand + Service pattern:
   `Screen -> Store (Zustand) -> Service -> Firebase SDK / API`
