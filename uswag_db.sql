-- =====================================================================================
-- PROJECT TITLE: USWAG: Unified System for Work and Growth
-- TARGET DBMS: MySQL 8.0+ / WAMP / MariaDB (InnoDB Engine)
-- DESCRIPTION: Fresh Production Schema Prepared for Real Web Application CRUD Inputs
-- =====================================================================================

-- HOSTING-READY: the DROP/CREATE DATABASE and USE lines were removed.
-- Import this file INTO the database your host gave you (phpMyAdmin > select DB > Import).
-- Running it on WAMP? Create an empty database named uswag_db first, then import.

-- =====================================================================================
-- SECTION 1: 10 TABLE SCHEMAS
-- =====================================================================================

-- 1. Accounts Table
-- Role-Based Access Control (RBAC) supporting Buyers, Sellers, and SLP Administrators.
CREATE TABLE IF NOT EXISTS Accounts (
    account_id INT PRIMARY KEY AUTO_INCREMENT,
    role ENUM('Buyer', 'Seller', 'SLP Admin') NOT NULL DEFAULT 'Buyer',
    username VARCHAR(50) NOT NULL UNIQUE,
    email VARCHAR(100) NOT NULL UNIQUE,
    contact_number VARCHAR(15) NOT NULL,
    address VARCHAR(150) NULL,
    password_hash VARCHAR(255) NOT NULL,
    api_token_hash CHAR(64) NULL,
    is_active TINYINT(1) DEFAULT 1,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT uq_account_contact UNIQUE (contact_number)
) ENGINE=InnoDB;

-- 2. Sellers Table
-- Profiles of local farmers, weavers, and SLP micro-entrepreneurs linked to system accounts.
CREATE TABLE IF NOT EXISTS Sellers (
    seller_id INT PRIMARY KEY AUTO_INCREMENT,
    account_id INT UNIQUE NULL,
    first_name VARCHAR(50) NOT NULL,
    last_name VARCHAR(50) NOT NULL,
    contact_number VARCHAR(15),
    barangay_zone VARCHAR(50) NOT NULL,
    slp_association VARCHAR(100) DEFAULT 'SLP Community Association',
    join_date DATE DEFAULT (CURRENT_DATE),
    FOREIGN KEY (account_id) REFERENCES Accounts(account_id) ON DELETE SET NULL,
    CONSTRAINT uq_seller_contact UNIQUE (contact_number)
) ENGINE=InnoDB;

-- 3. Categories Table
-- Classifies products into sector groupings (e.g., Agricultural, Handicrafts, Raw Materials).
CREATE TABLE IF NOT EXISTS Categories (
    category_id INT PRIMARY KEY AUTO_INCREMENT,
    category_name VARCHAR(50) NOT NULL UNIQUE
) ENGINE=InnoDB;

-- 4. Products Table
-- Manages inventory items per seller, tracking active prices and live stock levels.
CREATE TABLE IF NOT EXISTS Products (
    product_id INT PRIMARY KEY AUTO_INCREMENT,
    seller_id INT NOT NULL,
    category_id INT NOT NULL,
    product_name VARCHAR(100) NOT NULL,
    unit_of_measure VARCHAR(20) NOT NULL,
    unit_price DECIMAL(10, 2) NOT NULL DEFAULT 0.00,
    current_stock DECIMAL(10, 3) NOT NULL DEFAULT 0.000,
    FOREIGN KEY (seller_id) REFERENCES Sellers(seller_id) ON DELETE CASCADE,
    FOREIGN KEY (category_id) REFERENCES Categories(category_id) ON DELETE RESTRICT,
    CONSTRAINT chk_unit_price CHECK (unit_price >= 0.00),
    CONSTRAINT chk_current_stock CHECK (current_stock >= 0.000),
    CONSTRAINT uq_product_seller UNIQUE (product_name, seller_id)
) ENGINE=InnoDB;

