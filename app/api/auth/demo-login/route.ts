import { NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import { setSessionCookie } from '@/lib/auth';

export async function POST() {
  try {
    const demoEmail = 'demo@gymin.app';
    const user = await prisma.user.findUnique({
      where: { email: demoEmail },
      include: { profile: true },
    });

    if (!user) {
      return NextResponse.json(
        { error: 'Demo account not initialized. Please run seed script.' },
        { status: 404 }
      );
    }

    await setSessionCookie({
      userId: user.id,
      email: user.email,
      name: user.name,
    });

    return NextResponse.json({
      success: true,
      user: { id: user.id, name: user.name, email: user.email },
      redirectUrl: '/dashboard',
    });
  } catch (error) {
    console.error('Demo login error:', error);
    return NextResponse.json(
      { error: 'Failed to authenticate demo user.' },
      { status: 500 }
    );
  }
}
