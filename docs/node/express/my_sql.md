# Express + MySQL

This Assignment is a **practical SQL workshop** designed by Riwi to help developers and analysts improve their skills by writing progressive queries, from basics to advanced data analysis. Organized into **four complexity levels**, inside a context of **online store**, the workshop covers a wide range of common scenarios in real-world relational database environments.

---

## Context

Although not all the database schema is included, from the queries it's only needed the following entities and properties:

| Table | Columns |
|------|-------------------|
| `users` | `id`, `name`, `last_name`,`email`, `city` |
| `orders` | `id`, `order_number`, `user_id`, `status`, `order_date`, `total` |
| `products` | `id`, `name`, `sale_price`, `cost`, `category_id`, `stock` |
| `categories` | `id`, `name` |
| `order_items` | `order_id`, `product_id`, `quantity`, `price_at_purchase` |

> A relationship typical of a relational system: users → orders → items → products → categories.

---

## Express Structure
```
├── app.js
├── server.js
├── package.json
├── config/
│   └── db.js
├── middlewares/
│   ├── error.middleware.js
│   ├── users.middleware.js
│   ├── orders.middleware.js
│   ├── products.middleware.js
│   └── reports.middleware.js
└── modules/
     ├── users/
     │   ├── users.model.js
     │   ├── users.service.js
     │   ├── users.controller.js
     │   └── users.routes.js
     ├── orders/
     │   ├── orders.model.js
     │   ├── orders.service.js
     │   ├── orders.controller.js
     │   └── orders.routes.js
     ├── products/
     │   ├── users.model.js
     │   ├── users.service.js
     │   ├── users.controller.js
     │   └── users.routes.js 
     └── reports/
         ├── reports.model.js
         ├── reports.service.js
         ├── reports.controller.js
         └── reports.routes.js
```
--- 
## MySQL Queries
Note that all queries have been implemented with Express, every example where a ? appears means is the value given in the endpoint
### Level 1: Basic Queries and Direct Relationships (2 Tables)
Focused on mastering `SELECT`, `JOIN`, `WHERE`, `GROUP BY`, and basic aggregation functions.

**Key topics:**
- Name/email searches
- Simple joins between two tables (e.g., `users` ↔ `orders`)
- Using `COUNT`, `SUM`, `AVG`
- Filtering with conditions (`LIKE`, `IS NULL`)
- Sorting with `ORDER BY`

#### Solved Table
| # | Query | How it works | Endpoint |
|---:|---|---|----|
| 1 | `SELECT u.name, u.email, o.order_number FROM users u INNER JOIN orders o ON u.id = o.user_id WHERE u.id = ?;` | Joins `users` to `orders` by `user_id` and filters to a single user to list all their order codes. | `/api/users/nameEmailOrders/:id` |
| 2 | `SELECT o.order_number, o.order_date, u.email FROM orders o INNER JOIN users u ON o.user_id = u.id WHERE u.email = ?;` | Finds a user by email and returns every order (number + date) belonging to that user. | `/api/orders/withEmail/:email` |
| 3 | `SELECT p.name AS Product_name, c.name AS Category_name FROM products p INNER JOIN categories c ON p.category_id = c.id ORDER BY Product_name ASC;` | Joins each product to its category and sorts alphabetically by product name. | `/api/products/nameAndCategory` | 
| 4 | `SELECT u.name, u.email FROM users u LEFT JOIN orders o ON u.id = o.user_id WHERE o.user_id IS NULL;` | Left-joins orders; rows where `o.user_id` is `NULL` are users with **no orders**. |`/api/users/noOrders`| 
| 5 | `SELECT u.name, u.email, SUM(o.total) AS total_spent FROM users u INNER JOIN orders o ON u.id = o.user_id WHERE u.id = ? GROUP BY u.id;` | Sums all order totals for one user to compute lifetime spend. | `/api/users/totalMoneySpent/:id`|
| 6 | `SELECT status, COUNT(*) AS count FROM orders GROUP BY status;` | Groups orders by `status` and counts how many orders exist in each status. | `/api/orders/countByStatus`|
| 7a | `SELECT p.name AS Product_name, c.name AS Category_name FROM products p INNER JOIN categories c ON p.category_id = c.id WHERE c.name LIKE ? ORDER BY Category_name ASC;` | Filters products whose category name matches “Electrónica” (or any other word) and sorts by price descending. | `/api/products/categoryName/:categoryName`|
| 7b | `SELECT p.name AS Product_name, c.name AS Category_name FROM products p INNER JOIN categories c ON p.category_id = c.id WHERE p.category_id  IN (1, 2, 3, 4, 5, 7) ORDER BY Category_name ASC;` | Uses a manual list of category IDs (as a substitute if the category name doesn’t exist) and sorts expensive-to-cheap. |`/api/products/electronic`|
| 8 | `SELECT o.order_number AS Order_number, op.product_id AS Product_id, op.quantity AS Quantity FROM orders o  INNER JOIN order_product op ON o.id = op.order_id  WHERE o.order_number = ? ORDER BY o.order_number ASC;` | Finds one order by order number and lists product IDs + quantities in that order (line items). | `/api/products/orderNumber/:orderNumber`|
| 9 | `SELECT u.city, u.name, u.email, count(*) AS orders_count FROM users u RIGHT JOIN orders o ON u.id = o.user_id WHERE u.city = ? GROUP BY u.id ORDER BY orders_count DESC` | Filters users by city and keeps only those having at least one order (right join), then counts orders per user. | `/api/users/cityWithOrders/:city`|
| 10 | `SELECT u.name, AVG(total) AS avg_order_value, COUNT(o.id) AS total_orders FROM users u INNER JOIN orders o ON u.id = o.user_id GROUP BY u.id ORDER BY avg_order_value DESC;` | Computes each user’s average order value (and number of orders) by grouping their orders. | `/api/reports/avg-users-order-value`|

