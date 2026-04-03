import mysql from 'mysql2/promise';

const host = 'db46096.public.databaseasp.net';
const pwd = 'WebzioWeb';

const combinations = [
  { db: 'db46096.databaseasp.net', user: 'db46096.databaseasp.net' },
  { db: 'db46096', user: 'db46096' },
  { db: 'db46096', user: 'db46096.databaseasp.net' },
  { db: 'db46096.databaseasp.net', user: 'db46096' }
];

async function test() {
  for (const combo of combinations) {
    console.log(`Testing: DB=${combo.db}, User=${combo.user}...`);
    try {
      const conn = await mysql.createConnection({
        host,
        user: combo.user,
        password: pwd,
        database: combo.db,
        // No ssl object = SslMode Preferred (default)
      });
      console.log('✅ SUCCESS!');
      console.log(`Working Combo: DB=${combo.db}, User=${combo.user}`);
      await conn.end();
      return;
    } catch (err) {
      console.log(`❌ Failed: ${err.message}`);
    }
  }
  console.log('--- All combinations failed ---');
}

test();
