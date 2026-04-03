import mysql from 'mysql2/promise';
import dotenv from 'dotenv';
dotenv.config({ path: '.env.local' });

const config = {
  host: process.env.DB_HOST,
  user: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
  database: process.env.DB_NAME,
  port: 3306,
  ssl: false,
};

async function run() {
  const conn = await mysql.createConnection(config);
  console.log('✅ Connected\n');

  // Helper: check column exists
  const columnExists = async (table, column) => {
    const [r] = await conn.query('SHOW COLUMNS FROM ?? LIKE ?', [table, column]);
    return r.length > 0;
  };

  // Helper: get column type
  const columnType = async (table, column) => {
    const [r] = await conn.query('SHOW COLUMNS FROM ?? LIKE ?', [table, column]);
    return r.length > 0 ? r[0].Type : null;
  };

  // ─── FIX 1: Change id columns from int to VARCHAR(50) ──────────────
  console.log('🔧 Fixing id column types...');

  const tables = ['projects', 'transactions', 'accounts', 'people', 'users', 'recurring_rules'];
  for (const table of tables) {
    const type = await columnType(table, 'id');
    if (type && type.includes('int')) {
      await conn.query(`ALTER TABLE \`${table}\` MODIFY COLUMN id VARCHAR(50) NOT NULL`);
      console.log(`   ✅ ${table}.id: ${type} → VARCHAR(50)`);
    } else {
      console.log(`   ⏭️  ${table}.id already ${type}`);
    }
  }

  // ─── FIX 2: Add clientName to projects if missing ───────────────────
  console.log('\n🔧 Fixing projects columns...');
  if (!await columnExists('projects', 'clientName')) {
    // Check if old column exists
    const hasClientId = await columnExists('projects', 'client_id');
    if (hasClientId) {
      await conn.query('ALTER TABLE projects CHANGE COLUMN client_id clientName VARCHAR(255)');
      console.log('   ✅ Renamed client_id → clientName');
    } else {
      await conn.query('ALTER TABLE projects ADD COLUMN clientName VARCHAR(255)');
      console.log('   ✅ Added clientName column');
    }
  } else {
    console.log('   ⏭️  clientName already exists');
  }

  // ─── FIX 3: Fix transactions CamelCase columns ──────────────────────
  console.log('\n🔧 Fixing transactions columns...');
  const txFixes = [
    { target: 'personId', legacy: 'person_id', type: 'VARCHAR(50)' },
    { target: 'projectId', legacy: 'project_id', type: 'VARCHAR(50)' },
    { target: 'paymentMethod', legacy: 'payment_method', type: 'VARCHAR(100)' },
  ];

  for (const fix of txFixes) {
    if (!await columnExists('transactions', fix.target)) {
      const hasLegacy = await columnExists('transactions', fix.legacy);
      if (hasLegacy) {
        await conn.query(`ALTER TABLE transactions CHANGE COLUMN \`${fix.legacy}\` \`${fix.target}\` ${fix.type}`);
        console.log(`   ✅ Renamed ${fix.legacy} → ${fix.target}`);
      } else {
        await conn.query(`ALTER TABLE transactions ADD COLUMN \`${fix.target}\` ${fix.type}`);
        console.log(`   ✅ Added ${fix.target}`);
      }
    } else {
      console.log(`   ⏭️  ${fix.target} already exists`);
    }
  }

  // ─── VERIFY ─────────────────────────────────────────────────────────
  console.log('\n📋 Final Schema Verification:');
  for (const table of tables) {
    const [cols] = await conn.query('SHOW COLUMNS FROM ??', [table]);
    const fields = cols.map(c => `${c.Field}(${c.Type})`);
    console.log(`   ${table}: ${fields.filter(f => f.includes('id') || f.includes('Name')).join(', ')}`);
  }

  await conn.end();
  console.log('\n✅ All fixes applied!');
}

run().catch(e => { console.error('❌ Error:', e.message); process.exit(1); });
