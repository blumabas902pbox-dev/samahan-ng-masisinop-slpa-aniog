# USWAG — Unified System for Work and Growth

A livelihood-tracking web system for **Samahan ng Masisinop SLPA**, a Sustainable Livelihood Program Association (SLPA) in **Barangay Aniog, Sagñay, Camarines Sur** (Region V, Bicol).

USWAG provides a public-facing website and a database-driven management system designed to support local farmers and micro-entrepreneurs. The platform helps track sellers, products, inventory, sales, expenses, capital, and receipts while promoting the association's products online.

Developed as a BSIT project at Partido State University in support of the DSWD Sustainable Livelihood Program (SLP).

---

## Table of Contents

- [About the Project](#about-the-project)
- [Features](#features)
- [Tech Stack](#tech-stack)
- [Project Structure](#project-structure)
- [Database Design](#database-design)
- [Getting Started](#getting-started)
- [Pages](#pages)
- [Privacy & Compliance](#privacy--compliance)
- [Credits & Author](#credits--author)

---

## About the Project

**Samahan ng Masisinop SLPA** is a DSWD-accredited beneficiary civil society organization based in Aniog, Sagñay, Camarines Sur. Members produce and trade local agricultural products such as:

- Copra
- Yellow Corn
- Palay (Rice)
- Cassava

USWAG aims to:

- Promote the association and its products online.
- Allow Buyers and Sellers to register and manage accounts.
- Maintain records of sales, inventory, expenses, and capital.
- Support offline-first sales synchronization in areas with limited internet connectivity.
- Generate digital receipts suitable for thermal printer output.

---

## Features

### Public Website

- Responsive multi-page website
- Shared navigation and footer
- Welcome modal with localStorage support
- Product gallery with image carousels
- Lazy-loading effects and loading indicators
- Registration tutorial video
- Confetti animations for successful actions

### Registration System

- Buyer and Seller role selection
- Client-side form validation
- Contact number verification
- Password strength checking
- Terms and Conditions agreement
- NPC Privacy Notice acceptance

### Contact System

- Inquiry categories:
  - Buying Products
  - Selling Products
  - Member Benefits
  - Registration
  - General Inquiry
- Confirmation notifications through SMS or email

### Database Features

- 10 normalized database tables
- Foreign key relationships and indexing
- Cash-flow reporting view
- Offline synchronization procedure
- Automated business logic using triggers
- Role-based accounts:
  - Buyer
  - Seller
  - SLP Admin

---

## Tech Stack

| Layer | Technology |
|---------|------------|
| Frontend | HTML5, CSS3, Vanilla JavaScript |
| Libraries | Font Awesome 6.5.1, Canvas Confetti 1.6.0 |
| Backend | PHP 7.4+ (PDO) |
| Database | MySQL 8.0+ / MariaDB |
| Email | PHPMailer |
| SMS | Semaphore API |
| Hosting | GitHub Pages (frontend) and PHP/MySQL hosting |

---

## Project Structure

```text
.
├── index.html
├── about.html
├── portfolio.html
├── contact.html
├── register.html
├── thankyou.html
│
├── styles.css
├── script.js
│
├── db.php
├── process_register.php
├── process_contact.php
├── send_email.php
├── uswag_db.sql
│
├── logo.png
├── SLP.png
├── NPC.png
├── Aniog_HQ.jpg
├── Farmers_in_Action.jpeg
├── SLPA_Certification.jpg
└── Video_Tutorial.mp4
```

---

## Database Design

The `uswag_db.sql` file creates ten core tables:

| # | Table | Purpose |
|---|--------|---------|
| 1 | Accounts | Login accounts and roles |
| 2 | Sellers | Seller profiles |
| 3 | Categories | Product categories |
| 4 | Products | Products and stock information |
| 5 | Sales | Sales transactions |
| 6 | Sale_Details | Individual sale items |
| 7 | Inventory_Transactions | Inventory movement history |
| 8 | Expenses | Seller expenses |
| 9 | Capital_Management | Capital tracking |
| 10 | Receipts | JSON receipt storage |

### Database View

- `vw_seller_cash_flow`
  - Revenue tracking
  - Expense tracking
  - Net cash flow reporting

### Stored Procedure

- `sp_sync_offline_sales()`
  - Synchronizes offline transactions
  - Updates pending receipt status

### Database Triggers

- Stock validation before transactions
- Automatic stock updates
- Capital deduction from expenses
- Inventory audit logging
- Capital adjustments on sales status updates
- Capital updates for paid sales additions
- Automatic receipt generation

### Included Sample Queries

The SQL file also contains ready-made operational queries for:

- Cash-flow analysis
- Inventory audits
- Offline-sync monitoring
- Low-stock detection
- Seller performance rankings
- Profit and loss reporting
- Receipt retrieval

---

## Getting Started

### Prerequisites

- PHP 7.4 or newer
- PDO MySQL Extension
- cURL Extension
- MySQL 8.0+ or MariaDB
- Composer (for PHPMailer)
- XAMPP, WAMP, Laragon, or a compatible web host

### Installation

#### Clone the Repository

```bash
git clone https://github.com/your-username/uswag.git
cd uswag
```

#### Create the Database

Import the SQL file using phpMyAdmin or the command line:

```bash
mysql -u username -p database_name < uswag_db.sql
```

#### Install PHPMailer

```bash
composer require phpmailer/phpmailer
```

#### Run the Project

Place the project folder inside your web server's root directory and access:

```text
http://localhost/index.html
```

---

## Pages

| Page | File | Description |
|--------|------|-------------|
| Home | index.html | Association overview and featured images |
| About | about.html | Information about USWAG and the organization |
| Products | portfolio.html | Product showcase and gallery |
| Contact | contact.html | Inquiry form and contact details |
| Registration | register.html | Buyer and Seller registration |
| Confirmation | thankyou.html | Registration success page |

---

## Privacy & Compliance

- Registration requires user consent to the Terms and Conditions.
- Registration requires acceptance of the National Privacy Commission (NPC) Privacy Notice.
- Passwords are securely stored using hashing.
- Personal information is used only for legitimate livelihood operations.
- The project follows the principles of the Philippine Data Privacy Act of 2012 (RA 10173).

---

## Credits & Author

**Developer**  
Bryan Jay M. Lumabas (BJ)  
BSIT, Partido State University

**Portfolio**  
https://blumabas902pbox-dev.github.io/Personal-Profile/

**Beneficiary Organization**  
Samahan ng Masisinop SLPA  
Aniog, Sagñay, Camarines Sur

**Program Partner**  
DSWD Sustainable Livelihood Program (SLP)  
Field Office V – Bicol Region

---

Logos, certification images, and organizational assets belong to their respective owners.

© BJML. All Rights Reserved.
