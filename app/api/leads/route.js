import { NextResponse } from 'next/server';
import pool from '@/src/lib/db';
import { getServerSession } from '@/src/lib/auth-server';

export async function GET(request) {
  try {
    const session = await getServerSession();
    const role = session?.user?.role?.toLowerCase();
    const isManagement = ['founder', 'admin', 'hr'].includes(role);

    if (!session || !isManagement) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const status = searchParams.get('status');
    
    let sql = 'SELECT * FROM leads WHERE isActive = TRUE';
    const params = [];
    
    if (status) {
      sql += ' AND status = ?';
      params.push(status);
    }
    
    sql += ' ORDER BY created_at DESC';
    
    const [rows] = await pool.query(sql, params);
    return NextResponse.json(rows);
  } catch (error) {
    console.error('DB Error:', error);
    return NextResponse.json({ error: 'Failed to fetch leads' }, { status: 500 });
  }
}

import { logActivity } from '@/src/lib/activity';

export async function POST(request) {
  try {
    const session = await getServerSession();
    const role = session?.user?.role?.toLowerCase();
    const isManagement = ['founder', 'admin', 'hr'].includes(role);

    if (!session || !isManagement) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await request.json();
    const { name, phone, email, source, notes } = body;
    const id = 'lead_' + Date.now();

    await pool.query(
      'INSERT INTO leads (id, name, phone, email, source, notes, status, isActive) VALUES (?, ?, ?, ?, ?, ?, "New", TRUE)',
      [id, name, phone || null, email || null, source || 'Manual', notes || '']
    );

    await logActivity(session.user.id, 'Captured Lead', 'CRM', { leadId: id, name });

    return NextResponse.json({ id, name, status: 'New' });
  } catch (error) {
    console.error('DB Error:', error);
    return NextResponse.json({ error: 'Failed to create lead' }, { status: 500 });
  }
}

export async function PUT(request) {
  try {
    const session = await getServerSession();
    const role = session?.user?.role?.toLowerCase();
    const isManagement = ['founder', 'admin', 'hr'].includes(role);

    if (!session || !isManagement) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await request.json();
    const { id, name, phone, email, source, status, notes } = body;

    await pool.query(
      'UPDATE leads SET name=?, phone=?, email=?, source=?, status=?, notes=? WHERE id=?',
      [name, phone, email, source, status, notes, id]
    );

    await logActivity(session.user.id, 'Updated Lead', 'CRM', { leadId: id, status });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('DB Error:', error);
    return NextResponse.json({ error: 'Failed to update lead' }, { status: 500 });
  }
}

export async function DELETE(request) {
  try {
    const session = await getServerSession();
    const role = session?.user?.role?.toLowerCase();
    const isManagement = ['founder', 'admin', 'hr'].includes(role);

    if (!session || !isManagement) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const id = searchParams.get('id');
    await pool.query('UPDATE leads SET isActive = FALSE WHERE id = ?', [id]);
    
    await logActivity(session.user.id, 'Deleted Lead', 'CRM', { leadId: id });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('DB Error:', error);
    return NextResponse.json({ error: 'Failed to delete lead' }, { status: 500 });
  }
}
