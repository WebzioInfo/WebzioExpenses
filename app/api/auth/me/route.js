import pool from '@/src/lib/db';
import { NextResponse } from 'next/server';
import { verifyJwt } from '@/src/lib/auth';
import { cookies } from 'next/headers';

export async function GET(request) {
  try {
    const token = (await cookies()).get('webzio_session')?.value;
    if (!token) {
      return NextResponse.json({ error: 'No session found' }, { status: 401 });
    }

    const payload = await verifyJwt(token);
    if (!payload || !payload.id) {
      return NextResponse.json({ error: 'Session invalid' }, { status: 401 });
    }
    
    // Find User
    const [users] = await pool.query('SELECT * FROM users WHERE id = ? AND isActive = TRUE', [payload.id]);
    
    if (users.length === 0) {
      return NextResponse.json({ error: 'User not found or inactive' }, { status: 401 });
    }
    
    const { password: _, ...safeUser } = users[0];
    
    // Link to Staff Record by email
    const [staffRecords] = await pool.query('SELECT id, name, role as staffRole FROM staff WHERE email = ? AND isActive = TRUE', [safeUser.email]);
    if (staffRecords.length > 0) {
      safeUser.staffId = staffRecords[0].id;
      safeUser.staffName = staffRecords[0].name;
      // Note: We use user.role for AUTH and staffRole for internal STAFF definition if they differ
    }

    // Parse permissions if they exist
    if (safeUser.permissions) {
      try {
        if (typeof safeUser.permissions === 'string') {
          safeUser.permissions = JSON.parse(safeUser.permissions);
        }
      } catch (e) {
        safeUser.permissions = ["Tasks"]; 
      }
    } else {
      safeUser.permissions = ["Tasks"];
    }

    return NextResponse.json({ success: true, user: safeUser });
  } catch (error) {
    console.error('Session check failed:', error);
    return NextResponse.json({ error: 'Auth check failed' }, { status: 500 });
  }
}
