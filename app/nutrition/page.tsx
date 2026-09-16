'use client';

import { useState, useEffect, useMemo } from 'react';
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
  Loader2,
  Globe,
  Leaf,
  Beef,
  BookmarkPlus,
  Zap,
} from 'lucide-react';
import { COUNTRY_METADATA, MasterFoodItem } from '@/lib/nutrition/master-foods-data';

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
  const [activeView, setActiveView] = useState<'TRACKER' | 'MASTER_BASE'>('TRACKER');

  // Master Database Explorer State
  const [selectedCountry, setSelectedCountry] = useState<string>('All');
  const [explorerSearch, setExplorerSearch] = useState('');
  const [explorerDietFilter, setExplorerDietFilter] = useState<'ALL' | 'HIGH_PROTEIN' | 'VEG' | 'LOW_CAL'>('ALL');

  // Add Food Modal State
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedMealType, setSelectedMealType] = useState<string>('BREAKFAST');
  const [foodSearchQuery, setFoodSearchQuery] = useState('');
  const [foodCategory, setFoodCategory] = useState('ALL');
  const [foodCountryFilter, setFoodCountryFilter] = useState('ALL');
  const [allFoods, setAllFoods] = useState<any[]>([]);
  const [countryCounts, setCountryCounts] = useState<Record<string, number>>({});
  const [selectedFood, setSelectedFood] = useState<any | null>(null);

  // Dynamic Serving State
  const [selectedUnit, setSelectedUnit] = useState('g');
  const [quantityInput, setQuantityInput] = useState<number>(100);
  const [addingFood, setAddingFood] = useState(false);
  const [foodLogError, setFoodLogError] = useState('');

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
      if (data?.countryCounts) setCountryCounts(data.countryCounts);
    } catch (err) {
      console.error(err);
    }
  };

  const openLogModal = (mealType: string, preselectedFood?: any) => {
    setSelectedMealType(mealType);
    setSelectedFood(preselectedFood || null);
    if (preselectedFood) {
      const units = preselectedFood.servingUnits
        ? JSON.parse(preselectedFood.servingUnits)
        : [{ unit: 'g', multiplier: 1 }];
      const defaultUnit = units[0]?.unit || 'g';
      setSelectedUnit(defaultUnit);
      setQuantityInput(defaultUnit === 'g' ? 100 : 1);
    } else {
      setSelectedUnit('g');
      setQuantityInput(100);
    }
    setFoodLogError('');
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
    setFoodLogError('');

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

      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || 'Failed to record food log');
      }

      setIsModalOpen(false);
      setSelectedFood(null);
      fetchNutrition();
    } catch (err: any) {
      console.error(err);
      setFoodLogError(err.message || 'Error saving food log. Please try again.');
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

  // Modal filtered foods
  const modalFilteredFoods = useMemo(() => {
    return allFoods.filter((f) => {
      const matchesCategory =
        foodCategory === 'ALL' ||
        (foodCategory === 'INDIAN' && f.isIndian) ||
        (foodCategory === 'PROTEIN' && f.proteinPer100 >= 10) ||
        f.category?.toUpperCase().includes(foodCategory);

      const matchesCountry =
        foodCountryFilter === 'ALL' || f.country === foodCountryFilter;

      const matchesSearch =
        !foodSearchQuery.trim() ||
        f.name.toLowerCase().includes(foodSearchQuery.toLowerCase()) ||
        f.subcategory?.toLowerCase().includes(foodSearchQuery.toLowerCase()) ||
        f.country?.toLowerCase().includes(foodSearchQuery.toLowerCase());

      return matchesCategory && matchesCountry && matchesSearch;
    });
  }, [allFoods, foodCategory, foodCountryFilter, foodSearchQuery]);

  // Master Explorer filtered foods
  const explorerFilteredFoods = useMemo(() => {
    return allFoods.filter((f) => {
      const matchesCountry =
        selectedCountry === 'All' || f.country === selectedCountry;

      const matchesSearch =
        !explorerSearch.trim() ||
        f.name.toLowerCase().includes(explorerSearch.toLowerCase()) ||
        f.subcategory?.toLowerCase().includes(explorerSearch.toLowerCase()) ||
        f.category?.toLowerCase().includes(explorerSearch.toLowerCase()) ||
        f.notes?.toLowerCase().includes(explorerSearch.toLowerCase());

      let matchesDiet = true;
      if (explorerDietFilter === 'HIGH_PROTEIN') {
        matchesDiet = f.proteinPer100 >= 12;
      } else if (explorerDietFilter === 'VEG') {
        matchesDiet = f.isVeg;
      } else if (explorerDietFilter === 'LOW_CAL') {
        matchesDiet = f.caloriesPer100 <= 150;
      }

      return matchesCountry && matchesSearch && matchesDiet;
    });
  }, [allFoods, selectedCountry, explorerSearch, explorerDietFilter]);

  const consumed = nutritionData?.consumed || { calories: 0, protein: 0, carbs: 0, fat: 0 };
  const targets = nutritionData?.targets || { calories: 2200, protein: 140, carbs: 250, fat: 70 };
  const meals = nutritionData?.meals || {};

  const countryKeys = Object.keys(COUNTRY_METADATA);

  return (
    <AppShell>
      <div className="space-y-6 max-w-6xl mx-auto">
        {/* Header with View Switcher */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-neutral-800/80 pb-5">
          <div>
            <div className="flex items-center gap-2">
              <span className="text-xs font-bold text-amber-400 uppercase tracking-wider">
                GYMIN Nutrition Engine
              </span>
              <span className="px-2 py-0.5 rounded-full text-[10px] font-extrabold bg-amber-500/10 text-amber-300 border border-amber-500/20">
                {allFoods.length > 0 ? `${allFoods.length}+ Global Foods` : 'Master Food Base'}
              </span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-black text-white tracking-tight mt-1">
              Nutrition & Master Food Base
            </h1>
            <p className="text-xs sm:text-sm text-neutral-400 mt-1">
              Track your daily macros or explore authentic dishes with calorie & protein profiles from every country
            </p>
          </div>

          <div className="flex items-center gap-2.5">
            {/* View Switcher Toggle */}
            <div className="p-1 rounded-2xl bg-neutral-900 border border-neutral-800 flex items-center gap-1 shadow-inner">
              <button
                type="button"
                onClick={() => setActiveView('TRACKER')}
                className={`px-3.5 py-1.5 rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 ${
                  activeView === 'TRACKER'
                    ? 'bg-gradient-to-r from-amber-400 to-amber-500 text-black font-extrabold shadow-sm'
                    : 'text-neutral-400 hover:text-white'
                }`}
              >
                <Flame className="w-3.5 h-3.5" />
                <span>Today's Macros</span>
              </button>
              <button
                type="button"
                onClick={() => setActiveView('MASTER_BASE')}
                className={`px-3.5 py-1.5 rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 ${
                  activeView === 'MASTER_BASE'
                    ? 'bg-gradient-to-r from-amber-400 to-amber-500 text-black font-extrabold shadow-sm'
                    : 'text-neutral-400 hover:text-white'
                }`}
              >
                <Globe className="w-3.5 h-3.5" />
                <span>Master Explorer</span>
              </button>
            </div>

            <button
              type="button"
              onClick={() => openLogModal('LUNCH')}
              className="px-4 py-2 rounded-xl bg-gradient-to-r from-amber-400 via-yellow-500 to-amber-500 hover:from-amber-300 text-black text-xs font-extrabold flex items-center gap-1.5 shadow-lg shadow-amber-500/25 transition-all"
            >
              <Plus className="w-4 h-4" />
              <span>Log Meal</span>
            </button>
          </div>
        </div>

        {/* ========================================================= */}
        {/* VIEW 1: TODAY'S MACRO TRACKER */}
        {/* ========================================================= */}
        {activeView === 'TRACKER' && (
          <div className="space-y-6">
            {/* Nutritional Overview Cards */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
              {/* Main Calorie Ring Card */}
              <div className="p-6 rounded-3xl bg-[#0a0a0a] border border-neutral-800 shadow-xl space-y-4">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold uppercase tracking-wider text-neutral-400">Calories</span>
                  <Flame className="w-4 h-4 text-amber-400" />
                </div>
                <div>
                  <div className="text-3xl font-black text-white">
                    {consumed.calories.toLocaleString()}{' '}
                    <span className="text-sm font-semibold text-neutral-400">
                      / {targets.calories.toLocaleString()} kcal
                    </span>
                  </div>
                  <p className="text-xs text-amber-400 font-bold mt-1">
                    {Math.max(0, targets.calories - consumed.calories)} kcal remaining
                  </p>
                </div>
                <div className="w-full h-2 rounded-full bg-neutral-800 overflow-hidden">
                  <div
                    className="h-full bg-gradient-to-r from-amber-400 to-yellow-500 rounded-full transition-all"
                    style={{ width: `${Math.min(100, (consumed.calories / targets.calories) * 100)}%` }}
                  />
                </div>
              </div>

              {/* Protein Card */}
              <div className="p-6 rounded-3xl bg-[#0a0a0a] border border-neutral-800 shadow-xl space-y-4">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold uppercase tracking-wider text-neutral-400">Protein</span>
                  <span className="text-xs font-bold text-amber-400">
                    {Math.round((consumed.protein / targets.protein) * 100)}%
                  </span>
                </div>
                <div>
                  <div className="text-2xl font-black text-white">
                    {consumed.protein}{' '}
                    <span className="text-xs font-semibold text-neutral-400">/ {targets.protein} g</span>
                  </div>
                  <p className="text-xs text-neutral-400 mt-1">
                    {Math.max(0, targets.protein - consumed.protein)} g to hit target
                  </p>
                </div>
                <div className="w-full h-2 rounded-full bg-neutral-800 overflow-hidden">
                  <div
                    className="h-full bg-amber-400 rounded-full transition-all"
                    style={{ width: `${Math.min(100, (consumed.protein / targets.protein) * 100)}%` }}
                  />
                </div>
              </div>

              {/* Carbs Card */}
              <div className="p-6 rounded-3xl bg-[#0a0a0a] border border-neutral-800 shadow-xl space-y-4">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold uppercase tracking-wider text-neutral-400">Carbohydrates</span>
                  <span className="text-xs font-bold text-amber-300">
                    {Math.round((consumed.carbs / targets.carbs) * 100)}%
                  </span>
                </div>
                <div>
                  <div className="text-2xl font-black text-white">
                    {consumed.carbs}{' '}
                    <span className="text-xs font-semibold text-neutral-400">/ {targets.carbs} g</span>
                  </div>
                  <p className="text-xs text-neutral-400 mt-1">Clean energy fuel</p>
                </div>
                <div className="w-full h-2 rounded-full bg-neutral-800 overflow-hidden">
                  <div
                    className="h-full bg-amber-300 rounded-full transition-all"
                    style={{ width: `${Math.min(100, (consumed.carbs / targets.carbs) * 100)}%` }}
                  />
                </div>
              </div>

              {/* Fat Card */}
              <div className="p-6 rounded-3xl bg-[#0a0a0a] border border-neutral-800 shadow-xl space-y-4">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold uppercase tracking-wider text-neutral-400">Fats</span>
                  <span className="text-xs font-bold text-yellow-400">
                    {Math.round((consumed.fat / targets.fat) * 100)}%
                  </span>
                </div>
                <div>
                  <div className="text-2xl font-black text-white">
                    {consumed.fat}{' '}
                    <span className="text-xs font-semibold text-neutral-400">/ {targets.fat} g</span>
                  </div>
                  <p className="text-xs text-neutral-400 mt-1">Hormonal & joint support</p>
                </div>
                <div className="w-full h-2 rounded-full bg-neutral-800 overflow-hidden">
                  <div
                    className="h-full bg-yellow-400 rounded-full transition-all"
                    style={{ width: `${Math.min(100, (consumed.fat / targets.fat) * 100)}%` }}
                  />
                </div>
              </div>
            </div>

            {/* Meals Breakdown (Breakfast, Lunch, Dinner, Snacks) */}
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <h2 className="text-lg font-bold text-white">Today's Meals Logged</h2>
                <span className="text-xs text-neutral-400">
                  Click "+ Add" to log with custom portions
                </span>
              </div>

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
                      className="p-5 rounded-3xl bg-[#0a0a0a] border border-neutral-800 space-y-3"
                    >
                      <div className="flex items-center justify-between">
                        <div>
                          <h3 className="font-extrabold text-sm text-white capitalize">
                            {type.toLowerCase()}
                          </h3>
                          <p className="text-xs text-neutral-400">
                            {mealCalories} kcal • {mealProtein}g protein
                          </p>
                        </div>

                        <button
                          type="button"
                          onClick={() => openLogModal(type)}
                          className="px-3 py-1.5 rounded-xl bg-amber-500/10 hover:bg-amber-500/20 text-amber-400 border border-amber-500/20 text-xs font-bold flex items-center gap-1 transition-colors"
                        >
                          <Plus className="w-3.5 h-3.5" />
                          <span>Add</span>
                        </button>
                      </div>

                      {mealItems.length === 0 ? (
                        <div className="py-4 text-center rounded-2xl bg-neutral-950/40 border border-dashed border-neutral-800 text-neutral-500 text-xs">
                          No items logged for {type.toLowerCase()} yet.
                        </div>
                      ) : (
                        <div className="space-y-2">
                          {mealItems.map((item: MealLog) => (
                            <div
                              key={item.id}
                              className="p-3 rounded-2xl bg-neutral-950/80 border border-neutral-800 flex items-center justify-between text-xs"
                            >
                              <div>
                                <div className="font-bold text-white">{item.foodName}</div>
                                <div className="text-[11px] text-neutral-400">
                                  {item.quantity} {item.servingUnit}
                                </div>
                              </div>

                              <div className="flex items-center gap-4">
                                <div className="text-right">
                                  <span className="font-bold text-amber-400">{item.calories} kcal</span>
                                  <div className="text-[10px] text-neutral-400">
                                    P: {item.protein}g | C: {item.carbs}g | F: {item.fat}g
                                  </div>
                                </div>

                                <button
                                  type="button"
                                  onClick={() => handleDeleteLog(item.id)}
                                  className="p-1 rounded-lg text-neutral-500 hover:text-red-400 transition-colors"
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
        )}

        {/* ========================================================= */}
        {/* VIEW 2: GLOBAL MASTER FOOD EXPLORER (DISHES BY COUNTRY) */}
        {/* ========================================================= */}
        {activeView === 'MASTER_BASE' && (
          <div className="space-y-6">
            {/* Country Selector Carousel */}
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-amber-400 uppercase tracking-wider flex items-center gap-1.5">
                  <Globe className="w-3.5 h-3.5" />
                  <span>Browse Cuisines & Countries</span>
                </span>
                <span className="text-xs text-neutral-400">
                  Showing {explorerFilteredFoods.length} dishes
                </span>
              </div>

              <div className="flex gap-2 overflow-x-auto pb-2 scrollbar-none">
                {countryKeys.map((cKey) => {
                  const meta = COUNTRY_METADATA[cKey];
                  const isSelected = selectedCountry === cKey;
                  const count = cKey === 'All' ? allFoods.length : (countryCounts[cKey] || 0);

                  return (
                    <button
                      key={cKey}
                      type="button"
                      onClick={() => setSelectedCountry(cKey)}
                      className={`px-3.5 py-2 rounded-2xl text-xs font-bold whitespace-nowrap transition-all flex items-center gap-2 ${
                        isSelected
                          ? 'bg-gradient-to-r from-amber-400 to-amber-500 text-black font-extrabold shadow-md shadow-amber-500/20 scale-105'
                          : 'bg-neutral-900 border border-neutral-800 text-neutral-300 hover:border-neutral-700 hover:text-white'
                      }`}
                    >
                      <span className="text-base">{meta.flag}</span>
                      <span>{meta.name}</span>
                      {count > 0 && (
                        <span
                          className={`px-1.5 py-0.2 rounded-full text-[10px] font-extrabold ${
                            isSelected
                              ? 'bg-black/25 text-black'
                              : 'bg-neutral-800 text-amber-400'
                          }`}
                        >
                          {count}
                        </span>
                      )}
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Search and Dietary Filter Bar */}
            <div className="p-4 rounded-3xl bg-[#0a0a0a] border border-neutral-800 space-y-3">
              <div className="flex flex-col sm:flex-row items-center gap-3">
                {/* Search input */}
                <div className="relative w-full sm:flex-1">
                  <Search className="w-4 h-4 text-neutral-400 absolute left-3 top-1/2 -translate-y-1/2" />
                  <input
                    type="text"
                    value={explorerSearch}
                    onChange={(e) => setExplorerSearch(e.target.value)}
                    placeholder="Search any dish, ingredient, or recipe (e.g. Biryani, Ramen, Tacos, Salmon, Oats)..."
                    className="w-full pl-10 pr-4 py-2.5 rounded-2xl bg-neutral-900 border border-neutral-800 text-white text-xs focus:border-amber-400 focus:outline-none placeholder:text-neutral-500"
                  />
                  {explorerSearch && (
                    <button
                      type="button"
                      onClick={() => setExplorerSearch('')}
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-neutral-400 hover:text-white"
                    >
                      <X className="w-3.5 h-3.5" />
                    </button>
                  )}
                </div>

                {/* Dietary Filter Pills */}
                <div className="flex gap-1.5 overflow-x-auto w-full sm:w-auto scrollbar-none">
                  {[
                    { id: 'ALL', label: 'All Dishes' },
                    { id: 'HIGH_PROTEIN', label: '⚡ High Protein (≥12g)' },
                    { id: 'VEG', label: '🌱 Vegetarian' },
                    { id: 'LOW_CAL', label: '🔥 Under 150 kcal' },
                  ].map((filter) => (
                    <button
                      key={filter.id}
                      type="button"
                      onClick={() => setExplorerDietFilter(filter.id as any)}
                      className={`px-3 py-1.5 rounded-xl text-[11px] font-bold whitespace-nowrap transition-colors ${
                        explorerDietFilter === filter.id
                          ? 'bg-amber-400 text-black font-extrabold'
                          : 'bg-neutral-900 border border-neutral-800 text-neutral-400 hover:text-white'
                      }`}
                    >
                      {filter.label}
                    </button>
                  ))}
                </div>
              </div>
            </div>

            {/* Master Dishes Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {explorerFilteredFoods.map((food) => {
                const countryMeta = COUNTRY_METADATA[food.country] || { flag: '🌍', name: food.country };
                return (
                  <div
                    key={food.id || food.name}
                    className="p-4 rounded-3xl bg-[#0a0a0a] border border-neutral-800 hover:border-amber-400/40 transition-all flex flex-col justify-between space-y-3 group"
                  >
                    <div>
                      {/* Top Badges */}
                      <div className="flex items-center justify-between gap-2 mb-2">
                        <div className="flex items-center gap-1.5">
                          <span className="text-base">{countryMeta.flag}</span>
                          <span className="text-[11px] font-bold text-neutral-300">
                            {food.country}
                          </span>
                          {food.subcategory && (
                            <span className="px-2 py-0.5 rounded-full text-[9px] font-bold bg-neutral-900 text-neutral-400 border border-neutral-800">
                              {food.subcategory}
                            </span>
                          )}
                        </div>

                        {food.isVeg ? (
                          <span className="flex items-center gap-1 text-[10px] text-emerald-400 font-bold bg-emerald-500/10 px-2 py-0.5 rounded-full border border-emerald-500/20">
                            <Leaf className="w-2.5 h-2.5" />
                            Veg
                          </span>
                        ) : (
                          <span className="flex items-center gap-1 text-[10px] text-red-400 font-bold bg-red-500/10 px-2 py-0.5 rounded-full border border-red-500/20">
                            <Beef className="w-2.5 h-2.5" />
                            Non-Veg
                          </span>
                        )}
                      </div>

                      {/* Dish Title */}
                      <h4 className="text-sm font-extrabold text-white group-hover:text-amber-400 transition-colors">
                        {food.name}
                      </h4>

                      {/* Description / Cultural Notes */}
                      {food.notes && (
                        <p className="text-[11px] text-neutral-400 mt-1 line-clamp-2 leading-relaxed">
                          {food.notes}
                        </p>
                      )}
                    </div>

                    <div className="space-y-3 pt-2 border-t border-neutral-900">
                      {/* Nutrition Strip per 100g */}
                      <div className="grid grid-cols-4 gap-1.5 p-2 rounded-2xl bg-neutral-950 border border-neutral-900 text-center">
                        <div>
                          <span className="text-[9px] font-bold text-neutral-400 uppercase block">Calories</span>
                          <span className="text-xs font-black text-amber-400">{food.caloriesPer100}</span>
                          <span className="text-[8px] text-neutral-500 block">kcal</span>
                        </div>
                        <div>
                          <span className="text-[9px] font-bold text-neutral-400 uppercase block">Protein</span>
                          <span className="text-xs font-black text-white">{food.proteinPer100}g</span>
                          <span className="text-[8px] text-neutral-500 block">per 100g</span>
                        </div>
                        <div>
                          <span className="text-[9px] font-bold text-neutral-400 uppercase block">Carbs</span>
                          <span className="text-xs font-black text-white">{food.carbsPer100}g</span>
                          <span className="text-[8px] text-neutral-500 block">per 100g</span>
                        </div>
                        <div>
                          <span className="text-[9px] font-bold text-neutral-400 uppercase block">Fat</span>
                          <span className="text-xs font-black text-white">{food.fatPer100}g</span>
                          <span className="text-[8px] text-neutral-500 block">per 100g</span>
                        </div>
                      </div>

                      {/* Quick Log Action */}
                      <button
                        type="button"
                        onClick={() => openLogModal('LUNCH', food)}
                        className="w-full py-2 rounded-xl bg-neutral-900 hover:bg-gradient-to-r hover:from-amber-400 hover:to-amber-500 hover:text-black border border-neutral-800 text-neutral-200 text-xs font-bold transition-all flex items-center justify-center gap-1.5 shadow-sm"
                      >
                        <Plus className="w-3.5 h-3.5 text-amber-400 group-hover:text-black" />
                        <span>Log to Meal</span>
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>

            {explorerFilteredFoods.length === 0 && (
              <div className="p-12 text-center rounded-3xl bg-[#0a0a0a] border border-neutral-800 space-y-3">
                <Globe className="w-8 h-8 text-neutral-600 mx-auto" />
                <h3 className="text-base font-bold text-white">No dishes found</h3>
                <p className="text-xs text-neutral-400 max-w-sm mx-auto">
                  Try adjusting your country selection or search query. We have dishes from over 16 cuisines!
                </p>
                <button
                  type="button"
                  onClick={() => {
                    setSelectedCountry('All');
                    setExplorerSearch('');
                    setExplorerDietFilter('ALL');
                  }}
                  className="px-4 py-2 rounded-xl bg-amber-400 text-black text-xs font-bold"
                >
                  Reset Filters
                </button>
              </div>
            )}
          </div>
        )}

        {/* ========================================================= */}
        {/* LOG FOOD MODAL (PORTION & SERVING CUSTOMIZER) */}
        {/* ========================================================= */}
        {isModalOpen && (
          <div className="fixed inset-0 z-50 bg-black/75 backdrop-blur-sm flex items-center justify-center p-4">
            <div className="w-full max-w-xl bg-[#0a0a0a] border border-neutral-800 rounded-3xl p-6 space-y-4 shadow-2xl max-h-[90vh] flex flex-col">
              <div className="flex items-center justify-between pb-3 border-b border-neutral-800">
                <div>
                  <h3 className="text-base font-bold text-white">
                    Add Food to {selectedMealType.toLowerCase()}
                  </h3>
                  <p className="text-[11px] text-neutral-400">
                    Search 200+ dishes from every country or calibrate exact portions
                  </p>
                </div>
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="p-1.5 rounded-lg text-neutral-400 hover:text-white"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>

              {/* Meal Selector Tabs inside modal */}
              <div className="grid grid-cols-4 gap-1 p-1 rounded-2xl bg-neutral-900 border border-neutral-800">
                {['BREAKFAST', 'LUNCH', 'DINNER', 'SNACK'].map((mType) => (
                  <button
                    key={mType}
                    type="button"
                    onClick={() => setSelectedMealType(mType)}
                    className={`py-1.5 rounded-xl text-[10px] font-bold capitalize transition-all ${
                      selectedMealType === mType
                        ? 'bg-amber-400 text-black font-extrabold shadow-sm'
                        : 'text-neutral-400 hover:text-white'
                    }`}
                  >
                    {mType.toLowerCase()}
                  </button>
                ))}
              </div>

              {/* Category Filter Chips */}
              <div className="flex gap-1.5 overflow-x-auto pb-1 scrollbar-none">
                {[
                  { id: 'ALL', label: 'All Foods' },
                  { id: 'INDIAN', label: '🇮🇳 Indian' },
                  { id: 'PROTEIN', label: '⚡ High Protein' },
                  { id: 'CARBOHYDRATES', label: '🍚 Carbs' },
                  { id: 'FRUITS', label: '🍎 Fruits' },
                  { id: 'VEGETABLES', label: '🥦 Vegetables' },
                ].map((c) => (
                  <button
                    key={c.id}
                    type="button"
                    onClick={() => setFoodCategory(c.id)}
                    className={`px-3 py-1.5 rounded-xl text-xs font-bold whitespace-nowrap transition-colors ${
                      foodCategory === c.id
                        ? 'bg-amber-400 text-black font-extrabold shadow-sm'
                        : 'bg-neutral-900 border border-neutral-800 text-neutral-400 hover:text-white'
                    }`}
                  >
                    {c.label}
                  </button>
                ))}
              </div>

              {/* Search Input */}
              <div className="relative">
                <Search className="w-4 h-4 text-neutral-400 absolute left-3 top-1/2 -translate-y-1/2" />
                <input
                  type="text"
                  value={foodSearchQuery}
                  onChange={(e) => setFoodSearchQuery(e.target.value)}
                  placeholder="Search Paneer, Biryani, Tacos, Sushi, Salmon, Eggs, Oats..."
                  className="w-full pl-10 pr-4 py-2.5 rounded-xl bg-neutral-900 border border-neutral-800 text-white text-xs focus:border-amber-400 focus:outline-none"
                />
              </div>

              {/* Food Selection List */}
              <div className="flex-1 overflow-y-auto space-y-2 pr-1 max-h-44">
                {modalFilteredFoods.map((food) => {
                  const isSelected = selectedFood?.id === food.id || selectedFood?.name === food.name;
                  const cMeta = COUNTRY_METADATA[food.country] || { flag: '🌍' };
                  return (
                    <button
                      key={food.id || food.name}
                      type="button"
                      onClick={() => handleSelectFood(food)}
                      className={`w-full p-3 rounded-2xl text-left border transition-all flex items-center justify-between ${
                        isSelected
                          ? 'bg-amber-500/15 border-amber-400/50 shadow-sm'
                          : 'bg-[#050505] border-neutral-800 hover:border-neutral-700'
                      }`}
                    >
                      <div>
                        <div className="text-xs font-bold text-white flex items-center gap-1.5">
                          <span>{cMeta.flag}</span>
                          <span>{food.name}</span>
                          {food.country && (
                            <span className="px-1.5 py-0.2 rounded text-[9px] bg-neutral-800 text-amber-300 font-bold border border-neutral-700">
                              {food.country}
                            </span>
                          )}
                        </div>
                        <div className="text-[10px] text-neutral-400 mt-0.5">
                          {food.caloriesPer100} kcal per 100g • {food.proteinPer100}g P • {food.carbsPer100}g C • {food.fatPer100}g F
                        </div>
                      </div>
                      {isSelected && <CheckCircle2 className="w-4 h-4 text-amber-400 flex-shrink-0" />}
                    </button>
                  );
                })}
              </div>

              {/* Dynamic Serving & Portion Customizer */}
              {selectedFood && (
                <div className="p-4 rounded-2xl bg-neutral-950 border border-neutral-800 space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-bold text-amber-400 uppercase">
                      Portion & Serving Unit
                    </span>
                    <span className="text-xs font-bold text-white truncate max-w-[200px]">
                      {selectedFood.name}
                    </span>
                  </div>

                  <div className="grid grid-cols-2 gap-3">
                    {/* Quantity */}
                    <div>
                      <label className="block text-[10px] font-bold text-neutral-400 uppercase mb-1">
                        Quantity
                      </label>
                      <input
                        type="number"
                        step="any"
                        min="0.1"
                        value={quantityInput}
                        onChange={(e) => setQuantityInput(parseFloat(e.target.value) || 0)}
                        className="w-full px-3 py-2 rounded-xl bg-neutral-900 border border-neutral-700 text-white font-bold text-sm focus:border-amber-400 focus:outline-none"
                      />
                    </div>

                    {/* Serving Unit Dropdown */}
                    <div>
                      <label className="block text-[10px] font-bold text-neutral-400 uppercase mb-1">
                        Serving Unit
                      </label>
                      <select
                        value={selectedUnit}
                        onChange={(e) => setSelectedUnit(e.target.value)}
                        className="w-full px-3 py-2 rounded-xl bg-neutral-900 border border-neutral-700 text-white font-bold text-sm focus:border-amber-400 focus:outline-none capitalize"
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
                  <div className="p-3 rounded-xl bg-neutral-900/80 border border-neutral-800 flex items-center justify-between text-xs">
                    <div>
                      <span className="text-[10px] text-neutral-400 uppercase">Calories:</span>{' '}
                      <strong className="text-amber-400 text-sm">{calculated.calories} kcal</strong>
                    </div>
                    <div className="text-right text-[11px] text-neutral-300">
                      P: <strong>{calculated.protein}g</strong> | C: <strong>{calculated.carbs}g</strong> | F: <strong>{calculated.fat}g</strong>
                    </div>
                  </div>

                  {/* Error message banner */}
                  {foodLogError && (
                    <div className="p-2.5 rounded-xl bg-red-500/15 border border-red-500/40 text-red-400 text-xs font-semibold">
                      {foodLogError}
                    </div>
                  )}

                  <button
                    type="button"
                    onClick={handleSaveFoodLog}
                    disabled={addingFood || quantityInput <= 0}
                    className="w-full py-2.5 rounded-xl bg-gradient-to-r from-amber-400 via-yellow-500 to-amber-500 hover:from-amber-300 text-black font-extrabold text-xs shadow-lg shadow-amber-500/25 transition-all flex items-center justify-center gap-1.5 disabled:opacity-50"
                  >
                    {addingFood ? (
                      <>
                        <Loader2 className="w-4 h-4 animate-spin" />
                        <span>Recording food log...</span>
                      </>
                    ) : (
                      <>
                        <Plus className="w-4 h-4" />
                        <span>Log {calculated.calories} kcal to {selectedMealType}</span>
                      </>
                    )}
                  </button>
                </div>
              )}
            </div>
          </div>
        )}
      </div>
    </AppShell>
  );
}
