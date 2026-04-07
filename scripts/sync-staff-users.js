import mysql from 'mysql2/promise';
import bcrypt from 'bcryptjs';
import dotenv from 'dotenv';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

dotenv.config({ path: '.env.local' });
dotenv.config({ path: '.env' });

async function sync() {
  const pool = mysql.createPool({
    host: process.env.DB_HOST,
    user: process.env.DB_USER,
    password: process.env.DB_PASSWORD,
    database: process.env.DB_NAME,
    port: parseInt(process.env.DB_PORT || '3306'),
  });

  try {
    console.log('Fetching staff members...');
    const [staff] = await pool.query('SELECT * FROM staff WHERE isActive = TRUE');
    console.log(`Found ${staff.length} staff members.`);

    const [users] = await pool.query('SELECT email FROM users');
    const existingEmails = new Set(users.map(u => u.email));

    const defaultPassword = 'Staff@123';
    const hashedPassword = await bcrypt.hash(defaultPassword, 10);
    const defaultPermissions = JSON.stringify(['Tasks', 'Dashboard']);

    let createdCount = 0;

    for (const s of staff) {
      if (!existingEmails.has(s.email)) {
        console.log(`Creating user for: ${s.name} (${s.email})`);
        const userId = 'u_' + s.id;
        await pool.query(
          'INSERT INTO users (id, name, email, password, role, isActive, permissions) VALUES (?, ?, ?, ?, "staff", TRUE, ?)',
          [userId, s.name, s.email, hashedPassword, defaultPermissions]
        );
        createdCount++;
      }
    }

    console.log(`Sync complete. Created ${createdCount} new user accounts.`);
  } catch (error) {
    console.error('Migration failed:', error);
  } finally {
    await pool.end();
  }
}

sync();
