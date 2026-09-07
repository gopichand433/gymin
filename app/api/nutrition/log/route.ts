import { NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import { getSession } from '@/lib/auth';

export async function POST(request: Request) {
  try {
    const session = await getSession();
    if (!session?.userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await request.json();
    const {
      mealType,
      foodId,
      foodName,
      servingUnit,
      quantity,
      calories,
      protein,
      carbs,
      fat,
      date,
    } = body;

    const todayStr = date || new Date().toISOString().split('T')[0];

    // Ensure foodId is a valid foreign key if provided
    let validFoodId: string | null = null;
    if (foodId) {
      const foodExists = await prisma.food.findUnique({
        where: { id: foodId },
        select: { id: true },
      });
      if (foodExists) {
        validFoodId = foodExists.id;
      }
    }

    const log = await prisma.nutritionLog.create({
      data: {
        userId: session.userId,
        date: todayStr,
        mealType: mealType || 'SNACK',
        foodId: validFoodId,
        foodName: foodName || 'Custom Food',
        servingUnit: servingUnit || 'g',
        quantity: Math.max(0.1, parseFloat(quantity) || 100),
        calories: Math.max(0, Math.round(parseFloat(calories) || 0)),
        protein: Math.max(0, Math.round(parseFloat(protein) || 0)),
        carbs: Math.max(0, Math.round(parseFloat(carbs) || 0)),
        fat: Math.max(0, Math.round(parseFloat(fat) || 0)),
      },
    });

    return NextResponse.json({ success: true, log });
  } catch (error: any) {
    console.error('Add food log error:', error);
    return NextResponse.json({ error: error?.message || 'Failed to log food' }, { status: 500 });
  }
}

export async function DELETE(request: Request) {
  try {
    const session = await getSession();
    if (!session?.userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const id = searchParams.get('id');

    if (!id) {
      return NextResponse.json({ error: 'Log ID required' }, { status: 400 });
    }

    // Verify ownership
    const log = await prisma.nutritionLog.findUnique({ where: { id } });
    if (!log || log.userId !== session.userId) {
      return NextResponse.json({ error: 'Log not found or unauthorized' }, { status: 404 });
    }

    await prisma.nutritionLog.delete({ where: { id } });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Delete food log error:', error);
    return NextResponse.json({ error: 'Failed to delete food log' }, { status: 500 });
  }
}