-- 5. Sales Table
-- Transaction header recording sale metadata, buyer details, payment status, and offline sync state.
CREATE TABLE IF NOT EXISTS Sales (
    sale_id INT PRIMARY KEY AUTO_INCREMENT,
    seller_id INT NOT NULL,
    buyer_account_id INT NULL,
    sale_date DATETIME DEFAULT CURRENT_TIMESTAMP,
    status ENUM('Paid', 'Pending') DEFAULT 'Paid',
    sync_status ENUM('Online', 'Offline') DEFAULT 'Online',
    client_id CHAR(36) NULL,
    FOREIGN KEY (seller_id) REFERENCES Sellers(seller_id) ON DELETE CASCADE,
    FOREIGN KEY (buyer_account_id) REFERENCES Accounts(account_id) ON DELETE SET NULL,
    CONSTRAINT uq_sales_client_id UNIQUE (client_id)
) ENGINE=InnoDB;

-- 6. Sale_Details Table
-- Individual line items per sale with calculated stored line totals.
CREATE TABLE IF NOT EXISTS Sale_Details (
    sale_detail_id INT PRIMARY KEY AUTO_INCREMENT,
    sale_id INT NOT NULL,
    product_id INT NOT NULL,
    quantity_sold DECIMAL(10, 3) NOT NULL,
    unit_price_at_sale DECIMAL(10, 2) NOT NULL,
    line_total DECIMAL(10, 2) GENERATED ALWAYS AS (quantity_sold * unit_price_at_sale) STORED,
    FOREIGN KEY (sale_id) REFERENCES Sales(sale_id) ON DELETE CASCADE,
    FOREIGN KEY (product_id) REFERENCES Products(product_id) ON DELETE RESTRICT,
    CONSTRAINT chk_qty_sold CHECK (quantity_sold > 0.000),
    CONSTRAINT chk_sale_unit_price CHECK (unit_price_at_sale >= 0.00)
) ENGINE=InnoDB;

-- 7. Inventory_Transactions Table
-- Audit trail tracking stock movements: harvests, restocks, sales, and spoilage.
CREATE TABLE IF NOT EXISTS Inventory_Transactions (
    transaction_id INT PRIMARY KEY AUTO_INCREMENT,
    product_id INT NOT NULL,
    sale_detail_id INT NULL,
    transaction_type ENUM('Harvest/Restock', 'Sale', 'Spoilage', 'Adjustment') NOT NULL,
    verification_status ENUM('Pending Review', 'Verified', 'Rejected') DEFAULT 'Pending Review',
    quantity DECIMAL(10, 3) NOT NULL,
    transaction_date DATETIME DEFAULT CURRENT_TIMESTAMP,
    remarks VARCHAR(150),
    FOREIGN KEY (product_id) REFERENCES Products(product_id) ON DELETE CASCADE,
    FOREIGN KEY (sale_detail_id) REFERENCES Sale_Details(sale_detail_id) ON DELETE SET NULL,
    CONSTRAINT chk_trans_quantity CHECK (quantity <> 0.000)
) ENGINE=InnoDB;

-- 8. Expenses Table
-- Tracks operational and production costs incurred by micro-entrepreneurs.
CREATE TABLE IF NOT EXISTS Expenses (
    expense_id INT PRIMARY KEY AUTO_INCREMENT,
    seller_id INT NOT NULL,
    expense_category ENUM('Raw Materials/Seeds', 'Labor', 'Equipment', 'Other') NOT NULL,
    amount DECIMAL(10, 2) NOT NULL,
    expense_date DATETIME DEFAULT CURRENT_TIMESTAMP,
    description VARCHAR(150),
    FOREIGN KEY (seller_id) REFERENCES Sellers(seller_id) ON DELETE CASCADE,
    CONSTRAINT chk_expense_amount CHECK (amount >= 0.00)
) ENGINE=InnoDB;

-- 9. Capital_Management Table
-- Financial ledger tracking active working capital and cash balances per seller.
CREATE TABLE IF NOT EXISTS Capital_Management (
    capital_id INT PRIMARY KEY AUTO_INCREMENT,
    seller_id INT NOT NULL,
    initial_capital DECIMAL(10, 2) NOT NULL DEFAULT 0.00,
    current_balance DECIMAL(10, 2) NOT NULL DEFAULT 0.00,
    last_updated DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (seller_id) REFERENCES Sellers(seller_id) ON DELETE CASCADE,
    CONSTRAINT uq_capital_seller UNIQUE (seller_id),
    CONSTRAINT chk_initial_capital CHECK (initial_capital >= 0.00)
) ENGINE=InnoDB;

