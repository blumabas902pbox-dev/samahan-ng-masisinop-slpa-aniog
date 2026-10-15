# USWAG — Unified System for Work and Growth

A livelihood-tracking web system for **Samahan ng Masisinop SLPA**, a Sustainable Livelihood Program Association (SLPA) in **Barangay Aniog, Sagñay, Camarines Sur** (Region V – Bicol).

USWAG gives the association a public-facing website (home, about, product gallery, contact, registration) backed by a MySQL database designed to track sellers, products, sales, inventory, expenses, capital, and receipts for local farmers and micro-entrepreneurs.

> Developed as a BSIT project at Partido State University, Goa, Camarines Sur, in support of the DSWD Sustainable Livelihood Program (SLP).

---

## Table of Contents

1. [About the Project](#about-the-project)
2. [Features](#features)
3. [Tech Stack](#tech-stack)
4. [Project Structure](#project-structure)
5. [Database Design](#database-design)
6. [Getting Started](#getting-started)
7. [Configuration](#configuration)
8. [Pages](#pages)
9. [Backend Endpoints](#backend-endpoints)
10. [Known Issues & Next Steps](#known-issues--next-steps)
11. [Privacy & Compliance](#privacy--compliance)
12. [Credits & Author](#credits--author)

---

## About the Project

**Samahan ng Masisinop SLPA** is a DSWD-accredited beneficiary civil society organization based in Aniog, Sagñay, Camarines Sur. Its members produce and trade local goods such as **copra, yellow corn, palay (rice), and cassava**. The association's accreditation (DSWD Field Office V) is valid for three years, from **17 September 2025 to 16 September 2028**.

USWAG aims to:

- Present the association and its products to buyers online.
- Let **Buyers** and **Sellers** register for an account.
- Give sellers a structured record of sales, stock, expenses, and capital.
- Support **offline-first** selling, where sales are queued and synchronized later, which suits areas with unreliable connectivity.
- Generate receipts (stored as JSON, suitable for thermal-printer output).

---

## Features

**Public website**
- Responsive multi-page site with a shared header/footer and stylesheet
- Welcome modal shown once per browser (remembered via `localStorage`)
- Product gallery with image carousels and lazy-loading spinners
- Registration tutorial video with a mute/unmute toggle
- Confetti celebration on successful registration and message submission

**Registration**
- Role selection modal (**Buyer** or **Seller**)
- Client-side validation: all fields required, 11-digit contact number, minimum 8-character password, weak-password detection (common passwords, sequences, repeated characters, keyboard patterns)
- Terms & Conditions and **National Privacy Commission (NPC)** privacy notice that must be accepted before sign-up

**Contact**
- Subject selection modal: *Buying Products, Selling Products, Member Benefits, Registration, General Inquiry*
- Confirmation notice sent to the sender (SMS via Semaphore and/or email via Gmail SMTP; see [Configuration](#configuration))

**Database**
- 10 normalized tables with foreign keys and indexes
- A cash-flow reporting view, a sync stored procedure, and 7 automation triggers
- Role-based accounts: `Buyer`, `Seller`, `SLP Admin`

---

## Tech Stack

| Layer      | Technology                                                    |
|------------|---------------------------------------------------------------|
| Frontend   | HTML5, CSS3, vanilla JavaScript                               |
| Libraries  | Font Awesome 6.5.1 (CDN), canvas-confetti 1.6.0 (CDN)         |
| Backend    | PHP 7.4+ (PDO)                                                |
| Database   | MySQL 8.0+ / MariaDB (InnoDB)                                 |
| Email      | PHPMailer over Gmail SMTP (via Composer)                      |
| SMS        | Semaphore API (Philippines)                                   |
| Hosting    | Static pages on GitHub Pages, PHP + MySQL on a compatible host |

---

## Project Structure

```
.
├── index.html            # Home
├── about.html            # About USWAG and the association
├── portfolio.html        # Product gallery
├── contact.html          # Contact form
├── register.html         # Buyer / Seller registration
├── thankyou.html         # Post-registration confirmation
├── styles.css            # Global styles
├── script.js             # Modals, validation, gallery, form submission
│
├── db.php                # PDO connection (reads config.php)
├── process_register.php  # API endpoint: register / login (CORS-enabled, JSON)
├── process_contact.php   # SMS confirmation via Semaphore API
├── send_email.php        # Email confirmation via PHPMailer / Gmail SMTP
├── uswag_db.sql          # Schema, view, procedure, triggers, seed data
│
├── logo.png  SLP.png  NPC.png                  # Branding / compliance images
├── Aniog_HQ.jpg  Farmers_in_Action.jpeg        # Photos
├── SLPA_Certification.jpg                      # DSWD Certificate of Accreditation
└── Video_Tutorial.mp4                          # Registration tutorial video
```

> `config.php` (database credentials) is **not** part of the repository and must be created locally. See [Configuration](#configuration).

---

## Database Design

`uswag_db.sql` creates the following **10 tables**:

| # | Table                    | Purpose                                                                 |
|---|--------------------------|-------------------------------------------------------------------------|
| 1 | `Accounts`               | Login accounts with role (`Buyer`, `Seller`, `SLP Admin`), hashed password, API token hash |
| 2 | `Sellers`                | Seller profiles (name, barangay zone, SLP association), linked to an account |
| 3 | `Categories`             | Product categories                                                      |
| 4 | `Products`               | Items per seller, with unit of measure, price, and live stock level     |
| 5 | `Sales`                  | Sales headers with payment status and sync status (offline/online)      |
| 6 | `Sale_Details`           | Line items per sale                                                     |
| 7 | `Inventory_Transactions` | Audit trail of stock movements (sales, spoilage, etc.)                  |
| 8 | `Expenses`               | Seller expenses                                                         |
| 9 | `Capital_Management`     | Initial capital and current balance per seller                          |
| 10| `Receipts`               | JSON receipts per paid sale, with sync status                           |

**View**
- `vw_seller_cash_flow`: per-seller total revenue, total expenses, and net cash flow

**Stored procedure**
- `sp_sync_offline_sales()`: marks `Offline` sales as `Online` and `Pending` receipts as `Synced`

**Triggers (7)**
1. `trg_check_stock_before_transaction`: blocks sales/spoilage that exceed available stock
2. `trg_update_stock_after_insert`: updates stock after a verified inventory transaction
3. `trg_update_capital_after_expense`: deducts expenses from capital balance
4. `trg_saledetails_inventory_sync`: logs an inventory audit record for each sale line
5. `trg_sales_status_capital_update`: adjusts capital when a sale switches between Paid and Pending
6. `trg_saledetails_capital_insert`: adds to capital when an item is added to an already-Paid sale
7. `trg_generate_receipt_after_sale`: creates a JSON receipt when a sale is marked Paid

**Seed data:** three categories: *Agricultural Products, Raw Materials, Handicrafts*.

The file also includes **10 ready-made operational queries** (cash-flow monitoring, inventory audit, offline-sync queue, low-stock alerts below 50 units, top-seller leaderboard, profit & loss, JSON receipt retrieval, and more).

---

## Getting Started

### Prerequisites

- PHP 7.4 or newer with the `pdo_mysql` and `curl` extensions
- MySQL 8.0+ or MariaDB
- [Composer](https://getcomposer.org/) (only needed for PHPMailer)
- A local server stack (WAMP, XAMPP, Laragon) **or** any PHP + MySQL web host

### Installation

1. **Clone or download** the project.

   ```bash
   git clone https://github.com/blumabas902pbox-dev/<your-repo-name>.git
   cd <your-repo-name>
   ```

2. **Create the database.** Create an empty database (for example `uswag_db`), then import the schema:

   - phpMyAdmin: select the database → *Import* → choose `uswag_db.sql`
   - or CLI:

     ```bash
     mysql -u <user> -p uswag_db < uswag_db.sql
     ```

   > The script contains no `CREATE DATABASE` or `USE` statements, so it imports into whichever database you select. It uses `DELIMITER //` for triggers and the procedure, which phpMyAdmin and the `mysql` CLI both handle.

3. **Create `config.php`** next to `db.php` (see below).

4. **Install PHPMailer** (for email confirmations):

   ```bash
   composer require phpmailer/phpmailer
   ```

5. **Serve the project.** Place the files in your web root (e.g. `htdocs/` or `www/`) and open `http://localhost/index.html`.

---

## Configuration

### Database: `config.php`

`db.php` loads credentials from a `config.php` file that returns an array. Keep this file out of version control (add it to `.gitignore`).

```php
<?php
return [
    'host' => 'localhost',
    'db'   => 'uswag_db',
    'user' => 'your_db_user',
    'pass' => 'your_db_password',
];
```

### Email (PHPMailer + Gmail SMTP)

In `send_email.php`, replace the placeholder password with a **Google App Password** (not your normal Gmail password):

```php
$mail->Password = 'YOUR_GMAIL_APP_PASSWORD';
```

### SMS (Semaphore)

In `process_contact.php`, replace the placeholder with your registered Semaphore API key and sender name:

```php
'apikey'     => 'YOUR_SEMAPHORE_API_KEY',
'sendername' => 'SEMAPHORE',
```

### CORS (when the frontend is on GitHub Pages)

`process_register.php` only accepts cross-origin requests from `https://blumabas902pbox-dev.github.io` and from `localhost` / `127.0.0.1`. If you host the frontend elsewhere, update the `$allowed` check at the top of that file.

> ⚠️ **Never commit real API keys, SMTP passwords, or database credentials.** Use `config.php` (git-ignored) or environment variables.

---

## Pages

| Page            | File             | Description                                                      |
|-----------------|------------------|------------------------------------------------------------------|
| Home            | `index.html`     | Association overview and photo highlights                        |
| About USWAG     | `about.html`     | Purpose of the system and the developer's portfolio link         |
| Products        | `portfolio.html` | Product gallery (copra, corn, cassava, and other local produce)  |
| Contact         | `contact.html`   | Inquiry form with subject selection and a map link               |
| Registration    | `register.html`  | Buyer/Seller sign-up with tutorial video and NPC privacy notice  |
| Confirmation    | `thankyou.html`  | Shown after registration                                         |

---

## Backend Endpoints

| File                   | Method | Purpose |
|------------------------|--------|---------|
| `process_register.php` | POST (JSON) | Single API endpoint with `action` of `register` or `login`. Handles CORS preflight (`OPTIONS`) and returns JSON. |
| `process_contact.php`  | POST (form) | Sends an SMS confirmation to the visitor's contact number through the Semaphore API. |
| `send_email.php`       | POST (form) | Sends an HTML email confirmation through Gmail SMTP using PHPMailer. |

---

## Known Issues & Next Steps

These were found while reviewing the current files and are worth resolving before production use:

- **`process_register.php` is incomplete.** The uploaded file ends after the `switch` statement. The `register()` and `login()` functions are not defined, and the `sync_sales` action mentioned in its header comment has no case.
- **Frontend/backend mismatch on registration.** `script.js` submits `FormData`, but `process_register.php` reads a JSON body (`php://input`). The registration form also has no `email` field, while `Accounts.email` is `NOT NULL UNIQUE`. The fetch handler also redirects to `thankyou.html` whether or not the request succeeds.
- **Contact form wiring.** `script.js` posts to `process_contact.php` and expects a JSON `{status: "success"}`, but that file only sends an SMS and returns no JSON. Email sending lives in `send_email.php`, which the frontend does not call. The success dialog appears even when the request fails.
- **Simulated notifications.** `dispatchContactNotification()` in `script.js` only logs to the browser console. It does not send anything.
- **Image filenames.** Pages reference files such as `Aniog HQ.jpg` (with spaces), while the uploaded assets use underscores (`Aniog_HQ.jpg`). Make names consistent or broken images will result. Several referenced gallery photos are not in this upload.
- **Missing seller/product flows.** The database supports seller dashboards, sales, and expenses, but the current pages cover registration and public content only.
- **`SLP Admin` role** exists in the database but is intentionally not offered on the registration form.

---

## Privacy & Compliance

- Registration requires explicit consent to the Terms & Conditions and the **National Privacy Commission (NPC)** privacy notice, in line with the Philippine Data Privacy Act of 2012 (RA 10173).
- Passwords are stored as hashes (`password_hash`), never in plain text.
- Collected personal data (username, address, contact number) should be used only for the association's livelihood operations.

---

## Credits & Author

- **Developer:** Bryan Jay M. Lumabas (**BJ**): BSIT, Partido State University
- **Portfolio:** [blumabas902pbox-dev.github.io/Personal-Profile](https://blumabas902pbox-dev.github.io/Personal-Profile/)
- **Beneficiary:** Samahan ng Masisinop SLPA, Aniog, Sagñay, Camarines Sur
- **Program:** DSWD Sustainable Livelihood Program (SLP), Field Office V – Bicol Region

Logos and certificate images belong to their respective owners (DSWD, the Sustainable Livelihood Program, the National Privacy Commission, and the Barangay/Municipality of Aniog, Sagñay).

---

© BJML. All rights reserved.
