import { createSlice, PayloadAction } from '@reduxjs/toolkit';
import AsyncStorage from '@react-native-async-storage/async-storage';

export interface UserProfile {
  id: string;
  name: string;
  email: string;
  avatar: string | null;
  gender: 'male' | 'female' | 'other';
  age: number;
  weight: number;
  height: number;
  fitnessLevel: 'beginner' | 'intermediate' | 'advanced';
  createdAt: string;
}

export interface UserPreferences {
  useMetricSystem: boolean;
  fitnessGoal: 'weightLoss' | 'muscleGain' | 'endurance' | 'general';
  workoutReminders: boolean;
  notifications: {
    workoutReminders: boolean;
    nutritionReminders: boolean;
    progressUpdates: boolean;
  };
}

export interface Achievement {
  id: string;
  name: string;
  description: string;
  completed: boolean;
  completedDate: string | null;
  icon: string;
}

export interface UserState {
  auth: {
    token: string | null;
    isLoading: boolean;
    error: string | null;
  };
  profile: UserProfile;
  preferences: UserPreferences;
  achievements: Achievement[];
}

const initialState: UserState = {
  auth: {
    token: null,
    isLoading: false,
    error: null,
  },
  profile: {
    id: '',
    name: 'Guest User',
    email: '',
    avatar: null,
    gender: 'male',
    age: 30,
    weight: 75,
    height: 175,
    fitnessLevel: 'intermediate',
    createdAt: new Date().toISOString(),
  },
  preferences: {
    useMetricSystem: true,
    fitnessGoal: 'general',
    workoutReminders: true,
    notifications: {
      workoutReminders: true,
      nutritionReminders: true,
      progressUpdates: true,
    },
  },
  achievements: [
    {
      id: '1',
      name: 'First Workout',
      description: 'Complete your first workout',
      completed: false,
      completedDate: null,
      icon: 'dumbbell',
    },
    {
      id: '2',
      name: '5kg Progress',
      description: 'Make progress toward your weight goal (5kg)',
      completed: false,
      completedDate: null,
      icon: 'scale',
    },
    {
      id: '3',
      name: 'Workout Streak',
      description: 'Complete workouts for 7 consecutive days',
      completed: false,
      completedDate: null,
      icon: 'calendar-check',
    },
    {
      id: '4',
      name: 'Nutrition Master',
      description: 'Meet your nutrition goals for 10 days',
      completed: false,
      completedDate: null,
      icon: 'food-apple',
    },
  ],
};

// Helper function to save auth token
const saveAuthToken = async (token: string | null) => {
  try {
    if (token) {
      await AsyncStorage.setItem('userToken', token);
    } else {
      await AsyncStorage.removeItem('userToken');
    }
  } catch (error) {
    console.error('Error saving auth token:', error);
  }
};

// Helper function to save user data
const saveUserData = async (data: Partial<UserState>) => {
  try {
    await AsyncStorage.setItem('userData', JSON.stringify(data));
  } catch (error) {
    console.error('Error saving user data:', error);
  }
};

const userSlice = createSlice({
  name: 'user',
  initialState,
  reducers: {
    // Auth actions
    loginRequest: (state) => {
      state.auth.isLoading = true;
      state.auth.error = null;
    },
    loginSuccess: (state, action: PayloadAction<{ token: string; user: UserProfile }>) => {
      state.auth.token = action.payload.token;
      state.auth.isLoading = false;
      state.profile = action.payload.user;
      saveAuthToken(action.payload.token);
      saveUserData({ profile: action.payload.user });
    },
    loginFailure: (state, action: PayloadAction<string>) => {
      state.auth.isLoading = false;
      state.auth.error = action.payload;
    },
    logout: (state) => {
      state.auth.token = null;
      saveAuthToken(null);
    },
    
    // User actions
    loginUser: (state, action: PayloadAction<{ id: string; email: string; name: string; avatar: string | null; token: string }>) => {
      state.auth.token = action.payload.token;
      state.profile.id = action.payload.id;
      state.profile.email = action.payload.email;
      state.profile.name = action.payload.name;
      state.profile.avatar = action.payload.avatar;
      saveAuthToken(action.payload.token);
      saveUserData({ profile: state.profile });
    },
    
    // Profile actions
    updateUserProfile: (
      state, 
      action: PayloadAction<Partial<UserProfile>>
    ) => {
      state.profile = {
        ...state.profile,
        ...action.payload,
      };
      saveUserData({ profile: state.profile });
    },
    
    // Preferences actions
    updateUserPreferences: (
      state,
      action: PayloadAction<Partial<UserPreferences>>
    ) => {
      state.preferences = {
        ...state.preferences,
        ...action.payload,
      };
      saveUserData({ preferences: state.preferences });
    },
    
    // Achievement actions
    unlockAchievement: (state, action: PayloadAction<string>) => {
      const achievement = state.achievements.find(a => a.id === action.payload);
      if (achievement && !achievement.completed) {
        achievement.completed = true;
        achievement.completedDate = new Date().toISOString();
        saveUserData({ achievements: state.achievements });
      }
    },
    
    // Load saved state
    loadUserData: (state, action: PayloadAction<Partial<UserState>>) => {
      if (action.payload.profile) {
        state.profile = {
          ...state.profile,
          ...action.payload.profile,
        };
      }
      
      if (action.payload.preferences) {
        state.preferences = {
          ...state.preferences,
          ...action.payload.preferences,
        };
      }
      
      if (action.payload.achievements) {
        state.achievements = action.payload.achievements;
      }
    },
  },
});

export const {
  loginRequest,
  loginSuccess,
  loginFailure,
  logout,
  loginUser,
  updateUserProfile,
  updateUserPreferences,
  unlockAchievement,
  loadUserData,
} = userSlice.actions;

export default userSlice.reducer; 