---
### Level 2: Intermediate Queries (3 Tables)
Introduces multiple joins and deeper analysis of business behavior.
**Key topics:**
- Chained joins (3+ tables)
- Group aggregations (`GROUP BY`)
- Implicit subqueries or CTEs
- Sales analysis by product/category
- Identifying unsold products
#### Solved Table
| # | Query | How it works | Enpoint |
|---:|---|---|---|
| 11a | `SELECT  o.order_number, o.order_date, p.name, p.sale_price AS Sale_price, p.purchase_price AS Purcharse_price, op.quantity AS Quantity FROM orders o  INNER JOIN order_product op ON o.id = op.order_id  INNER JOIN products p ON op.product_id = p.id  ORDER BY o.order_date ASC;` | Builds a detailed receipt: order header + each purchased product + the historical price paid for all orders. |`/api/orders/receipts`|
| 11b | `SELECT  o.order_number, o.order_date, p.name, p.sale_price AS Sale_price, p.purchase_price AS Purcharse_price, op.quantity AS Quantity FROM orders o  INNER JOIN order_product op ON o.id = op.order_id  INNER JOIN products p ON op.product_id = p.id  WHERE o.id = ? ORDER BY o.order_date ASC;` | Builds a detailed receipt: order header + each purchased product + the historical price paid for a given order. |`/api/orders/receipt/:id`|
| 12a | `SELECT c.name, SUM(op.price_at_purchase * op.quantity) AS ingreso_total FROM categories c INNER JOIN products p ON p.category_id = c.id INNER JOIN order_product op ON op.product_id = p.id GROUP BY c.id, c.name ORDER BY ingreso_total DESC;` | Aggregates revenue by category using historical price × quantity from `order_product`. | `/api/reports/category-revenues`|
| 12b | `SELECT c.name, SUM(op.price_at_purchase * op.quantity) AS ingreso_total FROM categories c INNER JOIN products p ON p.category_id = c.id INNER JOIN order_product op ON op.product_id = p.id WHERE c.id = ? GROUP BY c.id, c.name;` | Aggregates revenue by a given category using historical price × quantity from `order_product`. | `/api/reports/category-revenues/:categoryId`|
| 13 | `SELECT u.name AS user_name, DISTINCT p.name AS product_name, FROM users u INNER JOIN orders o ON u.id = o.user_id INNER JOIN order_product op ON o.id = op.order_id INNER JOIN products p ON op.product_id = p.id WHERE u.name LIKE ? ORDER BY user_name ASC;` | For a given customer name, returns a **unique** list of products they have purchased. | `/api/products/userName/:userName`|
| 14 | `SELECT p.name, SUM(op.quantity) AS total_sold FROM products p INNER JOIN order_product op ON p.id = op.product_id GROUP BY p.id, p.name ORDER BY total_sold DESC LIMIT 5;;` | Totals units sold per product and returns the top 5 by quantity. | `/api/reports/five-best-selling-products`|
| 15a | `SELECT p.name AS product_name, MAX(op.created_at) AS last_sale_date FROM products p INNER JOIN order_product op ON p.id = op.product_id INNER JOIN orders o ON op.order_id = o.id GROUP BY p.id, p.name ORDER BY last_sale_date DESC;` | Finds the most recent sale date for each product by taking `MAX(order_date)`. | `/api/products/lastSaleDate`|
| 15b | `SELECT p.name AS product_name, MAX(op.created_at) AS last_sale_date FROM products p INNER JOIN order_product op ON p.id = op.product_id INNER JOIN orders o ON op.order_id = o.id WHERE p.id = ? GROUP BY p.id, p.name ORDER BY last_sale_date DESC;` | Finds the most recent sale date for a given product by taking `MAX(order_date)`. | `/api/products/lastSaleDate/:id`|
| 16 | `SELECT DISTINCT u.name FROM users u INNER JOIN orders o ON u.id = o.user_id INNER JOIN order_product op ON o.id = op.order_id INNER JOIN products p ON op.product_id = p.id WHERE p.name LIKE '%gamer%' ORDER BY u.name ASC;` | Returns customers who bought at least one product whose name contains “Gamer”. | `/api/users/gamerProducts`|
| 17 | `SELECT DATE(o.created_at) AS date, SUM(o.total) AS daily_revenue FROM orders o GROUP BY DATE(o.created_at) ORDER BY date ASC;` | Groups all orders by day (date part only) and sums daily revenue. |`/api/reports/daily-revenue` |
| 18 | `SELECT c.name AS Category_name FROM categories c LEFT JOIN products p ON p.category_id = c.id LEFT JOIN order_product op ON op.product_id = p.id WHERE op.id IS NULL GROUP BY c.id, c.name ORDER BY c.name ASC;` | Uses a left join to detect categories whose products have **zero** sales (no matching rows in `order_product`). |`/api/reports/categories-with-no-sales`|
| 19a | `SELECT u.name, AVG(o.total) AS avg_order_value FROM users u INNER JOIN orders o ON u.id = o.user_id GROUP BY u.id, u.name ORDER BY avg_order_value DESC;` | Computes each user’s average spend per order (“average ticket”). | `/api/users/averageOrderValue`|
| 19b | `SELECT u.name, AVG(o.total) AS avg_order_value FROM users u INNER JOIN orders o ON u.id = o.user_id WHERE u.id = ? GROUP BY u.id, u.name ORDER BY avg_order_value DESC;` | Computes a user’s average spend per order (“average ticket”). | `/api/users/averageOrderValue/:id`|
| 20 | `SELECT DISTINCT p.name AS Product_name, o.order_number AS Order_number, o.status AS Order_status FROM products p INNER JOIN order_product op ON p.id = op.product_id INNER JOIN orders o ON op.order_id = o.id WHERE o.status = 'cancelled' ORDER BY Product_name ASC;` | Lists products that appear in cancelled orders (distinct product names only). | `/api/orders/cancelledProducts`|
---
### Level 3: Complex Queries and Reports (4+ Tables)
Oriented toward generating executive reports and detailed analysis combining all available information.
**Key topics:**
- Consolidated reports (master tables)
- Cross-comparisons (products vs. historical prices)
- Conditional logic (`CASE`, subqueries)
- Temporal analysis (past sales vs. current prices)
- Purchase pattern detection

