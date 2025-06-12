+------------------+         +----------------------+
|     Product      |         |   Branch             |
+------------------+         +----------------------+
| id (PK)          |         | id (PK)              |
| name             |         | name                 |
| description      |         | location             |
+------------------+         +----------------------+
         |                             
         |                             
         v                             
+--------------------------+     
|   ProductVariant         |     
+--------------------------+     
| id (PK)                  |     
| product (FK → Product)   |     
| color                    |     
| size                     |     
| sku_code                 |     
| current_stock            |     
+--------------------------+     
         |                             
         v                           
+------------------------+
|   StockTransaction     |    ←  الحركة الواحدة (مثلاً: إذن إدخال أو إخراج)
+------------------------+
| id (PK)                |
| movement_type          |
| from_branch (nullable) |
| to_branch (nullable)   |
| created_at             |
| notes                  |
+------------------------+
|
|  1 → 🔁 → Many
v
+-----------------------------+
|  StockTransactionItem       |  ← تفاصيل المنتجات في الحركة
+-----------------------------+
| id (PK)                     |
| transaction (FK)           |
| variant (FK)                |
| quantity                    |
+-----------------------------+



Invoice (فاتورة)
│
├── branch (لمن ينتمي الفاتورة)
├── type = ['purchase', 'sale', 'return_purchase', 'return_sale']
│
├── items → InvoiceItem[]
      └── variant (المنتج/الخيار)
      └── quantity
      └── unit_price
