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
  cookieStore.set(COOKIE_NAME, '', {
    path: '/',
    maxAge: 0,
    expires: new Date(0),
    httpOnly: true,
  });
  try {
    cookieStore.delete(COOKIE_NAME);
  } catch {}
}

export async function calculateUserStreak(userId: string): Promise<number> {
  try {
    // 1. Workout sessions
    const sessions = await prisma.workoutSession.findMany({
      where: { userId },
      select: { createdAt: true, startedAt: true },
    });

    // 2. Nutrition logs
    const nutritionLogs = await prisma.nutritionLog.findMany({
      where: { userId },
      select: { date: true },
      distinct: ['date'],
    });

    // 3. Step logs with steps > 0
    const stepLogs = await prisma.stepLog.findMany({
      where: { userId, steps: { gt: 0 } },
      select: { date: true },
    });

    const activeDateSet = new Set<string>();

    sessions.forEach((s) => {
      const d = (s.startedAt || s.createdAt).toISOString().split('T')[0];
      activeDateSet.add(d);
    });

    nutritionLogs.forEach((n) => {
      if (n.date) activeDateSet.add(n.date);
    });

    stepLogs.forEach((st) => {
      if (st.date) activeDateSet.add(st.date);
    });

    if (activeDateSet.size === 0) {
      return 0;
    }

    const now = new Date();
    const todayStr = now.toISOString().split('T')[0];
    const yesterday = new Date(now.getTime() - 24 * 60 * 60 * 1000);
    const yesterdayStr = yesterday.toISOString().split('T')[0];

    // Anchor: today or yesterday
    let checkDate: Date;
    if (activeDateSet.has(todayStr)) {
      checkDate = now;
    } else if (activeDateSet.has(yesterdayStr)) {
      checkDate = yesterday;
    } else {
      return 0;
    }

    let streak = 0;
    while (true) {
      const dateStr = checkDate.toISOString().split('T')[0];
      if (activeDateSet.has(dateStr)) {
        streak++;
        checkDate = new Date(checkDate.getTime() - 24 * 60 * 60 * 1000);
      } else {
        break;
      }
    }

    return streak;
  } catch (error) {
    console.error('Error calculating streak:', error);
    return 0;
  }
}
