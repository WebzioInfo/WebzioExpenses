import { NextResponse } from 'next/server';
import pool from '@/src/lib/db';
import { getServerSession } from '@/src/lib/auth-server';
import { logActivity } from '@/src/lib/activity';

// Initialize table if not exists (one-time check)
const initTable = async () => {
  await pool.query(`
    CREATE TABLE IF NOT EXISTS attendance (
      id INT AUTO_INCREMENT PRIMARY KEY,
      staff_id VARCHAR(50) NOT NULL,
      date DATE NOT NULL,
      status ENUM('Present', 'Absent', 'Half Day', 'Leave', 'Holiday') DEFAULT 'Present',
      notes TEXT,
      created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
      updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
      UNIQUE KEY (staff_id, date)
    )
  `);
};

export async function GET(request) {
  try {
    const session = await getServerSession();
    if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

    const { searchParams } = new URL(request.url);
    const month = searchParams.get('month'); // MM
    const year = searchParams.get('year');   // YYYY
    let staffId = searchParams.get('staffId');

    if (!session.isAdmin) {
      staffId = session.staffId;
    }

    let query = 'SELECT a.*, s.name as staffName FROM attendance a JOIN staff s ON a.staff_id = s.id WHERE s.isActive = TRUE ';
    const params = [];

    if (staffId) {
      query += 'AND a.staff_id = ? ';
      params.push(staffId);
    }

    if (month && year) {
      query += 'AND MONTH(a.date) = ? AND YEAR(a.date) = ? ';
      params.push(month, year);
    }

    query += 'ORDER BY a.date DESC';

    const [rows] = await pool.query(query, params);
    return NextResponse.json(rows);
  } catch (error) {
    console.error('Attendance GET error:', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}

export async function POST(request) {
  try {
    const session = await getServerSession();
    if (!session || !session.isAdmin) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    await initTable();

    const { staff_id, date, status, notes } = await request.json();

    if (!staff_id || !date || !status) {
      return NextResponse.json({ error: 'Missing required fields' }, { status: 400 });
    }

    // Upsert logic
    await pool.query(
      `INSERT INTO attendance (staff_id, date, status, notes) 
       VALUES (?, ?, ?, ?) 
       ON DUPLICATE KEY UPDATE status = VALUES(status), notes = VALUES(notes)`,
      [staff_id, date, status, notes || '']
    );

    await logActivity(session.user.id, 'Updated Attendance', 'Attendance', { staffId: staff_id, date, status });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Attendance POST error:', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}
