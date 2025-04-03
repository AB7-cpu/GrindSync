import { createSlice, PayloadAction } from '@reduxjs/toolkit';

export interface FoodEntry {
  id: string;
  description: string;
  quantity: string;
  mealType: 'breakfast' | 'lunch' | 'dinner' | 'snack';
  calories: number;
  protein: number;
  carbs: number;
  fat: number;
  date: string; // ISO string
  aiGenerated: boolean;
  notes: string;
}

interface NutritionState {
  foodEntries: FoodEntry[];
  dailyGoals: {
    calories: number;
    protein: number;
    carbs: number;
    fat: number;
    water: number;
  };
  water: {
    current: number; // in liters
    goal: number;
  };
  activeDate: string; // ISO date string
}

const today = new Date().toISOString().split('T')[0];

const initialState: NutritionState = {
  foodEntries: [
    {
      id: '1',
      description: 'Scrambled Eggs',
      quantity: '2 large eggs',
      mealType: 'breakfast',
      calories: 180,
      protein: 12,
      carbs: 2,
      fat: 14,
      date: today,
      aiGenerated: true,
      notes: '',
    },
    {
      id: '2',
      description: 'Banana',
      quantity: '1 medium',
      mealType: 'breakfast',
      calories: 105,
      protein: 1,
      carbs: 27,
      fat: 0,
      date: today,
      aiGenerated: true,
      notes: '',
    },
    {
      id: '3',
      description: 'Coffee with Milk',
      quantity: '1 cup',
      mealType: 'breakfast',
      calories: 135,
      protein: 4,
      carbs: 12,
      fat: 7,
      date: today,
      aiGenerated: true,
      notes: '',
    },
    {
      id: '4',
      description: 'Grilled Chicken Salad',
      quantity: '1 bowl (250g)',
      mealType: 'lunch',
      calories: 350,
      protein: 35,
      carbs: 20,
      fat: 12,
      date: today,
      aiGenerated: true,
      notes: '',
    },
  ],
  dailyGoals: {
    calories: 2000,
    protein: 120,
    carbs: 250,
    fat: 65,
    water: 2.5,
  },
  water: {
    current: 1.5,
    goal: 2.5,
  },
  activeDate: today,
};

const nutritionSlice = createSlice({
  name: 'nutrition',
  initialState,
  reducers: {
    addFoodEntry: (state, action: PayloadAction<Omit<FoodEntry, 'id'>>) => {
      const newEntry = {
        ...action.payload,
        id: `${state.foodEntries.length + 1}`,
      };
      state.foodEntries.push(newEntry);
    },
    updateFoodEntry: (state, action: PayloadAction<{ id: string; updates: Partial<Omit<FoodEntry, 'id'>> }>) => {
      const { id, updates } = action.payload;
      const entryIndex = state.foodEntries.findIndex(entry => entry.id === id);
      
      if (entryIndex !== -1) {
        state.foodEntries[entryIndex] = {
          ...state.foodEntries[entryIndex],
          ...updates,
        };
      }
    },
    deleteFoodEntry: (state, action: PayloadAction<string>) => {
      state.foodEntries = state.foodEntries.filter(entry => entry.id !== action.payload);
    },
    updateWaterIntake: (state, action: PayloadAction<number>) => {
      state.water.current = action.payload;
    },
    updateDailyNutritionGoals: (state, action: PayloadAction<Partial<NutritionState['dailyGoals']>>) => {
      state.dailyGoals = {
        ...state.dailyGoals,
        ...action.payload,
      };
    },
    setActiveDate: (state, action: PayloadAction<string>) => {
      state.activeDate = action.payload;
    },
    processTextFoodEntry: (state, action: PayloadAction<{ 
      description: string;
      quantity: string; 
      mealType: FoodEntry['mealType'];
      aiCalculated: {
        calories: number;
        protein: number;
        carbs: number;
        fat: number;
      };
      notes: string;
    }>) => {
      const { description, quantity, mealType, aiCalculated, notes } = action.payload;
      
      const newEntry: FoodEntry = {
        id: `${state.foodEntries.length + 1}`,
        description,
        quantity,
        mealType,
        calories: aiCalculated.calories,
        protein: aiCalculated.protein,
        carbs: aiCalculated.carbs,
        fat: aiCalculated.fat,
        date: state.activeDate,
        aiGenerated: true,
        notes,
      };
      
      state.foodEntries.push(newEntry);
    }
  },
});

export const {
  addFoodEntry,
  updateFoodEntry,
  deleteFoodEntry,
  updateWaterIntake,
  updateDailyNutritionGoals,
  setActiveDate,
  processTextFoodEntry,
} = nutritionSlice.actions;

export default nutritionSlice.reducer; 