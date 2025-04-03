import { configureStore } from '@reduxjs/toolkit';
import userReducer from './slices/userSlice';
import workoutReducer from './slices/workoutSlice';
import nutritionReducer from './slices/nutritionSlice';
import settingsReducer from './slices/settingsSlice';

export const store = configureStore({
  reducer: {
    user: userReducer,
    workout: workoutReducer,
    nutrition: nutritionReducer,
    settings: settingsReducer,
  },
  middleware: (getDefaultMiddleware) =>
    getDefaultMiddleware({
      serializableCheck: false,
    }),
});

export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch; 