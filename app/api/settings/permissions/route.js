import { NextResponse } from 'next/server';
import pool from '@/src/lib/db';

export async function PUT(request) {
  try {
    const { userId, role, permissions } = await request.json();
    
    // permissions should be an array of module names, e.g. ["Finance", "Projects", "Tasks", "Staff"]
    const permissionsJson = JSON.stringify(permissions || []);

    await pool.query(
      'UPDATE users SET role = ?, permissions = ? WHERE id = ?',
      [role, permissionsJson, userId]
    );

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('DB Error:', error);
    return NextResponse.json({ error: 'Failed to update permissions' }, { status: 500 });
  }
}

export async function GET() {
  try {
    const [users] = await pool.query('SELECT id, name, email, role, permissions FROM users WHERE isActive = TRUE');
    
    const formattedUsers = users.map(u => ({
      ...u,
      permissions: u.permissions ? JSON.parse(u.permissions) : []
    }));

    return NextResponse.json(formattedUsers);
  } catch (error) {
    console.error('DB Error:', error);
    return NextResponse.json({ error: 'Failed to fetch users' }, { status: 500 });
  }
}
