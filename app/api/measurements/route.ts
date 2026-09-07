import { NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import { getSession } from '@/lib/auth';

export async function GET() {
  try {
    const session = await getSession();
    if (!session?.userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const measurements = await prisma.bodyMeasurement.findMany({
      where: { userId: session.userId },
      orderBy: { date: 'asc' },
    });

    return NextResponse.json({ measurements });
  } catch (error) {
    console.error('Measurements GET error:', error);
    return NextResponse.json({ error: 'Failed to fetch measurements' }, { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    const session = await getSession();
    if (!session?.userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await request.json();
    const { date, chestCm, waistCm, hipsCm, armsCm, thighsCm, calvesCm, notes } = body;
    const targetDate = date || new Date().toISOString().split('T')[0];

    const record = await prisma.bodyMeasurement.upsert({
      where: { userId_date: { userId: session.userId, date: targetDate } },
      update: {
        chestCm: chestCm ? parseFloat(chestCm) : undefined,
        waistCm: waistCm ? parseFloat(waistCm) : undefined,
        hipsCm: hipsCm ? parseFloat(hipsCm) : undefined,
        armsCm: armsCm ? parseFloat(armsCm) : undefined,
        thighsCm: thighsCm ? parseFloat(thighsCm) : undefined,
        calvesCm: calvesCm ? parseFloat(calvesCm) : undefined,
        notes,
      },
      create: {
        userId: session.userId,
        date: targetDate,
        chestCm: chestCm ? parseFloat(chestCm) : undefined,
        waistCm: waistCm ? parseFloat(waistCm) : undefined,
        hipsCm: hipsCm ? parseFloat(hipsCm) : undefined,
        armsCm: armsCm ? parseFloat(armsCm) : undefined,
        thighsCm: thighsCm ? parseFloat(thighsCm) : undefined,
        calvesCm: calvesCm ? parseFloat(calvesCm) : undefined,
        notes,
      },
    });

    return NextResponse.json({ success: true, measurement: record });
  } catch (error) {
    console.error('Measurements POST error:', error);
    return NextResponse.json({ error: 'Failed to save measurements' }, { status: 500 });
  }
}
