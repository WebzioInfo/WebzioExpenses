import { NextResponse } from 'next/server';
import pool from '@/src/lib/db';
import { getServerSession } from '@/src/lib/auth-server';
import bcrypt from 'bcryptjs';
import { logActivity } from '@/src/lib/activity';

export async function GET(request) {
  try {
    const session = await getServerSession();
    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    let sql = 'SELECT * FROM staff WHERE isActive = TRUE';
    const params = [];

    const role = session.user.role?.toLowerCase();
    const isManagement = ['founder', 'admin', 'hr'].includes(role);

    // RBAC: Staff only see themselves
    if (!isManagement) {
      if (!session.staffId) return NextResponse.json([]);
      sql += ' AND id = ?';
      params.push(session.staffId);
    } else {
      sql += ' ORDER BY name ASC';
    }

    const [rows] = await pool.query(sql, params);
    
    // Parse permissions JSON for each staff
    const staffWithPerms = rows.map(s => ({
      ...s,
      permissions: s.permissions ? (typeof s.permissions === 'string' ? JSON.parse(s.permissions) : s.permissions) : []
    }));

    return NextResponse.json(staffWithPerms);
  } catch (error) {
    console.error('DB Error:', error);
    return NextResponse.json({ error: 'Failed to fetch staff' }, { status: 500 });
  }
}

export async function POST(request) {
  try {
    const role = session.user.role?.toLowerCase();
    const isManagement = ['founder', 'admin', 'hr'].includes(role);

    if (!session || !isManagement) {
      return NextResponse.json({ error: 'Unauthorized: Management only' }, { status: 401 });
    }

    const { name, email, role, note, permissions } = await request.json();
    const id = Date.now().toString();
    
    const professionalEmail = email || `${name.toLowerCase().replace(/\s+/g, '')}@webziointernational.in`;
    const permsJson = JSON.stringify(permissions || ['Dashboard', 'Work']);

    await pool.query(
      'INSERT INTO staff (id, name, email, role, note, permissions, isActive) VALUES (?, ?, ?, ?, ?, ?, TRUE)',
      [id, name, professionalEmail, role || 'Staff', note || '', permsJson]
    );

    // Auto-create User account for the staff
    const userId = 'u_' + id;
    const defaultPassword = 'Staff@123';
    const hashedPassword = await bcrypt.hash(defaultPassword, 10);

    await pool.query(
      'INSERT INTO users (id, name, email, password, role, isActive, permissions) VALUES (?, ?, ?, ?, ?, TRUE, ?)',
      [userId, name, professionalEmail, hashedPassword, (role || 'staff').toLowerCase(), permsJson]
    );

    await logActivity(session.user.id, 'Added Staff & User with Permissions', 'Staff', { staffId: id, name });

    return NextResponse.json({ id, name, email: professionalEmail, role, note, permissions: permissions || [] });
  } catch (error) {
    console.error('DB Error:', error);
    return NextResponse.json({ error: 'Failed to add staff' }, { status: 500 });
  }
}

export async function PUT(request) {
  try {
    const session = await getServerSession();
    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { id, name, email, role, note, permissions } = await request.json();

    const role = session.user.role?.toLowerCase();
    const isManagement = ['founder', 'admin', 'hr'].includes(role);

    if (!isManagement && id !== session.staffId) {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
    }

    if (isManagement) {
      const permsJson = JSON.stringify(permissions || []);
      
      // Update Staff table
      await pool.query(
        'UPDATE staff SET name=?, email=?, role=?, note=?, permissions=? WHERE id=?',
        [name, email, role, note || '', permsJson, id]
      );

      // Update corresponding User record (linked by original ID or email)
      await pool.query(
        'UPDATE users SET name=?, email=?, role=?, permissions=? WHERE id=? OR email=?',
        [name, email, role.toLowerCase(), permsJson, 'u_' + id, email]
      );
    } else {
      // Staff can only update their own notes
      await pool.query('UPDATE staff SET note=? WHERE id=?', [note || '', id]);
    }

    await logActivity(session.user.id, 'Updated Staff & Permissions', 'Staff', { staffId: id });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('DB Error:', error);
    return NextResponse.json({ error: 'Failed to update staff' }, { status: 500 });
  }
}

export async function DELETE(request) {
  try {
    const role = session.user.role?.toLowerCase();
    const isManagement = ['founder', 'admin', 'hr'].includes(role);

    if (!session || !isManagement) {
      return NextResponse.json({ error: 'Unauthorized: Management only' }, { status: 401 });
    }

    const { searchParams = new URL(request.url).searchParams } = new URL(request.url);
    const id = searchParams.get('id');

    // Soft delete
    await pool.query('UPDATE transactions SET personId = NULL WHERE personId = ?', [id]);
    await pool.query('UPDATE staff SET isActive = FALSE WHERE id = ?', [id]);
    await pool.query('UPDATE users SET isActive = FALSE WHERE email IN (SELECT email FROM staff WHERE id = ?)', [id]);
    
    await logActivity(session.user.id, 'Deleted Staff & User', 'Staff', { staffId: id });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('DB Error:', error);
    return NextResponse.json({ error: 'Failed to remove staff' }, { status: 500 });
  }
}
