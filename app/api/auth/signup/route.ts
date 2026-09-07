import { NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import { hashPassword, setSessionCookie } from '@/lib/auth';

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { name, email, password, age } = body;

    if (!name || !email || !password) {
      return NextResponse.json(
        { error: 'Name, email, and password are required.' },
        { status: 400 }
      );
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      return NextResponse.json(
        { error: 'Please enter a valid email address.' },
        { status: 400 }
      );
    }

    // Password validation: minimum 8 chars, 1 uppercase, 1 lowercase, 1 digit
    const passwordRegex = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d).{8,}$/;
    if (!passwordRegex.test(password)) {
      return NextResponse.json(
        {
          error:
            'Password must be at least 8 characters long and include an uppercase letter, lowercase letter, and a number.',
        },
        { status: 400 }
      );
    }

    const normalizedEmail = email.toLowerCase().trim();
    const existingUser = await prisma.user.findUnique({
      where: { email: normalizedEmail },
    });

    if (existingUser) {
      return NextResponse.json(
        { error: 'An account with this email already exists. Please log in.' },
        { status: 409 }
      );
    }

    const hashedPassword = await hashPassword(password);
    const parsedAge = age ? parseInt(age, 10) : undefined;

    const user = await prisma.user.create({
      data: {
        name: name.trim(),
        email: normalizedEmail,
        passwordHash: hashedPassword,
      },
    });

    // Set auth session
    await setSessionCookie({
      userId: user.id,
      email: user.email,
      name: user.name,
    });

    return NextResponse.json({
      success: true,
      user: { id: user.id, name: user.name, email: user.email },
      redirectUrl: '/onboarding',
    });
  } catch (error) {
    console.error('Signup error:', error);
    return NextResponse.json(
      { error: 'An error occurred while creating your account. Please try again.' },
      { status: 500 }
    );
  }
}
