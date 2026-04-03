-- Webzio International Accounting System v2
-- Evolution Script: Multi-Account, Auth, & Soft-Delete

-- USERS Table (Auth)
CREATE TABLE IF NOT EXISTS users (
  id VARCHAR(50) PRIMARY KEY,
  name VARCHAR(255) NOT NULL,
  email VARCHAR(255) UNIQUE NOT NULL,
  password VARCHAR(255) NOT NULL, -- Hashed
  role VARCHAR(50) DEFAULT 'staff', -- admin | staff
  isActive BOOLEAN DEFAULT TRUE,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- ACCOUNTS Table
CREATE TABLE IF NOT EXISTS accounts (
  id VARCHAR(50) PRIMARY KEY,
  name VARCHAR(255) NOT NULL, -- Cash, Bank, etc.
  type VARCHAR(50),
  balance DECIMAL(15, 2) DEFAULT 0,
  isActive BOOLEAN DEFAULT TRUE,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Seed Default Accounts if they don't exist
INSERT IGNORE INTO accounts (id, name, type, balance) VALUES 
('acc_cash', 'Cash', 'cash', 0),
('acc_bank', 'Bank', 'bank', 0),
('acc_upi', 'UPI', 'upi', 0),
('acc_petty', 'Petty Cash', 'cash', 0);

-- Update Existing Tables (MySQL dialect for safe Alter)
-- People
ALTER TABLE people ADD COLUMN IF NOT EXISTS isActive BOOLEAN DEFAULT TRUE;

-- Projects
ALTER TABLE projects ADD COLUMN IF NOT EXISTS isActive BOOLEAN DEFAULT TRUE;
ALTER TABLE projects ADD COLUMN IF NOT EXISTS status VARCHAR(50) DEFAULT 'Active';

-- Transactions
ALTER TABLE transactions ADD COLUMN IF NOT EXISTS account_id VARCHAR(50);
ALTER TABLE transactions SET DEFAULT 'acc_cash' FOR account_id; -- Migration
ALTER TABLE transactions ADD COLUMN IF NOT EXISTS status VARCHAR(50) DEFAULT 'Paid';
ALTER TABLE transactions ADD COLUMN IF NOT EXISTS isActive BOOLEAN DEFAULT TRUE;
ALTER TABLE transactions ADD COLUMN IF NOT EXISTS createdBy VARCHAR(50);
ALTER TABLE transactions ADD COLUMN IF NOT EXISTS attachment TEXT;

-- RECURRING RULES Table
CREATE TABLE IF NOT EXISTS recurring_rules (
  id VARCHAR(50) PRIMARY KEY,
  transaction_template_id VARCHAR(50),
  frequency VARCHAR(50) NOT NULL, -- weekly | monthly
  next_date DATE NOT NULL,
  isActive BOOLEAN DEFAULT TRUE,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (transaction_template_id) REFERENCES transactions(id) ON DELETE CASCADE
);
