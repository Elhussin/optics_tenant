# Mobile API Strategy 📱

The Mobile API (`apps/api/views_mobile.py`) is designed specifically for performance on low-bandwidth networks and limited-resource devices.

## ⚡ Design Philosophy

1.  **Outcome-Oriented Endpoints**: Instead of CRUD, we expose intent-based endpoints (e.g., `quick_sale`, `dashboard`).
2.  **Data Aggregation**: Multiple resource fetches are combined into single requests to reduce round-trips (Latency reduction).
3.  **Payload Optimization**: We selectively return only the fields needed for the mobile UI (e.g., `id`, `name`, `price`) instead of full objects.

## 📡 Key Endpoints

### 1. Unified Dashboard (`GET /api/mobile/dashboard/`)
Returns a snapshot of the entire business state in one call:
-   Today's Sales (Cash vs Card).
-   Recent 5 Orders.
-   Critical Alerts (Low Stock, Pending Orders).
-   User's Personal Performance (if Employee).

### 2. Offline Sync (`GET /api/mobile/sync/`)
Supports **Offline-First** architecture.
-   **Param**: `?since=<timestamp>`
-   **Logic**: Returns only records (Products, Customers) modified *after* the provided timestamp.
-   **Usage**: The mobile app stores this data locally (SQLite/Realm) and queries the server only for deltas.

### 3. Quick Search (`GET /api/mobile/products/search/`)
Optimized for instant autocomplete.
-   **Logic**: Searches SKU, Name, and Model using Trigram similarity.
-   **Response**: Lightweight JSON list ( < 1KB per 20 items).

### 4. Quick Sale (`POST /api/mobile/sale/create/`)
Atomic transaction creation.
-   **Input**: Customer ID + List of Variants.
-   **Process**: Creates Order, OrderItems, deducts Stock, and records Payment in a single database transaction.
