import { NextResponse } from 'next/server';
import pool from '@/src/lib/db';
import { getServerSession } from '@/src/lib/auth-server';
import bcrypt from 'bcryptjs';
import { logActivity } from '@/src/lib/activity';

export async function GET(request) {
  try {
    const session = await getServerSession();
    if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

    const [users] = await pool.query(
      'SELECT id, name, email, role, profile_pic FROM users WHERE id = ?',
      [session.user.id]
    );

    if (users.length === 0) return NextResponse.json({ error: 'User not found' }, { status: 404 });

    return NextResponse.json(users[0]);
  } catch (error) {
    console.error('Profile GET error:', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}

export async function PUT(request) {
  try {
    const session = await getServerSession();
    if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

    const { name, profile_pic, password, otp } = await request.json();
    const [users] = await pool.query('SELECT email FROM users WHERE id = ?', [session.user.id]);
    const email = users[0]?.email;
    
    if (password) {
      if (!otp) return NextResponse.json({ error: 'Verification OTP is required to change password' }, { status: 400 });
      
      // Verify OTP with canonical email
      const [resets] = await pool.query(
        'SELECT id, expires_at FROM password_resets WHERE LOWER(email) = LOWER(?) AND otp = ?',
        [email, otp]
      );

      if (resets.length === 0) {
        console.error(`OTP Verification Failed: No match found for email ${email} and otp ${otp}`);
        return NextResponse.json({ error: 'Invalid OTP' }, { status: 400 });
      }

      const now = new Date();
      if (new Date(resets[0].expires_at) < now) {
        console.error(`OTP Verification Failed: OTP expired at ${resets[0].expires_at} for email ${email}`);
        return NextResponse.json({ error: 'Expired OTP' }, { status: 400 });
      }

      const hashedPassword = await bcrypt.hash(password, 10);
      await pool.query('UPDATE users SET password = ? WHERE id = ?', [hashedPassword, session.user.id]);
      
      // Clear OTP
      await pool.query('DELETE FROM password_resets WHERE LOWER(email) = LOWER(?)', [email]);
      
      await logActivity(session.user.id, 'Updated Password', 'Settings', { type: 'password' });
    }

    if (name || profile_pic) {
      const updates = [];
      const params = [];

      if (name) {
        updates.push('name = ?');
        params.push(name);
      }
      if (profile_pic) {
        updates.push('profile_pic = ?');
        params.push(profile_pic);
      }

      params.push(session.user.id);
      await pool.query(`UPDATE users SET ${updates.join(', ')} WHERE id = ?`, params);

      // If name or pic updated in users, sync with staff table if applicable
      const [usersNew] = await pool.query('SELECT role, email FROM users WHERE id = ?', [session.user.id]);
      if (usersNew[0]?.role === 'staff') {
        const staffUpdates = [];
        const staffParams = [];
        if (name) {
          staffUpdates.push('name = ?');
          staffParams.push(name);
        }
        if (profile_pic) {
          staffUpdates.push('profile_pic = ?');
          staffParams.push(profile_pic);
        }
        staffParams.push(users[0].email); // Uses email from line 32
        await pool.query(`UPDATE staff SET ${staffUpdates.join(', ')} WHERE email = ?`, staffParams);
      }
      
      await logActivity(session.user.id, 'Updated Profile Info', 'Settings', { 
        nameChanged: !!name, 
        picChanged: !!profile_pic 
      });
    }

    return NextResponse.json({ success: true, message: 'Profile updated' });
  } catch (error) {
    console.error('Profile PUT error:', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}
