import { cookies } from 'next/headers';
import pool from './db';
import { verifyJwt } from './auth';

export async function getServerSession() {
  try {
    const cookieStore = await cookies();
    const token = cookieStore.get('webzio_session')?.value;
    
    if (!token) return null;

    const payload = await verifyJwt(token);
    if (!payload || !payload.id) return null;

    // Fetch full user data
    const [users] = await pool.query(
      'SELECT id, name, email, role, isActive, permissions FROM users WHERE id = ? AND isActive = TRUE', 
      [payload.id]
    );

    if (users.length === 0) return null;

    const user = users[0];
    
    // Attempt to link to Staff record
    const [staffRecords] = await pool.query(
      'SELECT id, name, role as staffRole FROM staff WHERE email = ? AND isActive = TRUE',
      [user.email]
    );

    const staff = staffRecords.length > 0 ? staffRecords[0] : null;

    return {
      user,
      staffId: staff?.id || null,
      isAdmin: user.role === 'admin',
      isStaff: user.role === 'staff' || (staff && staff.staffRole === 'Staff'),
      isFreelancer: user.role === 'freelancer' || (staff && staff.staffRole === 'Freelancer'),
      permissions: typeof user.permissions === 'string' ? JSON.parse(user.permissions || '[]') : (user.permissions || [])
    };
  } catch (error) {
    console.error('getServerSession Error:', error);
    return null;
  }
}
