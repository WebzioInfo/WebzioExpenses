import mysql from 'mysql2/promise';
import bcrypt from 'bcryptjs';
import dotenv from 'dotenv';
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
    console.log('Seeding staff and users...');
    const [staff] = await pool.query('SELECT * FROM staff WHERE isActive = TRUE');
    console.log(`Found ${staff.length} staff members.`);

    const defaultPassword = 'Staff@123';
    const hashedPassword = await bcrypt.hash(defaultPassword, 10);
    const defaultPermissions = JSON.stringify(['Tasks', 'Dashboard']);

    for (const s of staff) {
      // Pattern: lowercasename@webziointernational.in
      const newEmail = `${s.name.toLowerCase().replace(/\s+/g, '')}@webziointernational.in`;
      console.log(`Updating ${s.name}: ${s.email} -> ${newEmail}`);

      // Update Staff table
      await pool.query('UPDATE staff SET email = ? WHERE id = ?', [newEmail, s.id]);

      // Update or Create User table
      const [users] = await pool.query('SELECT id FROM users WHERE email = ?', [s.email]);
      
      if (users.length > 0) {
        // Update existing user (by old email)
        await pool.query(
          'UPDATE users SET email = ?, password = ?, name = ? WHERE id = ?',
          [newEmail, hashedPassword, s.name, users[0].id]
        );
      } else {
        // Check if user already exists with new email
        const [usersNew] = await pool.query('SELECT id FROM users WHERE email = ?', [newEmail]);
        if (usersNew.length === 0) {
          // Create new user
          const userId = 'u_' + s.id;
          await pool.query(
            'INSERT INTO users (id, name, email, password, role, isActive, permissions) VALUES (?, ?, ?, ?, "staff", TRUE, ?)',
            [userId, s.name, newEmail, hashedPassword, defaultPermissions]
          );
        } else {
            // User already exists with new email, update password
            await pool.query(
                'UPDATE users SET password = ?, name = ? WHERE id = ?',
                [hashedPassword, s.name, usersNew[0].id]
            );
        }
      }
    }

    // Also update Admin user if any (based on name or known email)
    // For now, let's just ensure the staff are synced.
    
    console.log('Seeding complete.');
  } catch (error) {
    console.error('Seeding failed:', error);
  } finally {
    await pool.end();
  }
}

sync();
