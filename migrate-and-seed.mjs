// Webzio International — Database Migration + Seed Script
// Run: node migrate-and-seed.mjs
// 
// This script will:
//   1. Create/update all tables (users, accounts, people, projects, transactions, recurring_rules)
//   2. Seed default accounts (Cash, Bank, UPI, Petty Cash)
//   3. Create the admin user (or update if already exists)

import mysql from 'mysql2/promise';
import { createInterface } from 'readline';

const config = {
  host: 'db46096.public.databaseasp.net',
  user: 'db46096',
  password: 'WebzioWeb',
  database: 'db46096',
  port: 3306,
  ssl: false,
};

const rl = createInterface({ input: process.stdin, output: process.stdout });
const ask = (q) => new Promise(res => rl.question(q, res));

async function run() {
  console.log('\n🚀 Webzio International — Database Migration & Seed');
  console.log('═══════════════════════════════════════════════════\n');

  let conn;
  try {
    console.log('⏳ Connecting to database...');
    conn = await mysql.createConnection(config);
    console.log('✅ Connected to MySQL.\n');

    // ─── STEP 1: CREATE / UPDATE ALL TABLES ─────────────────────────

    console.log('📦 Step 1: Creating/updating tables...\n');

    // USERS
    await conn.query(`
      CREATE TABLE IF NOT EXISTS users (
        id VARCHAR(50) PRIMARY KEY,
        name VARCHAR(255) NOT NULL,
        email VARCHAR(255) UNIQUE NOT NULL,
        password VARCHAR(255) NOT NULL,
        role VARCHAR(50) DEFAULT 'staff',
        isActive BOOLEAN DEFAULT TRUE,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      )
    `);
    console.log('   ✅ users');

    // ACCOUNTS
    await conn.query(`
      CREATE TABLE IF NOT EXISTS accounts (
        id VARCHAR(50) PRIMARY KEY,
        name VARCHAR(255) NOT NULL,
        type VARCHAR(50) DEFAULT 'other',
        balance DECIMAL(15,2) DEFAULT 0,
        isActive BOOLEAN DEFAULT TRUE,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      )
    `);
    console.log('   ✅ accounts');

    // PEOPLE
    await conn.query(`
      CREATE TABLE IF NOT EXISTS people (
        id VARCHAR(50) PRIMARY KEY,
        name VARCHAR(255) NOT NULL,
        role VARCHAR(100) DEFAULT 'Staff',
        note TEXT,
        isActive BOOLEAN DEFAULT TRUE,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      )
    `);
    console.log('   ✅ people');

    // PROJECTS
    await conn.query(`
      CREATE TABLE IF NOT EXISTS projects (
        id VARCHAR(50) PRIMARY KEY,
        name VARCHAR(255) NOT NULL,
        clientName VARCHAR(255),
        description TEXT,
        status VARCHAR(50) DEFAULT 'Active',
        isActive BOOLEAN DEFAULT TRUE,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      )
    `);
    console.log('   ✅ projects');

    // TRANSACTIONS
    await conn.query(`
      CREATE TABLE IF NOT EXISTS transactions (
        id VARCHAR(50) PRIMARY KEY,
        type VARCHAR(50) NOT NULL,
        title VARCHAR(255) NOT NULL,
        amount DECIMAL(15,2) NOT NULL,
        date DATE NOT NULL,
        category VARCHAR(100),
        account VARCHAR(100) DEFAULT 'Cash',
        paymentMethod VARCHAR(100),
        status VARCHAR(50) DEFAULT 'Paid',
        personId VARCHAR(50),
        projectId VARCHAR(50),
        notes TEXT,
        createdBy VARCHAR(255),
        isActive BOOLEAN DEFAULT TRUE,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      )
    `);
    console.log('   ✅ transactions');

    // RECURRING RULES
    await conn.query(`
      CREATE TABLE IF NOT EXISTS recurring_rules (
        id VARCHAR(50) PRIMARY KEY,
        transaction_template_id VARCHAR(50),
        frequency VARCHAR(50) NOT NULL,
        next_date DATE NOT NULL,
        isActive BOOLEAN DEFAULT TRUE,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      )
    `);
    console.log('   ✅ recurring_rules');

    // ─── STEP 2: SAFE COLUMN ADDITIONS & RENAMING ──────────────────

    console.log('\n📦 Step 2: Ensuring all columns exist (safe alter/rename)...\n');

    const ensureColumn = async (table, targetColumn, type, legacyColumn = null) => {
      try {
        // 1. Check if target column exists
        const [cols] = await conn.query(`SHOW COLUMNS FROM ${table} LIKE ?`, [targetColumn]);
        if (cols.length > 0) {
          console.log(`   ⏭️  ${table}.${targetColumn} already exists`);
          return;
        }

        // 2. Check if legacy column exists to rename
        if (legacyColumn) {
          const [lcols] = await conn.query(`SHOW COLUMNS FROM ${table} LIKE ?`, [legacyColumn]);
          if (lcols.length > 0) {
            await conn.query(`ALTER TABLE ${table} CHANGE COLUMN ${legacyColumn} ${targetColumn} ${type}`);
            console.log(`   ✅ Renamed ${table}.${legacyColumn} ➔ ${targetColumn}`);
            return;
          }
        }

        // 3. Just add the column
        await conn.query(`ALTER TABLE ${table} ADD COLUMN ${targetColumn} ${type}`);
        console.log(`   ✅ Added ${table}.${targetColumn}`);
      } catch (e) {
        console.error(`   ❌ Failed to manage ${table}.${targetColumn}:`, e.message);
      }
    };

    // Projects
    await ensureColumn('projects', 'clientName', 'VARCHAR(255)', 'client_id');
    await ensureColumn('projects', 'status', 'VARCHAR(50) DEFAULT \'Active\'');
    await ensureColumn('projects', 'isActive', 'BOOLEAN DEFAULT TRUE');

    // Transactions
    await ensureColumn('transactions', 'personId', 'VARCHAR(50)', 'person_id');
    await ensureColumn('transactions', 'projectId', 'VARCHAR(50)', 'project_id');
    await ensureColumn('transactions', 'paymentMethod', 'VARCHAR(100)', 'payment_method');
    await ensureColumn('transactions', 'account', 'VARCHAR(100) DEFAULT \'Cash\'');
    await ensureColumn('transactions', 'status', 'VARCHAR(50) DEFAULT \'Paid\'');
    await ensureColumn('transactions', 'isActive', 'BOOLEAN DEFAULT TRUE');
    await ensureColumn('transactions', 'createdBy', 'VARCHAR(255)');

    // ─── STEP 3: SEED ACCOUNTS ───────────────────────────────────────

    console.log('\n📦 Step 3: Seeding default accounts...\n');

    const defaultAccounts = [
      { id: 'acc_cash', name: 'Cash', type: 'cash' },
      { id: 'acc_bank', name: 'Bank', type: 'bank' },
      { id: 'acc_upi', name: 'UPI', type: 'upi' },
      { id: 'acc_petty', name: 'Petty Cash', type: 'cash' },
    ];

    for (const acc of defaultAccounts) {
      const [existing] = await conn.query('SELECT id FROM accounts WHERE id = ?', [acc.id]);
      if (existing.length === 0) {
        await conn.query(
          'INSERT INTO accounts (id, name, type, balance, isActive) VALUES (?, ?, ?, 0, TRUE)',
          [acc.id, acc.name, acc.type]
        );
        console.log(`   ✅ Account created: ${acc.name}`);
      } else {
        console.log(`   ⏭️  Account exists: ${acc.name}`);
      }
    }

    // ─── STEP 4: SEED ADMIN USER ─────────────────────────────────────

    console.log('\n📦 Step 4: Admin user setup...\n');

    const [existingUsers] = await conn.query('SELECT id, email, name, role FROM users');

    if (existingUsers.length > 0) {
      console.log('   Existing users:');
      existingUsers.forEach(u => console.log(`   - ${u.name} (${u.email}) [${u.role}]`));
      console.log('');

      const action = await ask('   Users already exist. What would you like to do?\n   [1] Add a new user\n   [2] Skip (keep existing)\n   Enter 1 or 2: ');

      if (action.trim() === '1') {
        await createUser(conn, ask);
      } else {
        console.log('\n   ⏭️  Skipping user creation.\n');
      }
    } else {
      console.log('   No users found. Creating admin account...\n');
      await createUser(conn, ask, 'admin');
    }

    // ─── DONE ────────────────────────────────────────────────────────

    console.log('\n═══════════════════════════════════════════════════');
    console.log('✅ Migration complete! Your database is up to date.');
    console.log('');
    console.log('👉 Next step: Open http://localhost:3000');
    console.log('   If no user existed, you will be redirected to /setup.');
    console.log('   Otherwise, log in with your credentials.');
    console.log('═══════════════════════════════════════════════════\n');

  } catch (err) {
    console.error('\n❌ Error:', err.message);
    process.exit(1);
  } finally {
    if (conn) await conn.end();
    rl.close();
  }
}

async function createUser(conn, ask, defaultRole = null) {
  const name = await ask('   Full Name: ');
  const email = await ask('   Email: ');
  const password = await ask('   Password: ');
  const role = defaultRole || await ask('   Role (admin / staff): ') || 'staff';

  const id = Date.now().toString();

  try {
    await conn.query(
      'INSERT INTO users (id, name, email, password, role, isActive) VALUES (?, ?, ?, ?, ?, TRUE)',
      [id, name.trim(), email.trim(), password.trim(), role.trim()]
    );
    console.log(`\n   ✅ User created: ${name} (${role})`);
  } catch (err) {
    if (err.code === 'ER_DUP_ENTRY') {
      console.log(`\n   ⚠️  Email already exists. Updating password instead...`);
      await conn.query(
        'UPDATE users SET name=?, password=?, role=?, isActive=TRUE WHERE email=?',
        [name.trim(), password.trim(), role.trim(), email.trim()]
      );
      console.log(`   ✅ User updated: ${name}`);
    } else {
      throw err;
    }
  }
}

run();
