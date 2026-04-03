import dotenv from 'dotenv';
dotenv.config({ path: '.env.local' });
import pool from './src/lib/db.js';

async function debug() {
  try {
    console.log('Testing Transactions API Query...');
    const [rows] = await pool.query(
      `SELECT t.*, 
        p.name as personName, 
        pr.name as projectName
       FROM transactions t
       LEFT JOIN people p ON t.personId = p.id
       LEFT JOIN projects pr ON t.projectId = pr.id
       WHERE t.isActive = TRUE
       ORDER BY t.date DESC, t.created_at DESC`
    );
    console.log('Success! Rows found:', rows.length);
  } catch (error) {
    console.error('Query Failed:', error.message);
    if (error.code) console.error('Error Code:', error.code);
  } finally {
    process.exit(0);
  }
}

debug();