-- 10. Receipts Table
-- Stores formatted JSON receipts for thermal printing and offline sync verification.
CREATE TABLE IF NOT EXISTS Receipts (
    receipt_id BIGINT PRIMARY KEY AUTO_INCREMENT,
    sale_id INT NOT NULL,
    account_id INT NULL,
    receipt_number VARCHAR(50) NOT NULL UNIQUE,
    receipt_type ENUM('Online', 'Offline') DEFAULT 'Online',
    receipt_data JSON NOT NULL,
    issued_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    is_downloaded TINYINT(1) DEFAULT 0,
    sync_status ENUM('Pending', 'Synced') DEFAULT 'Synced',
    FOREIGN KEY (sale_id) REFERENCES Sales(sale_id) ON DELETE CASCADE,
    FOREIGN KEY (account_id) REFERENCES Accounts(account_id) ON DELETE SET NULL
) ENGINE=InnoDB;

-- =====================================================================================
-- SECTION 2: PERFORMANCE INDEXES
-- =====================================================================================

CREATE INDEX idx_sales_seller_status ON Sales(seller_id, status);
CREATE INDEX idx_saledetails_product ON Sale_Details(product_id);
CREATE INDEX idx_expenses_seller ON Expenses(seller_id);
CREATE INDEX idx_transactions_type ON Inventory_Transactions(transaction_type);
CREATE INDEX idx_accounts_login ON Accounts(username, email, contact_number, is_active);
CREATE INDEX idx_accounts_token ON Accounts(api_token_hash);
CREATE INDEX idx_sales_sync ON Sales(sync_status, sale_date);
CREATE INDEX idx_receipts_sync ON Receipts(sync_status, issued_at);

-- =====================================================================================
-- SECTION 3: VIEWS, PROCEDURES & AUTOMATION TRIGGERS
-- =====================================================================================

-- View: Aggregated Seller Cash Flow Summary
DROP VIEW IF EXISTS vw_seller_cash_flow;
CREATE VIEW vw_seller_cash_flow AS
SELECT 
    s.seller_id,
    CONCAT(s.first_name, ' ', s.last_name) AS seller_name,
    s.barangay_zone,
    s.slp_association,
    COALESCE(sales_summary.total_sales, 0.00) AS total_sales_revenue,
    COALESCE(expense_summary.total_expense, 0.00) AS total_expenses,
    (COALESCE(sales_summary.total_sales, 0.00) - COALESCE(expense_summary.total_expense, 0.00)) AS net_cash_flow
FROM Sellers s
LEFT JOIN (
    SELECT sa.seller_id, SUM(sd.line_total) AS total_sales
    FROM Sales sa
    JOIN Sale_Details sd ON sa.sale_id = sd.sale_id
    WHERE sa.status = 'Paid'
    GROUP BY sa.seller_id
) sales_summary ON s.seller_id = sales_summary.seller_id
LEFT JOIN (
    SELECT seller_id, SUM(amount) AS total_expense
    FROM Expenses
    GROUP BY seller_id
) expense_summary ON s.seller_id = expense_summary.seller_id;

DELIMITER //

-- STORED PROCEDURE: Batch Synchronization of Offline Transactions
CREATE PROCEDURE sp_sync_offline_sales()
BEGIN
    UPDATE Sales 
    SET sync_status = 'Online' 
    WHERE sync_status = 'Offline';

    UPDATE Receipts 
    SET sync_status = 'Synced' 
    WHERE sync_status = 'Pending';
END;
//

-- TRIGGER 1: Check available stock before saving sales or spoilage inventory entries.
CREATE TRIGGER trg_check_stock_before_transaction
BEFORE INSERT ON Inventory_Transactions
FOR EACH ROW
BEGIN
    DECLARE current_qty DECIMAL(10, 3);
    IF NEW.verification_status = 'Verified' AND NEW.transaction_type IN ('Sale', 'Spoilage') THEN
        SELECT current_stock INTO current_qty FROM Products WHERE product_id = NEW.product_id FOR UPDATE;
        IF current_qty < NEW.quantity THEN
            SIGNAL SQLSTATE '45000' SET MESSAGE_TEXT = 'Error: Insufficient inventory stock available.';
        END IF;
    END IF;
END;
//

