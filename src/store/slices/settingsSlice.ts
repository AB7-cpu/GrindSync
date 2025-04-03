import { createSlice, PayloadAction } from '@reduxjs/toolkit';
import AsyncStorage from '@react-native-async-storage/async-storage';

export interface SettingsState {
  darkMode: boolean;
  units: 'metric' | 'imperial';
  notifications: {
    enabled: boolean;
    workouts: boolean;
    nutrition: boolean;
    progress: boolean;
    reminders: boolean;
  };
  sound: {
    enabled: boolean;
    volume: number;
  };
  haptics: boolean;
  autoSave: boolean;
  lastBackup: string | null;
}

const initialState: SettingsState = {
  darkMode: false,
  units: 'metric',
  notifications: {
    enabled: true,
    workouts: true,
    nutrition: true,
    progress: true,
    reminders: true,
  },
  sound: {
    enabled: true,
    volume: 0.7,
  },
  haptics: true,
  autoSave: true,
  lastBackup: null,
};

// Helper function to persist settings to AsyncStorage
const persistSettings = async (settings: SettingsState) => {
  try {
    await AsyncStorage.setItem('settings', JSON.stringify(settings));
  } catch (error) {
    console.error('Error saving settings:', error);
  }
};

export const settingsSlice = createSlice({
  name: 'settings',
  initialState,
  reducers: {
    // Toggle dark mode
    toggleDarkMode: (state) => {
      state.darkMode = !state.darkMode;
      persistSettings(state);
    },
    
    // Set specific dark mode state
    setDarkMode: (state, action: PayloadAction<boolean>) => {
      state.darkMode = action.payload;
      persistSettings(state);
    },
    
    // Change units system
    setUnits: (state, action: PayloadAction<'metric' | 'imperial'>) => {
      state.units = action.payload;
      persistSettings(state);
    },
    
    // Toggle global notifications
    toggleNotifications: (state, action: PayloadAction<boolean>) => {
      state.notifications.enabled = action.payload;
      persistSettings(state);
    },
    
    // Update specific notification settings
    updateNotificationSettings: (
      state,
      action: PayloadAction<{
        workouts?: boolean;
        nutrition?: boolean;
        progress?: boolean;
        reminders?: boolean;
      }>
    ) => {
      state.notifications = {
        ...state.notifications,
        ...action.payload,
      };
      persistSettings(state);
    },
    
    // Toggle sound
    toggleSound: (state, action: PayloadAction<boolean>) => {
      state.sound.enabled = action.payload;
      persistSettings(state);
    },
    
    // Set sound volume
    setSoundVolume: (state, action: PayloadAction<number>) => {
      state.sound.volume = Math.max(0, Math.min(1, action.payload));
      persistSettings(state);
    },
    
    // Toggle haptic feedback
    toggleHaptics: (state, action: PayloadAction<boolean>) => {
      state.haptics = action.payload;
      persistSettings(state);
    },
    
    // Toggle auto-save
    toggleAutoSave: (state, action: PayloadAction<boolean>) => {
      state.autoSave = action.payload;
      persistSettings(state);
    },
    
    // Record backup time
    setLastBackup: (state, action: PayloadAction<string>) => {
      state.lastBackup = action.payload;
      persistSettings(state);
    },
    
    // Load stored settings
    loadSettings: (state, action: PayloadAction<SettingsState>) => {
      return { ...action.payload };
    },
    
    // Reset settings to default
    resetSettings: () => {
      persistSettings(initialState);
      return initialState;
    },
  },
});

// Export actions
export const {
  toggleDarkMode,
  setDarkMode,
  setUnits,
  toggleNotifications,
  updateNotificationSettings,
  toggleSound,
  setSoundVolume,
  toggleHaptics,
  toggleAutoSave,
  setLastBackup,
  loadSettings,
  resetSettings,
} = settingsSlice.actions;

// Export reducer
export default settingsSlice.reducer; 