import { NextResponse } from 'next/server';
import prisma from '@/lib/prisma';

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const category = searchParams.get('category');
    const search = searchParams.get('search');
    const isIndian = searchParams.get('isIndian');

    const where: any = {};

    if (category && category !== 'ALL') {
      where.category = category;
    }
    if (isIndian === 'true') {
      where.isIndian = true;
    }
    if (search && search.trim() !== '') {
      where.name = { contains: search.trim() };
    }

    const foods = await prisma.food.findMany({
      where,
      orderBy: { name: 'asc' },
    });

    return NextResponse.json({ foods });
  } catch (error) {
    console.error('Foods API error:', error);
    return NextResponse.json({ error: 'Failed to fetch foods' }, { status: 500 });
  }
}
