# MandiKart

MandiKart is a unified B2B/B2C agricultural commerce platform connecting farmers, buyers, logistics providers, and administrators.

## Monorepo Architecture

```
MandiKart/
├── apps/
│   ├── farmer-app/       # Mobile & backend service for farmers
│   ├── buyer-app/        # Mobile & backend service for buyers/retailers
│   ├── logistics-app/    # Fleet & delivery partner application
│   └── admin-panel/      # Back-office operations & management
├── shared/               # Shared cross-application libraries & types
├── firebase/             # Cloud Firestore, Storage, & Security rules
└── docs/                 # System architecture, API, and DB documentation
```

## Getting Started

### Prerequisites
- Node.js >= 20
- npm / yarn / pnpm
- Firebase CLI (`npm install -g firebase-tools`)

### Setup
```bash
npm install
```
