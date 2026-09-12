# MandiKart Firestore Schema

## Authoritative Collections:
- `users` - Root user accounts & roles (`FARMER`, `BUYER`, `LOGISTICS`, `ADMIN`, `FPO`)
- `farmers` - Farmer profiles, farm sizes, crops, KYC
- `buyers` - Buyer profiles, delivery addresses, GSTIN
- `fpos` - Farmer Producer Organizations & member registries
- `products` - Produce listings across the platform
- `orders` - Single source of truth for orders across all apps
- `orderItems` - Line items linked by `orderId`
- `logistics` - Logistics partner profiles & fleet info
- `deliveries` - Dispatch & transit tracking
- `payments` - Transactions, escrow, status
- `notifications` - Real-time alerts for all users
- `adminActions` - Immutable audit log of administrative decisions

## Single ID Rule
The exact same ID must be shared across all 4 applications:
`orderId = ORD123` is the same order in Buyer App, Farmer App, Logistics App, and Admin Panel.
