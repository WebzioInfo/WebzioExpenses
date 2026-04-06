import mysql from 'mysql2/promise';
import dotenv from 'dotenv';
dotenv.config();

async function migrate() {
  const connection = await mysql.createConnection({
    host: process.env.DB_HOST,
    user: process.env.DB_USER,
    password: process.env.DB_PASSWORD,
    database: process.env.DB_NAME,
    port: 3306,
  });

  try {
    console.log('🚀 Starting Migration v3 (System Hardening)...');

    // 1. Add destination_account_id to transactions
    console.log('--- Adding destination_account_id to transactions ---');
    await connection.query(`
      ALTER TABLE transactions 
      ADD COLUMN IF NOT EXISTS destination_account_id VARCHAR(50) AFTER account;
    `);

    // 2. Add performance indexes
    console.log('--- Adding performance indexes ---');
    
    const [indexes] = await connection.query('SHOW INDEX FROM transactions');
    const indexNames = indexes.map(i => i.Key_name);

    if (!indexNames.includes('idx_tx_status_type')) {
      await connection.query('CREATE INDEX idx_tx_status_type ON transactions(status, type)');
    }
    if (!indexNames.includes('idx_tx_date')) {
      await connection.query('CREATE INDEX idx_tx_date ON transactions(date)');
    }
    if (!indexNames.includes('idx_tx_scope')) {
      // Check if 'scope' exists first (it was added in a previous phase but let's be sure)
      const [txCols] = await connection.query("SHOW COLUMNS FROM transactions LIKE 'scope'");
      if (txCols.length > 0) {
        await connection.query('CREATE INDEX idx_tx_scope ON transactions(scope)');
      }
    }
    if (!indexNames.includes('idx_tx_active')) {
      await connection.query('CREATE INDEX idx_tx_active ON transactions(isActive)');
    }

    // Index for people and projects
    const [pIdx] = await connection.query('SHOW INDEX FROM people');
    if (!pIdx.map(i => i.Key_name).includes('idx_people_active')) {
      await connection.query('ALTER TABLE people ADD INDEX idx_people_active (isActive)');
    }
    
    const [prjIdx] = await connection.query('SHOW INDEX FROM projects');
    if (!prjIdx.map(i => i.Key_name).includes('idx_projects_active')) {
      await connection.query('ALTER TABLE projects ADD INDEX idx_projects_active (isActive)');
    }

    // 3. Migrate Transfer data from notes
    console.log('--- Migrating existing Transfer data from notes ---');
    const [transfers] = await connection.query(
      "SELECT id, notes FROM transactions WHERE type = 'Transfer' AND notes LIKE 'To: %' AND destination_account_id IS NULL"
    );

    console.log(`Found ${transfers.length} transfers to migrate...`);
    
    for (const t of transfers) {
      const destName = t.notes.substring(4).trim();
      // Try to find matching account ID by name
      const [accounts] = await connection.query('SELECT name FROM accounts WHERE name = ?', [destName]);
      if (accounts.length > 0) {
        await connection.query(
          'UPDATE transactions SET destination_account_id = ? WHERE id = ?',
          [accounts[0].name, t.id]
        );
      }
    }

    console.log('✅ Migration v3 Successful!');
  } catch (error) {
    console.error('❌ Migration v3 Failed:', error);
  } finally {
    await connection.end();
  }
}

migrate();
