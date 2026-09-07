import { cookies } from 'next/headers';
import jwt from 'jsonwebtoken';
import bcrypt from 'bcryptjs';
import prisma from './prisma';

const JWT_SECRET = process.env.JWT_SECRET || 'gymin_secret_key_change_in_production_2026';
const COOKIE_NAME = 'gymin_session';

export interface UserSessionPayload {
  userId: string;
  email: string;
  name: string;
}

export function signJwtToken(payload: UserSessionPayload): string {
  return jwt.sign(payload, JWT_SECRET, { expiresIn: '30d' });
}

export function verifyJwtToken(token: string): UserSessionPayload | null {
  try {
    return jwt.verify(token, JWT_SECRET) as UserSessionPayload;
  } catch {
    return null;
  }
}

export async function hashPassword(password: string): Promise<string> {
  return bcrypt.hash(password, 10);
}

export async function comparePassword(plain: string, hashed: string): Promise<boolean> {
  return bcrypt.compare(plain, hashed);
}

export async function getSession(): Promise<UserSessionPayload | null> {
  const cookieStore = await cookies();
  const token = cookieStore.get(COOKIE_NAME)?.value;
  if (!token) return null;
  const payload = verifyJwtToken(token);
  if (!payload?.userId) return null;

  try {
    // 1. Direct match by ID
    const user = await prisma.user.findUnique({
      where: { id: payload.userId },
      select: { id: true, email: true, name: true },
    });

    if (user) {
      return {
        userId: user.id,
        email: user.email,
        name: user.name,
      };
    }

    // 2. If ID changed (e.g. database re-seeded), match by email
    if (payload.email) {
      const userByEmail = await prisma.user.findUnique({
        where: { email: payload.email },
        select: { id: true, email: true, name: true },
      });
      if (userByEmail) {
        return {
          userId: userByEmail.id,
          email: userByEmail.email,
          name: userByEmail.name,
        };
      }
    }

    // 3. Fallback to active demo user if present
    const demoUser = await prisma.user.findFirst({
      select: { id: true, email: true, name: true },
    });
    if (demoUser) {
      return {
        userId: demoUser.id,
        email: demoUser.email,
        name: demoUser.name,
      };
    }

    return null;
  } catch (err) {
    console.error('Session user verification error:', err);
    return payload;
  }
}

export async function getCurrentUser() {
  const session = await getSession();
  if (!session?.userId) return null;

  try {
    const user = await prisma.user.findUnique({
      where: { id: session.userId },
      include: {
        profile: true,
      },
    });
    return user;
  } catch (error) {
    console.error('Error fetching current user:', error);
    return null;
  }
}

export async function setSessionCookie(payload: UserSessionPayload) {
  const token = signJwtToken(payload);
  const cookieStore = await cookies();
  cookieStore.set(COOKIE_NAME, token, {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'lax',
    path: '/',
    maxAge: 30 * 24 * 60 * 60, // 30 days
  });
}

export async function clearSessionCookie() {
  const cookieStore = await cookies();
  cookieStore.delete(COOKIE_NAME);
}
