# Order Lifecycle Flow

```
Buyer: Create Order
  ↓
Backend / Functions: Validates prices & reserves quantity
  ↓
Firestore: Order created (status = PENDING)
  ↓
Farmer App (Real-time listener): Sees new incoming order
  ↓
Farmer confirms order (status = CONFIRMED)
  ↓
Buyer makes payment -> Backend verifies -> (status = PAYMENT_CONFIRMED)
  ↓
Admin / Auto-assignment assigns Logistics (status = LOGISTICS_ASSIGNED)
  ↓
Logistics accepts & schedules pickup (status = PICKUP_SCHEDULED)
  ↓
Logistics picks up produce (status = PICKED_UP)
  ↓
Transit (status = IN_TRANSIT)
  ↓
Delivered & OTP/Signature verified (status = DELIVERED)
  ↓
Farmer payout released (status = COMPLETED)
```
