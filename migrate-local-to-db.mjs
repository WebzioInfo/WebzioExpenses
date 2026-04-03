import mysql from 'mysql2/promise';
import dotenv from 'dotenv';
import fs from 'fs/promises';

// Use this script to migrate your exported localStorage JSON to your MySQL database
// Command: node migrate-local-to-db.mjs <your-backup-file.json>

dotenv.config({ path: '.env.local' });

async function migrate() {
  const fileName = process.argv[2];
  if (!fileName) {
    console.error('Please provide the path to your backup JSON file.');
    console.log('Usage: node migrate-local-to-db.mjs backup.json');
    process.exit(1);
  }

  try {
    const rawData = await fs.readFile(fileName, 'utf8');
    const data = JSON.parse(rawData);

    const connection = await mysql.createConnection({
      host: process.env.DB_HOST,
      user: process.env.DB_USER,
      password: process.env.DB_PASSWORD,
      database: process.env.DB_NAME,
      port: 3306,
    });

    console.log('Connected to MySQL. Starting migration...');

    // 1. Migrate People
    if (data.people && data.people.length > 0) {
      console.log(`Migrating ${data.people.length} people...`);
      for (const person of data.people) {
        await connection.query(
          'INSERT INTO people (id, name, role, note) VALUES (?, ?, ?, ?) ON DUPLICATE KEY UPDATE name=VALUES(name), role=VALUES(role), note=VALUES(note)',
          [person.id, person.name, person.role, person.note]
        );
      }
    }

    // 2. Migrate Projects
    if (data.projects && data.projects.length > 0) {
      console.log(`Migrating ${data.projects.length} projects...`);
      for (const project of data.projects) {
        await connection.query(
          'INSERT INTO projects (id, name, clientName, description) VALUES (?, ?, ?, ?) ON DUPLICATE KEY UPDATE name=VALUES(name), clientName=VALUES(clientName), description=VALUES(description)',
          [project.id, project.name, project.clientName, project.description]
        );
      }
    }

    // 3. Migrate Transactions
    if (data.transactions && data.transactions.length > 0) {
      console.log(`Migrating ${data.transactions.length} transactions...`);
      for (const t of data.transactions) {
        await connection.query(
          `INSERT INTO transactions 
           (id, type, title, amount, date, category, paymentMethod, personId, projectId, notes) 
           VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
           ON DUPLICATE KEY UPDATE 
           type=VALUES(type), title=VALUES(title), amount=VALUES(amount), date=VALUES(date), 
           category=VALUES(category), paymentMethod=VALUES(paymentMethod), 
           personId=VALUES(personId), projectId=VALUES(projectId), notes=VALUES(notes)`,
          [
            t.id, t.type, t.title, t.amount, t.date, t.category, 
            t.paymentMethod || 'Bank', t.personId || null, t.projectId || null, t.notes || ''
          ]
        );
      }
    }

    console.log('Migration completed successfully!');
    await connection.end();
  } catch (error) {
    console.error('Migration Error:', error);
  }
}

migrate();
