import { NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import { COUNTRY_METADATA } from '@/lib/nutrition/master-foods-data';

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const category = searchParams.get('category');
    const country = searchParams.get('country');
    const search = searchParams.get('search');
    const isIndian = searchParams.get('isIndian');
    const isVeg = searchParams.get('isVeg');
    const highProtein = searchParams.get('highProtein');

    const where: any = {};

    if (category && category !== 'ALL') {
      where.category = category;
    }
    if (country && country !== 'ALL' && country !== 'All') {
      where.country = country;
    }
    if (isIndian === 'true') {
      where.isIndian = true;
    }
    if (isVeg === 'true') {
      where.isVeg = true;
    }
    if (highProtein === 'true') {
      where.proteinPer100 = { gte: 12 };
    }
    if (search && search.trim() !== '') {
      const q = search.trim();
      where.OR = [
        { name: { contains: q, mode: 'insensitive' } },
        { category: { contains: q, mode: 'insensitive' } },
        { subcategory: { contains: q, mode: 'insensitive' } },
        { country: { contains: q, mode: 'insensitive' } },
        { notes: { contains: q, mode: 'insensitive' } },
      ];
    }

    const foods = await prisma.food.findMany({
      where,
      orderBy: [{ country: 'asc' }, { name: 'asc' }],
    });

    // Compute live item counts per country
    const countryCounts: Record<string, number> = {};
    const allDbFoods = await prisma.food.findMany({
      select: { country: true },
    });
    for (const f of allDbFoods) {
      const c = f.country || 'Global';
      countryCounts[c] = (countryCounts[c] || 0) + 1;
    }

    return NextResponse.json({
      totalCount: foods.length,
      foods,
      countryCounts,
      countryMetadata: COUNTRY_METADATA,
    });
  } catch (error) {
    console.error('Foods API error:', error);
    return NextResponse.json({ error: 'Failed to fetch foods' }, { status: 500 });
  }
}

