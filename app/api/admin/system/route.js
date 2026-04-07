import { NextResponse } from 'next/server';
import pool from '@/src/lib/db';
import { getServerSession } from '@/src/lib/auth-server';
import { logActivity } from '@/src/lib/activity';

export async function GET(request) {
  try {
    const session = await getServerSession();
    if (!session || !session.isAdmin) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const TABLES = ['users', 'staff', 'projects', 'accounts', 'categories', 'transactions', 'tasks', 'leads', 'clients', 'attendance'];
    const backup = {};

    for (const table of TABLES) {
      const [rows] = await pool.query(`SELECT * FROM ${table}`);
      backup[table] = rows;
    }

    return NextResponse.json(backup);
  } catch (error) {
    console.error('Export Error:', error);
    return NextResponse.json({ error: 'Failed to export data' }, { status: 500 });
  }
}

export async function POST(request) {
  try {
    const session = await getServerSession();
    if (!session || !session.isAdmin) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { action, data } = await request.json();

    if (action === 'reset_transactions') {
      await pool.query('DELETE FROM transactions');
      await pool.query('UPDATE accounts SET balance = 0');
      await logActivity(session.user.id, 'System Reset: Transactions', 'System');
      return NextResponse.json({ success: true, message: 'All transactions cleared and balances reset.' });
    }

    if (action === 'full_reset') {
      const TABLES = ['transactions', 'tasks', 'leads', 'clients', 'attendance', 'projects', 'categories', 'accounts', 'staff'];
      for (const table of TABLES) {
        await pool.query(`DELETE FROM ${table}`);
      }
      // Re-initialize accounts with 0 balance if needed or just leave empty
      await logActivity(session.user.id, 'System Reset: FULL', 'System');
      return NextResponse.json({ success: true, message: 'System wiped to factory defaults (excluding users).' });
    }

    if (action === 'import') {
      if (!data) return NextResponse.json({ error: 'No data provided' }, { status: 400 });
      
      // Basic import logic (Truncate and reload)
      const TABLES = ['staff', 'projects', 'accounts', 'categories', 'transactions', 'tasks', 'leads', 'clients', 'attendance'];
      
      for (const table of TABLES) {
        if (data[table] && Array.isArray(data[table])) {
          await pool.query(`DELETE FROM ${table}`);
          for (const row of data[table]) {
            const columns = Object.keys(row).join(', ');
            const placeholders = Object.keys(row).map(() => '?').join(', ');
            const values = Object.values(row);
            await pool.query(`INSERT INTO ${table} (${columns}) VALUES (${placeholders})`, values);
          }
        }
      }

      await logActivity(session.user.id, 'System Import', 'System');
      return NextResponse.json({ success: true, message: 'Data imported successfully.' });
    }

    return NextResponse.json({ error: 'Invalid action' }, { status: 400 });
  } catch (error) {
    console.error('System Control Error:', error);
    return NextResponse.json({ error: 'Failed to execute system action' }, { status: 500 });
  }
}
