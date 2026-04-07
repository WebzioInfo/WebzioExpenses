import { NextResponse } from 'next/server';
import pool from '@/src/lib/db';
import { sendOtpEmail } from '@/src/lib/mail';

export async function POST(request) {
  try {
    const { email } = await request.json();

    // Check if user exists
    const [users] = await pool.query('SELECT id FROM users WHERE LOWER(email) = LOWER(?) AND isActive = TRUE', [email]);
    if (users.length === 0) {
      // For security, don't reveal if user doesn't exist. Just return success.
      // But for internal tools, sometimes a clearer error is better.
      return NextResponse.json({ success: true, message: 'If that email exists, an OTP has been sent.' });
    }

    // Generate 6-digit OTP
    const otp = Math.floor(100000 + Math.random() * 900000).toString();
    const expiresAt = new Date(Date.now() + 15 * 60 * 1000); // 15 minutes

    // Clear old OTPs for this email
    await pool.query('DELETE FROM password_resets WHERE LOWER(email) = LOWER(?)', [email]);

    // Save new OTP
    await pool.query(
      'INSERT INTO password_resets (email, otp, expires_at) VALUES (LOWER(?), ?, ?)',
      [email, otp, expiresAt]
    );

    // Send Email
    await sendOtpEmail(email, otp);

    return NextResponse.json({ success: true, message: 'OTP sent to your email.' });
  } catch (error) {
    console.error('Forgot Password error:', error);
    return NextResponse.json({ error: 'Failed to process request' }, { status: 500 });
  }
}
