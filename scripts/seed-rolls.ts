import { PrismaClient } from '@prisma/client';
import fs from 'fs';
import path from 'path';
import { MASTER_FOODS, MasterFoodItem, COUNTRY_METADATA } from '../lib/nutrition/master-foods-data';

const prisma = new PrismaClient();

const rollsData: MasterFoodItem[] = [
  {
    name: 'Kolkata Chicken Kathi Roll',
    category: 'Rolls & Wraps',
    subcategory: 'Kathi Rolls',
    country: 'India',
    caloriesPer100: 235,
    proteinPer100: 14.5,
    carbsPer100: 24.0,
    fatPer100: 9.8,
    fiberPer100: 1.8,
    servingUnits: JSON.stringify([
      { unit: 'roll', multiplier: 1.8 },
      { unit: 'piece', multiplier: 1.8 },
      { unit: 'g', multiplier: 1 },
    ]),
    isIndian: true,
    isVeg: false,
    notes: 'Flaky layered paratha lined with egg, stuffed with spiced grilled chicken tikka, sliced onions, chaat masala, lemon and green chilies.',
  },
  {
    name: 'Double Egg Kathi Roll',
    category: 'Rolls & Wraps',
    subcategory: 'Kathi Rolls',
    country: 'India',
    caloriesPer100: 220,
    proteinPer100: 11.8,
    carbsPer100: 25.0,
    fatPer100: 8.5,
    fiberPer100: 1.5,
    servingUnits: JSON.stringify([
      { unit: 'roll', multiplier: 1.7 },
      { unit: 'piece', multiplier: 1.7 },
      { unit: 'g', multiplier: 1 },
    ]),
    isIndian: true,
    isVeg: false,
    notes: 'Warm crisp paratha layered with 2 whole fried eggs, crunchy spiced onions and tangy green chutney.',
  },
  {
    name: 'Paneer Tikka Kathi Roll (Paneer Frankie)',
    category: 'Rolls & Wraps',
    subcategory: 'Kathi Rolls',
    country: 'India',
    caloriesPer100: 245,
    proteinPer100: 12.5,
    carbsPer100: 26.0,
    fatPer100: 10.5,
    fiberPer100: 2.5,
    servingUnits: JSON.stringify([
      { unit: 'roll', multiplier: 1.8 },
      { unit: 'piece', multiplier: 1.8 },
      { unit: 'g', multiplier: 1 },
    ]),
    isIndian: true,
    isVeg: true,
    notes: 'Char-grilled spiced cottage cheese cubes, bell peppers and mint chutney rolled in a warm flaky flatbread.',
  },
  {
    name: 'Mutton Seekh Kebab Roll',
    category: 'Rolls & Wraps',
    subcategory: 'Kathi Rolls',
    country: 'India',
    caloriesPer100: 260,
    proteinPer100: 16.5,
    carbsPer100: 22.0,
    fatPer100: 12.0,
    fiberPer100: 1.2,
    servingUnits: JSON.stringify([
      { unit: 'roll', multiplier: 1.9 },
      { unit: 'piece', multiplier: 1.9 },
      { unit: 'g', multiplier: 1 },
    ]),
    isIndian: true,
    isVeg: false,
    notes: 'Juicy charcoal-grilled spiced minced mutton seekh kebab wrapped in a soft roomali roti with sliced onions.',
  },
  {
    name: 'Soya Chaap Kathi Roll (High Protein Veg)',
    category: 'Rolls & Wraps',
    subcategory: 'Kathi Rolls',
    country: 'India',
    caloriesPer100: 210,
    proteinPer100: 16.0,
    carbsPer100: 25.0,
    fatPer100: 5.5,
    fiberPer100: 4.2,
    servingUnits: JSON.stringify([
      { unit: 'roll', multiplier: 1.8 },
      { unit: 'piece', multiplier: 1.8 },
      { unit: 'g', multiplier: 1 },
    ]),
    isIndian: true,
    isVeg: true,
    notes: 'Tandoori marinated soya chaap pieces wrapped in whole wheat roti; high vegetarian protein.',
  },
  {
    name: 'Mumbai Veg Frankie (Aloo Roll)',
    category: 'Rolls & Wraps',
    subcategory: 'Frankie',
    country: 'India',
    caloriesPer100: 195,
    proteinPer100: 4.8,
    carbsPer100: 31.0,
    fatPer100: 6.2,
    fiberPer100: 3.0,
    servingUnits: JSON.stringify([
      { unit: 'roll', multiplier: 1.6 },
      { unit: 'piece', multiplier: 1.6 },
      { unit: 'g', multiplier: 1 },
    ]),
    isIndian: true,
    isVeg: true,
    notes: 'Mumbai street food spiced potato cutlet rolled with special frankie masala, chopped onions and vinegar green chillies.',
  },
  {
    name: 'Chicken Shawarma Roll (Rumali Roti / Khubz Wrap)',
    category: 'Rolls & Wraps',
    subcategory: 'Shawarma',
    country: 'Middle East',
    caloriesPer100: 215,
    proteinPer100: 15.5,
    carbsPer100: 21.0,
    fatPer100: 7.8,
    fiberPer100: 1.5,
    servingUnits: JSON.stringify([
      { unit: 'roll', multiplier: 2.0 },
      { unit: 'piece', multiplier: 2.0 },
      { unit: 'g', multiplier: 1 },
    ]),
    isIndian: false,
    isVeg: false,
    notes: 'Spit-roasted sliced chicken, creamy garlic toum, tahini and pickled cucumbers rolled tight in thin Lebanese flatbread.',
  },
  {
    name: 'California Sushi Roll (8 pieces)',
    category: 'Rolls & Wraps',
    subcategory: 'Sushi Rolls',
    country: 'Japan',
    caloriesPer100: 155,
    proteinPer100: 4.5,
    carbsPer100: 28.0,
    fatPer100: 3.2,
    fiberPer100: 1.8,
    servingUnits: JSON.stringify([
      { unit: 'piece', multiplier: 0.25 },
      { unit: 'roll', multiplier: 2.0 },
      { unit: 'g', multiplier: 1 },
    ]),
    isIndian: false,
    isVeg: false,
    notes: 'Classic uramaki roll with seasoned crab stick, ripe avocado, crisp cucumber, toasted nori and sesame seeds.',
  },
  {
    name: 'Spicy Tuna Roll (8 pieces)',
    category: 'Rolls & Wraps',
    subcategory: 'Sushi Rolls',
    country: 'Japan',
    caloriesPer100: 185,
    proteinPer100: 11.5,
    carbsPer100: 24.0,
    fatPer100: 5.2,
    fiberPer100: 1.2,
    servingUnits: JSON.stringify([
      { unit: 'piece', multiplier: 0.25 },
      { unit: 'roll', multiplier: 2.0 },
      { unit: 'g', multiplier: 1 },
    ]),
    isIndian: false,
    isVeg: false,
    notes: 'Fresh diced yellowfin tuna tossed with sriracha, sesame oil, scallions and spicy mayo rolled in sushi rice.',
  },
  {
    name: 'Spicy Salmon Roll (8 pieces)',
    category: 'Rolls & Wraps',
    subcategory: 'Sushi Rolls',
    country: 'Japan',
    caloriesPer100: 195,
    proteinPer100: 11.0,
    carbsPer100: 23.5,
    fatPer100: 6.5,
    fiberPer100: 1.2,
    servingUnits: JSON.stringify([
      { unit: 'piece', multiplier: 0.25 },
      { unit: 'roll', multiplier: 2.0 },
      { unit: 'g', multiplier: 1 },
    ]),
    isIndian: false,
    isVeg: false,
    notes: 'Fresh Atlantic salmon chunks tossed with Japanese spicy sauce, scallions and sesame seeds.',
  },
  {
    name: 'Dragon Sushi Roll (8 pieces with Unagi & Avocado)',
    category: 'Rolls & Wraps',
    subcategory: 'Sushi Rolls',
    country: 'Japan',
    caloriesPer100: 210,
    proteinPer100: 8.5,
    carbsPer100: 28.0,
    fatPer100: 7.5,
    fiberPer100: 2.0,
    servingUnits: JSON.stringify([
      { unit: 'piece', multiplier: 0.28 },
      { unit: 'roll', multiplier: 2.2 },
      { unit: 'g', multiplier: 1 },
    ]),
    isIndian: false,
    isVeg: false,
    notes: 'Grilled unagi eel and cucumber inside, draped with thinly sliced avocado resembling dragon scales, brushed with sweet unagi glaze.',
  },
  {
    name: 'Philadelphia Roll (8 pieces with Smoked Salmon & Cream Cheese)',
    category: 'Rolls & Wraps',
    subcategory: 'Sushi Rolls',
    country: 'United States',
    caloriesPer100: 205,
    proteinPer100: 9.5,
    carbsPer100: 24.0,
    fatPer100: 8.0,
    fiberPer100: 1.0,
    servingUnits: JSON.stringify([
      { unit: 'piece', multiplier: 0.25 },
      { unit: 'roll', multiplier: 2.0 },
      { unit: 'g', multiplier: 1 },
    ]),
    isIndian: false,
    isVeg: false,
    notes: 'Smoked salmon, Philadelphia cream cheese and cucumber rolled inside out with toasted sesame.',
  },
  {
    name: 'Tempura Shrimp Crunchy Roll (8 pieces)',
    category: 'Rolls & Wraps',
    subcategory: 'Sushi Rolls',
    country: 'Japan',
    caloriesPer100: 225,
    proteinPer100: 8.0,
    carbsPer100: 31.0,
    fatPer100: 7.8,
    fiberPer100: 1.5,
    servingUnits: JSON.stringify([
      { unit: 'piece', multiplier: 0.28 },
      { unit: 'roll', multiplier: 2.2 },
      { unit: 'g', multiplier: 1 },
    ]),
    isIndian: false,
    isVeg: false,
    notes: 'Crispy fried panko shrimp tempura, avocado and cucumber rolled and coated in crispy tempura flakes and eel sauce.',
  },
  {
    name: 'Avocado & Cucumber Maki Roll (8 pieces, Vegetarian)',
    category: 'Rolls & Wraps',
    subcategory: 'Sushi Rolls',
    country: 'Japan',
    caloriesPer100: 140,
    proteinPer100: 3.0,
    carbsPer100: 27.0,
    fatPer100: 2.8,
    fiberPer100: 2.2,
    servingUnits: JSON.stringify([
      { unit: 'piece', multiplier: 0.22 },
      { unit: 'roll', multiplier: 1.8 },
      { unit: 'g', multiplier: 1 },
    ]),
    isIndian: false,
    isVeg: true,
    notes: 'Fresh Hass avocado and crisp cucumber wrapped in nori seaweed and seasoned sushi rice.',
  },
  {
    name: 'Crispy Vegetable Spring Rolls (4 rolls with Sweet Chili Dip)',
    category: 'Rolls & Wraps',
    subcategory: 'Spring Rolls',
    country: 'China',
    caloriesPer100: 215,
    proteinPer100: 4.2,
    carbsPer100: 32.0,
    fatPer100: 8.5,
    fiberPer100: 2.8,
    servingUnits: JSON.stringify([
      { unit: 'piece', multiplier: 0.45 },
      { unit: 'serving', multiplier: 1.8 },
      { unit: 'g', multiplier: 1 },
    ]),
    isIndian: false,
    isVeg: true,
    notes: 'Golden fried crisp pastry rolls filled with shredded cabbage, carrots, wood ear mushrooms and glass noodles (~97 kcal per roll).',
  },
  {
    name: 'Crispy Chicken Spring Rolls (4 rolls)',
    category: 'Rolls & Wraps',
    subcategory: 'Spring Rolls',
    country: 'China',
    caloriesPer100: 245,
    proteinPer100: 11.5,
    carbsPer100: 28.0,
    fatPer100: 10.0,
    fiberPer100: 1.8,
    servingUnits: JSON.stringify([
      { unit: 'piece', multiplier: 0.45 },
      { unit: 'serving', multiplier: 1.8 },
      { unit: 'g', multiplier: 1 },
    ]),
    isIndian: false,
    isVeg: false,
    notes: 'Deep-fried golden pastry cylinders stuffed with seasoned minced chicken breast, scallions and ginger.',
  },
  {
    name: 'Vietnamese Fresh Summer Roll (Gỏi Cuốn with Shrimp, 2 rolls)',
    category: 'Rolls & Wraps',
    subcategory: 'Spring Rolls',
    country: 'Vietnam',
    caloriesPer100: 125,
    proteinPer100: 7.5,
    carbsPer100: 18.0,
    fatPer100: 2.5,
    fiberPer100: 1.5,
    servingUnits: JSON.stringify([
      { unit: 'piece', multiplier: 0.65 },
      { unit: 'serving', multiplier: 1.3 },
      { unit: 'g', multiplier: 1 },
    ]),
    isIndian: false,
    isVeg: false,
    notes: 'Translucent rice paper rolled with steamed tiger shrimp, fresh mint, cilantro, cucumber and rice vermicelli (~81 kcal per roll).',
  },
  {
    name: 'Vietnamese Crispy Spring Roll (Chả Giò, 4 rolls)',
    category: 'Rolls & Wraps',
    subcategory: 'Spring Rolls',
    country: 'Vietnam',
    caloriesPer100: 260,
    proteinPer100: 12.0,
    carbsPer100: 24.0,
    fatPer100: 13.5,
    fiberPer100: 1.5,
    servingUnits: JSON.stringify([
      { unit: 'piece', multiplier: 0.40 },
      { unit: 'serving', multiplier: 1.6 },
      { unit: 'g', multiplier: 1 },
    ]),
    isIndian: false,
    isVeg: false,
    notes: 'Crispy golden fried rolls stuffed with minced pork, shrimp, wood ear mushrooms and glass noodles.',
  },
  {
    name: 'Chinese-American Pork Egg Roll (2 large rolls)',
    category: 'Rolls & Wraps',
    subcategory: 'Egg Rolls',
    country: 'United States',
    caloriesPer100: 250,
    proteinPer100: 9.5,
    carbsPer100: 28.0,
    fatPer100: 11.5,
    fiberPer100: 2.2,
    servingUnits: JSON.stringify([
      { unit: 'piece', multiplier: 0.85 },
      { unit: 'serving', multiplier: 1.7 },
      { unit: 'g', multiplier: 1 },
    ]),
    isIndian: false,
    isVeg: false,
    notes: 'Thick crispy blistered egg noodle wrapper filled with seasoned ground pork, cabbage and celery (~212 kcal per roll).',
  },
  {
    name: 'Classic Cinnamon Roll with Cream Cheese Icing',
    category: 'Rolls & Wraps',
    subcategory: 'Bakery Rolls',
    country: 'United States',
    caloriesPer100: 390,
    proteinPer100: 5.2,
    carbsPer100: 54.0,
    fatPer100: 17.5,
    fiberPer100: 2.0,
    servingUnits: JSON.stringify([
      { unit: 'piece', multiplier: 1.1 },
      { unit: 'roll', multiplier: 1.1 },
      { unit: 'g', multiplier: 1 },
    ]),
    isIndian: false,
    isVeg: true,
    notes: 'Warm baked sweet yeast dough swirled with cinnamon butter and brown sugar, topped with rich cream cheese glaze (~430 kcal).',
  },
  {
    name: 'British Flaky Sausage Roll',
    category: 'Rolls & Wraps',
    subcategory: 'Bakery Rolls',
    country: 'United Kingdom',
    caloriesPer100: 345,
    proteinPer100: 10.5,
    carbsPer100: 26.0,
    fatPer100: 22.0,
    fiberPer100: 1.2,
    servingUnits: JSON.stringify([
      { unit: 'piece', multiplier: 1.0 },
      { unit: 'roll', multiplier: 1.0 },
      { unit: 'g', multiplier: 1 },
    ]),
    isIndian: false,
    isVeg: false,
    notes: 'Flaky golden puff pastry rolled around seasoned minced British pork sausage meat (~345 kcal per roll).',
  },
  {
    name: 'New England Lobster Roll (Warm Butter or Mayo Style)',
    category: 'Rolls & Wraps',
    subcategory: 'Seafood Rolls',
    country: 'United States',
    caloriesPer100: 215,
    proteinPer100: 16.5,
    carbsPer100: 18.0,
    fatPer100: 9.5,
    fiberPer100: 0.8,
    servingUnits: JSON.stringify([
      { unit: 'roll', multiplier: 1.8 },
      { unit: 'piece', multiplier: 1.8 },
      { unit: 'g', multiplier: 1 },
    ]),
    isIndian: false,
    isVeg: false,
    notes: 'Sweet Maine lobster claw and knuckle meat tossed in warm clarified butter, stuffed in a split-top toasted brioche roll (~387 kcal, 30g protein).',
  },
  {
    name: 'Soft Brioche Dinner Roll',
    category: 'Rolls & Wraps',
    subcategory: 'Bakery Rolls',
    country: 'France',
    caloriesPer100: 310,
    proteinPer100: 8.5,
    carbsPer100: 48.0,
    fatPer100: 9.5,
    fiberPer100: 2.0,
    servingUnits: JSON.stringify([
      { unit: 'piece', multiplier: 0.40 },
      { unit: 'roll', multiplier: 0.40 },
      { unit: 'g', multiplier: 1 },
    ]),
    isIndian: false,
    isVeg: true,
    notes: 'Golden enriched yeast bread roll baked with butter and eggs; soft, fluffy and pillowy (~124 kcal per roll).',
  },
  {
    name: 'Swiss Roll / Jelly Roll (Vanilla Sponge & Strawberry Cream)',
    category: 'Rolls & Wraps',
    subcategory: 'Bakery Rolls',
    country: 'United Kingdom',
    caloriesPer100: 320,
    proteinPer100: 4.5,
    carbsPer100: 55.0,
    fatPer100: 9.8,
    fiberPer100: 1.0,
    servingUnits: JSON.stringify([
      { unit: 'slice', multiplier: 0.60 },
      { unit: 'piece', multiplier: 0.60 },
      { unit: 'g', multiplier: 1 },
    ]),
    isIndian: false,
    isVeg: true,
    notes: 'Light sponge cake rolled in a spiral around sweet strawberry jam and whipped cream (~192 kcal per slice).',
  },
  {
    name: 'Stuffed Cabbage Roll (Golabki / Sarma)',
    category: 'Rolls & Wraps',
    subcategory: 'European Rolls',
    country: 'Global',
    caloriesPer100: 115,
    proteinPer100: 7.5,
    carbsPer100: 9.5,
    fatPer100: 5.5,
    fiberPer100: 2.0,
    servingUnits: JSON.stringify([
      { unit: 'roll', multiplier: 1.5 },
      { unit: 'piece', multiplier: 1.5 },
      { unit: 'g', multiplier: 1 },
    ]),
    isIndian: false,
    isVeg: false,
    notes: 'Tender boiled cabbage leaves wrapped around seasoned ground beef, pork, rice and onions, baked in rich tomato sauce (~172 kcal per roll).',
  },
  {
    name: 'Vietnamese Bánh Mì Roll (Grilled Lemongrass Chicken)',
    category: 'Rolls & Wraps',
    subcategory: 'Sandwich Rolls',
    country: 'Vietnam',
    caloriesPer100: 210,
    proteinPer100: 14.5,
    carbsPer100: 26.0,
    fatPer100: 5.8,
    fiberPer100: 2.0,
    servingUnits: JSON.stringify([
      { unit: 'roll', multiplier: 2.2 },
      { unit: 'piece', multiplier: 2.2 },
      { unit: 'g', multiplier: 1 },
    ]),
    isIndian: false,
    isVeg: false,
    notes: 'Crispy crusty baguette roll filled with grilled lemongrass chicken breast, pickled carrots, daikon, cucumber and fresh cilantro.',
  },
  {
    name: 'Paneer Kathi Roll (High Protein Whole Wheat Wrap)',
    category: 'Rolls & Wraps',
    subcategory: 'Kathi Rolls',
    country: 'India',
    caloriesPer100: 225,
    proteinPer100: 13.5,
    carbsPer100: 24.0,
    fatPer100: 8.8,
    fiberPer100: 3.5,
    servingUnits: JSON.stringify([
      { unit: 'roll', multiplier: 1.8 },
      { unit: 'piece', multiplier: 1.8 },
      { unit: 'g', multiplier: 1 },
    ]),
    isIndian: true,
    isVeg: true,
    notes: 'Whole wheat flatbread rolled with grilled malai paneer, chopped bell peppers, mint chutney and chaat masala.',
  },
  {
    name: 'Chicken Tikka Roll (Street Food Frankie)',
    category: 'Rolls & Wraps',
    subcategory: 'Kathi Rolls',
    country: 'India',
    caloriesPer100: 220,
    proteinPer100: 16.5,
    carbsPer100: 22.5,
    fatPer100: 7.0,
    fiberPer100: 2.0,
    servingUnits: JSON.stringify([
      { unit: 'roll', multiplier: 1.8 },
      { unit: 'piece', multiplier: 1.8 },
      { unit: 'g', multiplier: 1 },
    ]),
    isIndian: true,
    isVeg: false,
    notes: 'Tandoori chicken tikka rolled in paratha with crunchy red onions and spicy coriander sauce.',
  },
];

