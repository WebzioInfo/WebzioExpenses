import { NextResponse } from 'next/server';
import pool from '@/src/lib/db';
import bcrypt from 'bcryptjs';
import { logActivity } from '@/src/lib/activity';

export async function POST(request) {
  try {
    const { email, otp, password } = await request.json();

    if (!email || !otp || !password) {
      return NextResponse.json({ error: 'Missing required fields' }, { status: 400 });
    }

    // Verify OTP
    const [resets] = await pool.query(
      'SELECT id FROM password_resets WHERE email = ? AND otp = ? AND expires_at > NOW()',
      [email, otp]
    );

    if (resets.length === 0) {
      return NextResponse.json({ error: 'Invalid or expired OTP' }, { status: 400 });
    }

    // Update Password
    const hashedPassword = await bcrypt.hash(password, 10);
    await pool.query('UPDATE users SET password = ? WHERE email = ?', [hashedPassword, email]);

    // Clear OTP
    await pool.query('DELETE FROM password_resets WHERE email = ?', [email]);

    // Log Activity
    const [user] = await pool.query('SELECT id FROM users WHERE email = ?', [email]);
    if (user[0]) {
      await logActivity(user[0].id, 'Password Reset via OTP', 'Auth', { email });
    }

    return NextResponse.json({ success: true, message: 'Password reset successfully' });
  } catch (error) {
    console.error('Reset Password error:', error);
    return NextResponse.json({ error: 'Failed to reset password' }, { status: 500 });
  }
}
