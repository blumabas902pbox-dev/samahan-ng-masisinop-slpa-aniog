# USWAG — Unified System for Work and Growth

A livelihood-tracking web system built for **Samahan ng Masisinop**, the Sustainable Livelihood Program Association (SLPA) of Barangay Aniog, Sagñay, Camarines Sur. USWAG gives local sellers a place to list products and track stock and income, and gives buyers a simple gallery to browse what's available in the community.

## About

USWAG — *Unified System for Work and Growth* — was developed as a Bachelor of Science in Information Technology project at **Partido State University** (San Juan Buenvista Street, Goa, Camarines Sur). It supports the DSWD Sustainable Livelihood Program (SLP) by giving local farmers, weavers, and micro-entrepreneurs a digital space to manage inventory and connect with buyers.

**Developer:** Bryan Jay Lumabas

## Features

- Home, About, Product Gallery, and Contact pages sharing one header/nav and color scheme
- Product gallery with live price and stock per item (root crops, raw materials, grains)
- Buyer/Seller registration with a custom role-selection modal and password visibility toggle (the schema also supports a separate SLP Admin role)
- Client-side validation: required fields, strict 11-digit contact number, minimum password length, and weak-password checks (common passwords, sequential or repeated characters)
- Confetti-animated thank-you page on successful registration
- Secure registration handling: PDO prepared statements and bcrypt password hashing
- Database triggers that keep stock, capital balances, and JSON receipts in sync automatically as sales and expenses are recorded

## Tech Stack

| Layer | Technology |
|---|---|
| Frontend | HTML5, CSS3 (custom, no framework), vanilla JavaScript |
| Backend | PHP (PDO) |
| Database | MySQL 8.0+ / MariaDB (InnoDB) |
| Local environment | WAMP (Windows, Apache, MySQL, PHP) |
| Icons | Font Awesome 6.5.1 (CDN) |
| Effects | canvas-confetti (CDN) |

## Project Structure

```
index.html              Homepage with welcome modal and feature overview
about.html               About USWAG, project proponent, academic roots
portfolio.html            Product gallery
contact.html               Location, phone, and email
register.html                Buyer/Seller registration form
thankyou.html                  Post-registration confirmation with confetti
styles.css                      Shared stylesheet and color variables
script.js                        Modal logic, form validation, AJAX submission
db.php                             PDO database connection
process_register.php                Registration handler — validates, hashes, inserts, redirects
uswag_db.sql                          Full schema: tables, views, triggers, sample queries
```

## Database

`uswag_db.sql` defines a 10-table schema:

| Table | Purpose |
|---|---|
| `Accounts` | Role-based login — Buyer, Seller, or SLP Admin |
| `Sellers` | Farmer/entrepreneur profiles linked to an account |
| `Categories` | Product sector groupings |
| `Products` | Per-seller inventory, pricing, and stock |
| `Sales` | Transaction headers — payment and offline-sync status |
| `Sale_Details` | Line items, with a generated `line_total` column |
| `Inventory_Transactions` | Audit trail for restocks, sales, spoilage, adjustments |
| `Expenses` | Operational costs per seller |
| `Capital_Management` | Working capital and running cash balance |
| `Receipts` | JSON receipts for thermal printing and offline sync |

It also includes:
- A view, `vw_seller_cash_flow`, aggregating each seller's revenue vs. expenses
- A stored procedure, `sp_sync_offline_sales`, to batch-sync offline sales and receipts
- Seven triggers that validate stock before a transaction, auto-update stock levels, adjust capital on expenses and paid/pending sales, log inventory movements, and auto-generate receipts
- Ten sample queries covering cash flow, audits, low-stock alerts, top sellers, and more

## Setup (WAMP)

1. Copy the project folder into `www/` in your WAMP install.
2. Start Apache and MySQL from the WAMP control panel.
3. In phpMyAdmin, import `uswag_db.sql` — it drops and recreates `uswag_db` and seeds the baseline categories.
4. Check that `db.php` matches your local MySQL credentials (defaults to `root` with no password).
5. Open `http://localhost/<project-folder>/index.html`.

## Notes

- The current front end covers the public site and the Buyer/Seller registration flow. The schema is already built for the next phase — seller dashboards, product/sales entry, expense tracking, and receipts — none of which has a UI yet.
- `register.html` collects an **Address** field, but `process_register.php` doesn't insert it yet — there's no `address` column on `Accounts`, so that value isn't currently saved.
- Registering creates an `Accounts` row only; a matching `Sellers` profile isn't created automatically, so seller-specific features will need that step added.
- Image assets referenced by the pages (`logo.png`, `SLP.png`, and the product photos on the gallery) aren't part of this file set and will need to sit alongside the HTML files.
- `db.php` uses the default WAMP credentials (`root`, no password) — fine for local development, but should change before any public deployment.
- 
