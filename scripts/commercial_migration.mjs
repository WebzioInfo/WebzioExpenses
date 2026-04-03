import mysql from 'mysql2/promise';
import dotenv from 'dotenv';
dotenv.config({ path: '.env.local' });

async function migrate() {
  const pool = mysql.createPool({
    host: process.env.DB_HOST,
    user: process.env.DB_USER,
    password: process.env.DB_PASSWORD,
    database: process.env.DB_NAME,
    port: 3306,
  });

  try {
    console.log('--- Starting Commercial Migration ---');

    // 1. Create projects table
    console.log('Creating projects table...');
    await pool.query(`
      CREATE TABLE IF NOT EXISTS projects (
        id INT AUTO_INCREMENT PRIMARY KEY,
        name VARCHAR(255) NOT NULL,
        client_id INT NULL,
        status ENUM('Active', 'Lead', 'Completed', 'On-Hold') DEFAULT 'Active',
        description TEXT,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        INDEX (client_id)
      )
    `);

    // 2. Add project_id to transactions if not exists
    console.log('Adding project_id to transactions table...');
    const [cols] = await pool.query('DESCRIBE transactions');
    if (!cols.find(c => c.Field === 'project_id')) {
      await pool.query('ALTER TABLE transactions ADD COLUMN project_id INT NULL AFTER project_name');
      await pool.query('ALTER TABLE transactions ADD INDEX (project_id)');
    }

    // 3. Migrate unique project names
    console.log('Migrating existing project names to the projects table...');
    const [projectNames] = await pool.query(`
      SELECT DISTINCT project_name 
      FROM transactions 
      WHERE project_name IS NOT NULL AND project_name != ''
    `);

    for (const row of projectNames) {
      const name = row.project_name;
      
      // Check if project already exists
      const [existing] = await pool.query('SELECT id FROM projects WHERE name = ?', [name]);
      
      let projectId;
      if (existing.length === 0) {
        // Try to find a client associated with this project name
        const [potentialClients] = await pool.query(`
          SELECT person_id 
          FROM transactions 
          WHERE project_name = ? AND type = 'REVENUE' 
          LIMIT 1
        `, [name]);
        
        const clientId = potentialClients.length > 0 ? potentialClients[0].person_id : null;
        
        const [insertResult] = await pool.query(
          'INSERT INTO projects (name, client_id) VALUES (?, ?)',
          [name, clientId]
        );
        projectId = insertResult.insertId;
        console.log(`Created project: ${name} (ID: ${projectId})`);
      } else {
        projectId = existing[0].id;
      }

      // Link transactions to this projectId
      await pool.query(
        'UPDATE transactions SET project_id = ? WHERE project_name = ?',
        [projectId, name]
      );
    }

    console.log('Migration complete!');
  } catch (err) {
    console.error('Migration failed:', err);
  } finally {
    process.exit(0);
  }
}

migrate();
