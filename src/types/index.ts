export interface FoodItem {
  name: string;
  portion: string;
  calories: number;
  topPercent: number;
  leftPercent: number;
  colorType?: 'primary' | 'secondary' | 'tertiary';
}

export interface MealSpecimen {
  id: string;
  specimenNumber: string;
  time: string;
  mealType: 'Breakfast' | 'Lunch' | 'Dinner' | 'Refreshment';
  title: string;
  description: string;
  calories: number;
  netWeightGrams: number;
  proteinGrams: number;
  carbsGrams: number;
  fatGrams: number;
  score: number;
  confidencePercent: number;
  isAiVerified: boolean;
  waterAddedMl?: number;
  imageUrl?: string;
  items: FoodItem[];
}

export interface DayRecord {
  date: string;
  dayOfWeek: 'Mon' | 'Tue' | 'Wed' | 'Thu' | 'Fri' | 'Sat' | 'Sun';
  calories: number;
  targetCalories: number;
  waterMl: number;
  targetWaterMl: number;
  proteinGrams: number;
  carbsGrams: number;
  fatGrams: number;
  isToday?: boolean;
}

export interface UserGoals {
  dailyCalorieTarget: number;
  dailyWaterTargetMl: number;
  proteinTargetGrams: number;
  carbsTargetGrams: number;
  fatTargetGrams: number;
  soundEffectsEnabled: boolean;
}
