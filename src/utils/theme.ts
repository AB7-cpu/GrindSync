import { configureFonts, MD3DarkTheme, MD3LightTheme } from 'react-native-paper';
import { DefaultTheme as NavigationLightTheme, DarkTheme as NavigationDarkTheme, DarkTheme } from '@react-navigation/native';

// Define spacing units
export const spacing = {
  xs: 4,
  sm: 8,
  md: 16,
  lg: 24,
  xl: 32,
  xxl: 48,
};

// Define font sizes
export const fontSizes = {
  xs: 12,
  sm: 14,
  md: 16,
  lg: 18,
  xl: 24,
  xxl: 32,
};

// Define app colors
export const colors = {
  // Primary colors
  primary: '#01A7C2', // Teal/Cyan blue
  primaryLight: '#56D1E1', // Lighter teal
  primaryDark: '#017A94', // Darker teal
  
  // Secondary colors
  secondary: '#FFA045', // Orange
  secondaryLight: '#B7ADCF',
  secondaryDark: '#B7ADCF',
  
  // Accent colors
  accent: '#00B2FF', // Blue
  accentLight: '#6DDFFF',
  accentDark: '#0086CC',
  
  // Status colors
  success: '#4CAF50', // Green
  warning: '#FFC107', // Amber
  error: '#F44336',   // Red
  info: '#2196F3',    // Blue
  
  // Grays (light mode)
  background: '#F5F7FA',
  card: '#FFFFFF',
  cardLight: '#F0F2F5',
  text: '#1E293B',
  textSecondary: '#64748B',
  border: '#E2E8F0',
  
  // Grays (dark mode)
  backgroundDark: '#121212',
  cardDark: '#1E1E1E',
  cardLightDark: '#2A2A2A',
  textDark: '#F8FAFC',
  textSecondaryDark: '#94A3B8',
  borderDark: '#2A2A2A',
};

// Font configuration
const fontConfig = {
  fontFamily: 'System',
};

// Extended theme types 
declare global {
  namespace ReactNativePaper {
    interface ThemeColors {
      // Add custom properties used in the app
      border: string;
      textSecondary: string;
      cardLight: string;
      success: string;
      warning: string;
      info: string;
    }
  }
}

// Create light theme
export const lightTheme = {
  ...MD3LightTheme,
  ...NavigationLightTheme,
  colors: {
    ...MD3LightTheme.colors,
    ...NavigationLightTheme.colors,
    primary: colors.primary,
    primaryContainer: colors.primaryLight,
    secondary: colors.secondary,
    secondaryContainer: colors.secondaryLight,
    background: colors.background,
    surface: colors.card,
    surfaceVariant: colors.cardLight,
    error: colors.error,
    text: colors.text,
    onBackground: colors.text,
    onSurface: colors.text,
    disabled: colors.textSecondary,
    border: colors.border,
    notification: colors.accent,
    card: colors.card,
    
    // Custom colors
    success: colors.success,
    warning: colors.warning,
    info: colors.info,
    textSecondary: colors.textSecondary,
    cardLight: colors.cardLight,
  },
  spacing,
  fontSizes,
  fonts: configureFonts({ config: fontConfig }),
  roundness: 12,
};

// Create dark theme with updated colors
export const darkTheme = {
  ...MD3DarkTheme,
  ...NavigationDarkTheme,
  colors: {
    ...MD3DarkTheme.colors,
    ...NavigationDarkTheme.colors,
    primary: '#25C7DD', // More vibrant teal for dark mode
    primaryContainer: '#038595', // Darker teal for containers
    secondary: '#FF9541', // More vivid orange
    secondaryContainer: '#DC7520', // Darker orange for containers
    background: '#121820', // Dark blue-tinted black
    surface: '#1E2530', // Dark blue-gray
    surfaceVariant: '#252C38', // Slightly lighter blue-gray
    error: '#FF5252', // Brighter red
    text: '#F0F0F0', // Slightly off-white for better eye comfort
    onBackground: '#FFFFFF',
    onSurface: '#FFFFFF',
    disabled: '#8A93A8', // Blue-tinted gray
    border: '#384050', // Blue-tinted border
    notification: '#00B2FF', // Bright blue
    card: '#1E2530', // Same as surface
    
    // Custom colors
    success: '#4ADE80', // Brighter green
    warning: '#FFBB33', // Brighter amber
    info: '#38BDF8', // Sky blue
    textSecondary: '#A0A9B8', // Light blue-gray
    cardLight: '#252C38', // Same as surfaceVariant
  },
  spacing,
  fontSizes,
  fonts: configureFonts({ config: fontConfig }),
  roundness: 12,
};

// Default export is the light theme (for backwards compatibility)
export const theme = lightTheme; 