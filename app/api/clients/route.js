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
    
    let sql = 'SELECT * FROM clients WHERE isActive = TRUE';
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
    return NextResponse.json({ error: 'Failed to fetch clients' }, { status: 500 });
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
    const { name, phone, email, company, notes } = body;
    const id = 'client_' + Date.now();

    await pool.query(
      'INSERT INTO clients (id, name, phone, email, company, notes, status, isActive) VALUES (?, ?, ?, ?, ?, ?, "Active", TRUE)',
      [id, name, phone || null, email || null, company || null, notes || '']
    );

    await logActivity(session.user.id, 'Added Client', 'CRM', { clientId: id, name });

    return NextResponse.json({ id, name, status: 'Active' });
  } catch (error) {
    console.error('DB Error:', error);
    return NextResponse.json({ error: 'Failed to create client' }, { status: 500 });
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
    const { id, name, phone, email, company, status, notes } = body;

    await pool.query(
      'UPDATE clients SET name=?, phone=?, email=?, company=?, status=?, notes=? WHERE id=?',
      [name, phone, email, company, status, notes, id]
    );

    await logActivity(session.user.id, 'Updated Client', 'CRM', { clientId: id, status });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('DB Error:', error);
    return NextResponse.json({ error: 'Failed to update client' }, { status: 500 });
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
    await pool.query('UPDATE clients SET isActive = FALSE WHERE id = ?', [id]);
    
    await logActivity(session.user.id, 'Deleted Client', 'CRM', { clientId: id });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('DB Error:', error);
    return NextResponse.json({ error: 'Failed to delete client' }, { status: 500 });
  }
}
