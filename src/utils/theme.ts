import { configureFonts, MD3DarkTheme, MD3LightTheme } from 'react-native-paper';
import { DefaultTheme as NavigationLightTheme, DarkTheme as NavigationDarkTheme } from '@react-navigation/native';

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
  primary: '#8055E3', // Purple
  primaryLight: '#B18AFF',
  primaryDark: '#5C3EAD',
  
  // Secondary colors
  secondary: '#FFA045', // Orange
  secondaryLight: '#FFB76E',
  secondaryDark: '#E08629',
  
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

// Create dark theme
export const darkTheme = {
  ...MD3DarkTheme,
  ...NavigationDarkTheme,
  colors: {
    ...MD3DarkTheme.colors,
    ...NavigationDarkTheme.colors,
    primary: colors.primary,
    primaryContainer: colors.primaryDark,
    secondary: colors.secondary,
    secondaryContainer: colors.secondaryDark,
    background: colors.backgroundDark,
    surface: colors.cardDark,
    surfaceVariant: colors.cardLightDark,
    error: colors.error,
    text: colors.textDark,
    onBackground: colors.textDark,
    onSurface: colors.textDark,
    disabled: colors.textSecondaryDark,
    border: colors.borderDark,
    notification: colors.accent,
    card: colors.cardDark,
    
    // Custom colors
    success: colors.success,
    warning: colors.warning,
    info: colors.info,
    textSecondary: colors.textSecondaryDark,
    cardLight: colors.cardLightDark,
  },
  spacing,
  fontSizes,
  fonts: configureFonts({ config: fontConfig }),
  roundness: 12,
};

// Default export is the light theme (for backwards compatibility)
export const theme = lightTheme; 