-- TRIGGER 2: Update current stock automatically after a verified inventory transaction.
CREATE TRIGGER trg_update_stock_after_insert
AFTER INSERT ON Inventory_Transactions
FOR EACH ROW
BEGIN
    IF NEW.verification_status = 'Verified' THEN
        IF NEW.transaction_type IN ('Harvest/Restock', 'Adjustment') THEN
            UPDATE Products SET current_stock = current_stock + NEW.quantity WHERE product_id = NEW.product_id;
        ELSEIF NEW.transaction_type IN ('Sale', 'Spoilage') THEN
            UPDATE Products SET current_stock = current_stock - NEW.quantity WHERE product_id = NEW.product_id;
        END IF;
    END IF;
END;
//

-- TRIGGER 3: Deduct money from the seller's capital balance when an expense is recorded.
CREATE TRIGGER trg_update_capital_after_expense
AFTER INSERT ON Expenses
FOR EACH ROW
BEGIN
    UPDATE Capital_Management SET current_balance = current_balance - NEW.amount WHERE seller_id = NEW.seller_id;
END;
//

-- TRIGGER 4: Automatically log an inventory audit record whenever a sale detail is added.
CREATE TRIGGER trg_saledetails_inventory_sync
AFTER INSERT ON Sale_Details
FOR EACH ROW
BEGIN
    INSERT INTO Inventory_Transactions (product_id, sale_detail_id, transaction_type, verification_status, quantity, remarks)
    VALUES (NEW.product_id, NEW.sale_detail_id, 'Sale', 'Verified', NEW.quantity_sold, CONCAT('Auto-deduction for Sale #', NEW.sale_id));
END;
//

-- TRIGGER 5: Adjust capital balance when sale status switches between Paid and Pending.
CREATE TRIGGER trg_sales_status_capital_update
AFTER UPDATE ON Sales
FOR EACH ROW
BEGIN
    DECLARE total_sale_value DECIMAL(10, 2) DEFAULT 0.00;
    SELECT COALESCE(SUM(line_total), 0.00) INTO total_sale_value FROM Sale_Details WHERE sale_id = NEW.sale_id;
    IF OLD.status = 'Pending' AND NEW.status = 'Paid' THEN
        UPDATE Capital_Management SET current_balance = current_balance + total_sale_value WHERE seller_id = NEW.seller_id;
    ELSEIF OLD.status = 'Paid' AND NEW.status = 'Pending' THEN
        UPDATE Capital_Management SET current_balance = current_balance - total_sale_value WHERE seller_id = NEW.seller_id;
    END IF;
END;
//

-- TRIGGER 6: Add money to seller capital when a new item is added to an already Paid sale.
CREATE TRIGGER trg_saledetails_capital_insert
AFTER INSERT ON Sale_Details
FOR EACH ROW
BEGIN
    DECLARE parent_status VARCHAR(20);
    DECLARE parent_seller INT;
    SELECT status, seller_id INTO parent_status, parent_seller FROM Sales WHERE sale_id = NEW.sale_id;
    IF parent_status = 'Paid' THEN
        UPDATE Capital_Management SET current_balance = current_balance + NEW.line_total WHERE seller_id = parent_seller;
    END IF;
END;
//

-- TRIGGER 7: Automatically create a JSON receipt entry whenever a sale is marked Paid.
CREATE TRIGGER trg_generate_receipt_after_sale
AFTER INSERT ON Sales
FOR EACH ROW
BEGIN
    IF NEW.status = 'Paid' THEN
        INSERT INTO Receipts (sale_id, account_id, receipt_number, receipt_type, receipt_data, sync_status)
        VALUES (
            NEW.sale_id,
            NEW.buyer_account_id,
            CONCAT('USWAG-', DATE_FORMAT(NEW.sale_date, '%Y%m%d'), '-', LPAD(NEW.sale_id, 5, '0')),
            NEW.sync_status,
            JSON_OBJECT(
                'system', 'USWAG LIVELIHOOD SYSTEM',
                'seller_id', NEW.seller_id,
                'sale_id', NEW.sale_id,
                'timestamp', NEW.sale_date,
                'payment_status', 'PROCESSED'
            ),
            IF(NEW.sync_status = 'Offline', 'Pending', 'Synced')
        );
    END IF;
END;
//

DELIMITER ;

-- =====================================================================================
-- SECTION 4: SYSTEM BASELINE LOOKUP DATA
-- =====================================================================================

-- Baseline Product Categories (Required for web forms dropdown menus)
INSERT INTO Categories (category_name) VALUES 
('Agricultural Products'), 
('Raw Materials'),
('Handicrafts');

