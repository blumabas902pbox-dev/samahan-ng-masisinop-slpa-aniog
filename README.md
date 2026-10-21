# USWAG
### Unified System for Work and Growth

A livelihood-tracking web system developed for **Samahan ng Masisinop SLPA**, a Sustainable Livelihood Program Association (SLPA) located in **Barangay Aniog, Sagñay, Camarines Sur, Philippines**.

USWAG provides both:

- A public-facing website for promoting local products and the organization.
- A database-driven livelihood management system for tracking sellers, products, inventory, expenses, capital, sales, and receipts.

This project was developed as a Bachelor of Science in Information Technology (BSIT) project at **Partido State University** in support of the **Department of Social Welfare and Development (DSWD) Sustainable Livelihood Program (SLP)**.

---

## 📋 Table of Contents

- [About the Project](#about-the-project)
- #objectives
- [Features](#features)
- #technology-stack
- [Project Structure](#project-structure)
- [Database Design](#database-design)
- [Getting Started](#getting-started)
- [Configuration](#configuration)
- [Pages](#pages)
- #privacy-and-compliance
- #future-improvements
- #credits-and-author

---

## About the Project

**Samahan ng Masisinop SLPA** is a DSWD-accredited livelihood organization whose members engage in the production and trade of:

- Copra
- Yellow Corn
- Palay (Rice)
- Cassava
- Other agricultural products

USWAG was designed to modernize record-keeping and provide digital visibility for local farmers and micro-entrepreneurs.

The system combines:

- Website presence
- Seller and buyer registration
- Product showcasing
- Livelihood monitoring
- Financial tracking
- Offline-first sales synchronization

---

## Objectives

USWAG aims to:

- Promote the association and its products online.
- Allow Buyers and Sellers to create accounts.
- Maintain accurate records of sales and inventory.
- Track expenses and capital investments.
- Support offline-first transactions.
- Generate digital receipt records.
- Improve operational transparency for association members.

---

## ✨ Features

### Public Website

- Responsive multi-page interface
- Shared navigation and footer
- Image galleries and product showcases
- Welcome modal with localStorage support
- Lazy-loaded product images
- Registration tutorial video
- Contact page with inquiry categories
- Mobile-friendly design

### User Registration

- Buyer registration
- Seller registration
- Password strength validation
- 11-digit contact number validation
- Prevention of weak passwords
- Terms and Conditions acceptance
- NPC Privacy Notice acceptance

### Communication

- Contact inquiry form
- Email confirmation support
- SMS confirmation support via Semaphore API

### Database Features

- 10 normalized tables
- Foreign key enforcement
- Stored procedures
- SQL views
- Business automation triggers
- Inventory monitoring
- Livelihood financial tracking

### Sales Management

- Sales records
- Inventory updates
- Capital monitoring
- Expense tracking
- JSON receipt generation
- Offline-to-online synchronization

---

## 🛠 Technology Stack

| Layer | Technology |
|---------|------------|
| Frontend | HTML5, CSS3, JavaScript |
| Libraries | Font Awesome 6.5.1, Canvas Confetti 1.6.0 |
| Backend | PHP 7.4+ (PDO) |
| Database | MySQL 8.0+ / MariaDB |
| Email Service | PHPMailer via Gmail SMTP |
| SMS Service | Semaphore API |
| Hosting | GitHub Pages (Frontend) + PHP/MySQL Host |

---

## 📁 Project Structure

```text
USWAG/
│
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
│
├── uswag_db.sql
│
├── logo.png
├── SLP.png
├── NPC.png
├── Aniog_HQ.jpg
├── Farmers_in_Action.jpeg
├── SLPA_Certification.jpg
├── Video_Tutorial.mp4
│
└── config.php
```

> **Note:** `config.php` is intentionally excluded from the repository for security purposes.

---

## 🗄 Database Design

The database consists of **10 normalized tables**:

| Table | Purpose |
|---------|---------|
| Accounts | User accounts and roles |
| Sellers | Seller information |
| Categories | Product categories |
| Products | Product records |
| Sales | Sales transactions |
| Sale_Details | Individual sale items |
| Inventory_Transactions | Stock movement history |
| Expenses | Operational expenses |
| Capital_Management | Capital monitoring |
| Receipts | JSON receipt records |

### Database View

#### `vw_seller_cash_flow`

Provides:

- Total revenue
- Total expenses
- Net cash flow

per seller.

---

### Stored Procedure

#### `sp_sync_offline_sales()`

Processes:

- Offline transactions
- Unsynced receipts

and updates synchronization status.

---

### Triggers

The database includes automated triggers for:

1. Stock availability validation
2. Inventory deduction
3. Capital balance adjustment
4. Sale inventory synchronization
5. Payment status updates
6. Additional paid-sale adjustments
7. Automatic receipt generation

---

### Seed Data

Included categories:

- Agricultural Products
- Raw Materials
- Handicrafts

---

## 🚀 Getting Started

### Prerequisites

- PHP 7.4+
- MySQL 8.0+ or MariaDB
- Composer
- XAMPP, WAMP, Laragon, or equivalent

---

### Installation

#### Clone the Repository

```bash
git clone https://github.com/your-username/uswag.git
cd uswag
```

#### Create the Database

Create a database named:

```sql
uswag_db
```

Import the schema:

```bash
mysql -u username -p uswag_db < uswag_db.sql
```

or through **phpMyAdmin**.

---

#### Create `config.php`

```php
<?php

define('DB_HOST', 'localhost');
define('DB_NAME', 'uswag_db');
define('DB_USER', 'root');
define('DB_PASS', '');

?>
```

---

#### Install PHPMailer

```bash
composer require phpmailer/phpmailer
```

---

#### Run the Project

Place the project in your web server root directory.

Example:

```text
xampp/htdocs/uswag
```

Open:

```text
http://localhost/uswag/
```

---

## ⚙ Configuration

### Gmail SMTP

Configure:

```php
$mail->Host = 'smtp.gmail.com';
$mail->Username = 'your_email@gmail.com';
$mail->Password = 'your_app_password';
```

### Semaphore API

Configure:

```php
$apiKey = "YOUR_SEMAPHORE_API_KEY";
```

---

## 🌐 Pages

| Page | File |
|--------|--------|
| Home | index.html |
| About | about.html |
| Products | portfolio.html |
| Contact | contact.html |
| Registration | register.html |
| Confirmation | thankyou.html |

---

## 🔐 Privacy and Compliance

USWAG follows the principles of the Philippine **Data Privacy Act of 2012 (Republic Act No. 10173)**.

Measures include:

- User consent collection
- Password hashing
- Controlled access to user information
- Privacy Notice acknowledgment
- Secure credential management

Collected information is used solely for livelihood-related operations and organizational purposes.

---

## 🔮 Future Improvements

Potential enhancements include:

- Seller dashboard
- Admin analytics panel
- Mobile application integration
- QR-coded receipts
- Live inventory alerts
- Sales forecasting
- Multi-association support
- Cloud synchronization

---

## 👨‍💻 Credits and Author

### Developer

**Bryan Jay M. Lumabas**  
Bachelor of Science in Information Technology  
Partido State University

### Portfolio

🔗 https://blumabas902pbox-dev.github.io/Personal-Profile/

### Beneficiary Organization

**Samahan ng Masisinop SLPA**  
Aniog, Sagñay, Camarines Sur

### Partner Program

**DSWD Sustainable Livelihood Program (SLP)**  
Field Office V – Bicol Region

---

## Acknowledgments

Special thanks to:

- Department of Social Welfare and Development (DSWD)
- Sustainable Livelihood Program (SLP)
- National Privacy Commission (NPC)
- Samahan ng Masisinop SLPA
- Partido State University

---

© 2026 Bryan Jay M. Lumabas. All Rights Reserved.
