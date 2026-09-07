import { NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import { getSession } from '@/lib/auth';

export async function GET() {
  try {
    const session = await getSession();
    if (!session?.userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const allAchievements = await prisma.achievement.findMany({
      orderBy: { requirementThreshold: 'asc' },
    });

    const userAchievements = await prisma.userAchievement.findMany({
      where: { userId: session.userId },
      include: { achievement: true },
    });

    const unlockedMap = new Map(userAchievements.map((ua) => [ua.achievementId, ua.unlockedAt]));

    const achievementsWithStatus = allAchievements.map((ach) => ({
      ...ach,
      isUnlocked: unlockedMap.has(ach.id),
      unlockedAt: unlockedMap.get(ach.id) || null,
    }));

    return NextResponse.json({ achievements: achievementsWithStatus });
  } catch (error) {
    console.error('Achievements GET error:', error);
    return NextResponse.json({ error: 'Failed to fetch achievements' }, { status: 500 });
  }
}