async function main() {
  console.log(`🌯 Adding ${rollsData.length} rolls to master foods dataset and database...`);

  const foodMap = new Map<string, MasterFoodItem>();
  for (const f of MASTER_FOODS) {
    foodMap.set(f.name.toLowerCase().trim(), f);
  }
  for (const r of rollsData) {
    foodMap.set(r.name.toLowerCase().trim(), r);
  }

  const allUpdatedFoods = Array.from(foodMap.values());
  console.log(`Total Master Foods with Rolls: ${allUpdatedFoods.length}`);

  // 1. Update master-foods-data.ts file
  const fileHeader = `export interface MasterFoodItem {
  name: string;
  category: string;
  subcategory?: string;
  country: string;
  caloriesPer100: number;
  proteinPer100: number;
  carbsPer100: number;
  fatPer100: number;
  fiberPer100: number;
  servingUnits: string;
  isIndian: boolean;
  isVeg: boolean;
  notes?: string;
}

export const COUNTRY_METADATA: Record<string, { name: string; flag: string; region: string }> = ${JSON.stringify(
    COUNTRY_METADATA,
    null,
    2
  )};

export const MASTER_FOODS: MasterFoodItem[] = ${JSON.stringify(allUpdatedFoods, null, 2)};
`;

  const outputPath = path.join(process.cwd(), 'lib/nutrition/master-foods-data.ts');
  fs.writeFileSync(outputPath, fileHeader, 'utf-8');
  console.log(`✅ Updated ${outputPath}!`);

  // 2. Upsert each roll into the Supabase database
  let seeded = 0;
  for (const roll of rollsData) {
    const existing = await prisma.food.findFirst({
      where: { name: roll.name },
    });

    if (existing) {
      await prisma.food.update({
        where: { id: existing.id },
        data: {
          category: roll.category,
          subcategory: roll.subcategory,
          country: roll.country,
          caloriesPer100: roll.caloriesPer100,
          proteinPer100: roll.proteinPer100,
          carbsPer100: roll.carbsPer100,
          fatPer100: roll.fatPer100,
          fiberPer100: roll.fiberPer100,
          servingUnits: roll.servingUnits,
          isIndian: roll.isIndian,
          isVeg: roll.isVeg,
          notes: roll.notes,
        },
      });
    } else {
      await prisma.food.create({
        data: roll,
      });
    }
    seeded++;
  }

  const finalCount = await prisma.food.count();
  console.log(`🎉 Successfully seeded ${seeded} rolls! Total foods in database: ${finalCount}`);
}

main()
  .catch(console.error)
  .finally(async () => {
    await prisma.$disconnect();
  });
