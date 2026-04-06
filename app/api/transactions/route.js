import { NextResponse } from 'next/server';
import pool from '@/src/lib/db';
import { getServerSession } from '@/src/lib/auth-server';

export async function GET(request) {
  try {
    const session = await getServerSession();
    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    let personId = searchParams.get('personId');
    const projectId = searchParams.get('projectId');

    // RBAC: Staff only see their own transactions
    if (!session.isAdmin) {
      personId = session.staffId;
      if (!personId) return NextResponse.json([]);
    }

    let sql = `SELECT t.*, s.name as personName, pr.name as projectName
               FROM transactions t
               LEFT JOIN staff s ON t.personId = s.id
               LEFT JOIN projects pr ON t.projectId = pr.id
               WHERE t.isActive = TRUE`;
    
    const params = [];
    if (personId) {
      sql += ' AND t.personId = ?';
      params.push(personId);
    }
    if (projectId) {
      sql += ' AND t.projectId = ?';
      params.push(projectId);
    }

    sql += ' ORDER BY t.date DESC, created_at DESC';

    const [rows] = await pool.query(sql, params);
    return NextResponse.json(rows);
  } catch (error) {
    console.error('DB Error:', error);
    return NextResponse.json({ error: 'Failed to fetch entries' }, { status: 500 });
  }
}

import { logActivity } from '@/src/lib/activity';

export async function POST(request) {
  try {
    const session = await getServerSession();
    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await request.json();
    let { type, title, amount, date, category, account, destination_account_id, paymentMethod, status, personId, projectId, notes, scope } = body;
    
    if (!type || !title || !amount || !account || !date || !scope) {
      return NextResponse.json({ error: 'Missing required fields' }, { status: 400 });
    }

    if (!session.isAdmin) {
      personId = session.staffId;
      if (!personId) return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
    }

    const id = Date.now().toString();

    await pool.query(
      `INSERT INTO transactions 
       (id, type, title, amount, date, category, account, destination_account_id, paymentMethod, status, personId, projectId, notes, createdBy, scope, isActive) 
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, TRUE)`,
      [id, type, title, parseFloat(amount), date, category || null, account || 'Cash', destination_account_id || null, paymentMethod || null, status || 'Paid', personId || null, projectId || null, notes || '', session.user.id, scope]
    );

    await logActivity(session.user.id, 'Created Transaction', 'Finance', { transactionId: id, title, amount });

    return NextResponse.json({ id, ...body });
  } catch (error) {
    console.error('DB Error:', error);
    return NextResponse.json({ error: 'Failed to create entry' }, { status: 500 });
  }
}

export async function PUT(request) {
  try {
    const session = await getServerSession();
    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await request.json();
    const { id, type, title, amount } = body;

    const [existing] = await pool.query('SELECT personId FROM transactions WHERE id = ?', [id]);
    if (existing.length === 0) return NextResponse.json({ error: 'Entry not found' }, { status: 404 });

    if (!session.isAdmin && existing[0].personId !== session.staffId) {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
    }

    await pool.query(
      `UPDATE transactions 
       SET type=?, title=?, amount=?, date=?, category=?, account=?, destination_account_id=?, paymentMethod=?, status=?, personId=?, projectId=?, notes=?, scope=?
       WHERE id=?`,
      [body.type, body.title, parseFloat(body.amount), body.date, body.category || null, body.account || 'Cash', body.destination_account_id || null, body.paymentMethod || null, body.status || 'Paid', body.personId || null, body.projectId || null, body.notes || '', body.scope, id]
    );

    await logActivity(session.user.id, 'Updated Transaction', 'Finance', { transactionId: id, title, amount });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('DB Error:', error);
    return NextResponse.json({ error: 'Failed to update entry' }, { status: 500 });
  }
}

export async function DELETE(request) {
  try {
    const session = await getServerSession();
    if (!session || !session.isAdmin) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const id = searchParams.get('id');
    await pool.query('UPDATE transactions SET isActive = FALSE WHERE id = ?', [id]);
    
    await logActivity(session.user.id, 'Deleted Transaction', 'Finance', { transactionId: id });

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
