// Quick DB verification script
import mysql from 'mysql2/promise';

const conn = await mysql.createConnection({
  host: 'db46096.public.databaseasp.net',
  user: 'db46096',
  password: 'WebzioWeb',
  database: 'db46096',
  port: 3306
});

const [tables] = await conn.query('SHOW TABLES');
const [users] = await conn.query('SELECT id, name, email, role, isActive FROM users');
const [accounts] = await conn.query('SELECT id, name, type FROM accounts');

console.log('\n== TABLES ==');
tables.forEach(t => console.log(' -', Object.values(t)[0]));

console.log('\n== USERS ==');
if (users.length === 0) {
  console.log(' (no users found)');
} else {
  users.forEach(u => console.log(` - ${u.name} | ${u.email} | role: ${u.role} | active: ${u.isActive}`));
}

console.log('\n== ACCOUNTS ==');
accounts.forEach(a => console.log(` - ${a.name} (${a.type})`));

await conn.end();
console.log('\n✅ Database check complete.\n');
