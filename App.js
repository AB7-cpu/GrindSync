import React, { useEffect, useState } from 'react';
import { StatusBar } from 'expo-status-bar';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { Provider as PaperProvider } from 'react-native-paper';
import { Provider as ReduxProvider, useDispatch, useSelector } from 'react-redux';
import { NavigationContainer } from '@react-navigation/native';
import { createStackNavigator } from '@react-navigation/stack';
import AsyncStorage from '@react-native-async-storage/async-storage';

// Import screens
import SplashScreen from './src/screens/SplashScreen';
import LoginScreen from './src/screens/LoginScreen';
import AppNavigator from './src/navigation/AppNavigator';

// Import theme and store
import { theme } from './src/utils/theme';
import { store, RootState } from './src/store';

// Import actions
import { loadUserData, loginSuccess } from './src/store/slices/userSlice';
import { loadSettings } from './src/store/slices/settingsSlice';

// Create stack navigator for auth flow
const Stack = createStackNavigator();

// App container that provides Redux store
export default function App() {
  return (
    <ReduxProvider store={store}>
      <AppContent />
    </ReduxProvider>
  );
}

// App content that has access to Redux state
function AppContent() {
  const dispatch = useDispatch();
  const [isLoading, setIsLoading] = useState(true);
  const { token } = useSelector((state) => state.user?.auth || {});
  const { darkMode } = useSelector((state) => state.settings || {});
  
  // Create a theme based on dark mode setting
  const appTheme = {
    ...theme,
    dark: darkMode,
    colors: {
      ...theme.colors,
      background: darkMode ? '#121212' : '#f5f5f5',
      surface: darkMode ? '#1e1e1e' : '#ffffff',
      text: darkMode ? '#ffffff' : '#121212',
    }
  };
  
  // Load stored data on app startup
  useEffect(() => {
    const loadAppData = async () => {
      try {
        // Load settings
        const settingsData = await AsyncStorage.getItem('settings');
        if (settingsData) {
          dispatch(loadSettings(JSON.parse(settingsData)));
        }
        
        // Load user data
        const userData = await AsyncStorage.getItem('userData');
        if (userData) {
          dispatch(loadUserData(JSON.parse(userData)));
        }
        
        // Check for auth token
        const savedToken = await AsyncStorage.getItem('userToken');
        if (savedToken) {
          // In a real app, validate the token with your backend
          // For now, we'll just load the user profile
          const userProfile = await AsyncStorage.getItem('userData');
          if (userProfile) {
            const parsedProfile = JSON.parse(userProfile);
            if (parsedProfile.profile) {
              dispatch(loginSuccess({
                token: savedToken,
                user: parsedProfile.profile
              }));
            }
          }
        }
        
        // Simulate loading delay for splash screen
        setTimeout(() => {
          setIsLoading(false);
        }, 2000);
      } catch (error) {
        console.error('Error loading app data:', error);
        setIsLoading(false);
      }
    };
    
    loadAppData();
  }, [dispatch]);
  
  return (
    <PaperProvider theme={appTheme}>
      <SafeAreaProvider>
        <StatusBar style={darkMode ? "light" : "dark"} />
        <NavigationContainer>
          {isLoading ? (
            // Show splash screen while loading
            <SplashScreen setIsLoading={setIsLoading} />
          ) : token ? (
            // User is signed in - show main app screens
            <AppNavigator />
          ) : (
            // User is not signed in - show authentication flow
            <Stack.Navigator
              screenOptions={{
                headerShown: false,
                cardStyle: { backgroundColor: 'transparent' },
                cardStyleInterpolator: ({ current: { progress } }) => ({
                  cardStyle: {
                    opacity: progress,
                  },
                }),
              }}
            >
              <Stack.Screen name="Login" component={LoginScreen} />
              {/* Add more auth screens here (signup, forgot password, etc.) */}
            </Stack.Navigator>
          )}
        </NavigationContainer>
      </SafeAreaProvider>
    </PaperProvider>
  );
}