#### Solved Table
| # | Query | How it works |Endpoint|
|---:|---|---|---|
| 21 | `SELECT u.id, u.name, u.city, o.order_number, p.name AS name_product, c.name AS Category, op.quantity, (op.price_at_purchase * op.quantity) AS subtotal_item FROM users u LEFT JOIN orders o  ON o.user_id = u.id LEFT JOIN order_product op ON op.order_id  = o.id LEFT JOIN products p ON p.id = op.product_id LEFT JOIN categories c ON c.id = p.category_id  ORDER BY u.id ASC;` | Global report combining customer, order, product, category, quantities, and line-item subtotals. | `/api/reports/global-reports`|
| 22a | `SELECT u.city AS City_name, c.name AS Category, SUM(op.price_at_purchase * op.quantity) AS products_total_revenue FROM categories c INNER JOIN products p ON c.id = p.category_id INNER JOIN order_product op ON op.product_id = p.id INNER JOIN orders o ON o.id = op.order_id INNER JOIN users u ON u.id = o.user_id WHERE c.id = 6 AND u.city = ?;` | Filters to one category (clothes) + one city and sums item revenue for those matching purchases. | `/api/reports/city-revenue-clothes-category/:city`|
| 22b | `SELECT u.city AS City_name, c.name AS Category, SUM(op.price_at_purchase * op.quantity) AS products_total_revenue FROM categories c INNER JOIN products p ON c.id = p.category_id INNER JOIN order_product op ON op.product_id = p.id INNER JOIN orders o ON o.id = op.order_id INNER JOIN users u ON u.id = o.user_id WHERE c.id = 6 GROUP BY u.city;` | Filters to one category (clothes) + all cities and sums item revenue for those matching purchases. | `/api/reports/cities-revenue-clothes-category`|
| 23 | `SELECT u.name, u.email, SUM(o.total) AS total_spent FROM users u INNER JOIN orders o ON u.id = o.user_id WHERE YEAR(o.created_at) = YEAR(CURDATE()) GROUP BY u.id, u.name, u.email ORDER BY total_spent DESC LIMIT 1;` | “Customer of the year”: sums spend per user and returns the top spender. | `/api/users/yearBestCustomer`|
| 24 | `SELECT p.name AS product_name FROM products p LEFT JOIN order_product op ON p.id = op.product_id WHERE op.product_id IS NULL ORDER BY product_name ASC;` | Finds products with **no sales** by left-joining and keeping only rows without matches in `order_product`. |`/api/products/noSales` |
| 25 | `SELECT SUM((op.price_at_purchase - p.purchase_price) * op.quantity) AS total_profit FROM order_product op INNER JOIN products p ON op.product_id = p.id;` | Computes revenue per product using historical sale price and current purchase cost. | `/api/products/total-profit`|
| 26 | `SELECT DISTINCT u.name, u.email, c.name AS Category FROM users u INNER JOIN orders o ON o.user_id = u.id INNER JOIN order_product op ON op.order_id = o.id INNER JOIN products p ON p.id = op.product_id INNER JOIN categories c ON c.id = p.category_id WHERE c.id = 4 AND u.id NOT IN -- Assuming category id 4 corresponds to gaming products (SELECT u2.id FROM users u2 INNER JOIN orders o2 ON o2.user_id = u2.id INNER JOIN order_product op2 ON op2.order_id = o2.id INNER JOIN products p2 ON p2.id = op2.product_id INNER JOIN categories c2 ON c2.id = p2.category_id WHERE c2.id = 7) ORDER BY u.name ASC;` | Includes users who bought “Videojuegos” but excludes any user who ever bought “Hogar” (via subquery). | `/api/users/gamingNoHome`|
| 27 | `SELECT u.city AS City_name, SUM((op.price_at_purchase - p.purchase_price) * op.quantity) AS total_profit FROM order_product op INNER JOIN products p ON op.product_id = p.id INNER JOIN orders o ON o.id = op.order_id INNER JOIN users u ON u.id = o.user_id GROUP BY u.city ORDER BY total_profit DESC LIMIT 3;` | Ranks cities by total revenue and returns top 3; also counts distinct orders per city. | `/api/reports/three-most-profitable-cities`|
| 28 | `SELECT u.name AS user_name, o.order_number, COUNT(DISTINCT p.id) AS product_variety FROM orders o INNER JOIN order_product op ON o.id = op.order_id INNER JOIN products p ON op.product_id = p.id INNER JOIN users u ON o.user_id = u.id GROUP BY o.id, u.name, o.order_number ORDER BY product_variety DESC LIMIT 1;` | Finds the order with the highest number of distinct products (max unique line items). | `/api/products/mostProductVariety`|
| 29 | `SELECT p.name, p.sale_price AS current_price, op.price_at_purchase AS sold_price, o.order_date AS sale_date FROM products p INNER JOIN order_product op ON op.product_id = p.id INNER JOIN orders o ON o.id = op.order_id WHERE op.price_at_purchase < p.sale_price ORDER BY p.name, o.order_date DESC;` | Detects discounts by comparing historical paid price vs the current catalog sale price. | `/api/products/soldCheaper`|
| 30 | `SELECT u.name AS buyer_name, u.email AS buyer_email, op.price_at_purchase AS purchase_price, op.quantity AS purchase_quantity, o.order_date AS purchase_date FROM products p INNER JOIN order_product op ON p.id = op.product_id INNER JOIN orders o ON op.order_id = o.id INNER JOIN users u ON o.user_id = u.id WHERE p.id = ? ORDER BY o.order_date DESC;` | Purchase history for one product: who bought it, when, price paid, and quantity/subtotal. | `/api/products/buyers/:id`|
---
### Level 4: Business Logic and Advanced Analytics
The most advanced level, focused on strategic decision-making through deep analysis.
**Key topics:**
- Statistical analysis (global averages, comparisons)
- Customer classification (`VIP`, `Frequent`, etc.)
- Critical business metrics:
  - Churn rate (inactive customers)
  - Cancellation rate
  - Category participation (% of revenue)
