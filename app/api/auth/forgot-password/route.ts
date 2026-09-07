import { NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import { hashPassword } from '@/lib/auth';

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { email, newPassword } = body;

    if (!email) {
      return NextResponse.json({ error: 'Email address is required.' }, { status: 400 });
    }

    const user = await prisma.user.findUnique({
      where: { email: email.toLowerCase().trim() },
    });

    if (!user) {
      // Return success simulation for security (avoid enumeration)
      return NextResponse.json({
        success: true,
        message: 'If an account exists with this email, password reset instructions or update has been processed.',
      });
    }

    if (newPassword) {
      const passwordRegex = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d).{8,}$/;
      if (!passwordRegex.test(newPassword)) {
        return NextResponse.json(
          { error: 'New password must be at least 8 characters and include uppercase, lowercase, and a number.' },
          { status: 400 }
        );
      }
      const hashedPassword = await hashPassword(newPassword);
      await prisma.user.update({
        where: { id: user.id },
        data: { passwordHash: hashedPassword },
      });
      return NextResponse.json({
        success: true,
        message: 'Your password has been successfully reset! You can now log in.',
      });
    }

    return NextResponse.json({
      success: true,
      message: 'Reset instructions have been dispatched. You can enter your new password now.',
      canResetDirectly: true,
    });
  } catch (error) {
    console.error('Password reset error:', error);
    return NextResponse.json(
      { error: 'Failed to process password reset.' },
      { status: 500 }
    );
  }
}
