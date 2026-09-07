'use client';

import { useState, useEffect } from 'react';
import AppShell from '@/components/layout/AppShell';
import {
  Utensils,
  Plus,
  Trash2,
  Search,
  X,
  Flame,
  PieChart,
  CheckCircle2,
  Info,
  Sparkles,
  ChevronRight,
  Filter,
} from 'lucide-react';

interface MealLog {
  id: string;
  mealType: string;
  foodName: string;
  servingUnit: string;
  quantity: number;
  calories: number;
  protein: number;
  carbs: number;
  fat: number;
}

export default function NutritionPage() {
  const [nutritionData, setNutritionData] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  // Add Food Modal State
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedMealType, setSelectedMealType] = useState<string>('BREAKFAST');
  const [foodSearchQuery, setFoodSearchQuery] = useState('');
  const [foodCategory, setFoodCategory] = useState('ALL');
  const [allFoods, setAllFoods] = useState<any[]>([]);
  const [selectedFood, setSelectedFood] = useState<any | null>(null);

  // Dynamic Serving State
  const [selectedUnit, setSelectedUnit] = useState('g');
  const [quantityInput, setQuantityInput] = useState<number>(100);
  const [addingFood, setAddingFood] = useState(false);

  useEffect(() => {
    fetchNutrition();
    fetchFoods();
  }, []);

  const fetchNutrition = async () => {
    try {
      const res = await fetch('/api/nutrition/today');
      const data = await res.json();
      setNutritionData(data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const fetchFoods = async () => {
    try {
      const res = await fetch('/api/foods');
      const data = await res.json();
      if (data?.foods) setAllFoods(data.foods);
    } catch (err) {
      console.error(err);
    }
  };

  const openLogModal = (mealType: string) => {
    setSelectedMealType(mealType);
    setSelectedFood(null);
    setSelectedUnit('g');
    setQuantityInput(100);
    setIsModalOpen(true);
  };

  const handleSelectFood = (food: any) => {
    setSelectedFood(food);
    const units = food.servingUnits ? JSON.parse(food.servingUnits) : [{ unit: 'g', multiplier: 1 }];
    const defaultUnit = units[0]?.unit || 'g';
    setSelectedUnit(defaultUnit);
    setQuantityInput(defaultUnit === 'g' ? 100 : 1);
  };

  // Calculate dynamic nutritional values based on selected unit and quantity
  const calculateMacros = () => {
    if (!selectedFood) return { calories: 0, protein: 0, carbs: 0, fat: 0 };
    const units = selectedFood.servingUnits
      ? JSON.parse(selectedFood.servingUnits)
      : [{ unit: 'g', multiplier: 1 }];
    const unitObj = units.find((u: any) => u.unit === selectedUnit) || { multiplier: 1 };

    let effectiveGrams = quantityInput;
    if (selectedUnit === 'g' || selectedUnit === 'ml') {
      effectiveGrams = quantityInput;
    } else {
      // Multiplier indicates how many 100g portions per 1 unit
      effectiveGrams = quantityInput * unitObj.multiplier * 100;
    }

    const ratio = effectiveGrams / 100;
    return {
      calories: Math.round(selectedFood.caloriesPer100 * ratio),
      protein: Math.round(selectedFood.proteinPer100 * ratio * 10) / 10,
      carbs: Math.round(selectedFood.carbsPer100 * ratio * 10) / 10,
      fat: Math.round(selectedFood.fatPer100 * ratio * 10) / 10,
    };
  };

  const calculated = calculateMacros();

  const handleSaveFoodLog = async () => {
    if (!selectedFood) return;
    setAddingFood(true);

    try {
      const res = await fetch('/api/nutrition/log', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          mealType: selectedMealType,
          foodId: selectedFood.id,
          foodName: selectedFood.name,
          servingUnit: selectedUnit,
          quantity: quantityInput,
          calories: calculated.calories,
          protein: calculated.protein,
          carbs: calculated.carbs,
          fat: calculated.fat,
        }),
      });

      if (res.ok) {
        setIsModalOpen(false);
        fetchNutrition();
      }
    } catch (err) {
      console.error(err);
    } finally {
      setAddingFood(false);
    }
  };

  const handleDeleteLog = async (id: string) => {
    try {
      const res = await fetch(`/api/nutrition/log?id=${id}`, { method: 'DELETE' });
      if (res.ok) fetchNutrition();
    } catch (err) {
      console.error(err);
    }
  };

  const filteredFoods = allFoods.filter((f) => {
    const matchesCategory =
      foodCategory === 'ALL' ||
      (foodCategory === 'INDIAN' && f.isIndian) ||
      (foodCategory === 'PROTEIN' && f.proteinPer100 >= 10) ||
      f.category.toUpperCase().includes(foodCategory);
    const matchesSearch = f.name.toLowerCase().includes(foodSearchQuery.toLowerCase());
    return matchesCategory && matchesSearch;
  });

  const consumed = nutritionData?.consumed || { calories: 1620, protein: 105, carbs: 160, fat: 45 };
  const targets = nutritionData?.targets || { calories: 2200, protein: 140, carbs: 250, fat: 70 };
  const meals = nutritionData?.meals || {};

  return (
    <AppShell>
      <div className="space-y-8 max-w-6xl mx-auto">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <span className="text-xs font-bold text-emerald-400 uppercase tracking-wider">
              Daily Nutrition & Macro Tracker
            </span>
            <h1 className="text-2xl sm:text-3xl font-black text-white tracking-tight mt-0.5">
              Today's Nutrition
            </h1>
            <p className="text-xs sm:text-sm text-slate-400 mt-1">
              Track calories, macros, and authentic Indian dishes with dynamic serving conversions
            </p>
          </div>

          <button
            type="button"
            onClick={() => openLogModal('LUNCH')}
            className="px-5 py-2.5 rounded-xl bg-gradient-to-r from-emerald-500 to-teal-500 hover:from-emerald-400 hover:to-teal-400 text-black text-xs font-extrabold flex items-center gap-2 shadow-lg shadow-emerald-500/20 transition-all"
          >
            <Plus className="w-4 h-4" />
            <span>Log Food Item</span>
          </button>
        </div>

        {/* Nutritional Overview Cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          {/* Main Calorie Ring Card */}
          <div className="p-6 rounded-3xl bg-slate-900/90 border border-slate-800 shadow-xl space-y-4">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold uppercase tracking-wider text-slate-400">Calories</span>
              <Flame className="w-4 h-4 text-emerald-400" />
            </div>
            <div>
              <div className="text-3xl font-black text-white">
                {consumed.calories.toLocaleString()}{' '}
                <span className="text-sm font-semibold text-slate-400">
                  / {targets.calories.toLocaleString()} kcal
                </span>
              </div>
              <p className="text-xs text-emerald-400 font-bold mt-1">
                {Math.max(0, targets.calories - consumed.calories)} kcal remaining
              </p>
            </div>
            <div className="w-full h-2 rounded-full bg-slate-800 overflow-hidden">
              <div
                className="h-full bg-gradient-to-r from-emerald-500 to-teal-400 rounded-full transition-all"
                style={{ width: `${Math.min(100, (consumed.calories / targets.calories) * 100)}%` }}
              />
            </div>
          </div>

          {/* Protein Card */}
          <div className="p-6 rounded-3xl bg-slate-900/90 border border-slate-800 shadow-xl space-y-4">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold uppercase tracking-wider text-slate-400">Protein</span>
              <span className="text-xs font-bold text-emerald-400">
                {Math.round((consumed.protein / targets.protein) * 100)}%
              </span>
            </div>
            <div>
              <div className="text-2xl font-black text-white">
                {consumed.protein}{' '}
                <span className="text-xs font-semibold text-slate-400">/ {targets.protein} g</span>
              </div>
              <p className="text-xs text-slate-400 mt-1">
                {Math.max(0, targets.protein - consumed.protein)} g to hit target
              </p>
            </div>
            <div className="w-full h-2 rounded-full bg-slate-800 overflow-hidden">
              <div
                className="h-full bg-emerald-400 rounded-full transition-all"
                style={{ width: `${Math.min(100, (consumed.protein / targets.protein) * 100)}%` }}
              />
            </div>
          </div>

          {/* Carbs Card */}
          <div className="p-6 rounded-3xl bg-slate-900/90 border border-slate-800 shadow-xl space-y-4">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold uppercase tracking-wider text-slate-400">Carbohydrates</span>
              <span className="text-xs font-bold text-cyan-400">
                {Math.round((consumed.carbs / targets.carbs) * 100)}%
              </span>
            </div>
            <div>
              <div className="text-2xl font-black text-white">
                {consumed.carbs}{' '}
                <span className="text-xs font-semibold text-slate-400">/ {targets.carbs} g</span>
              </div>
              <p className="text-xs text-slate-400 mt-1">Clean energy fuel</p>
            </div>
            <div className="w-full h-2 rounded-full bg-slate-800 overflow-hidden">
              <div
                className="h-full bg-cyan-400 rounded-full transition-all"
                style={{ width: `${Math.min(100, (consumed.carbs / targets.carbs) * 100)}%` }}
              />
            </div>
          </div>

          {/* Fat Card */}
          <div className="p-6 rounded-3xl bg-slate-900/90 border border-slate-800 shadow-xl space-y-4">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold uppercase tracking-wider text-slate-400">Fats</span>
              <span className="text-xs font-bold text-amber-400">
                {Math.round((consumed.fat / targets.fat) * 100)}%
              </span>
            </div>
            <div>
              <div className="text-2xl font-black text-white">
                {consumed.fat}{' '}
                <span className="text-xs font-semibold text-slate-400">/ {targets.fat} g</span>
              </div>
              <p className="text-xs text-slate-400 mt-1">Hormonal & joint support</p>
            </div>
            <div className="w-full h-2 rounded-full bg-slate-800 overflow-hidden">
              <div
                className="h-full bg-amber-400 rounded-full transition-all"
                style={{ width: `${Math.min(100, (consumed.fat / targets.fat) * 100)}%` }}
              />
            </div>
          </div>
        </div>

        {/* Disclaimer Note */}
        <div className="p-3.5 rounded-2xl bg-slate-900/60 border border-slate-800 flex items-center gap-2.5 text-xs text-slate-400">
          <Info className="w-4 h-4 text-emerald-400 flex-shrink-0" />
          <span>
            Nutritional values are approximate scientific estimates and may vary based on brand, recipe, and cooking preparation.
          </span>
        </div>

        {/* Meals Breakdown (Breakfast, Lunch, Dinner, Snacks) */}
        <div className="space-y-4">
          <h2 className="text-lg font-bold text-white">Meals Breakdown</h2>

          <div className="space-y-4">
            {['BREAKFAST', 'LUNCH', 'DINNER', 'SNACK'].map((type) => {
              const mealItems = meals[type] || [];
              const mealCalories = Math.round(
                mealItems.reduce((acc: number, item: any) => acc + item.calories, 0)
              );
              const mealProtein = Math.round(
                mealItems.reduce((acc: number, item: any) => acc + item.protein, 0)
              );

              return (
                <div
                  key={type}
                  className="p-5 rounded-3xl bg-slate-900/70 border border-slate-800 space-y-3"
                >
                  <div className="flex items-center justify-between">
                    <div>
                      <h3 className="font-extrabold text-sm text-white capitalize">
                        {type.toLowerCase()}
                      </h3>
                      <p className="text-xs text-slate-400">
                        {mealCalories} kcal • {mealProtein}g protein
                      </p>
                    </div>

                    <button
                      type="button"
                      onClick={() => openLogModal(type)}
                      className="px-3 py-1.5 rounded-xl bg-emerald-500/10 hover:bg-emerald-500/20 text-emerald-400 text-xs font-bold flex items-center gap-1 transition-colors"
                    >
                      <Plus className="w-3.5 h-3.5" />
                      <span>Add</span>
                    </button>
                  </div>

                  {mealItems.length === 0 ? (
                    <div className="py-4 text-center rounded-2xl bg-slate-950/40 border border-dashed border-slate-800/80 text-slate-500 text-xs">
                      No items logged for {type.toLowerCase()} yet.
                    </div>
                  ) : (
                    <div className="space-y-2">
                      {mealItems.map((item: MealLog) => (
                        <div
                          key={item.id}
                          className="p-3 rounded-2xl bg-slate-950/80 border border-slate-800 flex items-center justify-between text-xs"
                        >
                          <div>
                            <div className="font-bold text-white">{item.foodName}</div>
                            <div className="text-[11px] text-slate-400">
                              {item.quantity} {item.servingUnit}
                            </div>
                          </div>

                          <div className="flex items-center gap-4">
                            <div className="text-right">
                              <span className="font-bold text-emerald-400">{item.calories} kcal</span>
                              <div className="text-[10px] text-slate-400">
                                P: {item.protein}g | C: {item.carbs}g | F: {item.fat}g
                              </div>
                            </div>

                            <button
                              type="button"
                              onClick={() => handleDeleteLog(item.id)}
                              className="p-1 rounded-lg text-slate-500 hover:text-red-400 transition-colors"
                            >
                              <Trash2 className="w-3.5 h-3.5" />
                            </button>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </div>
      </div>

      {/* LOG FOOD MODAL */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 bg-black/70 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="w-full max-w-xl bg-[#0a0d14] border border-slate-800 rounded-3xl p-6 space-y-4 shadow-2xl max-h-[90vh] flex flex-col">
            <div className="flex items-center justify-between pb-3 border-b border-slate-800">
              <div>
                <h3 className="text-base font-bold text-white">
                  Add Food to {selectedMealType.toLowerCase()}
                </h3>
                <p className="text-[11px] text-slate-400">
                  Search 110+ items or select an authentic Indian dish
                </p>
              </div>
              <button
                type="button"
                onClick={() => setIsModalOpen(false)}
                className="p-1.5 rounded-lg text-slate-400 hover:text-white"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* Category Filter Chips */}
            <div className="flex gap-2 overflow-x-auto pb-1 scrollbar-none">
              {[
                { id: 'ALL', label: 'All Foods' },
                { id: 'INDIAN', label: 'Indian Dishes' },
                { id: 'PROTEIN', label: 'High Protein' },
                { id: 'CARBOHYDRATES', label: 'Carbs & Rice' },
                { id: 'FRUITS', label: 'Fruits' },
                { id: 'VEGETABLES', label: 'Vegetables' },
              ].map((c) => (
                <button
                  key={c.id}
                  type="button"
                  onClick={() => setFoodCategory(c.id)}
                  className={`px-3 py-1.5 rounded-xl text-xs font-bold whitespace-nowrap transition-colors ${
                    foodCategory === c.id
                      ? 'bg-emerald-500 text-black'
                      : 'bg-slate-900 border border-slate-800 text-slate-400 hover:text-white'
                  }`}
                >
                  {c.label}
                </button>
              ))}
            </div>

            {/* Search Input */}
            <div className="relative">
              <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                value={foodSearchQuery}
                onChange={(e) => setFoodSearchQuery(e.target.value)}
                placeholder="Search Paneer, Chicken Biryani, Dosa, Eggs, Oats..."
                className="w-full pl-10 pr-4 py-2.5 rounded-xl bg-slate-900 border border-slate-800 text-white text-xs focus:border-emerald-400"
              />
            </div>

            {/* Food Selection List */}
            <div className="flex-1 overflow-y-auto space-y-2 pr-1 max-h-48">
              {filteredFoods.map((food) => {
                const isSelected = selectedFood?.id === food.id;
                return (
                  <button
                    key={food.id}
                    type="button"
                    onClick={() => handleSelectFood(food)}
                    className={`w-full p-3 rounded-2xl text-left border transition-all flex items-center justify-between ${
                      isSelected
                        ? 'bg-emerald-500/20 border-emerald-400'
                        : 'bg-slate-900/60 border-slate-800 hover:border-slate-700'
                    }`}
                  >
                    <div>
                      <div className="text-xs font-bold text-white flex items-center gap-2">
                        <span>{food.name}</span>
                        {food.isIndian && (
                          <span className="px-1.5 py-0.5 rounded text-[9px] bg-amber-500/20 text-amber-300 font-bold">
                            Indian
                          </span>
                        )}
                      </div>
                      <div className="text-[10px] text-slate-400 mt-0.5">
                        {food.caloriesPer100} kcal per 100g • {food.proteinPer100}g P • {food.carbsPer100}g C
                      </div>
                    </div>
                    {isSelected && <CheckCircle2 className="w-4 h-4 text-emerald-400" />}
                  </button>
                );
              })}
            </div>

            {/* Dynamic Serving & Portion Customizer */}
            {selectedFood && (
              <div className="p-4 rounded-2xl bg-slate-950 border border-slate-800 space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold text-emerald-400 uppercase">
                    Portion & Serving Unit
                  </span>
                  <span className="text-xs font-bold text-white">{selectedFood.name}</span>
                </div>

                <div className="grid grid-cols-2 gap-3">
                  {/* Quantity */}
                  <div>
                    <label className="block text-[10px] font-bold text-slate-400 uppercase mb-1">
                      Quantity
                    </label>
                    <input
                      type="number"
                      step="any"
                      min="0.1"
                      value={quantityInput}
                      onChange={(e) => setQuantityInput(parseFloat(e.target.value) || 0)}
                      className="w-full px-3 py-2 rounded-xl bg-slate-900 border border-slate-700 text-white font-bold text-sm focus:border-emerald-400"
                    />
                  </div>

                  {/* Serving Unit Dropdown */}
                  <div>
                    <label className="block text-[10px] font-bold text-slate-400 uppercase mb-1">
                      Serving Unit
                    </label>
                    <select
                      value={selectedUnit}
                      onChange={(e) => setSelectedUnit(e.target.value)}
                      className="w-full px-3 py-2 rounded-xl bg-slate-900 border border-slate-700 text-white font-bold text-sm focus:border-emerald-400 capitalize"
                    >
                      {(selectedFood.servingUnits
                        ? JSON.parse(selectedFood.servingUnits)
                        : [{ unit: 'g', multiplier: 1 }]
                      ).map((u: any) => (
                        <option key={u.unit} value={u.unit}>
                          {u.unit}
                        </option>
                      ))}
                    </select>
                  </div>
                </div>

                {/* Real-time Recalculated Nutrition Output */}
                <div className="p-3 rounded-xl bg-slate-900/80 border border-slate-800 flex items-center justify-between text-xs">
                  <div>
                    <span className="text-[10px] text-slate-400 uppercase">Calories:</span>{' '}
                    <strong className="text-emerald-400 text-sm">{calculated.calories} kcal</strong>
                  </div>
                  <div className="text-right text-[11px] text-slate-300">
                    P: <strong>{calculated.protein}g</strong> | C: <strong>{calculated.carbs}g</strong> | F: <strong>{calculated.fat}g</strong>
                  </div>
                </div>

                <button
                  type="button"
                  onClick={handleSaveFoodLog}
                  disabled={addingFood || quantityInput <= 0}
                  className="w-full py-2.5 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-black font-extrabold text-xs shadow-lg shadow-emerald-500/20 transition-all flex items-center justify-center gap-1.5"
                >
                  <Plus className="w-4 h-4" />
                  <span>Log {calculated.calories} kcal to {selectedMealType}</span>
                </button>
              </div>
            )}
          </div>
        </div>
      )}
    </AppShell>
  );
}
