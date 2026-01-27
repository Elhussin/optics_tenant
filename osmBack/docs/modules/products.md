# Products & Inventory 📦

The Products module manages the catalog of optical items (glasses, lenses, accessories) and their stock levels across multiple branches.

## 👓 Product Structure
The system distinguishes between a generic Product and its Variants.

1.  **Product**: The base item (e.g., "Ray-Ban Aviator").
    -   Attributes: Brand, Model, Category, Material.
2.  **ProductVariant**: The specific sellable item (e.g., "Ray-Ban Aviator - Gold Frame - Green Lens").
    -   Attributes: SKU, Color, Size, Selling Price.

## 🏭 Inventory Management

### Stock Model
Tracks quantity per variant per branch.
`Stock(branch_id, variant_id, quantity)`

### Stock Movements
Every change in inventory is recorded in `StockMovement` for audit purposes.
-   **Types**: `purchase`, `sale`, `transfer`, `adjustment`, `return`.
-   **Logic**:
    -   **Sale**: Decreases stock, validates availability.
    -   **Return**: Increases stock.
    -   **Transfer**: Atomically decreases from Source Branch and increases in Destination Branch.

## 🏷️ Pricing & Barcodes
-   **SKU Generation**: System auto-generates unique SKUs if not provided.
-   **Barcodes**: Supports printing barcode labels for physical scanning.

## 🔍 Search & Filtering
-   **Optimized Search**: Uses `trigram` similarity for fuzzy matching (searching "Rayban" finds "Ray-Ban").
-   **Filters**: Advanced filtering by Brand, Category, Price Range, and Stock Level.
