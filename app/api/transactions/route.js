import { NextResponse } from 'next/server';
import pool from '@/src/lib/db';

export async function GET() {
  try {
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
    return NextResponse.json(rows);
  } catch (error) {
    console.error('DB Error:', error);
    return NextResponse.json({ error: 'Failed to fetch entries' }, { status: 500 });
  }
}

export async function POST(request) {
  try {
    const body = await request.json();
    const { type, title, amount, date, category, account, paymentMethod, status, personId, projectId, notes, createdBy, isRecurring, recurringFrequency } = body;
    const id = Date.now().toString();

    await pool.query(
      `INSERT INTO transactions 
       (id, type, title, amount, date, category, account, paymentMethod, status, personId, projectId, notes, createdBy, isActive) 
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, TRUE)`,
      [id, type, title, parseFloat(amount), date, category || null, account || 'Cash', paymentMethod || null, status || 'Paid', personId || null, projectId || null, notes || '', createdBy || null]
    );

    // Handle recurring rule
    if (isRecurring && recurringFrequency) {
      const nextDate = getNextDate(date, recurringFrequency);
      await pool.query(
        `INSERT INTO recurring_rules (id, transaction_template_id, frequency, next_date, isActive) VALUES (?, ?, ?, ?, TRUE)`,
        [Date.now().toString() + '_r', id, recurringFrequency, nextDate]
      );
    }

    return NextResponse.json({ id, ...body });
  } catch (error) {
    console.error('DB Error:', error);
    return NextResponse.json({ error: 'Failed to create entry' }, { status: 500 });
  }
}

export async function PUT(request) {
  try {
    const body = await request.json();
    const { id, type, title, amount, date, category, account, paymentMethod, status, personId, projectId, notes } = body;

    await pool.query(
      `UPDATE transactions 
       SET type=?, title=?, amount=?, date=?, category=?, account=?, paymentMethod=?, status=?, personId=?, projectId=?, notes=?
       WHERE id=?`,
      [type, title, parseFloat(amount), date, category || null, account || 'Cash', paymentMethod || null, status || 'Paid', personId || null, projectId || null, notes || '', id]
    );
    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('DB Error:', error);
    return NextResponse.json({ error: 'Failed to update entry' }, { status: 500 });
  }
}

export async function DELETE(request) {
  try {
    const { searchParams } = new URL(request.url);
    const id = searchParams.get('id');
    // Soft delete
    await pool.query('UPDATE transactions SET isActive = FALSE WHERE id = ?', [id]);
    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('DB Error:', error);
    return NextResponse.json({ error: 'Failed to delete entry' }, { status: 500 });
  }
}

function getNextDate(dateStr, frequency) {
  const d = new Date(dateStr);
  if (frequency === 'Monthly') d.setMonth(d.getMonth() + 1);
  else if (frequency === 'Weekly') d.setDate(d.getDate() + 7);
  return d.toISOString().split('T')[0];
}