- Market analysis:
  - City rankings
  - Star products (>2% of total revenue)
- Inventory intelligence:
  - Low stock alerts on pending orders
- Market basket analysis: which products are bought together

#### Solved Table
| # | Query | How it works | Endpoint |
|---:|---|---|---|
| 31 | `SELECT u.name, u.email, SUM(o.total) AS total_spent FROM users u INNER JOIN orders o ON u.id = o.user_id GROUP BY u.id, u.name, u.email HAVING total_spent > (SELECT AVG(total) FROM (SELECT SUM(o.total) AS total FROM orders o GROUP BY o.user_id) AS general_average_subquery) ORDER BY total_spent DESC;` | Computes total spend per user and keeps only those above the *average user lifetime spend*. |`/api/usersaboveAverageSpending` |
| 32 | `SELECT p.name, pr.product_revenue as Product_revenue, (pr.product_revenue / company_revenue)*100 AS percentage FROM (SELECT SUM(op.price_at_purchase * op.quantity) as product_revenue, op.product_id as product_id FROM order_product op GROUP BY op.product_id) AS pr INNER JOIN (SELECT SUM(op.price_at_purchase * op.quantity) AS company_revenue FROM order_product op) AS company INNER JOIN products p ON product_id = p.id WHERE (pr.product_revenue / company_revenue)*100 > 2;` | Flags “star products” whose revenue share is > 2% of total company revenue (product revenue / total revenue). | `/api/products/stairProducts`|
| 33 | `SELECT u.name, u.email, u.city, MAX(o.order_date) AS last_purchase, ROUND(DATEDIFF(NOW(), MAX(o.order_date))/30,0) AS months_without_buying FROM users u INNER JOIN orders o ON o.user_id = u.id GROUP BY u.id, u.name, u.email, u.city HAVING MAX(o.order_date) < DATE_SUB(NOW(), INTERVAL 6 MONTH) ORDER BY last_purchase ASC;` | Finds customers whose most recent purchase was more than 6 months ago (basic churn list). | `/api/users/inactiveInLastSixMonths`|
| 34 | `SELECT u.name, u.email, SUM(o.total) AS total_expense, CASE WHEN SUM(o.total) > 5000 THEN 'VIP' WHEN SUM(o.total) BETWEEN 1000 AND 5000 THEN 'Frecuente' ELSE 'Regular' END AS level_users FROM users u INNER JOIN orders o ON o.user_id = u.id GROUP BY u.id, u.name, u.email ORDER BY total_expense DESC;` | Segments customers into tiers using a `CASE` expression based on lifetime spend. | `/api/users/VipFrecuentAndRegular`|
| 35 | `SELECT DATE_FORMAT(o.order_date, '%Y-%m') AS period, SUM(o.total) AS total_billing FROM orders o GROUP BY period ORDER BY total_billing DESC LIMIT 1;` | Groups revenue by year-month and returns the single highest-billing month. | `/api/reports/most-revenue-month`|
| 36 | `SELECT o.order_number, o.status AS order_status, u.name AS client, p.name AS product, op.quantity AS product_in_order, p.stock AS product_in_stock FROM orders o INNER JOIN order_product op ON op.order_id  = o.id INNER JOIN products p ON p.id = op.product_id INNER JOIN users u ON u.id = o.user_id WHERE o.status  = 'pending' AND p.stock < 5 ORDER BY p.stock ASC, o.order_date ASC;` | Inventory alert: pending orders that include products with dangerously low current stock. | `/api/orders/pendingLowStock`|
| 37a | `SELECT cr.Category, cr.category_revenue as Category_revenue, (cr.category_revenue / company_revenue)*100 AS percentage FROM (SELECT SUM(op.price_at_purchase * op.quantity) as category_revenue, c.name AS Category FROM order_product op RIGHT JOIN products p on p.id = op.product_id RIGHT JOIN categories c ON p.category_id = c.id GROUP BY c.id) AS cr INNER JOIN (SELECT SUM(op.price_at_purchase * op.quantity) AS company_revenue FROM order_product op) AS company ORDER BY percentage DESC;` | Uses CTEs to compute category revenue and divides by total revenue to get percentage share per category. | `/api/reports/revenue-percentage-each-category`|
| 37b | `WITH ventas_categoria AS (SELECT c.id, c.name AS category, SUM(op.price_at_purchase * op.quantity) AS income_category FROM categories c INNER JOIN products p ON p.category_id = c.id INNER JOIN order_product op ON op.product_id = p.id GROUP BY c.id, c.name), total_ventas AS (SELECT SUM(price_at_purchase * quantity) AS grand_total FROM order_product) SELECT vc.category, vc.income_category, tv.grand_total, (vc.income_category / tv.grand_total) * 100 AS percentage FROM ventas_categoria vc CROSS JOIN total_ventas tv ORDER BY percentage DESC;` | Uses CTEs to compute category revenue and divides by total revenue to get percentage share per category. | `/api/reports/revenue-percentage-each-category`|
| 38 | `WITH ventas_ciudad AS (SELECT u.city, SUM(o.total) AS total_city FROM users u JOIN orders o ON o.user_id = u.id GROUP BY u.city), promedio_ciudades AS (SELECT AVG(total_city) AS average FROM ventas_ciudad) SELECT vc.city, vc.total_city, ROUND(pc.average, 2) AS average_citys, ROUND(vc.total_city - pc.average, 2) AS difference, CASE WHEN vc.total_city > pc.average THEN 'Above Average' WHEN vc.total_city < pc.average THEN 'Below Average' ELSE 'Average' END AS comparison FROM ventas_ciudad vc CROSS JOIN promedio_ciudades pc ORDER BY vc.total_city DESC;` | Compares each city’s revenue to the overall average city revenue and labels it above/below/average. | `/api/reports/average-cities-revenue`|
| 39 | `SELECT DATE_FORMAT(order_date, '%Y-%m') AS period, COUNT(*) AS orders_total, SUM(CASE WHEN status = 'cancelled' THEN 1 ELSE 0 END) AS orders_cancelled, ROUND(SUM(CASE WHEN status = 'cancelled' THEN 1 ELSE 0 END) / COUNT(*) * 100, 2) AS cancellations_percentage FROM orders o GROUP BY period ORDER BY period DESC;` | Computes monthly cancellation rate: cancelled orders / total orders per month. | `/api/orders/cancelledPercentage`|
| 40 | `SELECT p1.name AS product_1, p2.name AS product_2, COUNT(*) AS times_together FROM order_product op1 INNER JOIN order_product op2 ON op1.order_id = op2.order_id AND op1.product_id < op2.product_id INNER JOIN products p1 ON p1.id = op1.product_id INNER JOIN products p2 ON p2.id = op2.product_id GROUP BY p1.id, p1.name, p2.id, p2.name ORDER BY times_together DESC LIMIT 10;` | Basket analysis: self-joins line items within the same order to count the most frequent product pairs. | `/api/products/mostPaired`|
---

## Instalation and Set Up

1. **Create the schema first**: Define the suggested tables and populate with test data.
2. **Use MySQL/PostgreSQL**: Both support all necessary functionalities.
3. **Go level by level**: Don't skip ahead without mastering previous levels.
4. **Optimize queries**: After solving, think about how to improve performance (indexes, avoid unnecessary subqueries).
5. **Automate reports**: Imagine how to convert each query into a dashboard.

---

--- 
