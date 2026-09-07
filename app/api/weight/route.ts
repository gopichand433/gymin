import { NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import { getSession } from '@/lib/auth';

export async function GET() {
  try {
    const session = await getSession();
    if (!session?.userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const logs = await prisma.weightLog.findMany({
      where: { userId: session.userId },
      orderBy: { date: 'asc' },
    });

    const startingWeight = logs.length > 0 ? logs[0].weightKg : 75;
    const currentWeight = logs.length > 0 ? logs[logs.length - 1].weightKg : startingWeight;
    const change = Math.round((currentWeight - startingWeight) * 10) / 10;

    return NextResponse.json({
      startingWeight,
      currentWeight,
      change,
      history: logs,
    });
  } catch (error) {
    console.error('Weight GET error:', error);
    return NextResponse.json({ error: 'Failed to fetch weight logs' }, { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    const session = await getSession();
    if (!session?.userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await request.json();
    const { weightKg, date, notes } = body;
    const targetDate = date || new Date().toISOString().split('T')[0];
    const weight = parseFloat(weightKg);

    if (isNaN(weight) || weight <= 0) {
      return NextResponse.json({ error: 'Valid weight value required' }, { status: 400 });
    }

    const log = await prisma.weightLog.upsert({
      where: { userId_date: { userId: session.userId, date: targetDate } },
      update: { weightKg: weight, notes },
      create: {
        userId: session.userId,
        date: targetDate,
        weightKg: weight,
        notes,
      },
    });

    // Update profile current weight as well
    await prisma.userProfile.updateMany({
      where: { userId: session.userId },
      data: { weightKg: weight },
    });

    return NextResponse.json({ success: true, log });
  } catch (error) {
    console.error('Weight POST error:', error);
    return NextResponse.json({ error: 'Failed to record weight' }, { status: 500 });
  }
}