-- =====================================================================================
-- SECTION 5: OPERATIONAL & ANALYTICAL QUERIES (Ready for Dynamic Web Application Use)
-- =====================================================================================

-- Query 1: SLP Admin Cash Flow Monitoring View
SELECT seller_id, seller_name, barangay_zone, slp_association, total_sales_revenue, total_expenses, net_cash_flow 
FROM vw_seller_cash_flow 
ORDER BY net_cash_flow DESC;

-- Query 2: Inventory Audit Trail Verification
SELECT t.transaction_id, p.product_name, t.transaction_type, t.quantity, t.verification_status, t.remarks, t.transaction_date
FROM Inventory_Transactions t
JOIN Products p ON t.product_id = p.product_id
ORDER BY t.transaction_date DESC;

-- Query 3: Offline Synchronization Queue Inspection
SELECT s.sale_id, s.seller_id, s.sync_status AS sale_sync, r.receipt_number, r.sync_status AS receipt_sync
FROM Sales s
LEFT JOIN Receipts r ON s.sale_id = r.sale_id
WHERE s.sync_status = 'Offline' OR r.sync_status = 'Pending';

-- Query 4: Performance Execution Plan Evaluation
EXPLAIN SELECT sa.sale_id, sa.seller_id, SUM(sd.line_total) AS total_amount
FROM Sales sa
JOIN Sale_Details sd ON sa.sale_id = sd.sale_id
WHERE sa.status = 'Paid' AND sa.seller_id = 1
GROUP BY sa.sale_id, sa.seller_id;

-- Query 5: Product Category Sales & Revenue Breakdown
SELECT c.category_name, COUNT(DISTINCT p.product_id) AS total_products, COALESCE(SUM(sd.quantity_sold), 0) AS units_sold, COALESCE(SUM(sd.line_total), 0.00) AS total_revenue
FROM Categories c
LEFT JOIN Products p ON c.category_id = p.category_id
LEFT JOIN Sale_Details sd ON p.product_id = sd.product_id
GROUP BY c.category_id, c.category_name
ORDER BY total_revenue DESC;

-- Query 6: Low Stock Alert (< 50 units remaining)
SELECT p.product_id, p.product_name, CONCAT(s.first_name, ' ', s.last_name) AS seller_name, p.current_stock, p.unit_of_measure
FROM Products p
JOIN Sellers s ON p.seller_id = s.seller_id
WHERE p.current_stock < 50.000
ORDER BY p.current_stock ASC;

-- Query 7: Top-Performing Sellers Leaderboard
SELECT s.seller_id, CONCAT(s.first_name, ' ', s.last_name) AS seller_name, s.slp_association, COUNT(DISTINCT sa.sale_id) AS completed_sales, COALESCE(SUM(sd.line_total), 0.00) AS gross_earnings
FROM Sellers s
JOIN Sales sa ON s.seller_id = sa.seller_id
JOIN Sale_Details sd ON sa.sale_id = sd.sale_id
WHERE sa.status = 'Paid'
GROUP BY s.seller_id, s.first_name, s.last_name, s.slp_association
ORDER BY gross_earnings DESC;

-- Query 8: Micro-Entrepreneur Profit & Loss Statement
SELECT s.seller_id, CONCAT(s.first_name, ' ', s.last_name) AS seller_name, cm.initial_capital, cm.current_balance, COALESCE(e.total_expense, 0.00) AS total_expenses
FROM Sellers s
JOIN Capital_Management cm ON s.seller_id = cm.seller_id
LEFT JOIN (
    SELECT seller_id, SUM(amount) AS total_expense FROM Expenses GROUP BY seller_id
) e ON s.seller_id = e.seller_id
WHERE s.seller_id = 1;

-- Query 9: Thermal Printer JSON Receipt Retrieval
SELECT receipt_id, receipt_number, JSON_UNQUOTE(JSON_EXTRACT(receipt_data, '$.system')) AS system_header, JSON_UNQUOTE(JSON_EXTRACT(receipt_data, '$.payment_status')) AS status
FROM Receipts
WHERE sync_status = 'Synced';

-- Query 10: Active User Authentication Audit
SELECT account_id, username, email, role, is_active, created_at
FROM Accounts
WHERE is_active = 1 AND role IN ('SLP Admin', 'Seller')
ORDER BY created_at DESC;